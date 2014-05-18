define(function(require, exports, module) {
	var furnace = {
		version : {
				num :'1.0b',
				create_time : '2013-10-11 17:04:39'
		},
		msg:{
			statusCode_503 : '服务器当前负载过大或者正在维护!'
		},
		ajaxError:function(xhr, ajaxOptions, thrownError){
			if (furnace.alert) {
				furnace.alert("<div>Http status: " + xhr.status + " " + xhr.statusText + "</div>" 
					+ "<div>ajaxOptions: "+ajaxOptions + "</div>"
					+ "<div>thrownError: "+thrownError + "</div>"
					+ "<div>"+xhr.responseText+"</div>");
			} else {
				alert("Http status: " + xhr.status + " " + xhr.statusText + "\najaxOptions: " + ajaxOptions + "\nthrownError:"+thrownError + "\n" +xhr.responseText);
			}
		}
	};
	
	furnace.getRootPath = function()
	{
		var pathName = window.location.pathname.substring(1);
		var webName = pathName == '' ? '' : pathName.substring(0, pathName.indexOf('/'));
		return window.location.protocol + '//' + window.location.host + '/'+ webName + '/';
	}
	
	furnace.isNullObj = function(obj){
	    for(var i in obj){
	        if(obj.hasOwnProperty(i)){
	            return false;
	        }
	    }
	    return true;
	}
	
	furnace.clone = function(newObj){
		$.extend(this, newObj);
	}
		
	module.exports = furnace;
	//导出为全局变量
	window.furnace = furnace;
});