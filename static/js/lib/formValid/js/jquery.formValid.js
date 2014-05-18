;(function($){
	//定义一个数组记录表单验证的情况
	var arr = new Array();
	//得到元素的输入值
	var getVal=function(id){
		return $.trim($('#'+id).val());
	}
	var getValNoRs=function(id){
		return $('#'+id).val();
	}
	//元素是否需要进行非空验证
	var checkNul = function(id){
		if(typeof($('#'+id).attr('checkNull'))=='undefined')
		{
			return false;
		}
		else
		{
			if($('#'+id).attr('checkNull')=='yes')
			{
				return true;
			}
		}
	}
	var _globaloptions = {
		ignoreHidden:false,
		tipsCustom:false
	}
	var tipsModeArr = {};
	var tipsMode = function(formId){
		return tipsModeArr[formId];
	};
	$.fn.extend({
		//选择需要验证的表单
		"formValid":function(value){
			if(typeof(value)!='undefined')
			{
				var value = $.extend({},_globaloptions,value);
			}
			else
			{
				var value = _globaloptions;
			}
	//		alert($(this).attr('id')+"----------"+value.tipsCustom)
			tipsModeArr[$(this).attr('id')] = value.tipsCustom;
	//		tipsMode = value.tipsCustom;
			var ignoreHidden = value.ignoreHidden;
			//输入框获得焦点后的输入提示
			bindTips(this);
			//只是需要限制最大长度的textarea元素，根据maxLength属性添加ie限制输入的方法,     暂时注释 ，ie下的快捷键问题
	//		textareaLengthBind(this);
			//获得表单上所有需要check值的元素，blur后响应绑定的验证方法
			
			checkBind(this,ignoreHidden);
//			if(typeof(value)!='undefined')
//			{
//				if(value.onElement == true)
//				{
//					$('.tipMsgWrap',this).css('top',-53).find('.tipFixed,.tipErr').css('top',24);
//				}
//			}
			return this;
		},
		//提交表单之前的统一验证
		"beforeSubmitCheck":function(){
			//点击提交的时候数组清零
			arr.length = 0;
			
			//表单全部含有checkType属性元素的验证,formValid方法中已执行
	//		checkBind(this);
			$("[checkType]",this).blur();
			var flag = false;
	//		alert(arr)
			//检验数组中是否有false，确定表单是否有元素内容输入错误
			return in_array(flag,arr);
		},
		//
		"showErrorMessage":showErrorMessage,
		"showTipMessage":showTipMessage,
		"addSuccessClass":successAndHideTips,
		//提示位置根据页面元素位置变化时变化，已改为相对定位，这个函数先不用
		"tipsResize":function(){
//			$('.errorTips,.formTip',this).each(function(){
//				tipsPosition(this);
//			});
		},
		"checkValue":function(){var check = new checkValue();return check;}
	});
	//提示位置根据页面元素位置变化时变化
	function tipsPosition(obj)
	{
//		var tipsWrap = $(obj).parent().parent();
//		var tipsWrapId = tipsWrap.attr('id');
//		var inputTextId = tipsWrapId.replace('msg_','');
//		var left=$('#'+inputTextId).offset().left;
//		var	top=$('#'+inputTextId).offset().top;
//		if(typeof($('#'+inputTextId).attr('wrapAbsolute'))!='undefined')
//		{
//			var elementInPosition = $('#'+inputTextId).attr('wrapAbsolute');
//			var arrayLeftAndTop = elementInPosition.split('-');
//			left-=arrayLeftAndTop[0];
//			top-=arrayLeftAndTop[1];
//		}
//		id = tipsWrapId;
//		$('#'+id).stop().css({
//			left:left+20,
//			top:top+20
//		});
	}
	//绑定验证元素
	
	//需要提示信息的元素
	function bindTips(obj)
	{
		var formId = $(obj).attr('id');
		$("[formtips]",obj).focusin(function(){
				if($(this).attr('ignore')!='yes'||typeof($(this).attr('ignore'))=='undefined')
				{
					var objId = $(this).attr('id');
					var tips = $(this).attr('formtips');
					if(tips == '')
					{
						tips = '请输入正确信息';
					}
					var msgWrapId = 'msg_'+objId;
					if($('#'+msgWrapId).length<1&&!tipsMode(formId))
					{
						var msgWrap = "<span class='tipMsgWrap' id='"+msgWrapId+"'></span>";
						$(this).before(msgWrap);
					}
					showTipMessage(objId, tips, formId);
				}
			}).focusout(function(){
				if(typeof($(this).attr('checkType'))=='undefined'||$(this).attr('checkType')=='custom')
				{
					addSuccessClass($(this).attr('id'),formId) 
				}
			});
	}
	//需验证的元素对应验证方法
	function checkBind(obj,ignoreHidden)
	{
		var formId = $(obj).attr('id');
		$("[checkType]",obj).each(function(){
			var id = $(this).attr('id');
			var checkNullArr=$(this).attr('checkType').split(',');
			var msgWrap='';
			var notNullSymbol;
			var pObj = $(this).parent();
			if(!in_array('isNull',checkNullArr))
			{
				var checkNull = 'notNullCheck';
				$(this).addClass(checkNull);
				if(!$(this).next().hasClass('notNullTip'))
				{
					notNullSymbol = '<a class="notNullTip">*</a>';
					$(this).after(notNullSymbol);
				}
			}
			var msgWrapId = "msg_"+id;
			if(pObj.find('#'+msgWrapId).length>0 || tipsMode(formId))
			{
				msgWrap += '';
			}
			else
			{
				msgWrap += "<span class='tipMsgWrap' id='"+msgWrapId+"'></span>";
			}
			$(this).before(msgWrap);
		})
		$("[checkType]",obj).blur(function(){
			if($(this).attr('checkType')!='custom')
			{
				if(ignoreHidden)
				{
					if($(this).attr('ignore')!='yes'&&$(this).css('display')!='none')
					{
						
						checkVal($(this),formId);
					}
				}
				else
				{
					if($(this).attr('ignore')!='yes')
					{
						checkVal($(this),formId);
					}
				}
			}
		});
		$("[checkType]",obj).focusin(function(){
			if(typeof($(this).attr('formtips'))=='undefined')
			{
				$('#msg_'+$(this).attr('id')).html(''); 
			}
		});
	}
	function textareaLengthBind(obj)
	{
		$('[maxLength]',obj).keyup(function(){
			if($(this).get(0).tagName=='TEXTAREA')
			{
				var maxLengthText = $(this).attr('maxLength');
				this.value = this.value.slice(0, maxLengthText);
			}
		});
	}
	//错误信息提示
	function showErrorMessage(id, msg,formID)
	{
//		$("#" + id).css('background-color','#FBE2E2');
//		alert($(this).attr('id')+'a') 
		var formID = formID||$(this).attr('id');
		var objHeight = $('#'+id).height();
		var tagName = $('#'+id).get(0).tagName;
//		alert(formID)
		$('#'+id).addClass('errorTipsColor');
		var id = "msg_" + id;
		var msgLength = msg.length;
		var tipWidth = (msgLength)*12;
		var imgInputTip;
		imgInputTip = '<div class="errorTips">'+msg+'</div><div class="tipErr">&#9670;</div>';
		if(tipsMode(formID))
		{
			imgInputTip = '<div class="errorTipsCustom">'+msg+'</div>';
		}
//		$("#" + id).find('.errorTips,.formTip,.tipFixed,.tipErr').remove();
		$("#" + id).html(imgInputTip);
		/*
		if(!tipsMode(formID))
		{
		//	$("#" + id+' .errorTips').css('width',tipWidth);
			if(tagName != 'TEXTAREA')
			{
				$('#'+id).css('top',objHeight/2);
			}
		}
		*/
		
		//元素insert后设置主题
//		themeSet(themeColor,this);
//		$('#'+id).stop().css({
//			top:12
//		}).show().animate({
//			top:3	
//		},200);
	//	$('#'+id).show();
		$('#'+id).css('display','inline-block');
		arr.push(false);
	}
	//提示信息
	function showTipMessage(id, msg,formID)
	{
//		alert($(this).attr('id')+'a') 
		var formID = formID||$(this).attr('id');
//		alert(formID)
		var objHeight = $('#'+id).height();
		var tagName = $('#'+id).get(0).tagName;
		var id = "msg_" + id; 
		var msgLength = msg.length;
		var tipWidth = (msgLength)*12;
		var imgInputTip = '<div class="formTip">'+msg+'</div><div class="tipFixed">&#9670;</div>';
		if(tipsMode(formID))
		{
			imgInputTip = '<div class="formTipCustom">'+msg+'</div>';;
		}
//		$("#" + id).find('.errorTips,.formTip,.tipFixed,.tipErr').remove();
		$("#" + id).html(imgInputTip);
		/*
		if(!tipsMode(formID))
		{
	//		$("#" + id+' .formTip').css('width',tipWidth);
			if(tagName != 'TEXTAREA')
			{
				$('#'+id).css('top',objHeight/2);
			}
		}
		
		*/
//		themeSet(themeColor,this);
//		$('#'+id).stop().css({
//			top:10
//		}).show().animate({
//			top:3	
//		},200);
	//	$('#'+id).show();
		$('#'+id).css('display','inline-block');
	}	
	//主题设置，这里先不用
	function themeSet(themeValue,obj)
	{
		if(typeof(themeValue)!='undefined')
		{
			var colorTips = themeValue.color;
			var backgroundColorTips = themeValue.bgColor;
			if(typeof(colorTips)=='undefined')
			{
				colorTips = '#fff';
			}
			if(typeof(backgroundColorTips)=='undefined')
			{
				backgroundColorTips = '#464A56';
			}
			$(obj).find('.tipMsgWrap').css('color',colorTips).find('.errorTips,.formTip').css('background-color',backgroundColorTips).end().find('.tipFixed').css('color',backgroundColorTips);
		}
	}
	//填写正确后调用
	function addSuccessClass(id,formID)
	{
//		$("#" + id).css('background-color','');
		var msgid = "msg_" + id;
		
		if(tipsMode(formID))
		{
			var rightTips = '<div class="rightTipCustom"></div>';
			$('#'+msgid).html(rightTips);
			$('#'+id).removeClass('errorTipsColor');
		}
		else
		{
			//加入这个判断，防止已经添加验证规则的元素，又在验证流程中需要调用showErrorMessage方法时，元素不弹出提示框
			if($('#'+msgid).children('.errorTips').length<=0)
			{
				$('#'+id).removeClass('errorTipsColor');
				$('#'+msgid).hide();
			}
		}
		
		arr.push(true);
	}
	//外部调用的方法，与上一个方法的区别是，因为要外部调用，不用判断，用这个直接隐藏提示，否则如果上一个方法外部调用，因为不是在焦点失去和获得的时候有一个过程，而是直接控制，在经过判断时就会无法取出错误提示
	function successAndHideTips(id)
	{
//		$("#" + id).css('background-color','');
		var msgid = "msg_" + id;
		if(tipsMode($(this).attr('id')))
		{
			var rightTips = '<div class="rightTipCustom"></div>';
			$('#'+msgid).html(rightTips);
			$('#'+id).removeClass('errorTipsColor');
		}
		else
		{
			$('#'+id).removeClass('errorTipsColor');
			$('#'+msgid).hide();
		}
		arr.push(true);
	}
	function checkVal(obj,formId)
	{
		var objCheckType = obj.attr('checkType');
		var id = obj.attr('id');
		var flagAllCheck;
		var tipMsg;
		if(typeof(obj.attr('errMsg'))!='undefined')
		{
			tipMsg = obj.attr('errMsg');
		}
		if(objCheckType)
		{
			var checkArr = objCheckType.split(',');
			var hasAjaxCheck = in_array('ajaxCheck',checkArr);
			if(!hasAjaxCheck)
			{
				var arrIndex = $.inArray('ajaxCheck',checkArr);
				checkArr.splice(arrIndex,1);
				checkArr.push('ajaxCheck');
			}
			for(i=0;i<checkArr.length;i++)
			{
				if(checkArr[i]!='ajaxCheck')
				{
					flagAllCheck = eval("checkInput."+checkArr[i]+"(id)");
					if(flagAllCheck)
					{
						addSuccessClass(id,formId); 
					}
					else
					{
						if(typeof(obj.attr('errMsg'))=='undefined')
						{
							tipMsg = checkErrMsg(checkArr[i]);
						}
						showErrorMessage(id, tipMsg,formId); 
						break;
					}
				}
				else
				{
					eval("checkInput."+checkArr[i]+"(id,formId)");
				}
				
			}
		}
	}
	//根据验证类型对应errorMsg
	function checkErrMsg(objCheckType)
	{
		var tipMsg;
		switch (objCheckType)
		{
			case 'isEmail':
			tipMsg = 'email格式不对';break;
			case 'isNull':
			tipMsg = '内容不能为空';break;
			case 'conLength':
			tipMsg = '内容长度不对';break;
			case 'isIP':
			tipMsg = 'IP格式错误';break;
			case 'regVal':
			tipMsg = '格式错误';break;
			case 'numberScope':
			tipMsg = '所输入内容大小不合适';break;
			case 'passwordRecheck':
			tipMsg = '两次输入不一致';break;
			case 'checkPhone':
			tipMsg = '电话格式不对';break;
			case 'isMobilePhone':
			tipMsg = '手机号码格式不对';break;
			case 'isPort':
			tipMsg = '端口号格式不对';break;
			case 'ajaxCheck':
			tipMsg = '该值已存在';break;
			default:
			tipMsg = '不符合格式要求';
		}
		return tipMsg;
	}
	/*
	//提示位置根据页面元素位置变化时变化
	function tipsResize()
	{
		$('.errorTips').each(function(){
			var tipsWrap = $(this).parent().parent();
			var tipsWrapId = tipsWrap.attr('id');
			var inputTextId = tipsWrapId.replace('msg_','');
			var left=$('#'+inputTextId).offset().left;
			var	top=$('#'+inputTextId).offset().top;
			id = tipsWrapId;
			$('#'+id).stop().css({
				left:left+20,
				top:top+20
			});
		});
	}
	*/
	//数组中是否含有某元素
	function in_array(value,arr)
	{
		for(i=0;i<arr.length;i++)  
		{  
			if(arr[i] == value)  
			return false;  
		}
		return true;
	}
	$.extend({
		checkValid:function(){
			var ck = new checkValue();
		/*	var ckr = {};
			ckr = $.extend(ckr,ck);
			return ckr;*/
			return ck;
		}
	});
/*	var ck = {
		isNull:function(id)
		{
			var checkVal = getVal(id);
			if(checkVal=='')
			{
				return false;
			}
			else
			{
				return 1;
			}
		}
	}*/
	var checkInput = new checkValue();
	/***********规则验证函数*****************/
	function checkValue()
	{
		
		//非空
		this.isNull=function(id)
		{
			var checkVal = getVal(id);
			if(checkVal=='')
			{
				return false;
			}
			else
			{
				return true;
			}
		},
		//密码一致性
		this.passwordRecheck=function(id)
		{
			var checkVal = getVal(id);
			var recheckObjId = $('#'+id).attr('recheckId');
			if(typeof(recheckObjId)!='undefined')
			{
				var recheckVal = getVal(recheckObjId);
				if(checkVal == recheckVal)
				{
					return true; 
				}
				else
				{
					return false;
				}
			}
		},
		//email
		this.isEmail=function(id)
		{
			var checkVal = getVal(id);
			var reg = /^[-_A-Za-z0-9]+@([_A-Za-z0-9]+\.)+[A-Za-z0-9]{2,3}$/; 
			
			if(reg.test(checkVal)||checkVal == '')
			{
				return true; 
			}
			else
			{
				return false;
			}
		},
		//长度限制
		this.conLength=function(id)
		{
			var checkVal = getVal(id);
			var minlength = $('#'+id).attr('minlength');
			var maxlength = $('#'+id).attr('maxlength');
			var checkValArr = checkVal.split(""); 
			if(checkValArr.length>maxlength||checkValArr.length<minlength)
			{
				return false;
			}
			else
			{
				return true; 
			}
		},
		//IP
		this.isIP=function (id) 
		{ 
			var checkVal = getVal(id);
			var reg=/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/g;
			if(reg.test(checkVal)||checkVal == '') 
			{ 
				if( RegExp.$1 <256 && RegExp.$2<256 && RegExp.$3<256 && RegExp.$4<256); 
				return true; 
			} 
			return false; 
		} ,
		/*************/
		//电话
		this.checkPhone=function (id)  
		{ 
			var checkVal = getVal(id);
			var phoneRegWithArea = /^[0][1-9]{2,3}-[0-9]{5,10}$/; 
			var phoneRegNoArea = /^[1-9]{1}[0-9]{5,8}$/; 
			if ( checkVal.length > 9 ) { 
				if ( phoneRegWithArea.test(checkVal)||checkVal == '' ) { 
					return true; 
				} 
				else { 
					return false; 
				} 
			} 
			else { 
				if ( phoneRegNoArea.test( checkVal )||checkVal == '') { 
					return true; 
				} 
				else { 
					return false; 
				} 
			} 
		},
		//邮编
		this.isPostcode=function (id)
		{
			var checkVal = getVal(id);
			var re= /^[1-9][0-9]{5}$/
			if(re.test(checkVal)||checkVal == '')
			{
				return true;
			}
			return false; 
		},
		//手机号码
		this.isMobilePhone=function (id)
		{
			var checkVal = getVal(id);
			var re= /^(13[0-9]|15[0|1|2|3|5|6|7|8|9]|18[0|5|6|8|9])\d{8}$/ 
			if(re.test(checkVal)||checkVal == '')
			{
				return true;
			}
			return false; 
		},
		//正整数
		this.isNumber=function (id) 
		{ 
			var checkVal = getVal(id);
			/*var re = "^[0-9]+$"; 
			var re = new RegExp(re); 
			if ((checkVal.search(re) != - 1)&&checkVal>0 ||checkVal == '')
			{ 
				return true; 
			} 
			else 
			{ 
				return false; 
			} */
			var reg = new RegExp("^[1-9][0-9]*$");
    		return reg.test(checkVal);

		},
		//0或正数
		this.positiveNumber=function (id) 
		{ 
			var checkVal = getVal(id);
	//		alert(typeof checkVal)
			if (checkVal>=0 ||checkVal == '')
			{ 
				return true; 
			} 
			else 
			{ 
				return false; 
			} 
		},
		//自然数
		this.isNaturalNumber=function (id) 
		{ 
			var checkVal = getVal(id);
			var re = "^[0-9]+$"; 
			var re = new RegExp(re); 
			if ((checkVal.search(re) != - 1) ||checkVal == '')
			{ 
				return true; 
			} 
			else 
			{ 
				return false; 
			} 
		},
		//整数
		this.isInteger=function (id) 
		{ 
			var checkVal = getVal(id);
			var re = /^[-]{0,1}[0-9]{1,}$/; 
			if(re.test(checkVal)||checkVal == '')
			{
				return true;
			}
			return false; 
		},
		//端口号
		this.isPort=function (id) 
		{ 
			var checkVal = getVal(id);
			var re = /^[-]{0,1}[0-9]{1,}$/; 
			 if((re.test(checkVal)&& checkVal < 65536&&checkVal>0)||checkVal == '')
			{
				return true;
			}
			return false; 
		},
		//由字母和数字组成
		this.isNumberOrLetter=function (id) 
		{ 
			var checkVal = getVal(id);
			var regu = "^[0-9a-zA-Z]+$"; 
			var re = new RegExp(regu); 
			 if(re.test(checkVal)||checkVal == '')
			{
				return true;
			}
			return false; 
		},
		//数字范围
		this.numberScope=function (id) 
		{ 
			var checkVal = getVal(id);
			if(checkVal == '')
			{
				return true; 
			}
			else if(this.isInteger(id))
			{
				//取到的属性值是string类型，进行类型转换，转换为数字，这里用加号会作为连接字符串的运算，可以x-0 或 x*1或Number(x)
				var minNumber = $('#'+id).attr('minNum')-0;
				var maxNumber = $('#'+id).attr('maxNum')-0;
				if(checkVal<minNumber||checkVal>maxNumber)
				{
					return false;
				}
				else
				{
					return true; 
				}
			}
			else
			{
				return false;
			}
		},
		this.ajaxCheck=function (id,formId)
		{
			var checkVal = getVal(id);
			var sendData = $('#'+id).serialize();
			var ajaxConfig= $('#'+id).attr('ajaxUrl');
			ajaxConfig = eval("("+ajaxConfig+")");
			var ajaxUrl = ajaxConfig.url;
			var ajaxTips = ajaxConfig.tip;
			var relationId = ajaxConfig.relationID;
			if(typeof relationId != 'undefined')
			{
				for(var i=0;i<relationId.length;i++)
				{
					sendData +='&'+ $('#'+relationId[i]).serialize();
				}
			}
	//		console.log(sendData)
			if(checkVal == '')
			{
				return true; 
			}
			else
			{
				$.ajax({
					type : "post",
					dataType : "json",
					url : ajaxUrl,
					async:false,
					data : sendData,
					success : function(dataVal) {
						if(dataVal)
						{
							addSuccessClass(id,formId);
						}
						else
						{
							showErrorMessage(id, ajaxTips,formId); 
						}
					}
				});
			}
		},
		/******************/
		//自定义验证正则，取reg属性的值作为正则表达式验证
		this.regVal=function (id)
		{
			var checkVal = getVal(id);
			var reg = eval($('#'+id).attr('reg')); 
			if(reg.test(checkVal)||checkVal == '')
			{
				return true; 
			}
			return false;
		},
		this.hasTag=function (id)
		{
			var checkVal = getVal(id);
			var re = /<\/?.+?>/; 
			if(checkVal=='')
			{
				return true; 
			}
			else if(re.test(checkVal))
			{
				return false;
			}
			else
			{
				return true; 			
			}
			
		},
		this.customFuns=function(id)
		{
			var checkVal = getVal(id);
			var funs = $('#'+id).attr('funs'); 
			var flag = eval(funs);
			return flag;
		}
	}
	
})(jQuery);

