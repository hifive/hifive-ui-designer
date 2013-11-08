h5.core.controller.define('hifive.editor.controller.ThumbsController', function() {

	var thumbsController = {
		'[name="showThumbnails"] click': function() {
			$('#thumbImages').css('display', 'block');
		}
	};

	return thumbsController;
});
