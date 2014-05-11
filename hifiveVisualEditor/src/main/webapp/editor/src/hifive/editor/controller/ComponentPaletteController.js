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

	var componentPaletteController = {
		/**
		 * @memberOf hifive.editor.controller.ComponentPaletteController
		 */
		__name: 'hifive.editor.controller.ComponentPaletteController',

		_isDragging: false,

		_$dragProxy: null,

		_moveBy: function(target, dx, dy) {
			hifive.editor.u.moveElementBy(target, dx, dy);
		},

		_components: h5.core.data.createObservableArray(),

		/**
		 * ComponentsTreeを作成してパレットに配置する
		 */
		_createComponentsTree: function() {
			// パレットをキーにしてコンポーネントを持つオブジェクトを作成
			// パレットの位置(コンポーネント配置位置)は複数個所指定可能なので、コンポーネントが重複することもある
			var componentsOnPalette = [];
			function enumratePalette(root) {
				for ( var p in root) {
					if (p === '__contents') {
						continue;
					}
					var c = root[p];
					if (!c.__contents.palette) {
						continue;
					}
					var places = $.isArray(c.__contents.palette) ? c.__contents.palette
							: [c.__contents.palette];
					for (var i = 0, l = places.length; i < l; i++) {
						componentsOnPalette.push({
							place: places[i],
							contents: c.__contents

						});
					}
					if (c.__contents.isGroup) {
						enumratePalette(c);
					}
				}
			}
			enumratePalette(hifive.editor.components);

			// パレットの指定位置順にソート
			componentsOnPalette.sort(function(a, b) {
				return a.place < b.place ? -1 : 1;
			});

			// jstreeに食わせるノードの作成
			var data = [];
			var childrens = {
				'': data
			};
			for (var i = 0, l = componentsOnPalette.length; i < l; i++) {
				var place = componentsOnPalette[i].place;
				// 一つ上のフォルダの場所名。ないなら空文字。
				var placeRoot = place.replace(/^[^\.]*?$|\.[^\.]*?$/, '');
				var contents = componentsOnPalette[i].contents;

				// ノードの作成
				var node = {
					data: {
						title: contents.label
					},
					attr: {}
				};
				if (contents.priority != null) {
					node.attr = {
						'data-priority': contents.priority
					};
				}
				// グループの場合、フォルダノードを作成
				if (contents.isGroup) {
					// 子ノードの追加先作成
					if (!childrens[place]) {
						childrens[place] = [];
					}
					node.children = childrens[place];
					// フォルダノードの状態設定
					//TODO 定数フラグ化
					node.state = 'close'; //'open';
					node.attr.rel = 'folder';

					// 親のchildren又はルートに挿入。
					// ソートしてあるので、必ず子ノードの配置場所より親ノードの配置場所が先に作られている
					childrens[placeRoot].push(node);
				} else {
					// グループでない場合(=コンポーネント本体)
					node.attr['data-editor-component-name'] = contents.id;
					node.attr['class'] = 'component';
					node.attr.rel = 'component';
					childrens[placeRoot].push(node);
				}
			}

			// jstree
			$('.componentPalette').jstree({
				json_data: {
					data: data
				},
				plugins: ['themes', 'json_data', 'types', 'sort'],
				core: {
					html_titles: true,
					animation: 100
				},
				sort: function(a, b) {
					var $a = $(a);
					var $b = $(b);
					// 片方だけが葉ならそちらが後
					if ($a.hasClass('jstree-leaf') ^ $b.hasClass('jstree-leaf')) {
						return $a.hasClass('jstree-leaf') ? 1 : -1;
					}
					// priorityがあればpriority比較
					var aPriority = $a.data('priority');
					var bPriority = $b.data('priority');
					// どちらもnullならデフォルト
					if (aPriority == null && bPriority == null) {
						return;
					}
					if (aPriority != null && bPriority != null) {
						// どちらもnullじゃないなら比較
						return aPriority > bPriority ? 1 : -1;
					}
					// 片方だけがnullならそっちが後
					return aPriority == null ? 1 : -1;
				},
				types: {
					types: {
						folder: {
							icon: {
								image: 'res/images/folder.png'
							}
						},
						component: {
							icon: {
								image: 'res/images/file.png'
							}
						}
					}
				}
			});
		},

		__ready: function() {
			// パレットの作成
			this._createComponentsTree();
		},

		'.component h5trackstart': function(context) {
			if (this._isDragging) {
				return;
			}
			this._isDragging = true;

			this._$dragProxy = $(context.event.currentTarget).clone();

			this.log.debug('trackstart: pageX={0},pageY={1}', context.event.pageX,
					context.event.pageY);

			var proxyLeft = context.event.pageX + 2 - $(this.rootElement).offset().left;
			var proxyTop = context.event.pageY - ($(context.event.currentTarget).height() + 2)
					- $(this.rootElement).offset().top;

			// ドラッグ中画像の初期位置とドラッグ中専用のスタイルを設定
			this._$dragProxy.css({
				position: 'absolute',
				zIndex: 99,
				opacity: 0.5,
				left: proxyLeft, // context.event.pageX + 2,
				top: proxyTop
			// context.event.pageY - ($(context.event.currentTarget).height() +
			// 2)
			});

			// <body>にアペンド
			$(this.rootElement).append(this._$dragProxy);

			this.trigger(hifive.editor.consts.EVENT_ADD_COMPONENT_BEGIN);
		},

		'{body} mousemove': function(context) {
			if (!this._isDragging) {
				return;
			}

			// ブラウザのデフォルト挙動（画像のドラッグ）をキャンセル
			context.event.preventDefault();
		},

		'{body} h5trackmove': function(context) {
			if (!this._isDragging) {
				return;
			}

			context.event.preventDefault();

			hifive.editor.highlightDropTarget(context.event.pageX, context.event.pageY);

			this._moveBy(this._$dragProxy, context.event.dx, context.event.dy);

			this.trigger('cancelPreview');
		},

		'{body} h5trackend': function(context) {
			if (!this._isDragging) {
				return;
			}

			//ドロップターゲットのハイライトを消す
			hifive.editor.hideDropTarget();

			this._isDragging = false;

			var $removedDragProxy = this._$dragProxy.remove();

			this._$dragProxy = null;

			// TODO ドラッグを行う

			// このチェックはdropされる側でやるべきか
			var dropTarget = document.elementFromPoint(context.event.pageX, context.event.pageY);

			this.trigger(hifive.editor.consts.EVENT_ADD_COMPONENT_END);

			if (!$(dropTarget).is('.pageWrapper')
					&& $(dropTarget).parents('.pageWrapper').length === 0) {

				this.trigger(hifive.editor.consts.EVENT_ADD_COMPONENT_ABORT);
				return;
			}

			var componentId = $removedDragProxy.attr('data-editor-component-name');
			if (!componentId) {
				this.trigger(hifive.editor.consts.EVENT_ADD_COMPONENT_ABORT);
				return;
			}

			hifive.editor.dropComponent(componentId, context.event.pageX, context.event.pageY);

			this.trigger(hifive.editor.consts.EVENT_ADD_COMPONENT_COMPLETE);
		}

	};

	h5.core.expose(componentPaletteController);

})();