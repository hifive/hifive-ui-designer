(function() {

	$(document).one('h5preinit', function() {
		function isEventHandler(invocation) {
			return invocation.funcName.indexOf(' ') !== -1;
		}

		var cancelInterceptor = h5.u.createInterceptor(function(invocation, data) {
			var ret = invocation.proceed();

			if (isEventHandler(invocation) && ret === false) {
				var ev = invocation.args[0].event;
				ev.stopPropagation();
				ev.preventDefault();
			}

			return ret;
		});

		var cancelEventAspect = {
			interceptors: cancelInterceptor,
			target: '*Controller'
		};

//		var logAspect = {
//			interceptors: h5.core.interceptor.logInterceptor,
//			target: '*Controller'
//		};

		h5.settings.aspects = [cancelEventAspect];

		//Ajaxのリトライ設定
		h5.settings.ajax.retryCount = 3;
		h5.settings.ajax.retryInterval = 500;
		h5.settings.ajax.retryFilter = function(){
			alert('Ajax RETRY!');
		};

	});

})();
