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
