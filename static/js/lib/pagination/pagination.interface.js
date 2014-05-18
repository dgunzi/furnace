define(function(require, exports, module) {	

	require('../getOSBro/getOSAndBrowse');
	require('./pagination');
	
	var pagination = {};
	pagination._template ='<ul><li class="j-first"><a class="first" href="javascript:;"><span>首页</span></a><span class="first"><span>首页</span></span></li><li class="j-prev"><a class="previous" href="javascript:;"><span>上一页</span></a><span class="previous"><span>上一页</span></span></li>#pageNumFrag#<li class="j-next"><a class="next" href="javascript:;"><span>下一页</span></a><span class="next"><span>下一页</span></span></li><li class="j-last"><a class="last" href="javascript:;"><span>末页</span></a><span class="last"><span>末页</span></span></li><li class="jumpto"><input class="textInput" type="text" size="4" value="#currentPage#" /><input class="goto" type="button" value="确定" /></li></ul>';
	pagination._error = function(){alert('异步请求出错');};
	
	/**
	 * 
	 * @param {Object} args {pageNum:"",numPerPage:"",orderField:"",orderDirection:""}
	 * @param String formId 分页表单选择器，非必填项默认值是 "pagerForm"
	 */
	function _getPagerForm($parent, args) {
		var form = $("#pagerForm", $parent).get(0);
	
		if (form) {
			if (args["pageNum"]) form["pageNum"].value = args["pageNum"];
			if (args["numPerPage"]) form["numPerPage"].value = args["numPerPage"];
		}
		
		return form;
	}
	
	pagination.pager = function(_box,customFun){
		var $p = $(_box || document);
		if(!customFun){
			customFun = function(){alert('pager回调函数为空');}
		}
		$("div.pagination", $p).each(function(){
			//调用自定义分页控件计算分页
			var $this = $(this);
			$this.pagination({
			     targetType:$this.attr("targetType"), //目标类型
			     totalCount:$this.attr("totalCount"), //记录总数
			     numPerPage:$this.attr("numPerPage"), //每页多少条
			     pageNumShown:$this.attr("pageNumShown"), //显示页的个数
			     currentPage:$this.attr("currentPage"), //当前页
			     rel : $this.attr("rel"),
			     customFun : customFun
			},pagination._template);
		});
		var osAndBrowse =  $.getOSAndBrowser().split('/');
		if(osAndBrowse[0]=='WinXP'&&osAndBrowse[1]=='IE8.0')
		{	
			$('.combox[name=numPerPage] option[value=500]', $p).remove();
		}
	};
    	  
	pagination.pageBreak = function(args, rel, customFun){
		if(!customFun){
			customFun = function(){alert('pageBreak回调函数为空');}
		}
		var options = {rel:rel, data:args};
		var op = $.extend({rel:"", data:{pageNum:"", numPerPage:""}, callback:null}, options);
    	var $box = $("#" + op.rel);
		var form = _getPagerForm($box, op.data);
		if (form) {
			if ($.isFunction(customFun)) customFun(rel);
		}
   };
   
   pagination.tableCallback = function(rel,formId) {
		var relId = "#" + rel;
	    var $form = $(relId + " #pagerForm");
	    if(formId){
	    	$form = $(relId + " "+formId);
	    }
	    $.ajax({
	        type: "post",
	        url: $form.attr("action"),
	        data: $form.serializeArray(),
	        cache: false,
	        dataType :"html",
	        success: function(data) {
	           $(relId).html(data);
	           furnace.cssTable(relId);
				var str = $(relId +" div.pagination")[0];
				var val = $(str).attr("numperpage");
   				var combox = $(relId +" select.combox")[0];
   				$(combox).val(val);
	            furnace.pager("#"+rel,furnace.tableCallback);
	            $(":button.checkboxCtrl, :checkbox.checkboxCtrl", $(relId)).checkboxCtrl($(relId));
	        },
	        error: furnace.ajaxError || pagination._error
	    });
	};
	
	module.exports = pagination;
	
	if(typeof(furnace) !== 'undefined'){
		furnace.clone(pagination);
	}

});   