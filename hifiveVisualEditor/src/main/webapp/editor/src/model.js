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

	var manager = h5.core.data.createManager('modelManager', 'hifive.editor');

	/*
	var resourceDesc = {
		name: 'resource',

		schema: {
			resourceId: {
				type: 'string',
				id: true
			},

			path: {
				type: 'string'
			}
		}
	};
	manager.createModel(resourceDesc);
	*/

	var pageTemplateDesc = {
		/**
		 * @memberOf layoutDesc
		 */
		name: 'pageTemplate',
		schema: {
			id: { // このidはseriesId+revisionの複合主キーに対応する代理キー
				type: 'integer',
				id: true
			},

			seriesId: { // series = 系列
				type: 'integer',
				constraint: {
				// notNull : true
				}
			},

			revision: {
				type: 'integer',
				constraint: {
				// notNull : true
				}
			},

			name: {
				type: 'string',
				constraint: {
					notEmpty: true
				}
			},

			url: { // コンテンツのパス（URL）
				type: 'string'
			},

			thumbnail: {
				type: 'string'
			},

			description: {
				type: 'string'
			}
		}
	};
	manager.createModel(pageTemplateDesc);

	var pageDesc = {
		name: 'page',
		schema: {
			id: {
				type: 'integer',
				id: true
			},
			css: {
				type: 'string[]'
			},
			script: {
				type: 'string[]'
			},
			templateUrl: { //IDの方がよい？
				type: 'string'
			}
		}
	};
	manager.createModel(pageDesc);

	var lastPageId = 0;

	function Page(win) {
		this._item = manager.models.page.create({
			id: ++lastPageId
		});

		this._window = win;
		this._document = win.document;
	}
	$.extend(Page.prototype, {
		render: function() {
			//HTMLをレンダリングする
			//TODO 本当はプレビューとその他を分けないとダメ
			var html = this._document.documentElement.outerHTML;
			return html;
		}
	});

	function createPage(win) {
		return new Page(win);
	}

	h5.u.obj.expose('hifive.editor.model', {
		createPage: createPage
	});

})();
