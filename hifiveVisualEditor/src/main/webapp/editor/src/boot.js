$(function() {

	h5.core.view.load('templates/templates.ejs').done(function() {
	// 				$(function() {
	// 					h5.require('com.htmlhifive.visualeditor.PadController').resolve().done(
	// 							function(padController) {
	// 								h5.core.controller('#pad', padController, {
	// 									myparam: {
	// 										the: 'TEST'
	// 									}
	// 								});
	// 							});
	// 				});
	});

	//ここまで即時関数だった




	h5.ext.autoRun('.dividedBox', h5.ui.container.DividedBox);

	setTimeout(function() {
		h5.core.controller('.pageWrapper', hifive.editor.controller.PageController);
	}, 400);

	$(window).bind('resize', function() {
		var dividedBoxes = h5.core.controllerManager.getControllers(document.body, {
			name: 'h5.ui.container.DividedBox',
			deep: true
		});

		for ( var i = 0, len = dividedBoxes.length; i < len; i++) {
			dividedBoxes[i].refresh();
		}
	});

});
