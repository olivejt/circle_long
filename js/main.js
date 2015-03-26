$(function () {
	// var circleUrl = "http://seecsee.com/index.php/circle/index";
	// var bannerUrl = "http://seecsee.com/index.php/circle/indexBanner";
	// var infoUrl = "http://seecsee.com/index.php/circle/indexInfoList";
	
	var circleUrl = "getCircle.php";
	var bannerUrl = "getBanner.php";
	var infoUrl = "getInfoList.php";

	/**
	 * 圈子类 
	 * @function init() 获取滚动图列表数据
	 * @function show() 显示圈子列表
	 * @function slide() 滚动 执行
	 * @function addEvent() 添加点击跳转
	 */
	var circle = {
		circleList : [],	//存放列表
		circleListLength : null,	//列表长度
		picList : [],
		page : null,	//	页码
		status : 0,
		init : function () {
			var self = this;

			//获取圈子列表
			$.getJSON(circleUrl,{},function (list) {
				if(list.msg == "success"){
					// console.log(list);
					var len = list.data.length;
					for(var i = 0;i < len;i++){
						var curData = list.data[i];
						var curPos = i%2==0?"fl":"fr";
						curData.cir_pos = curPos;
						self.circleList.push($.extend(true, {},curData));	//数组对象拷贝
						self.picList.push(curData.cir_banner);	
					}
					self.circleListLength = self.circleList.length;
					self.status = 1;
					loadImages(self.picList,self.show());
				}
			});
		},

		show : function () {
			var self = this;
			var pages = Math.ceil(self.circleListLength / 4);

			//页码
			var dotsList = '';
			var dotsArea =  $("#dotsTemp");
			var dotsTemp = dotsArea.val();
			var dotsColor = [];
			for(var i = 0;i < pages;i++){
				if (i==0) {
					dotsColor.push({"colorClass":"bgc1c1c1"});
				}else{
					dotsColor.push({"colorClass":"bgd8d8d8"});
				}
			}
			dotsColor.forEach(function(object) {
				dotsList += dotsTemp.temp(object);
			});
			dotsArea.parent().append(dotsList);

			//滚动图
			var cirWrapTemp = $("#cirWrapTemp").val();
			var swipeBox = $(".swipe-wrap");
			for(var i = 0;i < pages;i++){
				swipeBox.append(cirWrapTemp);	//添加滚动图的框（滚动单位），每个框内可放四张图片
			}

			var htmlList = '';
			var tempArea =  $("#cirTemp");
			var htmlTemp = tempArea.val();
			for(var i = 0;i < pages;i++){
				htmlList = '';
				for(var j = 4 * i; j < 4 * ( i + 1 ) && j < self.circleListLength; j++){
					htmlList += htmlTemp.temp(self.circleList[j]);
				}
				$(".wrap").eq(i).append(htmlList);	//圈子列表图片分页添加至框中
			}
			self.addEvent();
			self.slide();
		},

		slide : function () {
			var bullets = $(".dot");
			var box = $("#slider")[0];	//sliderJS 为DOM操作
			var slider = Swipe(box, {	
			    auto: 3000,
			    continuous: true,
			    callback: function(pos) {
			    	var i = bullets.length;
			    	while (i--) {	//页码轮换
			    		bullets.eq(i).removeClass("bgc1c1c1").addClass("bgd8d8d8");
			      	}
			     	bullets.eq(pos).removeClass("bgd8d8d8").addClass("bgc1c1c1");
			    }
			 });
		},

		addEvent : function () {
			var circleBox = $(".circles");
			circleBox.bind("click",function () {
				var cir_id = $(this).attr("cir_id");
				location.href = "http://seecsee.com/see/web/circle/circleDetail.html?cir_id=" +
								cir_id;
			});
		}
	}
	
	/**
	 * 广告栏类 banner
	 * @function init() 获取一条广告
	 * @function show() 显示广告
	 * @function addEvent() 按钮绑定事件 
	 */
	var banner = {
		ban : null,
		picList : [],
		status : 0,

		init : function () {
			var self = this;

			$.getJSON(bannerUrl,{},function (obj) {
				if(obj.msg == "success"){
					self.ban = obj.data;
					self.picList.push(obj.data.banner_image);
					loadImages(self.picList,self.show());
				}
			});
		},

		show : function () {
			var self = this;
			var htmlList = '';
			var tempArea =  $("#bannerTemp");
			var htmlTemp = tempArea.val();
			htmlList += htmlTemp.temp(self.ban);
			tempArea.prev().after(htmlList);
			self.bindEvent();
		},

		bindEvent : function() {
			$("#close").click(function(){
		        $("#banner").css("display","none");
		    });
		}
	}


	/**
	 * 资讯类 info 每日See
	 * @function init() 获取圈子列表数据
	 * @function show() 显示圈子列表
	 * @function addEvent() 按钮绑定事件 
	 */
	var info = {
		infoList : [],	//存放列表
		infoListLength : null,	//列表长度
		picList : [],
		page : 1,	//	页码
		status : 0,

		init : function () {
			var self = this;

			//获取资讯列表
			$.getJSON(infoUrl,{p:self.page},function (list) {
				if(list.msg == "success"){
					// console.log(list);
					var len = list.data.length;
					for(var i = 0;i < len;i++){
						var curData = list.data[i];
						curData.info_time = calTime(curData.info_time); //计算发布时间与当前时间间隔
						
						if(curData.info_type == 0 && curData.info_imglist.length >= 3){
							//多图lookbook 显示前三张图
							curData.info_img_left = curData.info_imglist[0];
							curData.info_img_top = curData.info_imglist[1];
							curData.info_img_bottom = curData.info_imglist[2];
						}
						self.infoList.push($.extend(true, {},curData));	//数组对象拷贝

						//拷贝图片地址用于预加载
						if(curData.info_type == 0)	{ //lookbook类型（多图）
							for(img in curData.info_imglist){
								self.picList.push(curData.info_imglist[img]);
							}
						}else{	//单图
							self.picList.push(curData.info_banner);
						}	
					}
					self.status = 1;
					loadImages(self.picList,self.show());
				}
			});
		},

		show : function  () {
			var self = this;
			var htmlList = '';
			var info =  $("#infoTemp");
			var lookbook = $("#lookbookTemp");
			var infoTemp = info.val();
			var lookbookTemp = lookbook.val();

			self.infoList.forEach(function(object) {
				if(object.info_type == 0){	//多图类型
					htmlList += lookbookTemp.temp(object);
				}else{	//单图
					htmlList += infoTemp.temp(object);
				}
			});
			info.parent().append(htmlList);
			self.infoList = [];		//清空本次加载的list
			self.page++;
			self.status = 0;
			self.bindEvent();
		},

		bindEvent : function () {
			var self = this;
			var talkBtns =  $(".oval");
			var infoBoxs =  $(".onebrand");
			infoBoxs.bind("click",function () {
				location.href = "http://seecsee.com/see/web/circle/infoDetail.html?info_id=" + $(this).attr("info_id");
			});
			talkBtns.bind("click",function () {
				location.href = "http://seecsee.com/see/web/circle/infoDetail.html?info_id=" + $(this).attr("info_id");
			});

			var _width = $(window).width();
		    var _width2 = _width*0.96;
		    var _heightzara = _width2*0.665;
		    var zarashowl = $(".zarashowl");
		    zarashowl.css({"height":_heightzara,"width":_heightzara});
		    zarashowl.find("img").css("height",_heightzara);
		    var _heightzara2 = _width2*0.325;
		    var zarashowr = $(".zarashowr");
		    zarashowr.css({"width":_heightzara2,"height":_heightzara});
		    zarashowr.find("img").css({"height":_heightzara2});
		    zarashowr.find(".zara3").css("margin-top",_width2*0.008);
		    $(window).resize(function(){
		        var _width = $(window).width();
		        var _width2 = _width*0.96;
		        var _heightzara = _width2*0.665;
		        zarashowl.css({"height":_heightzara,"width":_heightzara});
		        zarashowl.find("img").css("height",_heightzara);
		        var _heightzara2 = _width2*0.325;
		        zarashowr.css({"width":_heightzara2,"height":_heightzara});
		        zarashowr.find("img").css({"height":_heightzara2});
		        zarashowr.find(".zara3").css("margin-top",_width2*0.005);
		    });
		    
		    $(".shadow").find("img").css({"width":_width2,"height":_heightzara});
		}

	}

	/**
	 * 导航栏类 cirFooter 
	 * @function init() 
	 * @function addEvent() 绑定显示或隐藏事件 
	 */
	var cirFooter = {
		footer : null,
		win : null,
		body : null,
		prevTop : 0,
		curTop : 0,
		flag : 0,

		init : function () {
			var self = this;
			self.footer = $('.cirfooter');
			self.win = $(window);
			self.body = $("body");
			self.prevTop = self.win.scrollTop();
			self.addEvent();
		},

		addEvent : function() {
			var self = this;
			self.win.scroll(function () {
				self.curTop = self.win.scrollTop();
				// if(self.curTop > self.prevTop){
				// 	if(self.flag == 0){
				// 		self.footer.stop().animate({bottom:"0px"},100);
				// 	}
				// 	self.flag = 1;
				// }else{
				// 	if (self.flag == 1) {
				// 		self.footer.stop().animate({bottom:"-60px"},100);
				// 	}
				// 	self.flag = 0;
				// }
				// self.prevTop = self.curTop;

				if(self.curTop + self.win.height() + 10 >= self.body.height() ){
					info.init();
				}
			});
		}
	}


	/**
	 * 图片预加载函数
	 * @param sources 图片信息数组
	 * @param callback 回调函数——图片预加载完成后立即执行此函数
	 */
	var loadImages = function(sources, callback){  
	    var count = 0,  
	        images = [],  
	        imgNum = 0;  
	    for(src in sources){  
	        imgNum++;  
	    }  
	    for(src in sources){  
	        images[src] = new Image();  
	        images[src].onload = function(){  
	            if(++count >= imgNum){  
	                return callback;  
	            }  
	        }  
	        images[src].src = sources[src];  
	    }  
	} 

	/**
	 * 计算时间函数
	 * @param date 资讯发布时间
	 */ 
	var calTime = function (endTime) {
		var date = new Date();
		date.setFullYear(endTime.substring(0,4));
		date.setMonth(endTime.substring(5,7)-1);
		date.setDate(endTime.substring(8,10));
		date.setHours(endTime.substring(11,13));
		date.setMinutes(endTime.substring(14,16));
		date.setSeconds(endTime.substring(17,19));
		var now = new Date();	//当前时间
		var diff = ( Date.parse(now) - Date.parse(date) ) / 1000;	//转成时间戳计算差值

		var num = null;
		var unit = "";
		if(diff < 0){
			return "你穿越了";
		}else if(diff < 60){
			unit = "刚刚";
			num = "";
		}else if(diff < 3600){
			unit = "分钟前";
			num = Math.floor(diff / 60);
		}else if(diff < 86400){
			unit = "小时前";
			num = Math.floor(diff / 3600);
		}else if(diff < 2592000){
			unit = "天前";
			num = Math.floor(diff / 86400);
		}else if(diff < 31536000){
			unit = "月前";
			num = Math.floor(diff / 2592000);
		}else{
			unit = "年前";
			num = Math.floor(diff / 31536000);
		}
		return num + unit ; 
	}

	//自定义模板引擎
	String.prototype.temp = function(obj) {
    	return this.replace(/\$\w+\$/gi, function(matchs) {
	        var returns = obj[matchs.replace(/\$/g, "")];		
	        return (returns + "") == "undefined"? "": returns;
	    });
	};

	//页面内容加载
	circle.init();
	banner.init();
	info.init();
	cirFooter.init();
});