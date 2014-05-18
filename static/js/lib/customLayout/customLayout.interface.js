define(function(require, exports, module) {
	require('./jquery.customLayout');
	
	var cdx = {};
	
	cdx.customIndex = function(_box,config){
		var $p = $(_box || document);
		$p.sortable(config);
	};

	module.exports = cdx;
	
	if(typeof(furnace) !== 'undefined'){
		furnace.clone(cdx);
	}
});