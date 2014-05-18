define(function(require, exports, module) {

	require('./jquery.tabs');
	
	var tab = {};
	
	tab.tabs = function(_box,config){
		var $p = $(_box || document);
		if(typeof(config)!="undefined")
		{
			$p.idTabs(config);
		}
		else
		{
			$p.idTabs();
		}
	};
	
	module.exports = tab;
	
	if(typeof(furnace) !== 'undefined'){
		furnace.clone(tab); 
	}
});