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
