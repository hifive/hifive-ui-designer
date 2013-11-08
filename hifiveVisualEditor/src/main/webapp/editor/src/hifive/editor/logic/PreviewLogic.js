(function() {

	var previewLogic = {
		/**
		 * @memberOf hifive.editor.logic.PreviewLogic
		 */
		__name: 'hifive.editor.logic.PreviewLogic',

		_fileStoreLogic: hifive.editor.logic.FileStoreLogic,

		previewNewWindow: function(page) {
			var dfd = this.deferred();

			// スケッチコントローラを埋め込んだhtml文字列を取得する。
			// head要素にコメントを追加して、取得したouterHtmlのコメント部分をscriptタグに書き換える
			// そのままscriptを追加してしまうと、エディタで表示しているiframeでscriptが実行されてしまうため、
			// コメントを使って送信する文字列についてだけscriptタグがある状態にする
			var contentDocument = $('.pageFrame')[0].contentDocument;
			var comment = '<!-- script:HandwritingController.js -->';
			$(contentDocument).find('head').append(comment);
			var html = contentDocument.documentElement.outerHTML.replace(comment, '<script src="'
					+ hifive.editor.settings.pathHandwritingController + '"></script>');
			// 追加したコメントノードを削除
			$(contentDocument).find('head')[0].lastChild.remove();

			this._fileStoreLogic.uploadTemp(html).done(function(url) {
				window.open(url, null);
				dfd.resolve();
			});

			return dfd.promise();
		}
	};

	h5.core.expose(previewLogic);
})();
