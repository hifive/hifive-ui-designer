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

	var NO_UNIT = hifive.editor.controller.GenericParameterEditController.NO_UNIT;

	function ext(schema, createView) {

		var schemaBase = {
			_reflect: function(element, value, input, option) {
				element.parent().trigger('refresh');
			},
			reflect: function(element, value, input, option) {
				var newElement = createView();
				element.replaceWith(newElement);
				newElement.element.parent().trigger('create');
			}
		};
		return $.extend(true, schema, schemaBase);
	}

	function makeId() {
		var time = new Date().getTime().toString(16);
		var rand = (Math.ceil(Math.random() * 1024)).toString(16);
		return 'jquery_mobile_' + time + rand;
	}

	(function() {
		var id = 'jquery.mobile.header';
		var label = 'ヘッダー';

		function createView() {
			return '';
		}

		var editSchema = [];

		var creator = {
			label: label,
			id: id,
			palette: 'jquery.mobile.header',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	hifive.editor.addCreator({
		id: 'jquery',
		palette: 'jquery',
		label: 'jQuery',
		isGroup: true
	});
	hifive.editor.addCreator({
		id: 'jquery.mobile',
		palette: 'jquery.mobile',
		label: 'jQuery.mobile',
		isGroup: true
	});

	(function() {
		var id = 'jquery.mobile.button';
		var label = 'ボタン';

		function createView() {
			var $elem = $('<a href="index.html" data-role="button">Link button</a>');
			return $elem;
		}

		var editSchema = [{
			label: 'ミニサイズ',
			selector: '',
			type: 'boolean',
			booleanValue: 'true',
			target: 'func',
			getValue: function(element) {
				return element.attr('data-mini');
			},
			reflect: function(element, value, input, option) {
				var newElement = createView();
				element.replaceWith(newElement);
				newElement.attr('data-mini', value);
				newElement.parent().trigger('create');
				return newElement;
			}
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'jquery.mobile.button',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'jquery.mobile.collapsible';
		var label = '開閉式コンテンツ';

		function createView() {
			var $elem = $('<div data-role="collapsible">' + '<h3>ヘッダ</h3>' + '<p>コンテンツ</p>'
					+ '</div>');
			return $elem;
		}

		var editSchema = [{
			label: 'ヘッダ',
			selector: 'h3',
			type: 'string',
			target: 'text'
		}, {
			label: 'コンテンツ',
			selector: 'p',
			type: 'string',
			inputType: 'textarea',
			target: 'html'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'jquery.mobile.collapsible',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'jquery.mobile.textInput';
		var label = 'テキスト入力';

		function createView() {
			var id = makeId();
			var $elem = $('<div><label for="' + id + '">' + label
					+ '</label><input type="text" id="' + id + '" /></div>');
			return $elem;
		}

		var editSchema = [{
			label: 'ラベル',
			selector: 'label',
			type: 'string',
			target: 'text'
		}, {
			label: 'NAME属性',
			selector: 'input[type="text"]',
			type: 'string',
			target: 'attr(name)'
		}, {
			label: '入力値',
			selector: 'input[type="text"]',
			type: 'string',
			target: 'attr(value)'
		}, {
			label: '無効',
			selector: 'input[type="text"]',
			type: 'boolean',
			target: 'attr(disabled)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'jquery.mobile.textInput',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'jquery.mobile.textarea';
		var label = '複数行テキスト入力';

		function createView() {
			var id = makeId();
			var $elem = $('<div><label for="' + id + '">' + label + '</label><textarea id="' + id
					+ '" /></div>');
			return $elem;
		}

		var editSchema = [{
			label: 'ラベル',
			selector: 'label',
			type: 'string',
			target: 'text'
		}, {
			label: 'NAME属性',
			selector: 'textarea',
			type: 'string',
			target: 'attr(name)'
		}, {
			label: '入力値',
			selector: 'textarea',
			type: 'string',
			target: 'attr(value)'
		}, {
			label: '行数',
			selector: 'textarea',
			type: 'integer',
			constraint: {
				min: 1
			},
			target: 'attr(rows)',
			unit: NO_UNIT
		}, {
			label: '無効',
			selector: 'textarea',
			type: 'boolean',
			target: 'attr(disabled)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'jquery.mobile.textarea',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'jquery.mobile.searchInput';
		var label = '検索用テキスト入力';

		function createView() {
			var id = makeId();
			var $elem = $('<div><label for="' + id + '">' + label
					+ '</label><input type="text" id="' + id + '" data-type="search" /></div>');
			return $elem;
		}

		var editSchema = [{
			label: 'ラベル',
			selector: 'label',
			type: 'string',
			target: 'text'
		}, {
			label: 'NAME属性',
			selector: 'input[type="text"]',
			type: 'string',
			target: 'attr(name)',
		}, {
			label: '入力値',
			selector: 'input[type="text"]',
			type: 'string',
			target: 'attr(value)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'jquery.mobile.searchInput',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();


	(function() {
		var id = 'jquery.mobile.slider';
		var label = 'スライダー';

		function createView() {
			var id = makeId();
			var $elem = $('<div>' + '<label for="' + id + '">' + label + '</label>'
					+ '<input type="range" name="" id="' + id
					+ '" value="25" min="0" max="100"  />' + '</div>');
			return $elem;
		}

		var editSchema = [{
			label: 'ラベル',
			selector: 'label',
			type: 'string',
			target: 'text'
		}, {
			label: 'NAME属性',
			selector: 'input',
			type: 'string',
			target: 'attr(name)'
		}, {
			label: '値',
			selector: 'input',
			type: 'integer',
			unit: NO_UNIT,
			target: 'attr(value)'
		}, {
			label: '最小値',
			selector: 'input',
			type: 'integer',
			unit: NO_UNIT,
			target: 'attr(min)'
		}, {
			label: '最大値',
			selector: 'input',
			type: 'integer',
			unit: NO_UNIT,
			target: 'attr(max)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'jquery.mobile.slider',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'jquery.mobile.flipSwitch';
		var label = 'スイッチ';

		function createView() {
			var id = makeId();
			var $elem = $('<div>' + '<label for="' + id + '">' + label + '</label>'
					+ '<select name="" id="' + id + '" data-role="slider">'
					+ '<option value="off">Off</option>' + '<option value="on">On</option>'
					+ '</select>' + '</div>');
			return $elem;
		}

		var editSchema = [{
			label: 'ラベル',
			selector: '> label',
			type: 'string',
			target: 'text'
		}, {
			label: 'NAME属性',
			selector: '> input',
			type: 'string',
			target: 'attr(name)',
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'jquery.mobile.flipSwitch',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'jquery.mobile.radio';
		var label = 'ラジオボタングループ';

		function makeElm(text, name, value, checked) {
			var id = makeId();
			var input = $('<input type="radio" />').val(value).prop('checked', checked).attr('id',
					id).attr('name', name);
			var label = $('<label></label>').attr('for', id).text(text);
			return [input, label];
		}

		function createView() {

			var $elem = $('<fieldset data-role="controlgroup">' + '<legend>Choose a pet:</legend>'
					+ '</fieldset>');

			$elem.append(makeElm('Cat', 'radio-choice-1', 'choice-1', true));
			$elem.append(makeElm('Dog', 'radio-choice-1', 'choice-2'));
			$elem.append(makeElm('Hamster', 'radio-choice-1', 'choice-3'));
			$elem.append(makeElm('Lizard', 'radio-choice-1', 'choice-4'));

			return $elem;
		}

		var editSchema = [{
			label: 'ラベル',
			selector: '> legend',
			type: 'string',
			target: 'text'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'jquery.mobile.radio',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'jquery.mobile.checkbox';
		var label = 'チェックボックスグループ';

		function createView() {

			function makeElm(text, name, checked) {
				var id = makeId();
				var input = $('<input type="checkbox" />').prop('checked', checked).attr('id', id)
						.attr('name', name);
				var label = $('<label></label>').attr('for', id).text(text);
				return [input, label];
			}

			var $elem = $('<fieldset data-role="controlgroup">'
					+ '<legend>Choose as many snacks as you\'d like</legend>' + '</fieldset>');

			$elem.append(makeElm('Cheetos', 'checkbox-1a'));
			$elem.append(makeElm('Doritos', 'checkbox-2a'));
			$elem.append(makeElm('Fritos', 'checkbox-3a'));
			$elem.append(makeElm('Sun Chips', 'checkbox-4a'));

			return $elem;
		}

		var editSchema = [{
			label: 'ラベル',
			selector: '> legend',
			type: 'string',
			target: 'text'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'jquery.mobile.checkbox',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'jquery.mobile.select';
		var label = 'セレクトメニュー';

		function createView() {

			var id = makeId();

			var $elem = $('<div>' + '<label for="' + id + '">Shipping method:</label>'
					+ '<select name="select-choice-0" id="' + id + '">'
					+ '<option value="standard">Standard: 7 day</option>'
					+ '<option value="rush">Rush: 3 days</option>'
					+ '<option value="express">Express: next day</option>'
					+ '<option value="overnight">Overnight</option>' + '</select>' + '</div>');

			return $elem;
		}

		var editSchema = [{
			label: 'ラベル',
			selector: '> label',
			type: 'string',
			target: 'text'
		}, {
			label: '各項目',
			selector: 'select option',
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
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'jquery.mobile.select',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'jquery.mobile.unorderedListView';
		var label = '順序なしリスト';

		function createView() {
			var $elem = $('<ul data-role="listview">' + '<li><a href="#">Acura</a></li>'
					+ '<li><a href="#">Audi</a></li>' + '<li><a href="#">BMW</a></li>' + '</ul>');

			return $elem;
		}

		var editSchema = [{
			label: 'ラベル',
			selector: '> label',
			type: 'string',
			target: 'text'
		}, {
			label: '各項目',
			selector: '> li',
			type: 'multiple',
			newItem: '<li><a href="#">New</a></li>',
			appendItem: function(item, parent) {
				parent.append(item);
				parent.listview('refresh');
			},
			schema: [{
				label: 'ラベル',
				selector: '> a',
				type: 'string',
				target: 'text'
			}]
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'jquery.mobile.unorderedListView',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'jquery.mobile.orderedListView';
		var label = '順序付きリスト';

		function createView() {
			var $elem = $('<ol data-role="listview">' + '<li><a href="#">Acura</a></li>'
					+ '<li><a href="#">Audi</a></li>' + '<li><a href="#">BMW</a></li>' + '</ol>');

			return $elem;
		}

		var editSchema = [{
			label: 'ラベル',
			selector: '> label',
			type: 'string',
			target: 'text'
		}, {
			label: '各項目',
			selector: '> li',
			type: 'multiple',
			newItem: '<li><a href="#">New</a></li>',
			appendItem: function(item, parent) {
				parent.append(item);
				parent.listview('refresh');
			},
			schema: [{
				label: 'ラベル',
				selector: '> a',
				type: 'string',
				target: 'text'
			}]
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'jquery.mobile.orderedListView',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();
})();