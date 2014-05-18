define(function(require, exports, module) {

	require('./jquery.contextMenu');
	require('./jquery.contextMenu.css');
	
	var menu = {};
	
	menu.contextMenu = function(config){
		$.contextMenu(config);
	};
	
	menu.contextMenuTrigger = function(_box,flag){
		$(_box).contextMenu(flag);
	};
	
	module.exports = menu;
	
	if(typeof(furnace) !== 'undefined'){
		furnace.clone(menu);
	}
});		