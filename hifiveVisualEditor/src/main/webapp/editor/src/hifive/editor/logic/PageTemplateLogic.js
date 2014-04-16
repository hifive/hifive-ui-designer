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

	var modelManager = hifive.editor.modelManager;

	var lastPageTemplateId = 0;

	/**
	 * @name hifive.editor.PageTemplateLogic
	 * @class
	 */
	var pageTemplateLogic = {
		/**
		 * @memberOf hifive.editor.PageTemplateLogic
		 */
		__name: 'hifive.editor.logic.PageTemplateLogic',

		addTemplate: function(template) {
			var model = modelManager.models.pageTemplate;

			var item = model.create({
				id: ++lastPageTemplateId,
				name: template.name,
				url: template.url,
				thumbnail: template.thumbnail,
				description: template.description
			});

			return item;
		},

		getTemplate: function(id) {
			var model = modelManager.models.pageTemplate;
			return model.get(id);
		},

		getAllTemplates: function() {
			var model = modelManager.models.pageTemplate;
			return model.toArray().sort(function(a, b) {
				return a.id - b.id;
			});
		}
	};
	h5.core.expose(pageTemplateLogic);

})();
