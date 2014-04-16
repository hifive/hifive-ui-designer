/*
 * Copyright (C) 2012-2014 NS Solutions Corporation
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
package com.htmlhifive.visualeditor.persister;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.FileAlreadyExistsException;
import java.nio.file.FileSystem;
import java.nio.file.FileSystems;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.activation.MimetypesFileTypeMap;
import javax.annotation.PostConstruct;

import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;

import com.htmlhifive.resourcefw.exception.GenericResourceException;
import com.htmlhifive.resourcefw.resource.file.UrlTreeMetaData;
import com.htmlhifive.resourcefw.resource.file.auth.UrlTreeContext;
import com.htmlhifive.resourcefw.resource.file.exception.BadContentException;
import com.htmlhifive.resourcefw.resource.file.exception.TargetNotFoundException;
import com.htmlhifive.resourcefw.resource.file.persister.ContentsPersister;

/**
 * ローカルファイルシステムをストレージとするContentsPersister実装.
 * 
 * @author kawaguch
 */
public class LocalFileContentsPersister implements ContentsPersister<InputStream> {

	private static final Logger logger = Logger.getLogger(LocalFileContentsPersister.class);

	@Autowired
	private Properties appConf;

	/**
	 * デフォルトで保存するストレージ上のパスのキー
	 */
	public static final String KEY_DEFULT_PATH = "default.dir";
	/**
	 * デフォルトで保存しない指定のあるURLのキー
	 */
	public static final String KEY_CUSTOM_URLS = "custom.urls";

	/**
	 * デフォルトで保存するストレージ上のパス.
	 */
	private String defaultPath;

	/**
	 * デフォルトパスのPathオブジェクト.
	 */
	private Path defaultDir;

	/**
	 * ある特定のurlと、そのurlを指定された場合に保存するパスとのマップ
	 */
	private Map<String, Path> customUrlPathMap = new HashMap<String, Path>();

	/**
	 * 初期化処理としてベースパスの存在を確認し、このContentsPersisterを使用可能にします.
	 * 
	 * @throws IOException
	 */
	@PostConstruct
	public void init() throws IOException {

		// 必要なファイルパスを保存するリスト
		List<Path> filePathList = new ArrayList<Path>();

		try {
			// デフォルトパスを取り出す
			defaultPath = appConf.getProperty(KEY_DEFULT_PATH);
			FileSystem fs = FileSystems.getDefault();
			defaultDir = fs.getPath(defaultPath);
			filePathList.add(defaultDir);

			// default以外のパスを取り出す
			String[] urls = appConf.getProperty(KEY_CUSTOM_URLS).split(",");
			for (int i = 0, l = urls.length; i < l; i++) {
				Path p = fs.getPath(appConf.getProperty(urls[i] + ".dir"));
				filePathList.add(p);
				customUrlPathMap.put(urls[i], p);
			}
		} catch (Exception e) {
			logger.error("プロパティファイルの読み込みでエラーが発生しました。記述が正しいかどうか確認してください。");
			e.printStackTrace();
		}

		// フォルダが無かったら作る
		for (Path p : filePathList) {
			if (!Files.exists(p)) {
				Files.createDirectories(p);
			}
			if (!Files.isDirectory(p)) {
				// ディレクトリでなくファイル名で同名のものがあれば作れないのでエラー
				throw new IllegalArgumentException("同名のファイルが既にあるため、ディレクトリを作成できませんでした。" + p);
			}
		}
	}

	/**
	 * ファイルデータをストレージからロードします.
	 * 
	 * @param metadata urlTreeメタデータオブジェクト
	 * @param ctx urlTreeコンテキストオブジェクト
	 * @return ロードされたファイルデータ
	 */
	@Override
	public InputStream load(UrlTreeMetaData<InputStream> metadata, UrlTreeContext ctx) throws BadContentException,
			TargetNotFoundException {
		Path f = this.generateFileObj(metadata.getAbsolutePath());

		if (!Files.exists(f) || !Files.isReadable(f)) {
			throw new TargetNotFoundException("cannot read real file");
		}

		InputStream contents;
		try {
			contents = Files.newInputStream(f);
		} catch (IOException e) {
			throw new GenericResourceException(e);
		}

		String contentType = new MimetypesFileTypeMap().getContentType(f.getFileName().toString());
		metadata.setContentType(contentType);

		return contents;
	}

	/**
	 * ファイルデータをストレージに保存します.
	 * 
	 * @param metadata ファイルデータを含むurlTreeメタデータオブジェクト
	 * @param ctx urlTreeコンテキストオブジェクト
	 */
	@Override
	public void save(UrlTreeMetaData<InputStream> metadata, UrlTreeContext ctx) throws BadContentException {

		String localFileName = metadata.getAbsolutePath();

		logger.debug("saving " + localFileName);
		Path f = this.generateFileObj(localFileName);

		InputStream b = metadata.getData();
		// nullの場合は書き換えない。
		if (b == null) {
			return;
		}
		try {
			Path parent = f.getParent();

			// 書き込む場所がなければ親ディレクトリを作成
			if (Files.notExists(parent)) {
				Files.createDirectories(parent);
			}
			Files.copy(b, f, StandardCopyOption.REPLACE_EXISTING);
		} catch (IOException e) {
			throw new GenericResourceException(e);
		}
	}

	/**
	 * ディレクトリデータをストレージから削除します.
	 * 
	 * @param metadata ディレクトリデータを含むurlTreeメタデータオブジェクト
	 * @param ctx urlTreeコンテキストオブジェクト
	 */
	@Override
	public void delete(UrlTreeMetaData<InputStream> metadata, UrlTreeContext ctx) throws BadContentException {
		Path f = generateFileObj(metadata.getAbsolutePath());
		logger.debug("delete: " + f.getFileName());
		try {
			boolean deleted = Files.deleteIfExists(f);
			if (!deleted) {
				throw new IOException("file not exists");
			}
		} catch (IOException e) {
			// TargetNotFoundまたはBadContentでもよいか
			throw new GenericResourceException("cannot delete file", e);
		}
	}

	@Override
	public void copy(UrlTreeMetaData<InputStream> metadata, String dstDir, UrlTreeContext ctx)
			throws BadContentException {

		String srcPathName = metadata.getAbsolutePath();
		Path srcPath = this.generateFileObj(srcPathName);
		Path dstPath = this.generateFileObj(dstDir);

		logger.debug("copy: " + srcPath.toAbsolutePath() + " to " + dstPath.toAbsolutePath());

		try {
			Files.copy(srcPath, dstPath.resolve(srcPath.getFileName()), StandardCopyOption.COPY_ATTRIBUTES,
					StandardCopyOption.REPLACE_EXISTING);
		} catch (IOException e) {
			throw new GenericResourceException("cannot copy file", e);
		}
	}

	@Override
	public void move(UrlTreeMetaData<InputStream> metadata, String dstDir, UrlTreeContext ctx)
			throws BadContentException {

		String srcPathName = metadata.getAbsolutePath();
		Path srcPath = this.generateFileObj(srcPathName);
		Path dstPath = this.generateFileObj(dstDir);

		logger.debug("move: " + srcPath.toAbsolutePath() + " to " + dstPath.toAbsolutePath());

		try {
			Files.move(srcPath, dstPath.resolve(srcPath.getFileName()), StandardCopyOption.ATOMIC_MOVE,
					StandardCopyOption.REPLACE_EXISTING);
		} catch (IOException e) {
			throw new GenericResourceException("cannot copy file", e);
		}
	}

	/**
	 * ファイル名がこのPersisterで使用可能であればtrueを返します.
	 */
	private boolean isValidFileName(String fileName) {

		// nullはちろんNG
		if (fileName == null) {
			return false;
		}

		// 「.」が２個以上はNG
		if (fileName.matches("\\.{2,}")) {
			return false;
		}

		return true;
	}

	/**
	 * ディレクトリデータをストレージに保存(ディレクトリを作成)します.
	 * 
	 * @param metadata ディレクトリデータを含むurlTreeメタデータオブジェクト
	 * @param ctx urlTreeコンテキストオブジェクト
	 */
	@Override
	public void mkdir(UrlTreeMetaData<InputStream> metadata, UrlTreeContext ctx) throws BadContentException,
			FileAlreadyExistsException {
		Path f = generateFileObj(metadata.getAbsolutePath());
		if (Files.exists(f)) {
			throw new FileAlreadyExistsException("file exists");
		}

		try {
			Files.createDirectories(f);
		} catch (IOException e) {
			logger.error("mkdir failure", e);
			throw new RuntimeException(e);
		}
	}

	/**
	 * ディレクトリデータをストレージから削除します.
	 * 
	 * @param metadata ディレクトリデータを含むurlTreeメタデータオブジェクト
	 * @param ctx urlTreeコンテキストオブジェクト
	 */
	@Override
	public void rmdir(UrlTreeMetaData<InputStream> metadata, UrlTreeContext ctx) throws BadContentException,
			FileNotFoundException {
		Path f = generateFileObj(metadata.getAbsolutePath());
		logger.debug("called rmdir: " + f.getFileName());
		if (!Files.exists(f)) {
			throw new FileNotFoundException("file not exists");
		}

		try {
			Files.delete(f);
		} catch (IOException e) {
			logger.error("rmdir failure", e);
			throw new RuntimeException(e);
		}
	}

	/**
	 * キー情報だけでロードが可能かどうかを確認し、可能な場合trueを返します.
	 * 
	 * @param key ファイルデータのキー情報
	 * @return ロード可能なときtrue
	 */
	@Override
	public boolean canLoad(String key, UrlTreeContext ctx) throws BadContentException {
		if (key == null) {
			return false;
		}

		if (!isValidFileName(key)) {
			return false;
		}

		String key2;
		if (key.equals("root")) {
			key2 = "";
		} else {
			key2 = key;
		}

		Path f = this.generateFileObj(key2);
		logger.debug(f.toString() + ": canload called");
		return Files.exists(f, LinkOption.NOFOLLOW_LINKS);
	}

	/**
	 * キー情報から実ファイルデータを取得し、それらからメタデータを生成して返します.
	 * 
	 * @param key ファイルデータのキー情報
	 * @return キーから生成したメタデータ
	 */
	@Override
	public UrlTreeMetaData<InputStream> generateMetaDataFromReal(String key, UrlTreeContext ctx)
			throws BadContentException {
		if (!this.canLoad(key, ctx)) {
			throw new IllegalArgumentException("Cannot Load it. check before can it load with canLoad(key): " + key);
		}
		Path p = this.generateFileObj(key);
		File f = p.toFile();
		long lastModified = f.lastModified();

		logger.trace("[デバッグ]ファイル名とファイルのlastModified: " + p.toString() + ":" + lastModified);

		UrlTreeMetaData<InputStream> md = new UrlTreeMetaData<>();
		md.setDirectory(Files.isDirectory(p, LinkOption.NOFOLLOW_LINKS));
		md.setFilename(key);
		md.setOwnerId(ctx.getUserName());
		md.setGroupId(ctx.getPrimaryGroup());
		md.setCreatedTime(lastModified);
		md.setUpdatedTime(lastModified);
		md.setPermission(ctx.getDefaultPermission());
		String contentType = new MimetypesFileTypeMap().getContentType(p.getFileName().toString());
		md.setContentType(contentType);

		return md;
	}

	/**
	 * 指定されたディレクトリのキー情報から配下のファイルのキー情報リストを返します.
	 * 
	 * @param key ディレクトリのキー情報
	 * @param ctx urlTreeコンテキストオブジェクト
	 * @return キー情報のリスト
	 */
	@Override
	public List<String> getChildList(String key, UrlTreeContext ctx) throws BadContentException {
		if (!this.canLoad(key, ctx)) {
			throw new IllegalArgumentException("Cannot Load it. check before can it load with canLoad(key)");
		}
		Path p = this.generateFileObj(key);
		File f = p.toFile();
		return Arrays.asList(f.list());
	}

	/**
	 * ファイル名(パス)からファイル(Path)オブジェクトを生成します.
	 * 
	 * @param filename ファイル名
	 * @return pathオブジェクト
	 * @throws BadContentException
	 */
	private Path generateFileObj(String filename) throws BadContentException {
		if (isValidFileName(filename)) {
			for (Map.Entry<String, Path> e : customUrlPathMap.entrySet()) {
				if (filename.startsWith(e.getKey() + "/")) {
					return FileSystems.getDefault().getPath(e.getValue().toAbsolutePath().toString(),
							filename.substring(e.getKey().length()));
				}
			}
		}
		return FileSystems.getDefault().getPath(defaultDir.toAbsolutePath().toString(), filename);
	}
}
