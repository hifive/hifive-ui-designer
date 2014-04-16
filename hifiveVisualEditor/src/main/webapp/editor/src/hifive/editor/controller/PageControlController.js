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
function cdef() {

	var lastSnapshotId = 0;

	var getFocusedPageController = hifive.editor.u.getFocusedPageController;



	function selectAllTemplateElements() {
		var page = getFocusedPageController();

		var doc = page.getDocument();

		var elements = $('[data-template-id]', doc).toArray();

		page.select(elements);
	}

	var modelLogics = hifive.editor.logic;

	var pageControlController = {
		/**
		 * @memberOf hifive.editor.controller.PageControlController
		 */
		_pageList: null,

		_pagePrototypeList: null,

		_fileStoreLogic: hifive.editor.logic.FileStoreLogic,

		_currentPreviewUrl: null,

		_currentSavePath: null,

		_isPreviewAutoSaveEnabled: true,

		__construct: function() {
		//			throw new Error('error!');
		},

		__ready: function(context) {
			this._setPreviewAutoSave(this._isPreviewAutoSaveEnabled);
		},

		_getNewSnapshotUrl: function() {
			var path = this._currentSavePath;
			if (!path) {
				return;
			}

			path = path.substring(0, path.lastIndexOf('.'));
			//TODO パス組立Utilがほしい（./とか../とかを正しく扱う）

			var url = hifive.editor.settings.fileStoreBase + 'snapshot/' + path + '_'
					+ (lastSnapshotId++) + '.html';
			return url;
		},

		'[name="windowSize"] change': function() {
			this._refreshCurrentWindowSize();
		},

		_refreshCurrentWindowSize: function() {
			var windowSize = this.$find('[name="windowSize"]').val();
			this.$find('[name="currentWindowSize"]').val(windowSize);

			this.trigger('resizePageWindow', windowSize);
		},

		_quickTemplate: function() {
			var doc = pageContainer.contentDocument;

			$('.layoutCell', doc).each(
					function() {
						if ($(this).find('.layoutCell').length > 0) {
							//下にセルがあったらとりあえず何もしない
							return;
						}
						//最下層のセルの場合、空っぽにして代わりにAbsLayoutContainerをいれる

						$this = $(this);

						//paddingを含まない、コンテンツ部分だけのサイズ
						var w = $this.width();
						var h = $this.height();

						//<div class="layoutCell absoluteLayoutContainerCell"></div>
						$placeholder = $(
								'<div class="uiParts layoutCell" data-h5-container="stack"></div>')
								.css({
									width: w,
									height: h
								});

						$this.empty();
						$this.append($placeholder);
					});
		},

		_saveLayout: function(name) {
			var dfd = this.deferred();

			var layout = modelLogics.layoutLogic.create(name);
			var base = '/hifiveCompRepoServer/dynres/layouts/';
			var path = base + name + '.html';

			layout.set('contentsPath', path);

			var data = {
				content: pageContainer.contentDocument.documentElement.outerHTML,
				_method: 'PUT'
			};

			$.post(path, data, function() {
				dfd.resolve();
			});

			return dfd.promise();
		},

		_createMaster: function(name) {
			var prototypeItem = modelLogics.pageLogic.createMaster(name);
			var contents = $('#stage').html();

			prototypeItem.set('contents', contents);

			this._pagePrototypeList.push(prototypeItem);

			return prototypeItem;
		},

		_convertToPrototype: function() {
			return $('#stage').html();
		},

		_createPage: function(pageName) {
			var pageItem = modelLogics.pageLogic.create(null, null, pageName);
			this._pageList.push(pageItem); //本当はpageModelのイベントを見るべき
		},

		/**
		 * ページに何らかの変更があった場合のイベントハンドラ
		 */
		'{document} pageContentsChange': function() {
			if (this._isPreviewAutoSaveEnabled) {
				this._savePreviewWithWait();
			}
		},

		/** ダウンロードボタンクリック時 */
		'{.export .download} click': function(context) {
			var url = $(context.event.target).data('download-url');
			this._fileStoreLogic.download(url);
		},

		'.previewAutoSave click': function() {
			this._togglePreviewAutoSave();
		},

		_togglePreviewAutoSave: function() {
			this._isPreviewAutoSaveEnabled = !this._isPreviewAutoSaveEnabled;
			this._setPreviewAutoSave(this._isPreviewAutoSaveEnabled);
		},

		_autoSaveTimerId: null,

		_setPreviewAutoSave: function(flag) {
			if (flag === true) {
				this._savePreview();
				this.$find('.previewAutoSave').text('プレビューURL（自動更新中）：').addClass('btn-success');
			} else {
				if (this._autoSaveTimerId) {
					clearTimeout(this._autoSaveTimerId);
					this._autoSaveTimerId = null;
				}

				this.$find('.previewAutoSave').text('プレビューURL：').removeClass('btn-success');
			}

			this._isPreviewAutoSaveEnabled = flag;
		},

		_savePreviewWithWait: function() {
			if (this._autoSaveTimerId !== null) {
				clearTimeout(this._autoSaveTimerId);
			}

			this._autoSaveTimerId = setTimeout(this.own(function() {
				this._autoSaveTimerId = null;
				this._savePreview();
			}), hifive.editor.consts.AUTO_SAVE_WAIT);
		},

		_savePreview: function() {
			if (!this._currentPreviewUrl) {
				return;
			}

			var pageController = getFocusedPageController();
			if (pageController) {
				var scripts = [hifive.editor.settings.pathAutoReload];
				var csses = null;

				var exportHtml = pageController.exportPage(scripts, csses);

				var that = this;

				this._fileStoreLogic.upload(this._currentPreviewUrl, exportHtml).done(
						function() {
							var now = new Date();
							that.$find('.previewLastSaved').text(
									h5.u.str.format('（最終保存： {0}:{1}:{2}）', now.getHours(), now
											.getMinutes(), now.getSeconds()));
						});
			}
		},

		'[href="#takeSnapshot"] click': function(context) {
			context.event.preventDefault();

			var pageController = getFocusedPageController();
			if (!pageController) {
				return false;
			}

			var scripts = [hifive.editor.settings.pathHandwritingController];
			var csses = null;

			var exportHtml = pageController.exportPage(scripts, csses);

			var that = this;

			var snapshotUrl = this._getNewSnapshotUrl();

			this.log.debug('snapshotUrl={0}', snapshotUrl);

			this._fileStoreLogic.upload(snapshotUrl, exportHtml).done(
					function() {
						var now = new Date();

						var snapshotMenuItem = that.view.get('snapshotMenuItem', {
							url: snapshotUrl,
							time: h5.u.str.format('{0}:{1}:{2}', now.getHours(), now.getMinutes(),
									now.getSeconds())
						});

						that.$find('.snapshotLogTop').after(snapshotMenuItem);
					});
		},

		'{document} loadPage': function(context) {
			var savePath = context.evArg.savePath;

			var url = hifive.editor.u.getAbsoluteExportLivePreviewUrl(savePath);

			this._currentSavePath = savePath;
			this._currentPreviewUrl = url;

			this.$find('.previewUrl').attr('href', url).text(url);
		},

		'.selectionMode click': function(context, $el) {
			var pageController = getFocusedPageController();

			pageController.unselectAll();

			var mode = pageController.state.get('selectionMode');
			var newMode;
			if (mode === hifive.editor.consts.SELECTION_MODE_ELEMENT) {
				newMode = hifive.editor.consts.SELECTION_MODE_COMPONENT;
				$el.text('コンポーネント選択モード');
			} else if (mode === hifive.editor.consts.SELECTION_MODE_COMPONENT) {
				newMode = hifive.editor.consts.SELECTION_MODE_TEMPLATE;
				$el.text('テンプレート選択モード');
				selectAllTemplateElements();
			} else {
				newMode = hifive.editor.consts.SELECTION_MODE_ELEMENT;
				$el.text('要素選択モード');
			}
			pageController.state.set('selectionMode', newMode);
		}
	};

	return pageControlController;
}

//JSDTのフォーマッタだと、折り返しが起こってインデントが多くなってしまう
h5.core.controller.define('hifive.editor.controller.PageControlController', cdef);
