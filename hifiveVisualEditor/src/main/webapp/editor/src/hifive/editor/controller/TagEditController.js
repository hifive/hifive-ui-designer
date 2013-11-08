(function() {
	// 編集禁止の(表示しない)属性名
	var IGNORE_ATTRIBUTES = hifive.editor.consts.IGNORE_ATTRIBUTES;

	var IGNORE_CLASS_NAME = hifive.editor.consts.IGNORE_CLASS_NAME;

	// 要素が持っていない属性でもデフォルトで表示する属性名
	var DEFAULT_EDITABLE_ATTRIBUTES = ['innerHTML', 'id', 'class', 'style'];

	// 属性値を指定しない属性名
	var PROPERTY_ATTRIBUTES = ['disabled', 'checked', 'multiple', 'selected', 'autoplay',
			'controls', 'loop'];

	// TODO hifive内のコードをそのまま持ってきたもの
	function escapeRegex(str) {
		return str.replace(/\W/g, '\\$&');
	}
	function getRegex(target) {
		if ($.type(target) === 'regexp') {
			return target;
		}
		var str = '';
		if (target.indexOf('*') !== -1) {
			var array = $.map(target.split('*'), function(n) {
				return escapeRegex(n);
			});
			str = array.join('.*');
		} else {
			str = target;
		}
		return new RegExp('^' + str + '$');
	}

	var tagEditController = {
		__name: 'hifive.editor.controller.TagEditController',

		$editPanel: null,

		_selectingElement: null,

		__ready: function(context) {
			// TODO tagEditのリセットはページロード終了のタイミングでやる
			var $editPanel = $(this.rootElement);
			this.$editPanel = $editPanel;
			this.view.update($editPanel, 'tagEdit-table');
			this._hideEditTable();
			if (context.args && context.args.element) {
				// ターゲット要素が指定された状態でバインドされた
				this._showTagEditor(context.args.element);
			}
		},

		/**
		 * ダブルクリック コンポーネント内のタグを取得する
		 *
		 * @memberOf hifive.editor.controller.page.ManipulationController
		 * @param context
		 */
		'{rootElement} tagSelect': function(context) {
			this._showTagEditor(context.evArg.element);
		},

		'input change': function(context, $target) {
			// 一番最後のinputへの入力なら、新規追加
			var $tr = $target.parents('tr');
			if (!$tr.next().length) {
				this.view.append($target.parents('table').find('tbody'), 'tagEdit-tr', {
					attributes: []
				});
			}
			// プロパティの重複チェック
			if ($target.hasClass('attrName')) {
				if ($.trim($target.val())) {
					var hasSameName = false;
					$(this.rootElement).find('input.attrName').not($target).each(function() {
						if ($(this).val() === $target.val()) {
							hasSameName = true;
							return false;
						}
					});
					if (hasSameName) {
						$target.parents('tr').addClass('error');
						return;
					} else {
						$target.parents('tr').removeClass('error');
					}
				}
			}
			this._apply();
		},

		'input keydown': function(context, $target) {
			setTimeout(function() {
				$target.trigger('change');
			}, 0);
		},

		'input.attrName blur': function(context, $target) {
			if ($.trim($target.val())) {
				return;
			}
			// 属性名が空でかつ一番下の列じゃなければ削除
			var $tr = $target.parents('tr');
			if (!$tr.next().length) {
				return;
			}
			$tr.remove();
			this._apply();
		},

		'.apply click': function(context) {
			this._apply();
		},

		'.delBtn click': function(context, $target) {
			var $tr = $target.parents('tr:first');
			var attrName = $tr.find('.attrName').val();
			if (attrName) {
				this.$editPanel.data('element').removeAttribute(attrName);
			}
			$target.parents('tr:first').remove();
			this._apply();
		},


		_triggerPageChange: function() {
			var pageController = hifive.editor.u.getFocusedPageController();
			//pageController.trigger(hifive.editor.consts.EVENT_PAGE_CONTENTS_CHANGE);
			pageController._triggerPageContentsChange(); //TODO 本当はページ側で編集処理すべき
		},

		// クラスは変更不可なものはinputに表示していないので、それも含めて設定する
		_applyClass: function() {
			var target = this.$editPanel.data('element');
			var $classInput = this.$editPanel.find('input[name="class"]');
			var classes = $classInput.val().split(' ');
			var hiddenClasses = $classInput.data('hiddenClasses');
			var applyClasses = classes.concat(hiddenClasses);
			$(target).removeAttr('class');
			if (!applyClasses.length) {
				target.removeAttribute('class');
			}
			for ( var i = 0, l = applyClasses.length; i < l; i++) {
				$(target).addClass(applyClasses[i]);
			}
		},

		_applyInnerHTML: function() {
			var target = this.$editPanel.data('element');
			var $classInput = this.$editPanel.find('input[name="innerHTML"]');
			var html = $classInput.val();
			$(target).html($classInput.val());
		},

		_apply: function() {
			if ($(this.rootElement).find('.error').length) {
				// エラーが検知されているなら何もしない
				return;
			}
			var target = this.$editPanel.data('element');
			var that = this;
			var attributeNames = [];

			this.$editPanel.find('input.attrVal').each(function() {
				this.setAttribute('name', $(this).parents('tr').find('input.attrName').val());
				var name = $(this).attr('name');
				if (!name) {
					return;
				} else if (name === 'class') {
					that._applyClass();
				} else if (name === 'innerHTML') {
					that._applyInnerHTML();
				} else if ($.inArray(name, PROPERTY_ATTRIBUTES) !== -1) {
					$(target).prop(name, true);
				} else {
					var val = $.trim($(this).val());
					if (!val) {
						target.removeAttribute(name);
						return;
					}
					target.setAttribute(name, val);
				}
				attributeNames.push(name);
			});

			// targetが持ってる属性で、inputにない属性はtargetから消す
			for ( var i = 0, l = target.attributes.length; i < l; i++) {
				var attrName = target.attributes[i].name;
				if ($.inArray(attrName, attributeNames) === -1) {
					target.removeAttribute(attrName);
					i--;
					l--;
				}
			}
			// PROPERTY_ATTRIBUTESのうち、inputにないものはfalseを設定する
			for ( var i = 0, l = PROPERTY_ATTRIBUTES.length; i < l; i++) {
				var prop = PROPERTY_ATTRIBUTES[i];
				if ($.inArray(prop, attributeNames) === -1) {
					$(target).prop(prop, false);
				}
			}

			// 他のtagEditクラスについてtagSelectイベントを発火する
			$('.tagEdit').not(this.rootElement).trigger('tagSelect', {
				element: target
			});

			this._triggerPageChange();
		},

		_hideEditTable: function() {
			this.$editPanel.find('button,table').css('display', 'none');
		},

		_showEditTable: function() {
			this.$editPanel.find('button,table').css('display', 'inline-block');
		},

		_showTagEditor: function(element) {
			this._showEditTable();
			// タグ名の表示
			var tagName = element.tagName.toLowerCase();
			this.$editPanel.find('.tagName').text('<' + tagName + '>');

			// デフォルトで編集項目に表示する属性と、要素が持っている編集可能な属性値を列挙
			var attributes = [];
			for ( var i = 0, l = DEFAULT_EDITABLE_ATTRIBUTES.length; i < l; i++) {
				var name = DEFAULT_EDITABLE_ATTRIBUTES[i];
				var value = '';
				if (name === 'innerHTML') {
					value = $(element).html();
				} else {
					value = element.hasAttribute(name) ? element.getAttribute(name) : value;
				}
				attributes.push({
					name: name,
					value: value,
					fix: true
				});
			}
			for ( var i = 0, l = element.attributes.length; i < l; i++) {
				var attr = element.attributes[i];
				var name = attr.name;
				var value = attr.value;
				if ($.inArray(name, DEFAULT_EDITABLE_ATTRIBUTES) !== -1) {
					// デフォルト表示のものはもう追加していあるのでスキップ
					continue;
				}
				var hidden = false;
				// 編集不可能属性にマッチするかどうかチェック
				for ( var j = 0, len = IGNORE_ATTRIBUTES.length; j < len; j++) {
					if (name.match(getRegex(IGNORE_ATTRIBUTES[j]))) {
						hidden = true;
					}
				}
				attributes.push({
					name: name,
					value: value || '',
					hidden: hidden
				});
			}

			// 属性値を持たない属性が定義されていたら追加
			for ( var i = 0, l = PROPERTY_ATTRIBUTES.length; i < l; i++) {
				var name = PROPERTY_ATTRIBUTES[i];
				if ($(element).prop(name) && !element.hasAttribute(name)) {
					attributes.push({
						name: name,
						value: ''
					});
				}
			}

			this.view.update(this.$editPanel.find('tbody'), 'tagEdit-tr', {
				attributes: attributes
			});
			var $panel = this.$editPanel;
			$panel.data('element', element);

			// 無視するクラス名をinputから避ける
			var $classInput = $panel.find('input[name="class"]');
			var hiddenClasses = [];
			$classInput.data('hiddenClasses', hiddenClasses);

			if ($classInput.val()) {
				var classes = $classInput.val().split(' ');
				for ( var i = 0, l = IGNORE_CLASS_NAME.length; i < l; i++) {
					for ( var j = 0, len = classes.length; j < len; j++) {
						if (classes[j].match(getRegex(IGNORE_CLASS_NAME[i]))) {
							hiddenClasses.push(classes[j]);
							classes.splice(j, 1);
							len--;
							j--;
						}
					}
				}
				$classInput.val(classes.join(' '));
			}
		}
	};

	h5.core.expose(tagEditController);
})();
