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
	// hifiveコンポーネント部品の定義
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'hifive',
		palette: 'hifive',
		label: 'hifiveコンポーネント部品',
		priority: 3,
		isGroup: true,
		dependencies: {
			js: [{
				name: 'ejs',
				path: '$SYSTEM_LIB$/hifive/ejs-h5mod.js'
			}, {
				path: '$SYSTEM_LIB$/hifive/h5.js'
			}],
			css: '$SYSTEM_LIB$/hifive/h5.css'
		},
		depends: 'jquery'
	});

	//-------------------------------------------------------------------
	// グラフィックス
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'hifive.graphics',
		palette: 'hifive.graphics',
		label: 'グラフィックス',
		isGroup: true
	});

	(function() {
		var id = 'hifive.graphics.draw-canvas';
		var label = '手書きキャンバス';

		function createView() {
			var $elem = $('<canvas class="sketch-canvas" width="300" height="300"></canvas>');
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
			palette: 'hifive.graphics.draw-canvas',
			createView: createView,
			createEditor: editSchema,
			requirements: {
				jsMandatory: '$SYSTEM_LIB$/hifive.component/sketch/SketchController.js'
			}
		};
		hifive.editor.addCreator(creator);
	})();


	//-------------------------------------------------------------------
	// レイアウト
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'hifive.layout',
		palette: 'hifive.layout',
		label: 'レイアウト',
		isGroup: true
	});

	(function() {
		var id = 'hifive.layout.divided-box-horizontal';
		var label = 'DividedBox';

		function createView() {
			var $elem = $('<div class="dividedBox" style="min-height:20px; min-width:20px;"><div class="fill"></div><div class="fill autoSize"></div></div>');
			return $elem;
		}

		var editSchema = [{
			label: '水平区切り',
			type: 'boolean',
			booleanValue: 'horizontal',
			target: 'class'
		}, {
			label: '幅',
			type: 'number',
			target: 'style(width)'
		}, {
			label: '高さ',
			type: 'number',
			target: 'style(height)'
		}, {
			label: 'サイズ固定',
			type: 'boolean',
			booleanValue: 'freezeSize',
			target: 'class'
		}, , {
			label: '表示幅',
			type: 'number',
			target: 'style(width)'
		}, {
			label: '各要素',
			type: 'multiple',
			selector: '> div',
			schema: [{
				label: '幅',
				type: 'number',
				target: 'style(width)'
			}, {
				label: '高さ',
				type: 'number',
				target: 'style(height)'
			}, {
				label: '自動サイズ',
				type: 'boolean',
				booleanValue: 'autoSize',
				target: 'class'
			}]
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'hifive.layout.divided-box-horizontal',
			createView: createView,
			createEditor: editSchema,
			requirements: {
				jsMandatory: '$SYSTEM_LIB$/DividedBox/DividedBox.js',
				cssMandatory: '$SYSTEM_LIB$/DividedBox/DividedBox.css'
			}
		};
		hifive.editor.addCreator(creator);
	})();
})();