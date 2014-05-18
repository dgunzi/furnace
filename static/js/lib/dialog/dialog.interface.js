define(function(require, exports, module) {

	require('./lhgdialog.src.js');
	
	var dialog = {};
	
	var api = null,W =null;
	if(frameElement){
		api = frameElement.api, W = api.opener;
	}
	
	dialog.dialog = function(content,dlgId,title,config){
		var options = {content:content,max:false,min:false,lock:true,resize:false};
		if (!!dlgId && dlgId.length > 0) {
			options.id = dlgId;
		}
		if (!!dlgId && dlgId.length > 0) {
			options.title = title;
		}
		if(!!config){
			$.extend(options, config);
		}
		var rObj = null;
		if(W){
			$.extend(options,{parent:api});
			rObj = W.$.dialog(options);
		}else{
			rObj = $.dialog(options);
		}
		return rObj;
	};
	
	dialog.closeDialog = function(winId){
		if(W){
			W.lhgdialog.list[winId].close();
		}else{
			lhgdialog.list[winId].close();
		}
	};
	
	dialog.hideDialog = function(winId){
		if(W){
			W.lhgdialog.list[winId].hide();
		}else{
			lhgdialog.list[winId].hide();
		}
	};
	
	dialog.showDialog = function(winId){
		if(W){
			W.lhgdialog.list[winId].show();
		}else{
			lhgdialog.list[winId].show();
		}
	};
	
	dialog.doParentFunction = function(functionName,flag){
	 	var fun=functionName+"()";
		if(flag){
		  fun = functionName;	
		}
		return parent.eval(fun);
	};
	
	dialog.getParent = function(){
		return W;
	};
	
	dialog.doWinFunction = function(winId,functionName,flag){
		var fun=functionName+"()";
		var rObj = null;
		if(flag){
		  fun = functionName;
		}
		if(W){
			rObj = W.$.dialog.list[winId].content.eval(fun);
		}else{
			rObj = $.dialog.list[winId].content.eval(fun);
		}
		
		return rObj;
	};
	
	dialog.closeCurrentWin = function(){
		if(W){
			W.lhgdialog.focus.close();
		}else{
			lhgdialog.focus.close();
		}
	};
	
	dialog.setValueToParent = function(elementId,strValue,parentId){
		if(parentId){
			parent.lhgdialog.list[parentId].content.document.getElementById(elementId).value = strValue;
		}else{
	 		parent.document.getElementById(elementId).value = strValue;
	 	}
	};
	
	dialog.addButton = function(){
		var length = arguments.length;
		var dialog = null;
		var array = new Array();
		var obj = new Object();
		
		if(length%2 == 0){
			arguments[length] = null;
		}
		for(var i=1; i<length;){
			obj = new Object();
			obj["name"] = arguments[i];
			obj["callback"] = arguments[i+1];
			if(i==1){
				obj["focus"] = true;
			}
			array.push(obj);
			i = i+2;
		}
		if(W){
			dialog = W.$.dialog.list[arguments[0]];
		}else{
			dialog = $.dialog.list[arguments[0]];	
		}
		dialog.button.apply(dialog,array);
		array = null;
	};
	
	dialog.alert = function(message,callback){
		var rObj = null;
		if(W){
			rObj = W.$.dialog.alert(message,callback,api);
		}else{
			rObj = $.dialog.alert(message,callback);
		}
		return rObj;
	};
	
	dialog.confirm  = function(message,callback1,callback2){
		var rObj = null;
		if(W){
			rObj = W.$.dialog.confirm(message,callback1,callback2,api);
		}else{
			rObj = $.dialog.confirm(message,callback1,callback2);
		}
		return rObj;
	};
	
	dialog.tips =  function(message,time,pic,callback){
		return $.dialog.tips(message,time,pic,callback);
	};
	
	module.exports = dialog;
	
	if(typeof(furnace) !== 'undefined'){
		furnace.clone(dialog);
	}
});
