define(function(require, exports, module) {

	require('./dragTd');
	require('./cssTable');
	
	var table = {};
	
	table.cssTable = function(_box){
		var $p = $(_box || document);
		$('table.list', $p).cssTable();
	};
		
	table.sortTable = function(_box){
		var $p = $(_box || document);
		$('table.list', $p).sortTable();
	};
	
	table.allSelectTb = function(_box,config){
		var $p = $(_box || document);
		$p.allSelectTb(config);
	};
	
	table.getNoSelectTr = function(_box){
		var $p = $(_box || document);
		return $p.getNoSelectTr();
	};
	
	table.getAllCheckStatus = function(_box){
		var $p = $(_box || document);
		return $p.getAllCheckStatus();
	};
	
	table.addTrArr = function(_box){
		var $p = $(_box || document);
		$p.addTrArr();
	};
	
	table.delTrArr = function(_box){
		var $p = $(_box || document);
		$p.delTrArr();
	};
	
	module.exports = table;
	
	if(typeof(furnace) !== 'undefined'){
		furnace.clone(table);
	}
});