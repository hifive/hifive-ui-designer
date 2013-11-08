package com.htmlhifive.visualeditor.resource;

/*
 * Copyright (C) 2012-2013 NS Solutions Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.web.util.UrlUtils;

import com.htmlhifive.resourcefw.config.MessageMetadata;
import com.htmlhifive.resourcefw.exception.AbstractResourceException;
import com.htmlhifive.resourcefw.exception.GenericResourceException;
import com.htmlhifive.resourcefw.message.FileValueHolder;
import com.htmlhifive.resourcefw.message.RequestMessage;
import com.htmlhifive.resourcefw.message.ResponseMessage;
import com.htmlhifive.resourcefw.resource.ResourceActionStatus;
import com.htmlhifive.resourcefw.resource.ResourceClass;
import com.htmlhifive.resourcefw.resource.file.GenericUrlTreeFileResource;
import com.htmlhifive.resourcefw.resource.file.UrlTreeMetaData;
import com.htmlhifive.resourcefw.resource.file.UrlTreeResource;
import com.htmlhifive.resourcefw.resource.file.auth.UrlTreeAuthorizationManager;
import com.htmlhifive.resourcefw.resource.file.auth.UrlTreeContext;
import com.htmlhifive.resourcefw.resource.file.persister.ContentsPersister;

/**
 * リソースアイテムとしてファイルとそのメタデータ(ファイル名、権限、・・＝urlTreeMetada)を管理する汎用リソース.<br>
 * {@link UrlTreeAuthorizationManager UrlTreeAuthorizationManager}を用いた権限管理、ファイルデータを保存する{@link ContentsPersister
 * Persister}を切り替えることで、 様々な環境におけるファイルストレージリソースとして機能します.
 *
 * @author kishigam
 */
@ResourceClass(name = "files")
public class CustomGenericUrlTreeFileResource extends GenericUrlTreeFileResource {

	private static final Logger logger = Logger.getLogger(CustomGenericUrlTreeFileResource.class);

	/**
	 * 実処理を担うリソース本体ロジッククラス.
	 */
	@Autowired
	protected UrlTreeResource<InputStream> urlTreeResource;

	/**
	 * ファイル出力時のデフォルトエンコーディング
	 */
	@Value("${default.encoding}")
	private String defaultEncoding;

	/**
	 * HttpServletRequest
	 */
	@Autowired
	private HttpServletRequest httpServletRequest;

	/**
	 * If-Modified-Sinceのキー名
	 */
	private final String KEY_IF_MODIFIED_SINCE = "If-Modified-Since";

	/**
	 * このリソースおよび関連クラスの初期化処理.<br/>
	 * Springのアプリケーションコンテキスト構築後に実行します.
	 */
	@PostConstruct
	protected void init() {
		urlTreeResource.init();
	}

	/**
	 * IDでリソースアイテムを検索し、ファイルを返すアクションに対応するメソッド.<br/>
	 * ファイルは、そのファイルの情報(urlTreeMetadata)とともに検索、取得されます.<br/>
	 * urlTreeMetadataにはcontentType(MIMEタイプ)を含んでいるため、レスポンスメッセージにContent-Typeヘッダとしてそれを返す必要があります.
	 * リクエストに含まれるパラメータにより、urlTreeMetadataだけを返したり(metadataOnly設定)、
	 * リクエストにtype=dirパラメータが設定されたときにディレクトリ情報としてファイル一覧を返すことができます.<br/>
	 * これらの場合は、Content-Typeの設定は不要です.<br/>
	 * Persisterクラスの種類によっては、Persisterが扱うストレージから直接ファイルを取得するためのURLがurlTreeMetadataに設定されるので、
	 * Locationヘッダの値として使用することでクライアントがそのURLを参照できるようにします.
	 */
	@Override
	public Object findById(RequestMessage requestMessage) throws AbstractResourceException {
		UrlTreeContext ctx = createContext(requestMessage);

		String path = getId(requestMessage);

		// If-Modified-Sinceを取得（設定されていなければ0扱い)
		Object ifModifiedSinceObj = requestMessage.get(KEY_IF_MODIFIED_SINCE);

		logger.trace("[デバッグ]ifModifiedSinceの値：" + ifModifiedSinceObj);
		Set<String> headerKeys = requestMessage.keys();
		String headerKeysStr = "";
		for (Iterator<String> i = headerKeys.iterator(); i.hasNext();) {
			String key = i.next();
			headerKeysStr += key + ':' + requestMessage.get(key) + ',';
		}
		logger.trace("[デバッグ]requestMessageのキーと値：" + headerKeysStr);
		boolean hasIfModifiedSince = ifModifiedSinceObj != null;
		boolean notModified = false;
		long ifModifiedSince = 0;
		if (hasIfModifiedSince) {
			try {
				ifModifiedSince = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss zzz", Locale.ENGLISH).parse(
						(String) ifModifiedSinceObj).getTime();

				logger.trace("[デバッグ]ifModifiedSinceのgetTime()：" + ifModifiedSince);
			} catch (Exception e) {
				logger.trace("[デバッグ]ifModifiedSinceのパースでエラー：" + ifModifiedSinceObj + e.getMessage());
				ifModifiedSince = 0;
			}
		}

		boolean metadataOnly = requestMessage.get("metadata") != null;

		// 1件のみ前提(ディレクトリ指定は可能)
		// メタデータだけ取得
		Map<String, UrlTreeMetaData<InputStream>> urlTreeMetadataMap = urlTreeResource.doGet(true, ctx, path);
		UrlTreeMetaData<InputStream> urlTreeMetadata = urlTreeMetadataMap.values().iterator().next();

		logger.trace("[デバッグ]ファイルのupdateTime:" + urlTreeMetadata.getUpdatedTime());

		if (hasIfModifiedSince && urlTreeMetadata.getUpdatedTime() < ifModifiedSince) {
			logger.trace("[デバッグ]notModifiedなので304を返す：ifModifiedSince=" + ifModifiedSince + "updateTime="
					+ urlTreeMetadata.getUpdatedTime());
			notModified = true;
		}

		// ステータス判定、OK以外は例外をスロー
		checkStatus(urlTreeMetadata, requestMessage);

		// metadataOnlyならurlTreeMetadataを戻す
		// TODO metadataOnlyの時の304コードをどうするか(urlTreeMetadataに304はセットできない)
		if (metadataOnly) {
			// contentTypeの設定不要(デフォルト)
			return urlTreeMetadata;
		} else if (!notModified) {
			// metadataOnlyでもnotModifiedでもないなら、ボディも取得しないといけないので、metadataOnlyをfalseにしてurlTreeMetadataの取得しなおし
			urlTreeMetadata = urlTreeResource.doGet(false, ctx, path).values().iterator().next();
		}

		// ディレクトリであればchildListをオブジェクト戻し
		if (urlTreeMetadata.isDirectory()) {
			// contentTypeの設定不要(デフォルト)
			return urlTreeMetadata.getChildList();
		}

		// metadataOnlyでないファイルの場合

		// Content-Typeやファイル名の設定が必要なため、ResponseMessageを返す
		ResponseMessage responseMessage = new ResponseMessage(requestMessage);
		MessageMetadata messageMetadata = responseMessage.getMessageMetadata();

		Map<String, Object> headers = new HashMap<>();
		responseMessage.put(messageMetadata.RESPONSE_HEADER, headers);

		// urlが設定されていたら(外部ストレージのPersisterを使用している場合等)リダイレクトレスポンスを返す
		String url = urlTreeMetadata.getUrl();
		if (StringUtils.isNotBlank(url) && UrlUtils.isValidRedirectUrl(url)) {
			responseMessage.put(messageMetadata.RESPONSE_STATUS, ResourceActionStatus.SEE_OTHER);
			headers.put(messageMetadata.HTTP_HEADER_LOCATION, url);

			return responseMessage;
		}

		// ヘッダにContent-Type、ボディにファイルデータを追加
		headers.put(messageMetadata.HTTP_HEADER_CONTENT_TYPE, urlTreeMetadata.getContentType());

		// Content-Dipositionを設定する場合のファイル名
		responseMessage.put(messageMetadata.RESPONSE_DOWNLOAD_FILE_NAME, urlTreeMetadata.getName());

		if (notModified) {
			// If-Modified-Sinceが設定されていて、指定された日時よりファイルの更新日時が過去なら
			// ステータスは304。RESPONSE_BODYには何も渡さない。
			responseMessage.put(messageMetadata.RESPONSE_STATUS, ResourceActionStatus.NOT_MODIFIED);
		} else {
			responseMessage.put(messageMetadata.RESPONSE_STATUS, ResourceActionStatus.OK);
			responseMessage.put(messageMetadata.RESPONSE_BODY, urlTreeMetadata.getData());
		}

		return responseMessage;
	}

	/**
	 * requestヘッダに"base64:true"が設定されている場合は、itemにByteArrayInputStreamを作って格納します.
	 *
	 * @param item urlTreeMetadata
	 * @param requestMessage リクエストメッセージ
	 */
	@Override
	protected void setContent(UrlTreeMetaData<InputStream> item, RequestMessage requestMessage) {

		MessageMetadata metadata = requestMessage.getMessageMetadata();

		// content(data)とそのContent-TypeをRequestMessageから取得
		Object data = requestMessage.get((String) requestMessage.get(metadata.REQUEST_CONTENT_KEY));

		// base64対応
		if (requestMessage.get("base64") != null) {
			StringBuilder sb = new StringBuilder();
			if (data instanceof InputStream) {
				try {
					BufferedReader reader = new BufferedReader(new InputStreamReader((InputStream) data, "UTF-8"));
					String str;
					while ((str = reader.readLine()) != null) {
						sb.append(str);
						sb.append("\n");
					}
				} catch (Exception e) {
					throw new GenericResourceException(e);
				}
			} else if (data instanceof String) {
				sb.append((String) data);
			}

			item.setData(new ByteArrayInputStream(Base64.decodeBase64(sb.toString())));
			return;
		}

		try {
			if (data instanceof FileValueHolder) {
				FileValueHolder fileValueHolder = (FileValueHolder) data;
				item.setContentType(fileValueHolder.getContentType());
				item.setData(fileValueHolder.getInputStream());
			} else {
				item.setContentType((String) requestMessage.get(metadata.HTTP_HEADER_CONTENT_TYPE));
				if (data instanceof InputStream) {
					item.setData((InputStream) data);
				} else if (data instanceof String) {
					Object encodingObj = requestMessage.get("encoding");
					String encoding = defaultEncoding;
					if (encodingObj != null) {
						encoding = (String) encodingObj;
					}
					item.setData(new ByteArrayInputStream(((String) data).getBytes(encoding)));
				} else {
					item.setData(new ByteArrayInputStream((byte[]) data));
				}
			}
		} catch (IOException e) {
			throw new GenericResourceException(e);
		}
	}
}
