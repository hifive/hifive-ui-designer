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
$(function() {

	//h5.core.view.load('templates/templates.ejs').done(function() {
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
	//});

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
