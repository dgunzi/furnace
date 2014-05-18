define(function(require, exports, module) {

	require('./WdatePicker');
	
	var timeSelect = {};
	
	timeSelect.datePicker = function(_box,config){
		var $p = $(_box || document);
		$p.focus(function(){WdatePicker(config)});
	};
	
	module.exports = timeSelect;
	
	if(typeof(furnace) !== 'undefined'){
		furnace.clone(timeSelect);
	}
});