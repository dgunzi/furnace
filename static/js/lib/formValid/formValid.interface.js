//v1.0
define(function(require, exports, module) {

	require('./js/jquery.formValid');
	var fmValid = {};
	
	fmValid.formValid = function(_box,config){
		/*var cssTypeUse = 'formValid';
		if(typeof(config)!='undefined')
		{
			if(config.theme == 'orange'||config.theme == 'black')
			{
				cssTypeUse = cssTypeUse+'_'+config.theme;
			}
		}
		require.async(['./css/formValid_orange.css'], function() {
			var $p = $(_box || document);
			$p.formValid(config);
		});*/
		var $p = $(_box || document);
			$p.formValid(config);
	};
	fmValid.formShowErrorMessage = function(_box,id,tips){
			var $p = $(_box || document);
			$p.showErrorMessage(id,tips);
	};
	fmValid.formShowTipMessage = function(_box,id,tips){
			var $p = $(_box || document);
			$p.showTipMessage(id,tips);
	};
	fmValid.formAddSuccessClass = function(_box,id){
			var $p = $(_box || document);
			$p.addSuccessClass(id);
	};
	fmValid.formBeforeSubmitCheck = function(_box){
			var $p = $(_box || document);
			return $p.beforeSubmitCheck();
	};
	fmValid.checkValue = function(_box)
	{
		var $p = $(_box || document);
		return new $p.checkValue;
	};
	fmValid.checkValid = function()
	{
		return $.checkValid();
	};
	
	module.exports = fmValid;
	
	if(typeof(furnace) !== 'undefined'){
		furnace.clone(fmValid);
	}
});