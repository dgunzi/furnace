define(function(require, exports, module) {

	require('./jquery.ztree');
	
	var tree = {};
	tree.treeInit = function(treeDomId,setting,zNodes){
		var _ul = $("#"+treeDomId);
		$.fn.zTree.init(_ul,setting,zNodes);
	};
	
	tree.getTreeObj = function(treeId){
		return $.fn.zTree.getZTreeObj(treeId);
	};
	
	tree.treeDestroy = function(treeId){
		if(treeId){
			$.fn.zTree.destroy(treeId);
		}else{
			$.fn.zTree.destroy();
		}
	};
	
	module.exports = tree;
 	
 	if(typeof(furnace) !== 'undefined'){
 		furnace.clone(tree);
 	}
});	