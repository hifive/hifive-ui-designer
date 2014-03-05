(function() {

	function getTemporarySavePath() {
		var now = new Date();
		var salt = parseInt(Math.random() * 100);

		var path = h5.u.str.format('trial/{0}/{1}-{2}-{3}.html', salt, now.getHours(), now
				.getMinutes(), now.getSeconds());
		return path;
	}

	function toAbsoluteUrl(relativePath, doc) {
		var e = doc.createElement('span');
		e.innerHTML = '<a href="' + relativePath + '"></a>';
		return e.firstChild.href;
	}


	var pagePopUpController = {
		/**
		 * @memberOf hifive.editor.controller.PagePopUpController
		 */
		__name: 'hifive.editor.controller.PagePopUpController',

		__init: function(context) {
			this._popup = context.args.popup;

			this.view.append('.pageTemplates', 'pageTemplateList');

			var templates = this._pageTemplateLogic.getAllTemplates();

			this.view.bind('.pageTemplateList', {
				pageTemplates: templates
			});

			this._popup.refresh();

			if (hifive.editor.consts.TRIAL_MODE) {
				this.$find('[name="savePath"]').val(getTemporarySavePath());
			}

			this._selectItem(this._getTemplateIdFromElement(this.$find('[data-template-id]')[0]));
		},

		_popup: null,

		_selectedItemId: null,

		_pageTemplateLogic: hifive.editor.logic.PageTemplateLogic,

		'[name="createPage"] click': function() {
			var savePath = this.$find('[name="savePath"]').val();

			//TODO GTC特別対応
			//var url = this.$find('[name="predefined"]').val();
			var url = this.$find('[name="pageUrl"]').val();

			if (savePath === '') {
				//TODO メッセージを出す
				//TODO できればファイルの存在チェックをして、上書きして良いか確認するようにする
				return;
			}

			if (url === '') {
				url = this._pageTemplateLogic.getTemplate(this._selectedItemId).get('url');
			}

			if (!url) {
				return;
			}

			this.trigger('loadPage', {
				url: url,
				savePath: savePath
			});

			this._popup.dispose();
		},

		'.pageTemplateItem click': function(event, $el) {
			var templateId = this._getTemplateIdFromElement($el);
			this._selectItem(templateId);
		},

		_getTemplateIdFromElement: function(elem) {
			return $(elem).attr('data-template-id');
		},

		_selectItem: function(id) {
			this.$find('[data-template-id]').each(function() {
				var $this = $(this);
				var templateId = $this.attr('data-template-id');
				if (templateId === id) {
					$this.addClass('selected');
				} else {
					$this.removeClass('selected');
				}
			});

			this._selectedItemId = id;
		}
	};

	var loadPageController = {
		/**
		 * @memberOf hifive.editor.controller.LoadPageController
		 */
		__name: 'hifive.editor.controller.LoadPageController',

		'[name="create"] click': function(context) {
			var popup = h5.ui.popupManager.createPopUp('createPage');

			var form = this.view.get('createPageForm');

			popup.setTitle('新規ページ作成');
			popup.setContents(form);

			h5.core.controller(popup.contents, pagePopUpController, {
				popup: popup
			});

			popup.show();
		},

		'[name="editTemplate"] click': function(context) {
			//TODO 場所は仮
			//FIXME GTC向け
			var pageController = hifive.editor.u.getFocusedPageController();

			if (!pageController) {
				return;
			}

			var target = pageController.getFocusElement();

			if (!target) {
				return;
			}

			var DATA_TEMPLATE_ID = 'data-template-id';

			var templateId = $(target).attr(DATA_TEMPLATE_ID);

			var templateText = null;
			if (templateId) {
				var $template = $(pageController.getDocument()).find(
						'script[type="text/ejs"][id="' + templateId + '"]');
				if ($template[0]) {
					templateText = $template[0].text;
				}
			}

			var DATA_JSON_URL = 'data-json-url';

			var jsonUrl = $(target).attr(DATA_JSON_URL);

			if (jsonUrl) {
				jsonUrl = toAbsoluteUrl(jsonUrl, pageController.getDocument());
			}

			var sampleJson = null;

			var dfd = h5.async.deferred();

			dfd.then(function() {
				if (jsonUrl) {
					var p = h5.ajax({
						url: jsonUrl,
						dataType: 'text',
						cache: false
					}).done(function(jsonText) {
						sampleJson = jsonText;
					});

					return p;
				}

			}).then(function() {
				var win = hifive.editor.u.openChildWindow('ejseditor.html');

				setTimeout(function() {
					var c = win.h5.core.controllerManager.getControllers(win.document.body, {
						deep: true,
						name: 'hifive.editor.controller.ejs.TemplateEditController'
					})[0];

					if (!c) {
						return;
					}

					c.setTarget(target);

					if (templateText) {
						c.setTemplateId(templateId);
						c.setTemplateText(templateText);
					}

					if (sampleJson) {
						c.setDataText(sampleJson);
					}

				}, 500);
			});

			dfd.resolve();



		}
	};
	h5.core.expose(loadPageController);

})();
