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

	var holderData = hifive.editor.ui.holderData;
	var getButtonSchema = hifive.editor.ui.getBootstrapButtonSchema;

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

	var BUTTON_DROPDOWN_SCHEMA = getButtonSchema(['> button:first span:first', '> button:first'], {
		notBlock: true
	}).concat([{
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

	function getNavTabsSchema(selector) {

		var NAV_TABS_SCHEMA = [{
			label: 'タイプ',
			selector: selector,
			type: 'enum',
			enumValue: [['Basic tabs', 'nav-tabs'], ['Basic pills', 'nav-pills']],
			target: 'class'
		}, {
			label: '縦配置',
			selector: selector,
			type: 'boolean',
			booleanValue: 'nav-stacked',
			target: 'class'
		}, {
			label: '各タブ',
			selector: selector + ' > li',
			type: 'multiple',
			newItem: '<li><a href="#" data-toggle="tab">New</a></li>',
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
			}, {
				label: '横位置',
				selector: '',
				type: 'enum',
				enumValue: [['左寄せ', 'pull-left'], ['右寄せ', 'pull-right']],
				target: 'class'
			}]
		}];

		return NAV_TABS_SCHEMA;
	}

	var MEDIA_SCHEMA = [{
		label: '画像リンク',
		selector: '> a',
		type: 'string',
		target: 'attr(href)'
	}, {
		label: '画像SRC',
		selector: '> a img',
		type: 'string',
		target: 'attr(src)'
	}, {
		label: '画像位置',
		selector: '> a',
		type: 'enum',
		enumValue: [['左寄せ', 'pull-left'], ['右寄せ', 'pull-right']],
		target: 'class'
	}, {
		label: 'タイトル',
		selector: '> div.media-body h4.media-heading',
		type: 'string',
		target: 'text'
	}, {
		label: '本文',
		selector: '> div.media-body span',
		type: 'string',
		inputType: 'textarea',
		target: 'text'
	}];

	// グリッド幅を指定する編集スキーマ
	var GRID_SCHEMA = {
		label: '幅(グリッド)',
		selector: '',
		type: 'enum',
		enumValue: [],
		target: 'class'
	};
	for ( var i = 1; i <= 12; i++) {
		GRID_SCHEMA.enumValue.push([i, 'span' + i]);
	}
	//-------------------------------------------------------------------
	// ブートストラップ部品
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap',
		palette: 'bootstrap',
		label: 'Bootstrap',
		priority: 2,
		isGroup: true,
		dependencies: {
			js: '$SYSTEM_LIB$/bootstrap/js/bootstrap.min.js',
			css: '$SYSTEM_LIB$/bootstrap/css/bootstrap.min.css'
		},
		depends: 'jquery'
	});

	//-------------------------------------------------------------------
	// レイアウト
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap.layout',
		palette: 'bootstrap.layout',
		label: 'レイアウト',
		priority: 1,
		isGroup: true
	});
	(function() {
		var id = 'bootstrap.layout.row';
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
			palette: 'bootstrap.layout.row',
			label: label,
			createView: createView,
			createEditor: editSchema,
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.layout.div';
		var label = 'グリッド指定DIV要素';

		function createView() {
			var $elem = $('<div class="layoutCell span2 _h5editorMinSize"></div>');
			return $elem;
		}
		var editSchema = [GRID_SCHEMA, {
			label: '高さ',
			type: 'number',
			target: 'style(height)'
		}];
		var creator = {
			id: id,
			palette: 'bootstrap.layout.div',
			label: label,
			createView: createView,
			createEditor: editSchema,
		};
		hifive.editor.addCreator(creator);
	})();
	//-------------------------------------------------------------------
	// フォーム部品
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap.form',
		palette: 'bootstrap.form',
		label: 'フォーム部品',
		isGroup: true
	});

	(function() {
		var id = 'bootstrap.form.textInput';
		var label = 'テキスト入力';

		function createView() {
			var $elem = $('<input type="text" placeholder="Text input">');
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
			label: 'ブロック表示',
			selector: '',
			type: 'boolean',
			booleanValue: 'input-block-level',
			target: 'class'
		}, {
			label: '無効',
			selector: '',
			type: 'boolean',
			target: 'attr(disabled)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.form.textInput',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.form.textarea';
		var label = '複数行テキスト入力';

		function createView() {
			var $elem = $('<textarea rows="3"></textarea>');
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
			label: 'ブロック表示',
			selector: '',
			type: 'boolean',
			booleanValue: 'input-block-level',
			target: 'class'
		}, {
			label: '無効',
			selector: '',
			type: 'boolean',
			target: 'attr(disabled)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.form.textarea',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.form.checkbox';
		var label = 'チェックボックス';

		function createView() {
			var $elem = $('<label class="checkbox">' + '<input type="checkbox" value="">'
					+ '<span>Checkbox</span>' + '</label>');
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
			palette: 'bootstrap.form.checkbox',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.form.radio';
		var label = 'ラジオボタン';

		function createView() {
			var $elem = $('<label class="radio">' + '<input type="radio" name="" value="" checked>'
					+ '<span>Option</span>' + '</label>');
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
			palette: 'bootstrap.form.radio',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.form.select';
		var label = 'セレクトボックス';

		function createView() {
			var $elem = $('<select></select>');
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
			palette: 'bootstrap.form.select',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.form.submit';
		var label = '実行ボタン';

		function createView() {
			var $elem = $('<button class="btn" type="submit">Submit</button>');
			return $elem;
		}

		var editSchema = getButtonSchema('');

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.form.submit',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.form.searchForm';
		var label = '検索用フォーム';

		function createView() {
			var $elem = $('<form class="form-search">'
					+ '<input type="text" class="input-medium search-query">'
					+ '<button type="submit" class="btn">Search</button>' + '</form>');
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
			selector: 'button',
			type: 'string',
			target: 'text'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.form.searchForm',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// フォームサンプル部品
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap.form.sample',
		palette: 'bootstrap.form.sample',
		label: 'フォームサンプル',
		isGroup: true
	});

	(function() {
		var id = 'bootstrap.form.sample.login';
		var label = 'ログインフォーム';

		function createView() {
			var $elem = $('<form>' + '<fieldset>' + '<legend>Login</legend>'
					+ '<label>Email</label>' + '<input type="text" placeholder="Email">'
					+ '<label>Password</label>' + '<input type="password" placeholder="Password">'
					//+ '<span class="help-block">Example block-level help text here.</span>'
					+ '<label class="checkbox">' + '<input type="checkbox"> Remember me'
					+ '</label>' + '<button type="submit" class="btn">Log in</button>'
					+ '</fieldset>' + '</form>');
			return $elem;
		}

		//子要素の追加・削除が課題
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
			label: 'インライン',
			selector: '',
			type: 'boolean',
			booleanValue: 'form-inline',
			target: 'class'
		}, {
			label: '水平配置',
			selector: '',
			type: 'boolean',
			booleanValue: 'form-horizontal',
			target: 'class'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.form.sample.login',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.form.sample.name';
		var label = '名前入力フォーム';

		function createView() {
			var $elem = $('<form>' + '<table class="table">' + '<tr><td>名前(漢字)</td>'
					+ '<td><label>姓</label></td>' + '<td><input type="text" placeholder="姓"></td>'
					+ '<td><label>名</label></td>' + '<td><input type="text" placeholder="名"></td>'
					+ '</tr><tr>' + '<tr><td>名前(ひらがな)</td>' + '<td><label>せい</label></td>'
					+ '<td><input type="text" placeholder="せい"></td>'
					+ '<td><label>めい</label></td>'
					+ '<td><input type="text" placeholder="めい"></td>'
					+ '</tr></table><input class="btn" type="submit" value="送信"></form>');
			return $elem;
		}

		//子要素の追加・削除が課題
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
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.form.sample.name',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// 画像・メディア
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap.media',
		palette: 'bootstrap.media',
		label: '画像・メディア',
		isGroup: true
	});

	(function() {
		var id = 'bootstrap.media.image';
		var label = '画像';

		function createView() {
			var $elem = $('<img src="' + holderData + '" class="img-rounded">');
			return $elem;
		}

		var editSchema = [
				{
					label: 'SRC属性',
					selector: '',
					type: 'string',
					target: 'attr(src)'
				},
				{
					label: 'タイプ',
					selector: '',
					type: 'enum',
					enumValue: [['なし', ''], ['角丸', 'img-rounded'], ['円', 'img-circle'],
							['枠付き', 'img-polaroid']],
					target: 'class'
				}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.media.image',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.media.thumbnails';
		var label = 'サムネイル';

		function createView() {
			var $elem = $('<ul class="thumbnails">' + '<li>' + '<a href="#" class="thumbnail">'
					+ '<img src="' + holderData + '" alt="">' + '</a>' + '</li>'
					+ '<ul class="thumbnails">' + '<li>' + '<a href="#" class="thumbnail">'
					+ '<img src="' + holderData + '" alt="">' + '</a>' + '</li>' + '</ul>');
			return $elem;
		}

		var editSchema = [{
			label: '各項目',
			selector: '> ul li',
			itemParent: '> ul',
			type: 'multiple',
			newItem: '<li>' + '<a href="#" class="thumbnail">' + '<img src="' + holderData
					+ '" alt="">' + '</a>' + '</li>',
			schema: [{
				label: 'SRC属性',
				selector: '> a img',
				type: 'string',
				target: 'attr(src)'
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
			palette: 'bootstrap.media.thumbnails',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.media.media';
		var label = 'メディアボックス';

		function createView() {
			var $elem = $('<div class="media">' + '<a class="pull-left" href="#">'
					+ '<img class="media-object" src="' + holderData + '">' + '</a>'
					+ '<div class="media-body">' + '<h4 class="media-heading">Media heading</h4>'
					+ '<span>Text</span>' + '</div>');
			return $elem;
		}

		var editSchema = MEDIA_SCHEMA;

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.media.media',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.media.mediaList';
		var label = 'メディアボックスリスト';

		function createView() {
			var $elem = $('<ul class="media-list">' + '<li class="media">'
					+ '<a class="pull-left" href="#">' + '<img class="media-object" src="'
					+ holderData + '">' + '</a>' + '<div class="media-body">'
					+ '<h4 class="media-heading">Media heading</h4>' + '<span>Text</span>'
					+ '</div>' + '</li>' + '</ul>');
			return $elem;
		}

		var editSchema = [{
			label: '各項目',
			selector: '> li',
			type: 'multiple',
			newItem: '<li class="media">' + '<a class="pull-left" href="#">'
					+ '<img class="media-object" src="' + holderData + '">' + '</a>'
					+ '<div class="media-body">' + '<h4 class="media-heading">Media heading</h4>'
					+ '<span>Text</span>' + '</div>' + '</li>',
			schema: MEDIA_SCHEMA
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.media.mediaList',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// ボタン
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap.button',
		palette: 'bootstrap.button',
		label: 'ボタン',
		isGroup: true
	});
	(function() {
		var id = 'bootstrap.button.button';
		var label = 'ボタン';

		function createView() {
			var $elem = $('<button class="btn" type="button">Button</button>');
			return $elem;
		}

		var editSchema = getButtonSchema('');

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.button.button',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.button.singleButtonGroup';
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
			palette: 'bootstrap.button.singleButtonGroup',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.button.multipleButtonGroups';
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
			palette: 'bootstrap.button.multipleButtonGroups',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	hifive.editor
			.addCreator(

			(function() {

				var id = 'bootstrap.button.buttonDropdown';
				var label = 'ドロップダウンボタン';

				function createView() {
					var $elem = $('<div class="btn-group">'
							+ '<button class="btn dropdown-toggle" data-toggle="dropdown"><span>Action</span> <span class="caret"></span></button>'
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
					palette: 'bootstrap.button.buttonDropdown',
					createView: createView,
					createEditor: editSchema
				};
			})());

	(function() {
		var id = 'bootstrap.button.splitButtonDropdown';
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
			palette: 'bootstrap.button.splitButtonDropdown',
			createView: createView,
			createEditor: editSchema,
			resize: resize
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// タブ
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap.tab',
		palette: 'bootstrap.tab',
		label: 'タブ',
		isGroup: true
	});
	(function() {
		var id = 'bootstrap.tab.navTabs';
		var label = 'タブ';

		function createView() {
			var $elem = $('<ul class="nav nav-tabs">'
					+ '<li class="active"><a href="#">Home</a></li>'
					+ '<li><a href="#">Profile</a></li>' + '<li><a href="#">Messages</a></li>'
					+ '</ul>');
			return $elem;
		}

		var editSchema = getNavTabsSchema('');

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.tab.navTabs',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.tab.tabbable';
		var label = 'タブコンテナ';

		function createView() {
			var $elem = $('<div class="tabbable">' + '<ul class="nav nav-tabs">'
					+ '<li class="active"><a href="#tab1" data-toggle="tab">Section 1</a></li>'
					+ '<li><a href="#tab2" data-toggle="tab">Section 2</a></li>' + '</ul>'
					+ '<div class="tab-content">'
					+ '<div class="tab-pane active layoutCell" id="tab1">' + '<p>Section 1</p>'
					+ '</div>' + '<div class="tab-pane layoutCell" id="tab2">' + '<p>Section 2</p>'
					+ '</div>' + '</div>' + '</div>');
			return $elem;
		}

		var editSchema = [{
			label: 'タブ表示位置',
			selector: '',
			type: 'enum',
			enumValue: [['上', ''], ['左', 'tabs-left'], ['右', 'tabs-right'], ['下', 'tabs-below']],
			onchange: function($elm, val) {
				if (val === 'tabs-below') {
					$elm.find('.nav-tabs').insertAfter($elm.find('.tab-content'));
				} else if ($elm.find('.tab-content').next().hasClass('nav-tabs')) {
					$elm.find('.tab-content').insertAfter($elm.find('.nav-tabs'));
				}
			},
			target: 'class'
		}].concat(getNavTabsSchema('> ul.nav.nav-tabs').concat([{
			label: '各ペイン',
			selector: '> div.tab-content div.tab-pane',
			type: 'multiple',
			newItem: '<div class="tab-pane" id=""><div class="row"><p>New Section</p></div></div>',
			schema: [{
				label: 'ID属性',
				selector: '',
				type: 'string',
				target: 'attr(id)'
			}, {
				label: '選択',
				selector: '',
				type: 'boolean',
				booleanValue: 'active',
				target: 'class'
			}, {
				label: '内容',
				selector: '',
				type: 'string',
				inputType: 'textarea',
				target: 'html'
			}]
		}]));

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.tab.tabbable',
			createView: createView,
			createEditor: editSchema,
			isBlock: true
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// ナビゲーション
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap.nav',
		palette: 'bootstrap.nav',
		label: 'ナビゲーション',
		isGroup: true
	});
	(function() {
		var id = 'bootstrap.nav.navbar';
		var label = 'ナビゲーションバー';

		function createView() {
			var $elem = $('<div class="navbar">' + '<div class="navbar-inner">'
					+ '<a class="brand" href="#">Title</a>' + '<ul class="nav">'
					+ '<li class="active"><a href="#">Home</a></li>'
					+ '<li><a href="#">Link</a></li>' + '<li><a href="#">Link</a></li>' + '</ul>'
					+ '</div>' + '</div>');
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
			palette: 'bootstrap.nav.navbar',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.nav.navbarBrand';
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
			palette: 'bootstrap.nav.navbarBrand',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.nav.navbarLinks';
		var label = 'ナビゲーションリンク';

		function createView() {
			var $elem = $('<ul class="nav">' + '<li class="active"><a href="#">Home</a></li>'
					+ '<li><a href="#">Link</a></li>' + '<li><a href="#">Link</a></li>' + '</ul>');
			return $elem;
		}

		var editSchema = [{
			label: '各項目',
			selector: '> li',
			type: 'multiple',
			newItem: '<li><a href="#">New Link</a></li>',
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
				label: '区切り線',
				selector: '',
				type: 'boolean',
				booleanValue: 'divider-vertical',
				target: 'class'
			}]
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.nav.navbarLinks',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.nav.navLists';
		var label = 'ナビゲーションリスト';

		function createView() {
			var $elem = $('<ul class="nav nav-list">'
					+ '<li class="nav-header"><span>List header</span></li>'
					+ '<li class="active"><a href="#">Home</a></li>'
					+ '<li><a href="#">Library</a></li>' + '<li><a href="#">Applications</a></li>'
					+ '<li class="nav-header"><span>Another list header</span></li>'
					+ '<li><a href="#">Profile</a></li>' + '<li><a href="#">Settings</a></li>'
					+ '<li class="divider"><a></a></li>' + '<li><a href="#">Help</a></li>'
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
			}, {
				label: '区切り線',
				selector: '',
				type: 'boolean',
				booleanValue: 'divider',
				target: 'class'
			}]
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.nav.navLists',
			createView: createView,
			createEditor: editSchema,
			isBlock: true
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.nav.navbarForm';
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
			palette: 'bootstrap.nav.navbarForm',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.nav.navbarSearch';
		var label = 'ナビゲーション検索フォーム';

		function createView() {
			var $elem = $('<form class="navbar-search pull-left">'
					+ '<input type="text" class="search-query" placeholder="Search">' + '</form>');
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
			label: '代替文字列',
			selector: 'input',
			type: 'string',
			target: 'attr(placeholder)'
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
			palette: 'bootstrap.nav.navbarSearch',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.nav.breadcrumbs';
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
			palette: 'bootstrap.nav.breadcrumbs',
			createView: createView,
			createEditor: editSchema,
			needsSpanWrap: true
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.nav.pagination';
		var label = 'ページ切り替え';

		function createView() {
			var $elem = $('<div class="pagination">' + '<ul>' + '<li><a href="#">Prev</a></li>'
					+ '<li><a href="#">1</a></li>' + '<li><a href="#">2</a></li>'
					+ '<li><a href="#">3</a></li>' + '<li><a href="#">4</a></li>'
					+ '<li><a href="#">5</a></li>' + '<li><a href="#">Next</a></li>' + '</ul>'
					+ '</div>');
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
			palette: 'bootstrap.nav.pagination',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.nav.pager';
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
			palette: 'bootstrap.nav.pager',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// 通知
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap.info',
		palette: 'bootstrap.info',
		label: '通知',
		isGroup: true
	});

	(function() {
		var id = 'bootstrap.info.alert';
		var label = '警告';

		function createView() {
			var $elem = $('<div class="alert">'
					+ '  <button type="button" class="close" data-dismiss="alert">&times;</button>'
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
					enumValue: [['Warning', ''], ['Error', 'alert-error'],
							['Success', 'alert-success'], ['Information', 'alert-info']],
					target: 'class'
				}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.info.alert',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.info.progressBar';
		var label = 'プログレスバー';

		function createView() {
			var $elem = $('<div class="progress"><div class="bar" style="width: 30%;"></div></div>');
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
					enumValue: [['Default', ''], ['Information', 'progress-info'],
							['Success', 'progress-success'], ['Warning', 'progress-warning'],
							['Danger', 'progress-danger']],
					target: 'class'
				},
				{
					label: '各バー',
					selector: '> div.bar',
					type: 'multiple',
					newItem: '<div class="bar" style="width: 5%;"></div>',
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
								enumValue: [['Default', ''], ['Information', 'bar-info'],
										['Success', 'bar-success'], ['Warning', 'bar-warning'],
										['Danger', 'bar-danger']],
								target: 'class'
							}]
				}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.info.progressBar',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.info.well';
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
			enumValue: [['Large', 'well-large'], ['Default', ''], ['Small', 'well-small']],
			target: 'class'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'bootstrap.info.well',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// ページヘッダ
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'bootstrap.pageheader',
		palette: 'bootstrap.pageheader',
		label: 'ページヘッダ',
		isGroup: true
	});
	(function() {
		var id = 'bootstrap.pageheader.pageHeader';
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
			palette: 'bootstrap.pageheader.pageHeader',
			createView: createView,
			createEditor: editSchema,
			needsSpanWrap: true
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'bootstrap.pageheader.heroUnit';
		var label = '導入ボックス';

		function createView() {
			var $elem = $('<div class="hero-unit">' + '<h1>Heading</h1>' + '<p>Tagline</p>' + '<p>'
					+ '<button class="btn btn-primary btn-large">' + 'Learn more' + '</button>'
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
			palette: 'bootstrap.pageheader.heroUnit',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();
})();
