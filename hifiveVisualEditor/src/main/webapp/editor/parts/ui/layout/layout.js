(function() {
	//-------------------------------------------------------------------
	// レイアウト部品
	//-------------------------------------------------------------------
	hifive.editor.addCreator({
		id: 'layout',
		palette: 'layout',
		label: 'レイアウト',
		priority: 1,
		isGroup: true
	});

	// div
	(function() {
		var id = 'layout.div';
		var label = 'ブロック要素(div)';

		function createView() {
			var $elem = $('<div class="layoutCell" style="width:200px; height:200px"></div>');
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
			label: label,
			id: id,
			palette: 'layout.div',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	// form
	(function() {
		var id = 'layout.form';
		var label = 'フォーム(form)';

		function createView() {
			var $elem = $('<form class="layoutCell" style="width:200px; height:200px"></form>');
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
			label: label,
			id: id,
			palette: 'layout.form',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();


	// レイアウトコンテナ
	(function() {
		var id = 'layout.horizontal';
		var label = 'レイアウトコンテナ(横)';

		var cellStyle = 'background-color:#ffeecc;height:100%;display:inline-block;vertical-align: top;';
		function createView() {
			var $elem = $('<div class="cellInCell" style="width:100%;height:200px;">'
					+ '<div class="layoutCell" style="width:50%;' + cellStyle + '"></div>'
					+ '<div class="layoutCell" style="width:50%;' + cellStyle + '"></div></div>'
					+ '</div>');
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
		}, {
			label: '分割数',
			type: 'multiple',
			selector: '> *',
			newItem: '<div class="layoutCell" style="' + cellStyle + '"></div>',
			appendItem: function(newItem, itemParent) {
				itemParent.append(newItem);
				// 幅を等分する
				var layoutCells = itemParent.children();
				var len = layoutCells.length;
				layoutCells.css('width', (100 / len) + '%');
			},
			removeItem: function(item) {
				var itemParent = item.parent();
				item.remove();
				// 幅を等分する
				var layoutCells = itemParent.children();
				var len = layoutCells.length;
				layoutCells.css('width', (100 / len) + '%');
			},
			schema: [{
				label: '幅',
				type: 'number',
				target: 'style(width)'
			}, {
				label: '高さ',
				type: 'number',
				target: 'style(height)'
			}, {
				label: '背景色',
				type: 'color',
				target: 'style(background-color)'
			}]
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'layout.horizontal',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	(function() {
		var id = 'layout.vertical';
		var label = 'レイアウトコンテナ(縦)';

		var cellStyle = 'background-color:#ffeecc;width:100%;display:block;';
		function createView() {
			var $elem = $('<div class="cellInCell" style="width:200px;height:600px;">'
					+ '<div class="layoutCell" style="height:50%;' + cellStyle + '"></div>'
					+ '<div class="layoutCell" style="height:50%;' + cellStyle + '"></div></div>'
					+ '</div>');
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
		}, {
			label: '分割数',
			type: 'multiple',
			selector: '> *',
			newItem: '<div class="layoutCell" style="' + cellStyle + '"></div>',
			appendItem: function(newItem, itemParent) {
				itemParent.append(newItem);
				// 幅を等分する
				var layoutCells = itemParent.children();
				var len = layoutCells.length;
				layoutCells.css('height', (100 / len) + '%');
			},
			removeItem: function(item) {
				var itemParent = item.parent();
				// 消してもまだ要素が残るなら、削除されるitemの子要素を隣に移す
				if (itemParent.children().length > 1) {
					item.prev().append(item.children());
				}
				item.remove();
				// 幅を等分する
				var layoutCells = itemParent.children();
				var len = layoutCells.length;
				layoutCells.css('height', (100 / len) + '%');
			},
			schema: [{
				label: '幅',
				type: 'number',
				target: 'style(width)'
			}, {
				label: '高さ',
				type: 'number',
				target: 'style(height)'
			}, {
				label: '背景色',
				type: 'color',
				target: 'style(background-color)'
			}]
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'layout.vertical',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();

	hifive.editor.addCreator({
		id: 'layout.sample',
		palette: 'layout.sample',
		label: 'サンプルレイアウト',
		isGroup: true
	});
	(function() {
		var id = 'layout.sample.horizontal';
		var label = '横2カラム';

		var cellStyle = 'background-color:#ffeecc;height:100%;display:inline-block;vertical-align: top;';
		function createView() {
			var $elem = $('<div class="cellInCell" style="width:100%;height:200px;">'
					+ '<div class="layoutCell" style="width:20%;'
					+ cellStyle
					+ '"><ul class="componentCell" data-cell-desc="順序なしリスト(li)" data-h5editor-component="base.list.unordered">'
					+ '<li>トップ</li><li>特集</li><li>コラム</li></ul></div>'
					+ '<div class="layoutCell" style="width:80%;'
					+ cellStyle
					+ '">'
					+ '<h3 class="componentCell" data-cell-desc="見出し3(h3)" data-h5editor-component="base.heading.3">見出し3見出し3見出し3</h3>'
					+ '<img align="left" src="'
					+ hifive.editor.ui.holderData
					+ '" align="right" class="componentCell" data-cell-desc="画像(img)"'
					+ 'data-h5editor-component="base.media.image">'
					+ '<p class="componentCell" data-cell-desc="段落(p)" data-h5editor-component="base.text.bodyCopy">'
					+ '画像と文章を合わせたサンプルです。画像と記事を合わせたサンプルです。画像と記事を合わせたサンプルです。画像と記事を合わせたサンプルです。</p>'
					+ '</div></div>');
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
		}, {
			label: '分割数',
			type: 'multiple',
			selector: '> *',
			newItem: '<div class="layoutCell" style="' + cellStyle + '"></div>',
			appendItem: function(newItem, itemParent) {
				itemParent.append(newItem);
				// 幅を等分する
				var layoutCells = itemParent.children();
				var len = layoutCells.length;
				layoutCells.css('width', (100 / len) + '%');
			},
			removeItem: function(item) {
				var itemParent = item.parent();
				item.remove();
				// 幅を等分する
				var layoutCells = itemParent.children();
				var len = layoutCells.length;
				layoutCells.css('width', (100 / len) + '%');
			},
			schema: [{
				label: '幅',
				type: 'number',
				target: 'style(width)'
			}, {
				label: '高さ',
				type: 'number',
				target: 'style(height)'
			}, {
				label: '背景色',
				type: 'color',
				target: 'style(background-color)'
			}]
		}];

		var creator = {
			label: label,
			id: id,
			palette: 'layout.sample.horizonal',
			createView: createView,
			createEditor: editSchema
		};
		hifive.editor.addCreator(creator);
	})();
})();