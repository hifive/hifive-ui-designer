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

	//	var holderData = hifive.editor.ui.holderData;
	var getButtonSchema = hifive.editor.ui.getBootstrap3ButtonSchema;

	var NO_UNIT = hifive.editor.controller.GenericParameterEditController.NO_UNIT;

	var SINGLE_BUTTON_GROUP_SCHEMA = [{
		label: '縦配置',
		selector: '',
		type: 'boolean',
		booleanValue: 'btn-group-vertical',
		target: 'class'
	}, {
		label: '各ボタン',
		selector: '> button',
		type: 'multiple',
		newItem: '<button class="btn" type="button">New</button>',
		schema: getButtonSchema('', {
			notBlock: true
		})
	}, ];

	var BUTTON_DROPDOWN_SCHEMA = getButtonSchema(['> button:first span:first', '> button']).concat(
			[{
				label: 'ドロップアップ',
				selector: '',
				type: 'boolean',
				booleanValue: 'dropup',
				target: 'class'
			}, {
				label: '右揃え',
				selector: '> ul',
				type: 'boolean',
				booleanValue: 'pull-right',
				target: 'class'
			}, {
				label: '各項目',
				selector: '> ul li',
				type: 'multiple',
				newItem: '<li><a href="#">New</a></li>',
				schema: [{
					label: 'ラベル',
					selector: 'a',
					type: 'string',
					target: 'text'
				}, {
					label: 'HREF属性',
					selector: 'a',
					type: 'string',
					target: 'attr(href)'
				}, {
					label: '区切り線',
					selector: '',
					type: 'boolean',
					booleanValue: 'divider',
					target: 'class'
				}, {
					label: '無効',
					selector: '',
					type: 'boolean',
					booleanValue: 'disabled',
					target: 'class'
				}]
			}]);
	//
	//	function getNavTabsSchema(selector) {
	//
	//		var NAV_TABS_SCHEMA = [{
	//			label: 'タイプ',
	//			selector: selector,
	//			type: 'enum',
	//			enumValue: [['Basic tabs', 'nav-tabs'], ['Basic pills', 'nav-pills']],
	//			target: 'class'
	//		}, {
	//			label: '縦配置',
	//			selector: selector,
	//			type: 'boolean',
	//			booleanValue: 'nav-stacked',
	//			target: 'class'
	//		}, {
	//			label: '各タブ',
	//			selector: selector + ' > li',
	//			type: 'multiple',
	//			newItem: '<li><a href="#" data-toggle="tab">New</a></li>',
	//			schema: [{
	//				label: 'ラベル',
	//				selector: '> a',
	//				type: 'string',
	//				target: 'text'
	//			}, {
	//				label: 'HREF属性',
	//				selector: '> a',
	//				type: 'string',
	//				target: 'attr(href)'
	//			}, {
	//				label: '選択',
	//				selector: '',
	//				type: 'boolean',
	//				booleanValue: 'active',
	//				target: 'class'
	//			}, {
	//				label: '無効',
	//				selector: '',
	//				type: 'boolean',
	//				booleanValue: 'disabled',
	//				target: 'class'
	//			}, {
	//				label: '横位置',
	//				selector: '',
	//				type: 'enum',
	//				enumValue: [['左寄せ', 'pull-left'], ['右寄せ', 'pull-right']],
	//				target: 'class'
	//			}]
	//		}];
	//
	//		return NAV_TABS_SCHEMA;
	//	}
	//
	//	var MEDIA_SCHEMA = [{
	//		label: '画像リンク',
	//		selector: '> a',
	//		type: 'string',
	//		target: 'attr(href)'
	//	}, {
	//		label: '画像SRC',
	//		selector: '> a img',
	//		type: 'string',
	//		target: 'attr(src)'
	//	}, {
	//		label: '画像位置',
	//		selector: '> a',
	//		type: 'enum',
	//		enumValue: [['左寄せ', 'pull-left'], ['右寄せ', 'pull-right']],
	//		target: 'class'
	//	}, {
	//		label: 'タイトル',
	//		selector: '> div.media-body h4.media-heading',
	//		type: 'string',
	//		target: 'text'
	//	}, {
	//		label: '本文',
	//		selector: '> div.media-body span',
	//		type: 'string',
	//		inputType: 'textarea',
	//		target: 'text'
	//	}];

	// グリッド幅を指定する編集スキーマ
	var GRID_SCHEMA = {
		label: '幅(グリッド)',
		selector: '',
		type: 'enum',
		enumValue: [],
		target: 'class'
	};
	for ( var i = 1; i <= 12; i++) {
		GRID_SCHEMA.enumValue.push([i, 'col-md-' + i]);
	}

	//-------------------------------------------------------------------
	// ブートストラップ3部品
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap3',
		palette: 'bootstrap3',
		label: 'Bootstrap3',
		priority: 2.1,
		isGroup: true,
		dependencies: {
			js: '$SYSTEM_LIB$/bootstrap3/3.0.1/js/bootstrap.min.js',
			css: '$SYSTEM_LIB$/bootstrap3/3.0.1/css/bootstrap.min.css'
		},
		depends: 'jquery'
	});
	//-------------------------------------------------------------------
	// フォーム部品
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap3.form',
		palette: 'bootstrap3.form',
		label: 'フォーム部品',
		isGroup: true
	});

	(function() {
		var id = 'bootstrap3.form.textInput';
		var label = 'テキスト入力';

		function createView() {
			var $elem = $('<input  class="form-control" type="text" placeholder="Text input">');
			return $elem;
		}

		var editSchema = [{
			label: 'NAME属性',
			selector: '',
			type: 'string',
			target: 'attr(name)'
		}, {
			label: '入力値',
			selector: '',
			type: 'string',
			target: 'attr(value)'
		}, {
			label: '代替文字列',
			selector: '',
			type: 'string',
			target: 'attr(placeholder)'
		}, {
			label: '無効',
			selector: '',
			type: 'boolean',
			target: 'attr(disabled)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.form.textInput',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.form.textarea';
		var label = '複数行テキスト入力';

		function createView() {
			var $elem = $('<textarea class="form-control" rows="3"></textarea>');
			return $elem;
		}

		var editSchema = [{
			label: 'NAME属性',
			selector: '',
			type: 'string',
			target: 'attr(name)'
		}, {
			label: '入力値',
			selector: '',
			type: 'string',
			inputType: 'textarea',
			target: 'attr(value)'
		}, {
			label: '行数',
			selector: '',
			type: 'integer',
			constraint: {
				min: 1
			},
			target: 'attr(rows)',
			unit: NO_UNIT
		}, {
			label: '無効',
			selector: '',
			type: 'boolean',
			target: 'attr(disabled)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.form.textarea',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.form.checkbox';
		var label = 'チェックボックス';

		function createView() {
			var $elem = $('<label class="checkbox form-controll">'
					+ '<input type="checkbox" value="">' + '<span>Checkbox</span>' + '</label>');
			return $elem;
		}

		var editSchema = [{
			label: 'NAME属性',
			selector: '',
			type: 'string',
			target: 'attr(name)'
		}, {
			label: '値',
			selector: 'input[type="checkbox"]',
			type: 'string',
			target: 'attr(value)'
		}, {
			label: 'チェック',
			selector: 'input[type="checkbox"]',
			type: 'boolean',
			target: 'attr(checked)'
		}, {
			label: 'ラベル',
			selector: 'span',
			type: 'string',
			target: 'text'
		}, {
			label: 'インライン',
			selector: '',
			type: 'boolean',
			booleanValue: 'inline',
			target: 'class'
		}, {
			label: '無効',
			selector: 'input[type="checkbox"]',
			type: 'boolean',
			target: 'attr(disabled)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.form.checkbox',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.form.radio';
		var label = 'ラジオボタン';

		function createView() {
			var $elem = $('<label class="radio form-control">'
					+ '<input type="radio" name="" value="" checked>' + '<span>Option</span>'
					+ '</label>');
			return $elem;
		}

		var editSchema = [{
			label: 'NAME属性',
			selector: '',
			type: 'string',
			target: 'attr(name)'
		}, {
			label: '値',
			selector: 'input[type="radio"]',
			type: 'string',
			target: 'attr(value)'
		}, {
			label: 'チェック',
			selector: 'input[type="radio"]',
			type: 'boolean',
			target: 'attr(checked)'
		}, {
			label: 'ラベル',
			selector: 'span',
			type: 'string',
			target: 'text'
		}, {
			label: 'インライン',
			selector: '',
			type: 'boolean',
			booleanValue: 'inline',
			target: 'class'
		}, {
			label: '無効',
			selector: 'input[type="radio"]',
			type: 'boolean',
			target: 'attr(disabled)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.form.radio',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.form.select';
		var label = 'セレクトボックス';

		function createView() {
			var $elem = $('<select class="form-control"></select>');
			return $elem;
		}

		var editSchema = [{
			label: 'NAME属性',
			selector: '',
			type: 'string',
			target: 'attr(name)'
		}, {
			label: '複数選択',
			selector: '',
			type: 'boolean',
			target: 'attr(multiple)'
		}, {
			label: 'ブロック表示',
			selector: '',
			type: 'boolean',
			booleanValue: 'input-block-level',
			target: 'class'
		}, {
			label: '各項目',
			selector: '> option',
			type: 'multiple',
			newItem: '<option>New</option>',
			schema: [{
				label: 'ラベル',
				selector: '',
				type: 'string',
				target: 'text'
			}, {
				label: '値',
				selector: '',
				type: 'string',
				target: 'attr(value)'
			}, {
				label: '選択',
				selector: '',
				type: 'boolean',
				target: 'attr(selected)'
			}]
		}, {
			label: '無効',
			selector: '',
			type: 'boolean',
			target: 'attr(disabled)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.form.select',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.form.submit';
		var label = '実行ボタン';

		function createView() {
			var $elem = $('<button class="btn form-control" type="submit">Submit</button>');
			return $elem;
		}

		var editSchema = getButtonSchema('');

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.form.submit',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// ボタン
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap3.button',
		palette: 'bootstrap3.button',
		label: 'ボタン',
		isGroup: true
	});
	(function() {
		var id = 'bootstrap3.button.button';
		var label = 'ボタン';

		function createView() {
			var $elem = $('<button class="btn" type="button">Button</button>');
			return $elem;
		}

		var editSchema = getButtonSchema('');

		// TODO ボタンのスキーマはbootstrap2を流用しているが、クラス名(サイズとか)変わっているので3に合わせる
		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.button.button',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.button.singleButtonGroup';
		var label = 'ボタングループ';

		function createView() {
			var $elem = $('<div class="btn-group">' + '<button class="btn">Left</button>'
					+ '<button class="btn">Middle</button>' + '<button class="btn">Right</button>'
					+ '</div>');
			return $elem;
		}

		var editSchema = SINGLE_BUTTON_GROUP_SCHEMA;

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.button.singleButtonGroup',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.button.multipleButtonGroups';
		var label = '複数ボタングループ';

		function createView() {
			var $elem = $('<div class="btn-toolbar">' + '<div class="btn-group">'
					+ '<button class="btn">1</button>' + '<button class="btn">2</button>'
					+ '<button class="btn">3</button>' + '<button class="btn">4</button>'
					+ '</div>' + '<div class="btn-group">' + '<button class="btn">5</button>'
					+ '<button class="btn">6</button>' + '<button class="btn">7</button>'
					+ '</div>' + '<div class="btn-group">' + '<button class="btn">8</button>'
					+ '</div>' + '</div>');
			return $elem;
		}

		var editSchema = [{
			label: '各グループ',
			selector: '> div.btn-group',
			type: 'multiple',
			newItem: '<div class="btn-group">' + '<button class="btn">New</button>'
					+ '<button class="btn">New</button>' + '<button class="btn">New</button>'
					+ '</div>',
			schema: SINGLE_BUTTON_GROUP_SCHEMA
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.button.multipleButtonGroups',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	hifive.editor
			.addCreator(

			(function() {

				var id = 'bootstrap3.button.buttonDropdown';
				var label = 'ドロップダウンボタン';

				function createView() {
					var $elem = $('<div class="btn-group">'
							+ '<button class="btn dropdown-toggle" data-toggle="dropdown"><span>Action</span><span class="caret"></span></button>'
							+ '<ul class="dropdown-menu">'
							+ '<li><a tabindex="-1" href="#">Action</a></li>'
							+ '<li><a tabindex="-1" href="#">Another action</a></li>'
							+ '<li><a tabindex="-1" href="#">Something else here</a></li>'
							+ '<li class="divider"><a tabindex="-1"></a></li>'
							+ '<li><a tabindex="-1" href="#">Separated link</a></li>' + '</ul>'
							+ '</div>');
					return $elem;
				}

				var editSchema = BUTTON_DROPDOWN_SCHEMA;

				return {
					label: label,
					id: id,
					palette: 'bootstrap3.button.buttonDropdown',
					createView: createView,
					createEditor: editSchema
				};
			})());

	(function() {
		var id = 'bootstrap3.button.splitButtonDropdown';
		var label = '分離型ドロップダウンボタン';

		function createView() {
			var $elem = $('<div class="btn-group">'
					+ '<button class="btn"><span>Action</span></button>'
					+ '<button class="btn dropdown-toggle" data-toggle="dropdown"><span class="caret"></span></button>'
					+ '<ul class="dropdown-menu">'
					+ '<li><a tabindex="-1" href="#">Action</a></li>'
					+ '<li><a tabindex="-1" href="#">Another action</a></li>'
					+ '<li><a tabindex="-1" href="#">Something else here</a></li>'
					+ '<li class="divider"><a tabindex="-1"></a></li>'
					+ '<li><a tabindex="-1" href="#">Separated link</a></li>' + '</ul>' + '</div>');
			return $elem;
		}

		function resize(doc, element, operation) {
			var $elem = $(element);
			if (operation.dx) {
				var $xtarget = $elem.find('> button:first-child');
				var currentW = $xtarget.width();
				$xtarget.width(currentW + dx);
			}

			if (operation.dy) {
				var $ytarget = $elem.find('> button');
				var currentH = $ytarget.height();
				$ytarget.height(currentH + dy);
			}
		}

		var editSchema = BUTTON_DROPDOWN_SCHEMA;

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.button.splitButtonDropdown',
			createView: createView,
			createEditor: editSchema,
			resize: resize
		};
		hifive.editor.addCreator(creator);
	})();
	//-------------------------------------------------------------------
	// レイアウト
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap3.layout',
		palette: 'bootstrap3.layout',
		label: 'レイアウト',
		priority: 1,
		isGroup: true
	});

	(function() {
		var id = 'bootstrap3.layout.row';
		var label = '行コンテナ';

		function createView() {
			var $elem = $('<div class="row layoutCell _h5editorMinSize"></div>');
			return $elem;
		}
		var editSchema = [{
			label: '幅',
			type: 'number',
			target: 'style(width)'
		}, {
			label: '高さ',
			type: 'number',
			target: 'style(height)'
		}];
		var creator = {
			id: id,
			palette: 'bootstrap3.layout.row',
			label: label,
			createView: createView,
			createEditor: editSchema,
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.layout.div';
		var label = 'グリッド指定DIV要素';

		function createView() {
			var $elem = $('<div class="layoutCell _h5editorMinSize col-md-2"></div>');
			return $elem;
		}
		var editSchema = [GRID_SCHEMA, {
			label: '高さ',
			type: 'number',
			target: 'style(height)'
		}];
		var creator = {
			id: id,
			palette: 'bootstrap3.layout.div',
			label: label,
			createView: createView,
			createEditor: editSchema,
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// ページヘッダ
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap3.pageheader',
		palette: 'bootstrap3.pageheader',
		label: 'ページヘッダ',
		isGroup: true
	});
	(function() {
		var id = 'bootstrap3.pageheader.pageHeader';
		var label = 'ページヘッダ';

		function createView() {
			var $elem = $('<div class="page-header">'
					+ '<h1><span>Example page header</span> <small>Subtext for header</small></h1>'
					+ '</div>');
			return $elem;
		}

		var editSchema = [{
			label: 'タイトル',
			selector: '> h1 span',
			type: 'string',
			target: 'text'
		}, {
			label: 'サブタイトル',
			selector: '> h1 small',
			type: 'string',
			target: 'text'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.pageheader.pageHeader',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.pageheader.jumbotron';
		var label = '導入ボックス';

		function createView() {
			var $elem = $('<div class="jumbotron">' + '<h1>Heading</h1>' + '<p>Tagline</p>' + '<p>'
					+ '<button class="btn btn-primary btn-lg">' + 'Learn more' + '</button>'
					+ '</p>' + '</div>');
			return $elem;
		}

		var editSchema = [{
			label: 'タイトル',
			selector: '> h1',
			type: 'string',
			target: 'text'
		}, {
			label: 'タグ',
			selector: '> p:first',
			type: 'string',
			inputType: 'textarea',
			target: 'text'
		}].concat(getButtonSchema('> p button', {
			prefixLabel: 'ボタン '
		}));

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.pageheader.jumbotron',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// ナビゲーション
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap3.nav',
		palette: 'bootstrap3.nav',
		label: 'ナビゲーション',
		isGroup: true
	});
	(function() {
		var id = 'bootstrap3.nav.navbar';
		var label = 'ナビゲーションバー';

		function createView() {
			var $elem = $('<nav class="navbar navbar-default" role="navigation">'
					+ '<div class="navbar-header">'
					+ '<a class="navbar-brand" href="#">Brand</a></div>'
					+ '<div class="navbar-collapse">' + '<ul class="nav navbar-nav">'
					+ '<li class="active"><a href="#">Link</a></li>'
					+ '<li><a href="#">Link</a></li>' + '<li><a href="#">Link</a></li>'
					+ '<li><a href="#">Link</a></li></ul></div></nav>');
			return $elem;
		}

		//別途検討
		var editSchema = [{
			label: '反転色',
			type: 'boolean',
			booleanValue: 'navbar-inverse',
			target: 'class'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.nav.navbar',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.nav.navbarBrand';
		var label = 'ナビゲーションタイトル';

		function createView() {
			var $elem = $('<a class="brand" href="#">Project name</a>');
			return $elem;
		}

		var editSchema = [{
			label: 'ラベル',
			selector: '',
			type: 'string',
			target: 'text'
		}, {
			label: 'HREF属性',
			selector: '',
			type: 'string',
			target: 'attr(href)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.nav.navbarBrand',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.nav.navLists';
		var label = '積み上げタブ';

		function createView() {
			var $elem = $('<ul class="nav nav-tabs nav-stacked">'
					+ '<li class="active"><a href="#">Home</a></li>'
					+ '<li><a href="#">Library</a></li>' + '<li><a href="#">Applications</a></li>'
					+ '</ul>');
			return $elem;
		}

		var editSchema = [{
			label: '各項目',
			selector: '> li',
			type: 'multiple',
			newItem: '<li><a href="#">New</a></li>',
			schema: [{
				label: 'ラベル',
				selector: '> a,span',
				type: 'string',
				target: 'func',
				getValue: function(element, option) {
					return element.text();
				},
				reflect: function(element, value) {
					element.text(value);
				}
			}, {
				label: 'HREF属性',
				selector: '> a,span',
				type: 'string',
				target: 'attr(href)'
			}, {
				label: 'ヘッダー',
				selector: '',
				type: 'boolean',
				booleanValue: 'nav-header',
				target: 'func',
				getValue: function(element, option) {
					return element.hasClass('nav-header');
				},
				reflect: function(element, value) {
					if (value) {
						if (element.find('a').length) {
							var $span = $('<span></span>');
							$span.text(element.text());
							element.children().remove();
							element.append($span);
							$span.addClass(value);
						}
					} else {
						if (element.find('span').length) {
							var $a = $('<a href="#"></a>');
							$a.text(element.text());
							element.children().remove();
							element.append($a);
							element.removeClass('nav-header');
						}
					}
				}
			}, {
				label: '選択',
				selector: '',
				type: 'boolean',
				booleanValue: 'active',
				target: 'class'
			}, {
				label: '無効',
				selector: '',
				type: 'boolean',
				booleanValue: 'disabled',
				target: 'class'
			}]
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.nav.navLists',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.nav.navbarForm';
		var label = 'ナビゲーションフォーム';

		function createView() {
			var $elem = $('<form class="navbar-form pull-left">' + '<input type="text">'
					+ '<button type="submit" class="btn">Submit</button>' + '</form>');
			return $elem;
		}

		var editSchema = [{
			label: 'ACTION属性',
			selector: '',
			type: 'string',
			target: 'attr(action)',
		}, {
			label: 'NAME属性',
			selector: '',
			type: 'string',
			target: 'attr(name)',
		}, {
			label: 'TARGET属性',
			selector: '',
			type: 'string',
			target: 'attr(target)',
		}, {
			label: 'ボタンラベル',
			selector: '> button',
			type: 'string',
			target: 'text'
		}, {
			label: '横位置',
			selector: '',
			type: 'enum',
			enumValue: [['左寄せ', 'pull-left'], ['右寄せ', 'pull-right']],
			target: 'class'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.nav.navbarForm',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.nav.breadcrumbs';
		var label = 'パンくずリスト';

		function createView() {
			var $elem = $('<ul class="breadcrumb">'
					+ '<li><a href="#">Home</a> <span class="divider"></span></li>'
					+ '<li><a href="#">Library</a> <span class="divider"></span></li>'
					+ '<li class="active">Data</li>' + '</ul>');
			return $elem;
		}

		var editSchema = [{
			label: '表示中の項目',
			selector: '> li.active',
			type: 'string',
			target: 'text'
		}, {
			label: '各項目',
			selector: '> li:not(.active)',
			type: 'multiple',
			newItem: '<li><a href="#">New</a> <span class="divider">/</span></li>',
			appendItem: function(newItem, itemParent) {
				itemParent.find('.active').before(newItem);
			},
			schema: [{
				label: 'ラベル',
				selector: '> a',
				type: 'string',
				target: 'text'
			}, {
				label: 'HREF属性',
				selector: '> a',
				type: 'string',
				target: 'attr(href)'
			}]
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.nav.breadcrumbs',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.nav.pagination';
		var label = 'ページ切替';

		function createView() {
			var $elem = $('<ul class="pagination">' + '<li><a href="#">Prev</a></li>'
					+ '<li><a href="#">1</a></li>' + '<li><a href="#">2</a></li>'
					+ '<li><a href="#">3</a></li>' + '<li><a href="#">4</a></li>'
					+ '<li><a href="#">5</a></li>' + '<li><a href="#">Next</a></li>' + '</ul>');
			return $elem;
		}

		var editSchema = [
				{
					label: 'サイズ',
					selector: '',
					type: 'enum',
					enumValue: [['Large', 'pagination-large'], ['Default', ''],
							['Small', 'pagination-small'], ['Mini', 'pagination-mini']],
					target: 'class'
				},
				{
					label: '横位置',
					selector: '',
					type: 'enum',
					enumValue: [['左寄せ', ''], ['中央寄せ', 'pagination-centered'],
							['右寄せ', 'pagination-right']],
					target: 'class'
				}, {
					label: '各項目',
					selector: '> ul li',
					itemParent: '> ul',
					type: 'multiple',
					newItem: '<li><a href="#">New</a></li>',
					schema: [{
						label: 'ラベル',
						selector: '> a',
						type: 'string',
						target: 'text'
					}, {
						label: 'HREF属性',
						selector: '> a',
						type: 'string',
						target: 'attr(href)'
					}, {
						label: '選択',
						selector: '',
						type: 'boolean',
						booleanValue: 'active',
						target: 'class'
					}, {
						label: '無効',
						selector: '',
						type: 'boolean',
						booleanValue: 'disabled',
						target: 'class'
					}]
				}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.nav.pagination',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.nav.pager';
		var label = 'ページ遷移';

		function createView() {
			var $elem = $('<ul class="pager">' + '<li><a href="#">Previous</a></li>'
					+ '<li><a href="#">Next</a></li>' + '</ul>');
			return $elem;
		}

		var editSchema = [{
			label: '両端寄せ',
			selector: 'li:first',
			type: 'boolean',
			booleanValue: 'previous',
			target: 'func',
			getValue: function(element) {
				return element.hasClass('previous');
			},
			reflect: function(element, value) {
				if (value) {
					element.addClass('previous').next().addClass('next');
				} else {
					element.removeClass('previous').next().removeClass('next');
				}
			}
		}, {
			label: '前遷移 無効',
			selector: '> li:first',
			type: 'boolean',
			booleanValue: 'disabled',
			target: 'class'
		}, {
			label: '次遷移 無効',
			selector: '> li:last',
			type: 'boolean',
			booleanValue: 'disabled',
			target: 'class'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.nav.pager',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// 通知
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap3.info',
		palette: 'bootstrap3.info',
		label: '通知',
		isGroup: true
	});

	(function() {
		var id = 'bootstrap3.info.alert';
		var label = '警告';

		function createView() {
			var $elem = $('<div class="alert alert-warning">'
					+ '  <button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
					+ '  <strong>Warning!</strong> <span>Best check yo self, you\'re not looking too good.</span>'
					+ '</div>');
			return $elem;
		}

		var editSchema = [
				{
					label: 'タイトル',
					selector: '> strong',
					type: 'string',
					target: 'text'
				},
				{
					label: '本文',
					selector: '> span',
					type: 'string',
					inputType: 'textarea',
					target: 'text'
				},
				{
					label: '長文用',
					selector: '',
					type: 'boolean',
					booleanValue: 'alert-block',
					target: 'class'
				},
				{
					label: 'タイプ',
					selector: '',
					type: 'enum',
					enumValue: [['Warning', 'alert-warning'], ['Denger', 'alert-danger'],
							['Success', 'alert-success'], ['Information', 'alert-info']],
					target: 'class'
				}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.info.alert',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.info.progressBar';
		var label = 'プログレスバー';

		function createView() {
			var $elem = $('<div class="progress"><div class="progress-bar" role="progressbar" style="width: 30%;"></div></div>');
			return $elem;
		}

		var editSchema = [
				{
					label: 'ストライプ',
					selector: '',
					type: 'boolean',
					booleanValue: 'progress-striped',
					target: 'class'
				},
				{
					label: '+アニメ',
					selector: '',
					type: 'boolean',
					booleanValue: 'active',
					target: 'class'
				},
				{
					label: 'タイプ',
					selector: '',
					type: 'enum',
					enumValue: [['Default', ''], ['Information', 'progress-bar-info'],
							['Success', 'progress-bar-success'],
							['Warning', 'progress-bar-warning'], ['Danger', 'progress-bar-danger']],
					target: 'class'
				},
				{
					label: '各バー',
					selector: '> .progress-bar',
					type: 'multiple',
					newItem: '<div class="progress-bar" style="width: 5%;"></div>',
					schema: [
							{
								label: '割合',
								selector: '',
								type: 'integer',
								constraint: {
									notNull: true,
									min: 0,
									max: 100,
									step: 1
								},
								target: 'style(width)',
								unit: '%'
							},
							{
								label: 'タイプ',
								selector: '',
								type: 'enum',
								enumValue: [['Default', ''], ['Information', 'progress-bar-info'],
										['Success', 'progress-bar-success'],
										['Warning', 'progress-bar-warning'],
										['Danger', 'progress-bar-danger']],
								target: 'class'
							}]
				}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.info.progressBar',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap3.info.well';
		var label = 'インセットボックス';

		function createView() {
			var $elem = $('<div class="well">' + 'well' + '</div>');
			return $elem;
		}

		var editSchema = [{
			label: '本文',
			selector: '',
			type: 'string',
			inputType: 'textarea',
			target: 'text'
		}, {
			label: 'サイズ',
			selector: '',
			type: 'enum',
			enumValue: [['Large', 'well-lg'], ['Default', ''], ['Small', 'well-sm']],
			target: 'class'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap3.info.well',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

})();