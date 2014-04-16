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

	var PAGE_TEMPLATES = [
	/*
		                      {
			name: 'ブランク',
			url: 'data/pageTemplates/blank.html',
			thumbnail: 'data/pageTemplates/thumbnail/blank.png',
			description: '空のページです。'
		},
	*/
	{
		name: 'ブランク',
		url: 'data/pageTemplates/blank.html',
		thumbnail: 'data/pageTemplates/thumbnail/blank.png',
		description: '空のページです。jQueryとBootstrapが読み込まれています。'
	}, {
		name: 'Bootstrap2簡単モードブランク',
		url: 'data/pageTemplates/bootstrap2-simple-grid-blank.html',
		thumbnail: 'data/pageTemplates/thumbnail/blank.png',
		description: '空のページです。レイアウトグリッドに基づいて簡易に部品を配置できます。Bootstrap2を使用しています。',
		mailController: 'hifive.editor.controller.page.main.Bootstrap2SimpleGridController'
	}, {
		name: 'bootstrap3ブランク',
		url: 'data/pageTemplates/bootstrap3_blank.html',
		thumbnail: 'data/pageTemplates/thumbnail/blank.png',
		description: '空のページです。jQueryとBootstrap3が読み込まれています。'
	}, {
		name: '2カラム',
		url: 'data/pageTemplates/2column.html',
		thumbnail: 'data/pageTemplates/thumbnail/2column.png',
		description: 'ヘッダ、メニュー、コンテンツ、フッタからなる一般的な2カラムレイアウトです。'
	}, {
		name: 'リサイズ可能3カラム',
		url: 'data/pageTemplates/3column.html',
		thumbnail: 'data/pageTemplates/thumbnail/3column.png',
		description: '3カラムレイアウトです。カラムの幅はリサイズ可能です。'
	}, {
		name: 'hifiveブランクページ',
		url: 'data/pageTemplates/hifive_blank.html',
		thumbnail: 'data/pageTemplates/thumbnail/blank.png',
		description: '空のページです。hifiveコンポーネント、jQuery、Bootstrapが読み込まれています。'

	}];

	var pageTemplateLogic = h5.core.logic(hifive.editor.logic.PageTemplateLogic);

	function initData() {
		for (var i = 0, len = PAGE_TEMPLATES.length; i < len; i++) {
			var tmpl = PAGE_TEMPLATES[i];
			pageTemplateLogic.addTemplate(tmpl);
		}
	}

	h5.require('hifive.editor.logic.PageTemplateLogic').resolve().done(initData);
})();
