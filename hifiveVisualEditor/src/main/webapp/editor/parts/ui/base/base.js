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
	//-------------------------------------------------------------------
	// 基本タグの定義
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'base',
		palette: 'base',
		label: '基本タグ',
		isGroup: true
	});

	//-------------------------------------------------------------------
	// 見出し
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'base.heading',
		palette: 'base.heading',
		label: '見出し',
		isGroup: true
	});

	(function() {
		var id = 'base.heading.1';
		var label = '見出し1(h1)';

		function createView() {
			var $elem = $('<h1>Heading 1</h1>');
			return $elem;
		}

		var editSchema = [{
			label: '内容',
			selector: '',
			type: 'string',
			target: 'text'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.heading.1',
			priority: 1,
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.heading.2';
		var label = '見出し2(h2)';

		function createView() {
			var $elem = $('<h2>Heading 2</h2>');
			return $elem;
		}

		var editSchema = [{
			label: '内容',
			selector: '',
			type: 'string',
			target: 'text'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.heading.2',
			priority: 2,
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.heading.3';
		var label = '見出し3(h3)';

		function createView() {
			var $elem = $('<h3>Heading 3</h3>');
			return $elem;
		}

		var editSchema = [{
			label: '内容',
			selector: '',
			type: 'string',
			target: 'text'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.heading.3',
			priority: 3,
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.heading.4';
		var label = '見出し4(h4)';

		function createView() {
			var $elem = $('<h4>Heading 4</h4>');
			return $elem;
		}

		var editSchema = [{
			label: '内容',
			selector: '',
			type: 'string',
			target: 'text'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.heading.4',
			priority: 4,
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.heading.5';
		var label = '見出し5(h5)';

		function createView() {
			var $elem = $('<h5>Heading 5</h5>');
			return $elem;
		}

		var editSchema = [{
			label: '内容',
			selector: '',
			type: 'string',
			target: 'text'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.heading.5',
			priority: 5,
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.heading.6';
		var label = '見出し6(h6)';

		function createView() {
			var $elem = $('<h6>Heading 6</h6>');
			return $elem;
		}

		var editSchema = [{
			label: '内容',
			selector: '',
			type: 'string',
			target: 'text'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.heading.6',
			priority: 6,
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// テキスト
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'base.text',
		palette: 'base.text',
		label: 'テキスト',
		isGroup: true
	});

	(function() {
		var id = 'base.text.span';
		var label = 'インラインテキスト(span)';

		function createView() {
			var $elem = $('<span>inline text</span>');
			return $elem;
		}

		var editSchema = [{
			label: '内容',
			selector: '',
			type: 'string',
			target: 'text'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.text.span',
			priority: 5,
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.text.bodyCopy';
		var label = '段落(p)';

		function createView() {
			var $elem = $('<p>Body copy</p>');
			return $elem;
		}

		var editSchema = [
				{
					label: '本文',
					selector: '',
					type: 'string',
					inputType: 'textarea',
					target: 'text'
				},
				{
					label: '強調',
					selector: '',
					type: 'boolean',
					booleanValue: 'lead',
					target: 'class'
				},
				{
					label: 'テキスト位置',
					selector: '',
					type: 'enum',
					enumValue: [['左寄せ', 'text-left'], ['中央寄せ', 'text-center'],
							['右寄せ', 'text-right']],
					target: 'class'
				},
				{
					label: 'タイプ',
					selector: '',
					type: 'enum',
					enumValue: [['Default', ''], ['Muted', 'muted'], ['Warning', 'text-warning'],
							['Error', 'text-error'], ['Info', 'text-info'],
							['Success', 'text-success']],
					target: 'class'
				}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.text.bodyCopy',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.text.addresses';
		var label = '連絡先(address)';

		function createView() {
			var $elem = $('<address>Addresses</address>');
			return $elem;
		}

		var editSchema = [{
			label: '内容',
			selector: '',
			type: 'string',
			target: 'text'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.text.addresses',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.text.blockquote';
		var label = '引用文(blockquote)';

		function createView() {
			var $elem = $('<blockquote>' + '<p>引用</p>'
					+ '<small><span>引用元</span> <cite title="引用元名">引用元名</cite></small>'
					+ '</blockquote>');
			return $elem;
		}

		var editSchema = [{
			label: '引用文',
			selector: 'p',
			type: 'string',
			target: 'text'
		}, {
			label: '引用元作者',
			selector: 'small span',
			type: 'string',
			target: 'text'
		}, {
			label: '引用元著作',
			selector: 'small cite',
			type: 'string',
			target: 'text'
		}, {
			label: '右寄せ',
			selector: '',
			type: 'boolean',
			booleanValue: 'pull-right',
			target: 'class'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.text.blockquote',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.text.codeBlock';
		var label = '整形済みテキスト(pre)';

		function createView() {
			var $elem = $('<pre>&lt;p&gt;Sample text here...&lt;/p&gt;</pre>');
			return $elem;
		}

		var editSchema = [{
			label: '本文',
			selector: '',
			type: 'string',
			inputType: 'textarea',
			target: 'text'
		}, {
			label: 'スクロール',
			selector: '',
			type: 'boolean',
			booleanValue: 'pre-scrollable',
			target: 'class'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.text.codeBlock',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// リスト
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'base.list',
		palette: 'base.list',
		label: 'リスト',
		isGroup: true
	});
	(function() {
		var id = 'base.list.unordered';
		var label = '順序なしリスト(li)';

		function createView() {
			var $elem = $('<ul>' + '<li>Unordered List</li>' + '<li>Unordered List</li>' + '</ul>');
			return $elem;
		}

		var editSchema = [{
			label: 'タイプ',
			selector: '',
			type: 'enum',
			enumValue: [['デフォルト', ''], ['マークなし', 'unstyled'], ['インライン', 'inline'], ],
			target: 'class'
		}, {
			label: '各項目',
			selector: '> li',
			type: 'multiple',
			newItem: '<li>Unordered List</li>',
			schema: [{
				label: 'ラベル',
				selector: '',
				type: 'string',
				target: 'text'
			}]
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.list.unordered',
			createView: createView,
			createEditor: editSchema
		};

		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.list.ordered';
		var label = '順序付きリスト(ol)';

		function createView() {
			var $elem = $('<ol>' + '<li>Ordered List</li>' + '<li>Ordered List</li>' + '</ol>');
			return $elem;
		}

		var editSchema = [{
			label: '各項目',
			selector: '> li',
			type: 'multiple',
			newItem: '<li>Ordered List</li>',
			schema: [{
				label: 'ラベル',
				selector: '',
				type: 'string',
				target: 'text'
			}]
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.list.ordered',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.list.description';
		var label = '定義リスト(dl)';

		function createView() {
			var $elem = $('<dl>' + '<dt>Term</dt>' + '<dd>Description</dd>' + '<dt>Term</dt>'
					+ '<dd>Description</dd>' + '</dl>');
			return $elem;
		}

		var editSchema = [{
			label: '水平配置',
			selector: '',
			type: 'boolean',
			booleanValue: 'dl-horizontal',
			target: 'class'
		}, {
			label: '各項目',
			selector: '> dt',
			type: 'multiple',
			newItem: '<dt>Term</dt><dd>Description</dd>',
			removeItem: function(element) {
				element.next('dd').andSelf().remove();
			},
			schema: [{
				label: '用語',
				selector: '',
				type: 'string',
				target: 'text'
			}, {
				label: '説明',
				selector: '',
				getValue: function(element) {
					return element.next('dd').text();
				},
				reflect: function(element, value) {
					element.next('dd').text(value);
				},
				type: 'string',
				target: 'func'
			}]
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.list.description',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// テーブル
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'base.table',
		palette: 'base.table',
		label: 'テーブル',
		isGroup: true
	});

	(function() {
		var id = 'base.table.table';
		var label = 'テーブル(table)';

		function createView() {
			var $elem = $('<table class="table">' + '<caption>Caption</caption>' + '<thead>'
					+ '<tr>' + '<th>Header</th>' + '<th>Header</th>' + '</tr>' + '</thead>'
					+ '<tbody>' + '<tr>' + '<td>Data</td>' + '<td>Data</td>' + '</tr>' + '</tbody>'
					+ '</table>');
			return $elem;
		}

		//別途対応
		var editSchema = [];

		var creator = {
			label: label,
			id: id,
			palette: 'base.table.table',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// フォーム部品
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'base.form',
		palette: 'base.form',
		label: 'フォーム部品',
		isGroup: true
	});

	(function() {
		var id = 'base.form.textInput';
		var label = 'テキスト入力(input type="text")';

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
			label: '無効',
			selector: '',
			type: 'boolean',
			target: 'attr(disabled)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.form.textInput',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.form.checkbox';
		var label = 'チェックボックス(input type="checkbox")';

		function createView() {
			var $elem = $('<label>' + '<input type="checkbox" value="">' + '<span>Checkbox</span>'
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
			label: '無効',
			selector: 'input[type="checkbox"]',
			type: 'boolean',
			target: 'attr(disabled)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.form.checkbox',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.form.radio';
		var label = 'ラジオボタン(input type="radio")';

		function createView() {
			var $elem = $('<label>' + '<input type="radio" name="" value="" checked>'
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
			label: '無効',
			selector: 'input[type="radio"]',
			type: 'boolean',
			target: 'attr(disabled)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.form.radio',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.form.select';
		var label = 'セレクトボックス(select-option)';

		function createView() {
			var $elem = $('<select>' + '<option>1</option>' + '<option>2</option>'
					+ '<option>3</option>' + '<option>4</option>' + '<option>5</option>'
					+ '</select>');
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
			palette: 'base.form.select',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();
	(function() {
		var id = 'base.form.input';
		var label = '任意の入力(input type=*)';

		function createView() {
			var $elem = $('<input type="text">');
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
			label: 'タイプ',
			selector: '',
			type: 'string',
			target: 'attr(type)'
		}, {
			label: '無効',
			selector: '',
			type: 'boolean',
			target: 'attr(disabled)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.form.input',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.form.textarea';
		var label = '複数行テキスト入力(textarea)';

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
			target: 'attr(rows)'
		}, {
			label: '無効',
			selector: '',
			type: 'boolean',
			target: 'attr(disabled)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.form.textarea',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.form.submit';
		var label = '実行ボタン';

		function createView() {
			var $elem = $('<button type="submit">Submit</button>');
			return $elem;
		}

		var editSchema = hifive.editor.ui.getButtonSchema('');

		var creator = {
			label: label,
			id: id,
			palette: 'base.form.submit',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// 画像・メディア
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'base.media',
		palette: 'base.media',
		label: '画像・メディア',
		isGroup: true
	});

	(function() {
		var id = 'base.media.image';
		var label = '画像(img)';

		function createView() {
			var $elem = $('<img src="' + holderData + '">');
			return $elem;
		}

		var editSchema = [{
			label: 'SRC属性',
			selector: '',
			type: 'string',
			target: 'attr(src)'
		}, {
			label: 'ラベル',
			selector: '',
			type: 'string',
			target: 'text'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.media.image',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.media.video';
		var label = 'ビデオ(video)';

		function createView() {
			var $elem = $('<video controls><p>動画を再生するにはvideoタグをサポートしているブラウザでご覧ください。</p></video>');
			return $elem;
		}

		var editSchema = [{
			label: 'SRC属性',
			selector: '',
			type: 'string',
			target: 'attr(src)'
		}, {
			label: 'オートプレイ',
			selector: '',
			type: 'boolean',
			target: 'attr(autoplay)'
		}, {
			label: 'ループ',
			selector: '',
			type: 'boolean',
			target: 'attr(loop)'
		}, {
			label: 'コントロール表示',
			selector: '',
			type: 'boolean',
			target: 'attr(controls)'
		}, {
			label: 'メッセージ',
			selector: '> p',
			type: 'string',
			target: 'text'
		}, {
			label: 'sourceタグ',
			type: 'multiple',
			selector: '> source',
			newItem: '<source/>',
			appendItem: function(newItem, itemParent) {
				// sourceはvideoタグ内の最初に書かれるように追加。
				// 未サポートブラウザ用の記述があった場合でも<video><source><source>...<p></p></video>となるように順番に追加する
				if (itemParent.find('source:last').length) {
					itemParent.find('source:last').after(newItem);
					return;
				}
				itemParent.prepend(newItem);
			},
			schema: [{
				label: 'SRC属性',
				selector: '',
				type: 'string',
				target: 'attr(src)'
			}]
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.media.video',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.media.audio';
		var label = '音声(audio)';

		function createView() {
			var $elem = $('<audio controls><p>音声を再生するにはaudioタグをサポートしているブラウザでご覧ください。</p></audio>');
			return $elem;
		}

		var editSchema = [{
			label: 'SRC属性',
			selector: '',
			type: 'string',
			target: 'attr(src)'
		}, {
			label: 'オートプレイ',
			selector: '',
			type: 'boolean',
			target: 'attr(autoplay)'
		}, {
			label: 'ループ',
			selector: '',
			type: 'boolean',
			target: 'attr(loop)'
		}, {
			label: 'コントロール表示',
			selector: '',
			type: 'boolean',
			target: 'attr(controls)'
		}, {
			label: 'メッセージ',
			selector: '> p',
			type: 'string',
			target: 'text'
		}, {
			label: 'sourceタグ',
			type: 'multiple',
			selector: '> source',
			newItem: '<source/>',
			appendItem: function(newItem, itemParent) {
				// sourceはvideoタグ内の最初に書かれるように追加。
				// 未サポートブラウザ用の記述があった場合でも<audio><source><source>...<p></p></audio>となるように順番に追加する
				if (itemParent.find('source:last').length) {
					itemParent.find('source:last').after(newItem);
					return;
				}
				itemParent.prepend(newItem);
			},
			schema: [{
				label: 'SRC属性',
				selector: '',
				type: 'string',
				target: 'attr(src)'
			}]
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.media.audio',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'base.media.canvas';
		var label = 'キャンバス(canvas)';

		function createView() {
			var $elem = $('<canvas id="sketchCanvas" width="300" height="300"></canvas>');
			return $elem;
		}

		var editSchema = [{
			label: 'キャンバス幅',
			type: 'number',
			unit: '_NO_UNIT_',
			target: 'attr(width)'
		}, {
			label: 'キャンバス高さ',
			type: 'number',
			unit: '_NO_UNIT_',
			target: 'attr(height)'
		}, {
			label: '表示幅',
			type: 'number',
			target: 'style(width)'
		}, {
			label: '表示高さ',
			type: 'number',
			target: 'style(height)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.media.canvas',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// ボタン
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'base.button',
		palette: 'base.button',
		label: 'ボタン',
		isGroup: true
	});
	(function() {
		var id = 'base.button.button';
		var label = 'ボタン(button)';

		function createView() {
			var $elem = $('<button type="button">Button</button>');
			return $elem;
		}

		var editSchema = hifive.editor.ui.getButtonSchema('');

		var creator = {
			label: label,
			id: id,
			palette: 'base.button.button',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	//-------------------------------------------------------------------
	// リンク
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'base.link',
		palette: 'base.link',
		label: 'リンク',
		isGroup: true
	});
	(function() {
		var id = 'base.link.link';
		var label = 'リンク(a)';

		function createView() {
			var $elem = $('<a href="#">リンク</a>');
			return $elem;
		}

		var editSchema = [{
			label: 'href属性',
			selector: '',
			type: 'string',
			target: 'attr(href)'
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'base.link.link',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();
})();