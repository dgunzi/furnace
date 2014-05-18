define(function(require, exports, module) {

	require('./editData');
	
	var edt = {};
	
	edt.editData = function(_box,config){
		var $p = $(_box || document);
		$p.editTd(config);
	};

	module.exports = edt;
	
	if(typeof(furnace) !== 'undefined'){
		furnace.clone(edt);
	}
});