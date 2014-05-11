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
(function() {

	var lastTempUpload = 0;

	var tempUploadMagicNumber = parseInt(Math.random() * 10000);

	var fileStoreBase;

	// サーバのベースURLを求める
	(function() {
		var base = hifive.editor.settings.fileStoreBase;
		fileStoreBase = base[base.length - 1] === '/' ? base : base + '/';
	})();

	function getUrl(path) {
		if(path.charAt(0) === '/') {
			return path;
		}

		//var p = path[0] === '/' ? path.slice(1) : path;
		return fileStoreBase + '/' + path;
	}

	function createTempUrl() {
		var t = new Date().getTime();
		var p = t + tempUploadMagicNumber + (++lastTempUpload);
		return fileStoreBase + 'temp/' + p;
	}

	var fileStoreLogic = {
		/**
		 * @memberOf hifive.editor.logic.FileStoreLogic
		 */
		__name: 'hifive.editor.logic.FileStoreLogic',

		upload: function(path, data) {
			var dfd = this.deferred();


			if (hifive.editor.consts.ENABLE_SERVER_FEATURE) {
				var url = getUrl(path);

				h5.ajax({
					url: url,
					type: 'post',
					data: {
						__content: data,
						_method: 'PUT'
					}
				}).done(function(data) {
					dfd.resolve(url);
				});
			} else {
				dfd.reject();
			}

			return dfd.promise();
		},

		/**
		 * ファイル名は適当に生成。 TODO 本当はサーバーサイドで生成しないとダメ
		 */
		uploadTemp: function(data) {
			var dfd = this.deferred();

			var url = createTempUrl() + '.html';
			h5.ajax({
				url: url,
				type: 'post',
				data: {
					__content: data,
					_method: 'PUT'
				}
			}).done(function(data) {
				dfd.resolve(url);
			});

			return dfd.promise();
		},

		/**
		 * base64形式の画像をアップロード
		 *
		 * @memberOf hifive.editor.logic.FileStoreLogic
		 * @param url
		 */

		uploadBase64: function(url, data) {
			var dfd = this.deferred();

			h5.ajax({
				url: url,
				type: 'post',
				data: {
					__content: data.split('base64,')[1],
					_method: 'PUT'
				},
				beforeSend: function(xhr) {
					xhr.setRequestHeader('base64', true);
				}
			}).done(function(data) {
				dfd.resolve(url);
			});

			return dfd.promise();
		},

		download: function(url) {
			// download用のURL(__download='true'になっているURL)に遷移でダウンロード
			location.href = url + '?__download=true';
		},

		getContents: function(path, dataType) {
			var dfd = this.deferred();

			h5.ajax({
				url: url,
				type: 'get',
				data: {
					__content: data,
					__download: 'true'
				},
				dataType: dataType ? dataType : 'text'
			}).done(function(data, status) {
				dfd.resolve(data, status);
			});

			return dfd.promise();
		},

		getUrl: function(path) {
			return getUrl(path);
		}
	};

	h5.core.expose(fileStoreLogic);

})();
