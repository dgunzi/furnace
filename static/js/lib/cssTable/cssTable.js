/**
 * css table
 */
(function($){
	
	var tbIdObjCheck = {};
	
	var allSelectObj = {};
	var trNoSelectObj = {};
	
//	alert(1)
//	var lastSelectCheckbox = [];
	function mulSelect()
	{
		var obj = arguments[0];
		var objid = $(obj).attr('id');
		var  Args = Array.prototype.slice.call(arguments, 1);
		Args.sort(function compare(a,b){return a-b;}); 
		var startTr = Args[0];
		var endTr = Args[1];

		for(var i=startTr;i<=endTr;i++)
		{
			//tbody-index    table-index
			var j=i+1;
			$('tr:eq('+j+') td:first-child input:checkbox',$(obj)).attr('checked',true);
			$('tr:eq('+j+') td:first-child input:checkbox',$(obj)).parents('tr').addClass('selected');
			
			//存在全表选择的情况下执行
			
			if(typeof allSelectObj[objid]!='undefined'&&allSelectObj[objid] == true)
			{
				delTrArr($('#'+objid+' tr:eq('+j+') td:first-child input:checkbox'));
			}
			
		}
	}
	
	function addTrArr(obj)
	{
		var pTbid = $(obj).parents('table').attr('id');
		if(allSelectObj[pTbid] == true)
		{	
			var idValue = $(obj).val();
			
			var indexVal = $.inArray(idValue,trNoSelectObj[pTbid]);
			if(indexVal == -1)
			{
				trNoSelectObj[pTbid].push(idValue);
			}
		}
//		$('#itListTable #tr_'+idValue).removeClass('selected');
	}
	function delTrArr(obj)
	{
		var pTbid = $(obj).parents('table').attr('id');
		if(allSelectObj[pTbid] == true)
		{
			var idValue = $(obj).val();
			
			var indexVal = $.inArray(idValue,trNoSelectObj[pTbid]);
			
			if(indexVal != -1)
			{
				trNoSelectObj[pTbid].splice(indexVal,1);
			}
		}
//		$('#itListTable #tr_'+idValue).addClass('selected');
	}
	function relNoSelect(obj)
	{
		var idValue = $(obj).val();
		var pTbid = $(obj).parents('table').attr('id');
		var indexVal = $.inArray(idValue,trNoSelectObj[pTbid]);
		
		if(indexVal != -1)
		{
			$(obj).attr('checked',false);
			$('#'+pTbid+' #tr_'+idValue).removeClass('selected');
			$('#'+pTbid+' tr th input:checkbox').attr('checked',false);
		}
	}
	
	$.fn.extend({
		hoverClass: function(className, speed){
					var _className = className || "hover";
					return this.each(function(){
						var $this = $(this), mouseOutTimer;
						$this.hover(function(){
							if (mouseOutTimer) clearTimeout(mouseOutTimer);
							$this.addClass(_className);
						},function(){
							mouseOutTimer = setTimeout(function(){$this.removeClass(_className);}, speed||10);
						});
					});
		},
		ajaxUrl: function(op){
					var $this = $(this);
					$.ajax({
						type: op.type || 'GET',
						url: op.url,
						data: op.data,
						cache: false,
						success: function(response){
							if(response.length!=null){
								if ($.isFunction(op.callback)) op.callback(response);
							}
						},
						error : furnace.ajaxError,
						statusCode : {
							503: function(xhr, ajaxOptions, thrownError) {
								alert(furnace.msg["statusCode_503"] || thrownError);
							}
						}
					});
		},
		cssTable: function(options){
			
			return this.each(function(){
				$(this).dragTd({showDrag:false,minWidth:30});
				var $this = $(this);
				var $trh = $this.find('thead>tr');
				var $trs = $this.find('tbody>tr');
				
				$('td',$trs).each(function(){
					var tdVal = $.trim($(this).text());		
					if(tdVal != '')
					{
						tdVal=tdVal.replace(/(\s+$)|(^\s+)/g,"");
     					tdVal=tdVal.replace(/\s+/g," ");
						$(this).attr('title',tdVal);
					}
				});
				
				
				
				var $grid = $this.parent(); // table
				var nowrap = $this.hasClass("nowrap");
				var i = 0;
				var tbid = $this.attr('id');
				if(typeof tbid == 'undefined')
				{
					while($('body #thisTbShift'+i).length>0)
					{
						i++;
					}
					tbid = 'thisTbShift'+i;
					$this.attr('id',tbid);
				}
				/*
				$(this).mouseover(function(){
					var thisTbPos = $(this).offset();
					var corID = 'cor'+$(this).attr('id');
					var corClass = $(this).attr('class');
					var thStr = $(this).find('thead').html();
					var tbWidth = $(this).width();
					
					if($('#'+corID).length<1)
					{
						
						$('body').append('<table class="'+corClass+'" id="'+corID+'"><thead>'+thStr+'</thead></table>');
						
						$('#'+corID).css({'position':'fixed','top':thisTbPos.top,'left':thisTbPos.left,'width':tbWidth});
						$('#'+corID).find('th').css('background','#333');
					}
					$(window).resize(function(){
						$('#'+corID).remove();					
					});
				});
				*/
				if(!tbIdObjCheck.hasOwnProperty(tbid))
				{
					tbIdObjCheck[tbid] = new Array();
				}
				$trh.find('th:first-child :checkbox').click(function(){
					if(this.checked)
					{
						$trs.addClass("selected").find('td:first-child :checkbox').attr('checked',true);
					}
					else
					{
						$trs.removeClass("selected").find('td:first-child :checkbox').attr('checked',false);
					}
				});

				$trs.hoverClass("hover").each(function(index){
					var $tr = $(this);
					if (!nowrap && index % 2 == 1) 
					$tr.addClass("trbg");
					var thisTb = $(this).parents('table');
					tbIdObjCheck[tbid] = [];
					
	//				lastSelectCheckbox = [];
					$tr.find('td:first-child :checkbox').click(function(event){
						$trh.find('th:first-child :checkbox').attr('checked',false);
			//			alert()
						if($(this).attr('checked'))
						{
							$(this).parent().parent().addClass("selected");
						}
						else
						{
							$(this).parent().parent().removeClass("selected");
						}
						
						//给所有含有checkbox的表格增加shift多选
						var thisTrIndex = $(this).parents('tr').index();
						
						
						if(event.shiftKey)
						{
							if(tbIdObjCheck[tbid].length!=0&&thisTrIndex!=tbIdObjCheck[tbid][tbIdObjCheck[tbid].length-1])
							{
								mulSelect(thisTb,thisTrIndex,tbIdObjCheck[tbid][tbIdObjCheck[tbid].length-1]);
							}
						}
						tbIdObjCheck[tbid].push(thisTrIndex);
//						console.log(tbIdObjCheck)
			//			console.log('click');
//						$trs.filter(".selected").removeClass("selected");
//						$tr.addClass("selected");
//						var sTarget = $tr.attr("target");
//						if (sTarget) {
//							if ($("#"+sTarget, $grid).size() == 0) {
//								$grid.prepend('<input id="'+sTarget+'" type="hidden" />');
//							}
//							$("#"+sTarget, $grid).val($tr.attr("rel"));
//						}
					});
				});
				
				
			});
			
		},
		sortTable : function(options){
			function tabSort(i,type) {
					var sortFun = null;
					if(type == 'num'){
						sortFun = function (a, b) {
							var keya = $(a).find("td:nth-child(" + i + ")").text();
							var keyb = $(b).find("td:nth-child(" + i + ")").text();
							keya = parseFloat(keya) || 0;
							keyb = parseFloat(keyb) || 0;
							if (keya < keyb) { return -1; }
							if (keya > keyb) { return 1; }
							return 0;
						}
					}
					sortFun = function (a, b) {
							var keya = $(a).find("td:nth-child(" + i + ")").text();
							var keyb = $(b).find("td:nth-child(" + i + ")").text();
							return keya.localeCompare(keyb);
					};
					return sortFun;
			}
			this.each(function(){
				var $table = $(this);
				$table.find('th.sort').each(function(){
					$(this).click(function(){
						var $th = $(this),
						$thi = $th.parent().children().index($th),
						$arr = [],
						$trs = $table.find("tbody tr"),
						//console.log($trs);
						$frg = document.createDocumentFragment();
						$.each($trs, function (i) { $arr[i] = $trs[i] });
						if ($th.hasClass("selth")) {
							$th.toggleClass("desc");
							$arr.reverse();
						} else {
							$th.toggleClass("asc");
							var type = $th.attr('orderType');
							$arr.sort(tabSort($thi + 1,type));
							$(".selth").removeClass();
							$th.addClass("selth");
						}
						$.each($arr, function (i) { $frg.appendChild($arr[i]) });
						$table.find('tbody').empty().append($frg);
						$trs = $table.find("tbody tr");
						$trs.removeClass("trbg");
						$trs.hoverClass("hover").each(function(index){
							var $tr = $(this);
							if (index % 2 == 1) $tr.addClass("trbg");
						});
					}).attr('title', '点击可排序');
				});
			});
		},
		allSelectTb:function(options){
			var thisid = $(this).attr("id");
			var tableSelectId = options.tableid;
			var hasCard = options.hasCard;
			if(!allSelectObj.hasOwnProperty(tableSelectId))
			{
				allSelectObj[tableSelectId] = false;
			}
			if(!trNoSelectObj.hasOwnProperty(tableSelectId))
			{
				trNoSelectObj[tableSelectId] = new Array();
			}
			$(this).click(function(){
				allSelectObj[tableSelectId] = $(this).attr('checked')?true:false;
				var allSelect = allSelectObj[tableSelectId];
				$('input:checkbox',$('#'+tableSelectId)).attr('checked',allSelect);
				if(hasCard == 'hasCard')
				{
					var flag = $('#itMenu li.currentmode a').hasClass('cardmode');
					if(flag){
						if(allSelect)
						{
							$('#blocksitlist .grid').find('.state_table').addClass('selected');
						}
						else
						{
							$('#blocksitlist .grid').find('.state_table').removeClass('selected');
						}
					}
				}
				if(allSelect)
				{
					$('tbody tr',$('#'+tableSelectId)).addClass('selected');
				}
				else
				{
					$('tbody tr',$('#'+tableSelectId)).removeClass('selected');
				}
				trNoSelectObj[tableSelectId] = [];
			});
			$('#'+tableSelectId+' tr th:first input:checkbox').click(function(){
				if($(this).attr('checked'))
				{
					$('#'+tableSelectId+' tr td:first-child input:checkbox').each(function(){
						delTrArr($(this))
					});
				}
				else
				{
					$('#'+tableSelectId+' tr td:first-child input:checkbox').each(function(){
						addTrArr($(this))
					});
					
				}
			});
			$('#'+tableSelectId+' tr td:first-child input:checkbox').click(function(){
			
				if($(this).attr('checked'))
				{
					delTrArr($(this));
		//			var indexSelect = $(this).parents('tr').index();
		//			lastSelectCheckbox.push(indexSelect);
				}
				else
				{
					addTrArr($(this))
				}
			});
			if(allSelectObj[tableSelectId] == true)
			{
				$('#'+tableSelectId+' input:checkbox,#'+thisid).attr('checked',allSelectObj[tableSelectId]);
				$('#'+tableSelectId+' tbody tr').addClass('selected');
				$('#'+tableSelectId+' tr td:first-child input:checkbox').each(function(){
					relNoSelect($(this));
				})
			}
			else
			{
				$('#'+tableSelectId+' input:checkbox,#'+thisid).attr('checked',false);
			}
			return this;
		},
		getNoSelectTr:function(){
			var $thisid = $(this).attr('id');
			
			if(typeof trNoSelectObj[$thisid]!='undefined')
			{
				return trNoSelectObj[$thisid];
			}
			else
			{
				return [];
			}
		},
		getAllCheckStatus:function(){
			var $thisid = $(this).attr('id');
			
			if(typeof allSelectObj[$thisid]!='undefined')
			{
				return allSelectObj[$thisid];
			}
			else
			{
				return false;
			}
		},
		addTrArr:function(){
			addTrArr($(this));
			return this;
		},
		delTrArr:function(){
			delTrArr($(this));
			return this;
		}
	});
})(jQuery);

