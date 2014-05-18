define(function(require, exports, module) {

	require('./superfish');

	var menu = {};
	
	menu.multiMenu = function(_box,config){
		var $p = $(_box || document);
		$p.superfish(config);
	};

	module.exports = menu;
	
	if(typeof(furnace) !== 'undefined'){
		furnace.clone(menu); 
	}
});