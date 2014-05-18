define(function(require, exports, module) {
	
	require('./jquery.layout.min');
	
	var layout = {};

	layout.layout = function(_box,config){
		var options = {closable:false};
		$.extend(options,config);
		var $p = $(_box || 'body');
		return $p.layout(options);
	}

	module.exports = layout;

	if(typeof(furnace) !== 'undefined'){
		furnace.clone(layout);
	}
});