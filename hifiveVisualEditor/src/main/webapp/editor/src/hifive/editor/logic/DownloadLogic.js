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

	var downloadLogic = {
		/**
		 * @memberOf hifive.editor.logic.DownloadLogic
		 */
		__name : 'hifive.editor.logic.DownloadLogic',

		_fileStoreLogic : hifive.editor.logic.FileStoreLogic,

		uploadAndDownload : function(page) {
			var dfd = this.deferred();

			var html = page.render();
			var that = this;
			// TODO urlはとりあえず動作確認用
			this._fileStoreLogic.upload('test.html', html).done(function(url) {
				that._fileStoreLogic.download(url);
				dfd.resolve();
			});

			return dfd.promise();
		}
	};

	h5.core.expose(downloadLogic);
})();
