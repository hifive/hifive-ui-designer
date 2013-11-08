h5.core.controller.define('hifive.editor.controller.CreateSiteController', function() {

	var createSiteController = {
		/**
		 * @memberOf hifive.editor.controller.CreateSiteController
		 */
		__name: 'hifive.editor.controller.CreateSiteController', //TODO 不要
		'[name="createSite"] click': function(context) {
			modelLogics.siteLogic.create(this.$find('[name="siteName"]').val());
			alert('サイト作成完了');
		}
	};

	return createSiteController;
});
