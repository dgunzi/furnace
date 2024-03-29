define(function(require, exports, module) {
	require('furnace');
	require('scroll');
	require('layout');
	require('tab');
	require('multiMenu');
	require('cssTable');
	require('pagination');
	
	
	$(function(){
		furnace.layout('body',{ applyDefaultStyles: false,west__size:270,west__closable:false,onresize :function(){resizeLayout()},onload_end:function(){resizeLayout()}});
		//tabs调用
		furnace.tabs('#tabs');
		//滚动条美化
		furnace.scroll('#tab1,#main_content',{touchbehavior:false,cursorcolor:"#000",cursoropacitymax:0.7,cursorwidth:12,cursorborder:"1px solid #FFAF60",cursorborderradius:"3px",autohidemode:false});
		//页面加载时，tabs内容区div的高度
		resizeLayout();
		//menu
		furnace.multiMenu('.sf-menu');
	});	
	
});
