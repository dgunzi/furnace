;(function($){
	var options = {
		//单元格内是否需要放置与单元格值相同的一个隐藏元素，可以在一次性提交表单时用，如果是ajax实时修改提交则不用，如果需要隐藏值时，这里设置的字符串则为隐藏元素的name
		hiddenInput:false,
		//单元格编辑的底色
		bgcolor:'#A8E2F6',
		//回调函数
		blurCallBk:editComments
	};
	$.fn.extend({
		editTd:function(config){
			var cfg = $.extend({},options,config);
			if(cfg.hiddenInput)
			{
				$(this).each(function(){
					if($('input[name='+cfg.hiddenInput+']',this).length < 1 )
					{
						var thisTdVal = $.trim($(this).text());
						var inputHidden = '<input type="hidden" value="'+thisTdVal+'" name="'+cfg.hiddenInput+'"/>';
						$(this).append(inputHidden);
					}
				});
			}
			$(this).unbind('dblclick');
			return $(this).dblclick(function(){
				$thisTd = $(this);
				$thisVal = $.trim($thisTd.text());
				var $hidden = '';
				if(cfg.hiddenInput)
				{
					$hidden = $('input[name='+cfg.hiddenInput+']',this);
				}
				
				$input = '<input type="text" class="editInputStyle" />'
				$thisTd.html($input).append($hidden);
				$('.editInputStyle').css('background',cfg.bgcolor);
				$('input',this).val($thisVal).show().focus()
								.blur(function(){
									if(cfg.blurCallBk != null)
									{
										var callBkFun = cfg.blurCallBk;
										callBkFun($(this));
									}
									if(cfg.hiddenInput)
									{				
										$(this).parent().append($(this).val()).end().siblings('input[type=hidden]').val($(this).val()).end().remove();
									}
									else
									{
										$(this).parent().text($(this).val());
									}
									
								}).focus();
			});
		}
	});
	function editComments(obj)
	{
		var valComment = $.trim($(obj).val());
		var ciId=$(obj).parents('tr').find('td:nth-child(1) input').val();
		$(obj).parents('td').attr('title',valComment);
		$.ajax({
				type : "post",
				dataType : "json",
				url : "ciSlices_updateComment.action",
				data : {comment:valComment,ciId:ciId},
				success : function(data) {
				}
			});
	}
})(jQuery);