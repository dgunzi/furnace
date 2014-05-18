

//日志图表
function showChart(container,dataObj)
{
	var chart = new Highcharts.Chart({
		credits:{enabled:false},
        chart: {
            type: 'column',
            renderTo: container,
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
			
			backgroundColor : null
        },
        title: {
            text: '日志统计'
        },
        exporting: {
        	enabled: false
    	},
        xAxis: {
            categories: dataObj.dateValue,
			labels: {
                rotation: -70,
                align: 'right',
                style: {
                    fontSize: '11px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Total number'
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                }
            }
        },
        tooltip: {
            formatter: function() {
                return '<b>'+ this.x +'</b><br/>'+
                    this.series.name +': '+ this.y +'<br/>'+
                    'Total: '+ this.point.stackTotal;
            }
        },
        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                },
				borderWidth:0
            },
			series: { 
				cursor: 'pointer', 
				events: { 
					click: function(e) { 
	//						alert(e.point.category)
						showDataTable(e.point.category)
					} 
				} 
			} 

        },
        series: [
		{
            name: '应急',
            data: dataObj.emergency
        }, 
		{
            name: '警报',
            data: dataObj.alert
        },
		{
			name: '致命错误',
            data: dataObj.critical
        },  
		{
			name: '错误',
            data: dataObj.error
        },
		{
            name: '警告',
            data: dataObj.warning
        },
        {
			name: '提示',
            data: dataObj.notice
        },
		{
            name: '信息',
            data: dataObj.informational
        },
		{
            name: '诊断',
            data: dataObj.debug
        }
		]
	});
	return chart;
}

//饼图
function pieChart(config)
{
	var opt = {data:null,obj:null,chartName:'pie',chartTitle:'pie',height:200,funs:null}
	
	
	var value = $.extend(opt,config)
	
	var data = value.data;
	var wrapId = value.obj;
	var chartName = value.chartName;
	var chartTitle = value.chartTitle;
	var height = value.height;
	var funs = value.funs;
	
	if(funs != null)
	{
		var timeOnce = funs.interval;
		var callBack = function(chart){
            if (!chart.renderer.forExport) {
            	var Val = [
            				  [
            					['正常',   50],
	                    		['异常',   40],
	                    		['未知',   10]
	                    	  ],
	                    	  [
            					['正常',   60],
	                    		['异常',   30],
	                    		['未知',   10]
	                    	  ],
	                    	  [
            					['正常',   40],
	                    		['异常',   40],
	                    		['未知',   20]
	                    	  ],
	                		];
			    setInterval(function () {
	                chart.series[0].setData(Val[parseInt(Math.random()*3)]);		      
			    }, timeOnce);
			}	
    	};
		funs = callBack;
	}
	if(typeof data == 'string')
	{
		data = eval("("+data+")");
	}
	var chart = new Highcharts.Chart({
        	credits:{enabled:false},
            chart: {
            	height: height,
                renderTo: wrapId,
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false
            },
            legend: {
				borderwidth:0,
				navigation: {
					activecolor: '#cef60f',
					animation: true,
					arrowsize: 12,
					inactivecolor: '#ccc',
					style: {
						color: '#cef60f',
						fontsize: '12px'	
					}
				}
            },
            exporting: {
            	enabled: false
        	},
            title: {
            	useHTML:true,
                text: chartTitle
            },
           
            tooltip: {
        	    pointFormat: '{series.name}: <b>{point.percentage:.2f}%</b>',
            	percentageDecimals: 1
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                    	enabled: false,
                        color: '#BFF30C',
                        connectorColor: '#BFF30C',
                        formatter: function() {
                            return '<b>'+ this.point.name +'</b><br>'+ Highcharts.numberFormat(this.percentage, 2,'.') +' %';
                        }
                    },
                    showInLegend: true

                }
            },
            series: [{
            	type: 'pie',
                name: chartName,
                data: data
            }]
        },funs
        );
}
//可用性
function avaChart(config)
{
	var opt = {data:null,obj:null,chartName:'可用性',chartTitle:'可用性',height:200}
	
	var value = $.extend(opt,config)
	
	var data = value.data;
	var wrapId = value.obj;
	var chartName = value.chartName;
	var chartTitle = value.chartTitle;
	var height = value.height;
	var dataVal;
	if(typeof data == 'string')
	{
		dataVal = eval("("+data+")");
	}
	else
	{
		dataVal = data;
	}
	if(dataVal.length != 0)
	{
		var mutiColData = [[], [], [], [], [], [],[]];

		for (var i = 0; i < dataVal.length; i++) {
			// console.log(data[i][1]);
	
			switch(dataVal[i].y){
				case -1:
					mutiColData[0].push([dataVal[i].x, 1]);
					break;
				case 0:
					mutiColData[1].push([dataVal[i].x, 1]);
					break;
				case 1:
					mutiColData[2].push([dataVal[i].x, 1]);
					break;
				case 2:
					mutiColData[3].push([dataVal[i].x, 1]);
					break;
				case 3:
					mutiColData[4].push([dataVal[i].x, 1]);
					break;
				case 4:
					mutiColData[5].push([dataVal[i].x, 1]);
					break;
				case 100:
					mutiColData[6].push([dataVal[i].x, null]);
					break;
				default:
					//console.log('unknown');
			}
		}
		if(mutiColData[6].length>0)
		{
			var stx = mutiColData[6][0][0];
			stx += 1;
			mutiColData[6].splice(1,0,[stx,null]);
		}
		var seriesArr = [];
		var dataObj = new Object();
		var dataArr = [];
		dataArr.push([dataVal[0].x, 0]);
		dataObj.data = dataArr;
		dataObj.showInLegend = false;
		dataObj.visible = false;
		seriesArr.push(dataObj);
		var statusName;
		for(var n=0;n<mutiColData.length;n++)
		{
			if(mutiColData[n].length>0)
			{
				var dataObject = new Object();
				if(n!=6)
				{
					statusName = showTips(n-1, chartName);
					dataObject.name = statusName;
				}
				else
				{
					dataObject.showInLegend = false;
				}
				dataObject.data = mutiColData[n];
				seriesArr.push(dataObject);
			}
		}
	}
	else
	{
		var seriesArr = null;
	}
	Highcharts.setOptions({
		 lang:{
	               months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
	               shortMonths: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一', '十二'],
	               weekdays: ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
	               exportButtonTitle:'导出PDF',
	               printButtonTitle:'打印报表'
	     },

	});
    var chart = new Highcharts.StockChart({
     	 chart: {
     	  	height: height,
     	 	renderTo: wrapId,
     	 	type:'column',
	        alignTicks: false
	    },
		credits:{enabled:false},
		title: {
            text: chartTitle
        },
       tooltip: {
	     	 crosshairs:false,
	     	 valuePrefix: '<br>个数:',
			 valueSuffix:"个<br>",
			 pointFormat:' <span style="color:{series.color}">{series.name}{point.y}</span><br/>'
	    },
//        plotOptions: {
//	    	column:{
//	    		groupPadding:0,
//	    		pointPadding:0
//	    	}
 //       },
		 xAxis:{
   			ordinal:false, 
   			type: 'datetime',
            // 如果X轴刻度是日期或时间，该配置是格式化日期及时间显示格式
            dateTimeLabelFormats: {
                second: '%Y-%m-%d %H:%M:%S',
                minute: '%Y-%m-%d %H:%M',
                hour: '%Y-%m-%d  %H:%M',
                day: '%Y-%m-%d',
                week: '%Y-%m-%d',
                month: '%Y-%m',
                year: '%Y'
            },
            labels: {
				rotation:-70,
				formatter: function() {  
					return Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.value);
				},  
				align: 'center'
			}
          },
		yAxis: {         
            title: {
                text: chartTitle
            },
			labels: {
                align: 'right',
                enabled: false
            },
            stackLabels: {
                enabled: false,
                style: {
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                }
            }
        },
		legend: {
            enabled:true,
            layout: 'vertical',
        	backgroundColor: '#FFFFFF',
        	align: 'right',
         	verticalAlign: 'top',
        	x: 0,
        	y: 100
    	},
	    exporting: {
        	enabled: false
    	},
	    
	   	rangeSelector : {
	   		enabled: false,
			buttons: [
			{
				type: 'minute',
				count: 10,
				text: '10分钟'
			},
			{
				type: 'hour',
				count: 6,
				text: '6小时'
			}, {
				type: 'day',
				count: 10,
				text: '10天'
			}, {
				type: 'month',
				count: 1,
				text: '1月'
			}, {
				type: 'year',
				count: 1,
				text: '1年'
			}, {
				type: 'all',
				text: '全部'
			}],
			inputEnabled: false, // it supports only days
			selected : 1 // all
		},
        series:  seriesArr
    });
}

//曲线图
function stockSplineChart(config)
{
	var opt = {data:null,obj:null,unit:'',chartTitle:'Spline',height:200,funs:null}
	
	var value = $.extend(opt,config)
	
	var datas = value.data;
	var wrapId = value.obj;
	var unit = value.unit;
	var chartTitle = value.chartTitle;
	var height = value.height;
	var funs = value.funs;
	if(funs != null)
	{
		var timeOnce = funs.interval;
		var callBack = function(chart){
            // set up the updating of the chart each second
                        var series = chart.series[0];
                        
                        i =100;
                        setInterval(function() {
                            var x = (new Date()).getTime()+i, // current time
                                y =parseInt(Math.random()*(100-50)+50) ;
                            series.addPoint([x,y], true, true);
                            i +=10000000;
                        }, timeOnce);
    	};
		funs = callBack;
	}
	if(typeof datas == 'string')
	{
		datas = eval("("+datas+")");
	}
//	alert(datas[0].name)
//[{"name":"CPU0","data":[]}]
//	var data = [];
//	for(i=0;i<3;i++)
//	{
//		
//	}
	var chartsId = wrapId;
	var arr = new Array();
	arr = chartsId.split('_');
	var orKbps = arr[1];
	
	Highcharts.setOptions({
		 lang:{
	               months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
	               shortMonths: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一', '十二'],
	               weekdays: ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
	               exportButtonTitle:'导出PDF',
	               printButtonTitle:'打印报表'
	     },
	});
	var seriesOptions = [],
		yAxisOptions = [],
		seriesCounter = 0,
		names = ['MSFT'],
		colors = Highcharts.getOptions().colors;
	var chart = new Highcharts.StockChart({
			credits:{enabled:false},
		    chart: {
		    	 height: height,
		         renderTo: wrapId,
		    },
		  	xAxis:{
			   			ordinal:false, 
			   			type: 'datetime',
                        // 如果X轴刻度是日期或时间，该配置是格式化日期及时间显示格式
                        dateTimeLabelFormats: {
                            second: '%Y-%m-%d %H:%M:%S',
                            minute: '%Y-%m-%d %H:%M',
                            hour: '%Y-%m-%d  %H:%M',
                            day: '%Y-%m-%d',
                            week: '%Y-%m-%d',
                            month: '%Y-%m',
                            year: '%Y'
                        },
                        labels: {
	    					staggerLines: 2
	    				}
                        
                    },

	        yAxis : {    
	              title: {    
	                  text: chartTitle  //y轴上的标题  
	              },
	              labels: {
			    		formatter: function() {
			    			if(orKbps=='kbps'){
			    				return this.value>=1000?this.value/1000+'Mbps':this.value+'kbps';
			    			}else{
			    					return this.value+unit;
			    			}
			    				

			    			
			    		}
			    	},
			     min:0

	         },    
	         exporting: {
	            	enabled: false
	        	},
		    tooltip: {
		     	 xDateFormat: '%Y-%m-%d %H:%M:%S %A',
		     	 /*添加*/
				 formatter:function(){
					var str='';
					for(i=0;i<this.points.length;i++){
						var yvalue=this.points[i].y;
						var formatValueKBPS=Highcharts.numberFormat(yvalue, 2,'.');
						var formatValueMB=Highcharts.numberFormat(yvalue/1000, 2,'.');
						if(orKbps=='kbps')
						{
							str+='<br><span style="color:'+this.points[i].series.color+'">'+this.points[i].series.name+'</span>'+':'+(yvalue>=1000?formatValueMB+'Mbps':formatValueKBPS+'kbps');
						}
						else
						{
							str+='<br><span style="color:'+this.points[i].series.color+'">'+this.points[i].series.name+'</span>'+':'+formatValueKBPS;
						}
					}

					return Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x)+str;
				}
		    },
		    legend: {
                enabled:true,
                layout: 'vertical',
            	backgroundColor: '#FFFFFF',
            	align: 'right',
             	verticalAlign: 'top',
            	x: 0,
            	y: 100
        	},
		    
		   rangeSelector : {
		   		enabled: false,
				buttons: [
				{
					type: 'minute',
					count: 10,
					text: '10分钟'
				},
				{
					type: 'hour',
					count: 6,
					text: '6小时'
				}, {
					type: 'day',
					count: 10,
					text: '10天'
				}, {
					type: 'month',
					count: 1,
					text: '1月'
				}, {
					type: 'year',
					count: 1,
					text: '1年'
				}, {
					type: 'all',
					text: '全部'
				}],
				inputEnabled: false, // it supports only days
				selected : 1 // all
			},
//		    series: [{"name":"CPU0","data":[60,30,60]}]
			series:	datas
		},
		funs
	);
}
//仪表盘
function gaugeChart(config)
{
	var opt = {data:null,obj:null,unit:'',chartTitle:'仪表盘',height:200,funs:null}
	
	var value = $.extend(opt,config)
	
	var data = value.data;
	var wrapId = value.obj;
	var unit = value.unit;
	var chartTitle = value.chartTitle;
	var height = value.height;
	var funs = value.funs;
	if(funs != null)
	{
		var timeOnce = funs.interval;
		var callBack = function(chart){
            if (!chart.renderer.forExport) {
			    setInterval(function () {
			        var point = chart.series[0].points[0],
			            newVal,
			            inc = Math.round((Math.random() - 0.5) * 20);
			        newVal = point.y + inc;
			        if (newVal < 0 || newVal > 200) {
			            newVal = point.y - inc;
			        }
			        point.update(newVal);
			        
			    }, timeOnce);
			}
    	};
		funs = callBack;
	}
	
	if(typeof data == 'string')
	{
		data = eval("("+data+")");
	}
	var chart = new Highcharts.Chart({
			credits:{enabled:false},
		    chart: {
		    	height: height,
		        renderTo: wrapId,
		        type: 'gauge',
		        plotBackgroundColor: null,
		        plotBackgroundImage: null,
		        plotBorderWidth: 0,
		        plotShadow: false
		    },
		    
		    title: {
		        text: chartTitle
		    },
		    exporting: {
	        	enabled: false
	    	},
		    pane: {
		        startAngle: -150,
		        endAngle: 150,
		        background: [{
		            backgroundColor: {
		                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
		                stops: [
		                    [0, '#FFF'],
		                    [1, '#333']
		                ]
		            },
		            borderWidth: 0,
		            outerRadius: '109%'
		        }, {
		            backgroundColor: {
		                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
		                stops: [
		                    [0, '#333'],
		                    [1, '#FFF']
		                ]
		            },
		            borderWidth: 1,
		            outerRadius: '107%'
		        }, {
		            // default background
		        }, {
		            backgroundColor: '#DDD',
		            borderWidth: 0,
		            outerRadius: '105%',
		            innerRadius: '103%'
		        }]
		    },
		       
		    // the value axis
		    yAxis: {
		        min: 0,
		        max: 100,
		        
		        minorTickInterval: 'auto',
		        minorTickWidth: 1,
		        minorTickLength: 10,
		        minorTickPosition: 'inside',
		        minorTickColor: '#666',
		
		        tickPixelInterval: 30,
		        tickWidth: 2,
		        tickPosition: 'inside',
		        tickLength: 10,
		        tickColor: '#666',
		        labels: {
		            step: 2,
		            rotation: 'auto'
		        },
		        plotBands: [{
		            from: 0,
		            to: 60,
		            color: '#55BF3B' // green
		        }, {
		            from: 60,
		            to: 80,
		            color: '#DDDF0D' // yellow
		        }, {
		            from: 80,
		            to: 100,
		            color: '#DF5353' // red
		        }]        
		    },
			legend: {
				enabled:false
			},
		    series: [{
		    	name:chartTitle,
		        data: data,
		        tooltip: {
		            valueSuffix: unit
		        }
		    }]
		},
		funs
	);
}
//分类柱状统计
function barChart(config)
{
	var funsTipClick = {
		toolTip:function(){
	        		return '<b>'+ this.x +'</b><br/>'+
	            	this.series.name +': '+ this.y +'<br/>'+
	            	'Total: '+ this.point.stackTotal;
	    		},
		seriesClick:null
	}
	var opt = {data:null,obj:null,categories:null,chartTitle:'柱状图',height:200,funs:funsTipClick};
	//深度拷贝
	var value = $.extend(true,opt,config)
	
	var data = value.data;
	var wrapId = value.obj;
	var categories = value.categories;
	var chartTitle = value.chartTitle;
	var height = value.height;
	var funs = value.funs;
	
	if(typeof data == 'string')
	{
		data = eval("("+data+")");
	}
	if(typeof categories == 'string')
	{
		categories = eval("("+categories+")");
	}
	var chart = new Highcharts.Chart({
		credits:{enabled:false},
        chart: {
        	height: height,
            renderTo: wrapId,
            type: 'column'
        },

        title: {
            text: chartTitle
        },

        xAxis: {
            categories: categories,
            labels: {
                rotation: -70,
                align: 'right',
                style: {
                    fontSize: '11px',
                    fontFamily: 'Verdana, sans-serif'
                }
            }
        },
        exporting: {
        	enabled: false
    	},
        yAxis: {
            min: 0,
            title: {
                text: ''
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                }
            }
        },

        tooltip: {
            formatter: funs.toolTip
        },

        plotOptions: {
            column: {
                stacking: 'normal',
                dataLabels: {
                    enabled: true,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white'
                },
                borderWidth:0
            },
            series: { 
				cursor: 'pointer', 
				events: { 
					click: funs.seriesClick
				} 
			} 
        },
        series: data
    });
}


//物理内存，虚拟内存
function memShow(config)
{
    var opt = {data:null,obj:null,categories:null,chartName:'bar',chartTitle:'bar',height:200};
	
	var value = $.extend(opt,config)
	
	var data = value.data;
	var wrapId = value.obj;
	var categories = value.categories;
	var chartName = value.chartName;
	var chartTitle = value.chartTitle;
	var height = value.height;
	if(typeof data == 'string')
	{
		data = eval("("+data+")");
	}
    if(typeof categories == 'string')
	{
		categories = eval("("+categories+")");
	}
	var colors = Highcharts.getOptions().colors,
        categories = categories,
        name = chartName,
        data = data;
    function setChart(name, categories, data, color) {
		chart.xAxis[0].setCategories(categories, false);
		chart.series[0].remove(false);
		chart.addSeries({
			data: data,
			color: color || 'white'
		}, false);
		chart.redraw();
    }

    var chart = new Highcharts.Chart({
    	credits:{enabled:false},
        chart: {
            renderTo:wrapId,
            //plotBackgroundImage:'js/Highcharts/skies/skies.jpg',
           /* width: ${width},                //图框（最外层）宽(默认800)*/
            height: height,                
            type: 'column'
        },
        title: {
            text: chartTitle
        },
        subtitle: {
            text: ''
        },
        xAxis: {
            categories: categories
        },
        yAxis: {
            title: {
                text: ''
            }
        },
        exporting: {
        	enabled: false
    	},
        plotOptions: {
            column: {
                cursor: 'pointer',
                point: {
                    events: {
                        click: function() {
                            var drilldown = this.drilldown;
                            if (drilldown) { // drill down
                                setChart(drilldown.name, drilldown.categories, drilldown.data, drilldown.color);
                            } else { // restore
                                //setChart(name, categories, data);
                            }
                        }
                    }
                },
                dataLabels: {
                    enabled: true,
                    color: colors[0],
                    style: {
                        fontWeight: 'bold'
                    },
                    formatter: function() {
//                       return this.y +'%';
                    }
                }
            }
        },
        legend: {
		enabled:false
	},
        tooltip: {
            formatter: function() {
                var point = this.point,
                    s = this.x +':<b>'+ this.y +'%</b><br/>';
                if (point.drilldown) {
                    s += '单击显示'+ point.category +'详情 ';
                } else {
                    s += '单击返回';
                }
                return s;
            }
        },
        series: [{
            data: data,
            color: 'white'
        }],
        exporting: {
            enabled: true
        }
    });
}
/*可用性图表          先不用这个*/
function showStockColumn(container,data,title)
{
	var chart = new Highcharts.StockChart({
		    chart: {
		        alignTicks: false,
		        renderTo:container
		    },
			credits:{enabled:false},
			title: {
                text: title
            },
			 xAxis: {  
				labels: {  
					rotation:-70,
					formatter: function() {  
						var vDate=new Date(this.value);  
						return vDate.getFullYear()+"-"+(vDate.getMonth()+1)+"-"+vDate.getDate()+"-"+vDate.getHours()+":00:00";	
					},  
					align: 'center'  
				}
			}, 
			yAxis: {         
                title: {
                    text: title
                },
				labels: {
                    align: 'right',
                    enabled: false
                },
                stackLabels: {
                    enabled: false,
                    style: {
                        fontWeight: 'bold',
                        color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                    }
                }
            },
		    rangeSelector: {
		        selected: 1
		    },
			tooltip: {
				formatter: function() {
		    		return showTips(this.y,data.ciType);
				}
	        },

		    series: [{
		        type: 'column',
		        name: 'AAPL Stock Volume',
		        data: data.dataValue,

		        dataGrouping: {
					units: [[
						'week', // unit name
						[1] // allowed multiples
					], [
						'month',
						[1, 2, 3, 4, 6]
					]]
		        }
		    }]
		});
}
function showTips(value,citype)
{
	var ciStatus;
	switch(citype)
	{
		case 'FANSTATE':switch(value)
		{
			case -1: ciStatus = '未获取数据';break;
			case 1: ciStatus = '正常';break;
			case 2: ciStatus = '异常';break;
			case 3: ciStatus = '未知';
		};break;
		case 'POWERSTATE':switch(value)
		{
			case -1: ciStatus = '未获取数据';break;
			case 1: ciStatus = '正常';break;
			case 2: ciStatus = '异常';break;
			case 3: ciStatus = '未知';
		};break;
		case 'HOSTSERVICESTATE':switch(value)
		{
			case -1: ciStatus = '未获取数据';break;
			case 1: ciStatus = '已启动';break;
			case 2: ciStatus = '未启动';break;
			case 3: ciStatus = '不存在';
		};break;
		case 'INTERFACEADMINSTATE':switch(value)
		{
			case -1: ciStatus = '未获取数据';break;
			case 1: ciStatus = '可管理';break;
			case 2: ciStatus = '不可管理';break;
			case 3: ciStatus = '测试';
		};break;
		case 'INTERFACE_ADMIN_STATE':switch(value)
		{
			case -1: ciStatus = '未获取数据';break;
			case 1: ciStatus = '在线';break;
			case 2: ciStatus = '下线';break;
			case 3: ciStatus = '测试';
		};break;
		case 'PORTSTATE':switch(value)
		{
			case 1: ciStatus = '正常';break;
			case 2: ciStatus = '异常';break;
			case 3: ciStatus = '未知';
		};break;
		case 'ROUTERSTATE':switch(value)
		{
			case -1: ciStatus = '未获取数据';break;
			case 4: ciStatus = '直接连接';break;
			case 3: ciStatus = '间接连接';break;
			case 2: ciStatus = '无效';break;
			case 1: ciStatus = '其他';
		};break;
		case 'MYSQLSTATE':switch(value)
		{
			case -1: ciStatus = '未获取数据';break;
			case 0: ciStatus = '不存在';break;
			case 1: ciStatus = '存在';
		};break;
		case 'SQLSTATE':switch(value)
		{
			case -1: ciStatus = '未获取数据';break;
			case 0: ciStatus = '不存在';break;
			case 1: ciStatus = '存在';
		};break;
		case 'ORACLEREDLOGSTATE':switch(value)
		{
			case -1: ciStatus = '未获取数据';break;
			case 0: ciStatus = '不存在';break;
			case 1: ciStatus = '存在';
		};break;
		case 'ORACLETABLESTATE':switch(value)
		{
			case -1: ciStatus = '未获取数据';break;
			case 1: ciStatus = '在线';break;
			case 2: ciStatus = '只读';break;
			case 3: ciStatus = '下线';
		};break;
		case 'ORACLEDATAFILESTATE':switch(value)
		{
			case -1: ciStatus = '未获取数据';break;
			case 1: ciStatus = '可用';break;
			case 3: ciStatus = '不可用';break;
		};break;
		case 'ORACLEDATAFILEONLINESTATE':switch(value)
		{
			case -1: ciStatus = '未获取数据';break;
			case 1: ciStatus = '在线';break;
			case 2: ciStatus = '系统';break;
			case 3: ciStatus = '还原';break;
			case 4: ciStatus = '系统关闭';break;
			case 5: ciStatus = '下线';
		};break;
		case 'CISCOAP_APSTATE':switch(value)
		{
			case -1: ciStatus = '未获取数据';break;
			case 1: ciStatus = '开启';break;
			case 3: ciStatus = '关闭';
		};break;
		case 'cHsrpGrpStandbyState':switch(value)
		{
			case -1: ciStatus = '未获取数据';break;
			case 4: ciStatus = '过渡';break;
			case 5: ciStatus = '备用';break;
			case 6: ciStatus = '使用';
		};break;
		case 'SYSTEMHEALTH':switch(value)
		{
			case -1: ciStatus = '未知';break;
			case 1: ciStatus = '健康';break;
			case 2: ciStatus = '不健康';break;
			case 3: ciStatus = '未知';
		};break;
		case 'SERVICESTATE':switch(value)
		{
			case -1: ciStatus = '未知';break;
			case 1: ciStatus = '已启动';break;
			case 2: ciStatus = '未启动';break;
			case 3: ciStatus = '不存在';
		};break;
		case 'SGIDISCRETE':switch(value)
		{
			case -1: ciStatus = '未知';break;
			case 1: ciStatus = '0x0100';break;
			case 2: ciStatus = '0x0200';break;
			case 3: ciStatus = '未知';
		};break;
		case 'SGIELECTRICITY':switch(value)
		{
			case -1: ciStatus = '未知';break;
			case 1: ciStatus = '正常';break;
			case 2: ciStatus = '异常';break;
			case 3: ciStatus = '未知';
		};break;
		case 'SGIFAN':switch(value)
		{
			case -1: ciStatus = '未知';break;
			case 1: ciStatus = '正常';break;
			case 2: ciStatus = '异常';break;
			case 3: ciStatus = '未知';
		};break;
		case 'SGITEMPERATURE':switch(value)
		{
			case -1: ciStatus = '未知';break;
			case 1: ciStatus = '正常';break;
			case 2: ciStatus = '异常';break;
			case 3: ciStatus = '未知';
		};break;
		case 'WEBLOGICSERVER_SERVER_STATUS':switch(value)
		{
			case 0: ciStatus = '关闭';break;
			case 1: ciStatus = '运行';break;
			case 2: ciStatus = '初始化';break;
			case 3: ciStatus = '暂停';
		};break;
		case 'WEBLOGICWEBAPP_RUN_STATUS':switch(value)
		{
			case 0: ciStatus = '未知';break;
			case 1: ciStatus = '部署';
		};break;
		case 'WEBLOGICJDBCCONN_RUN_STATUS':switch(value)
		{
			case 0: ciStatus = '关闭';break;
			case 1: ciStatus = '运行';break;
			case 2: ciStatus = '暂停';break;
			case 3: ciStatus = '异常';break;
			case 4: ciStatus = '未知';
		};break;
		case 'TCPPORT_STATUS':switch(value)
		{
			case -1: ciStatus = '未知';break;
			case 1: ciStatus = '正常';break;
			case 2: ciStatus = '异常';break;
			
		};break;
		case 'CISCOSSID_SSIDSTATE':switch(value)
		{
			case -1: ciStatus = '未获取数据';break;
			case 1: ciStatus = '正常';break;
			case 3: ciStatus = '异常';
		};break;
		case 'SQLDATABASE_STATUS' : switch(value)
		{
		   case -1: ciStatus = '不存在';break;
		   case  0 : ciStatus = '不存在';break;
		   default : ciStatus = '存在';
		};
	}
	return '状态:'+ciStatus;
}