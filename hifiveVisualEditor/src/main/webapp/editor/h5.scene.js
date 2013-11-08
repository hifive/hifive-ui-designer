(function() {

	var pages = [];

	function Page(path, callbacks) {
		this.path = path;

		if (path.indexOf('#') > -1) {

		}

		this.rootElement = null;
		this.callbacks = callbacks;
	}

	// 映画⇒　Sequence / Scene / Cut の概念を拝借
	// hifive⇒ Scene / Page

	var defaultCallback = null;

	var currentPageRootElement = null;
	var currentPage = null;

	function jump(path) {
		location.href = path;
	}

	function transition(fromPage, toPage) {

	}

	function swapPage(toPage) {
		if (currentPageRootElement) {
			$(currentPageRootElement).remove();
			currentPageRootElement = null;
		}

		if (toPage) {
			currentPageRootElement;
			currentPage = toPage;
		}
	}

	function changePage(page, path, data) {
		var loaderPromise = page.callbacks.loader.call(null, path, data);
		loaderPromise.done(function() {});
	}

	/**
	 * @class
	 * @name SceneManager
	 */
	function SceneManager() {}
	$.extend(SceneManager.prototype, {
		/**
		 * @memberOf SceneManager
		 */
		addPage: function(path, callbacks) {
			pages.push(new Page($.trim(path), callbacks));
		},

		setDefaultCallback: function(callback) {
			defaultCallback = callback;
		},

		changePage: function(path, data, options) {
			//TODO 引数への再代入
			path = $.trim(path);

			//ハッシュ -> 同一ページ内のカットチェンジ（の可能性）
			if (path.charAt(0) === '#') {
				var cutName = path.slice(1);
			}



			var pageLen = pages.length;
			for ( var i = 0; i < pageLen; i++) {
				var p = pages[i];
				if (p.path === $.trim(path)) {
					p.callback.call(null, path, data);
					break;
				}
			}

			//TODO 一致するPageがない場合のデフォルト⇒普通に遷移
			//defaultCallbackは、自分で処理しきった場合（デフォルト操作不要）はtrueを返すことにする
			var ret = defaultCallback.call(null, path, data);
			if (ret !== true) {
				jump(path);
			}
		}
	});

	var manager = new SceneManager();

	h5.u.obj.expose('h5.scene', {
		manager: manager
	});

})();