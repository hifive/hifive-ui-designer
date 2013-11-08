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