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
	var DIVIDER = '<span class="divider sign">&gt;</span>';

	var nodePathController = {
		__name: 'hifive.editor.controller.NodePathController',
		_id: '#domRelationship',
		_$stack: null,
		show: function(target) {
			var that = this;
			var pageController = hifive.editor.u.getFocusedPageController();
			var $bread = $(this._id);
			var $parents = $(target).add($(target).parents());

			this._$stack = $();
			$bread.empty();

			$parents.each(function(i, e) {
				var isComponent = pageController.isComponent(e);
				var tagName = e.tagName.toLowerCase();

				tagName += e.id && e.id !== '' ? '#'+ e.id : '';
				tagName += e.className && e.clasName !== '' ? ('.'+ e.className.split(' ').join('.')) : '';

				var inner = '<li>'+ (isComponent ? '<span class="component" title="'+ pageController.getComponentName(e) +'">C</span>' : '') +'<span class="tagName" title="'+ tagName +'">'+ tagName +'</span>'+ (i === $parents.length - 1 ? '' : DIVIDER) +'</li>';
				var $inner = $(inner);

				$bread.append($inner);
				that._$stack = that._$stack.add($inner);

			});
		},
		clear: function() {
			$(this._id).empty();
		},
		highlight: function(index) {
			var $stack = this._$stack;

			if (!$stack || $stack.length === 0) {
				return;
			}

			$stack.removeClass('highlight');
			$stack.eq(index).children('.tagName').addClass('highlight');
		}
	};

	h5.core.expose(nodePathController);
})();