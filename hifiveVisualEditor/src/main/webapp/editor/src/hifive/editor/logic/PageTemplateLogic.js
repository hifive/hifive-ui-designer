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
