define('widget/header', function(require, exports, module) {
	var app = require('helper/base');
	var undef;

	var Model = app.BaseModel.extend({
		defaults: {
			isActive:undef,
			leftStatus:undef,
		},
	});

	var HeaderWidget = app.BaseView.extend({
		classNames: "w_header_box",
		template: '/* include("~/src/template/widget/header.html", {minify: true, escape: true}) */',
		events: {
			"click .left": function() {
				this.trigger('clickNav');
			},
			"click .right": function() {
				console.log("right");
			},
		},

		show: function() {
			this.model.set("isActive", true);
		},

		hide:function() {
			this.model.set("isActive", false);
		},

		check: function (argument) {
			var widget = this;
			var status = widget.model.get("isActive");
			if(status){
				widget.$el.removeClass('fn_hide');
			}else{
				widget.$el.addClass('fn_hide');
			}
		},
		switchLeft: function(){
			var widget = this;
			var leftStatus = this.model.get("leftStatus");
			if(leftStatus){
				widget.sideMenu.show();
			}else{
				widget.sideMenu.hide();
			}
		},

		initialize: function() {
			var widget = this;
			widget.model = new Model();

			// 渲染头部
			widget.$el.html(widget.template);
			$("body").prepend(widget.$el);
			widget.$el.addClass(widget.classNames);

			// 自定义点击左侧图标事件
			var SideMenu = require("widget/sideMenu");
			widget.sideMenu = new SideMenu();
			widget.on("clickNav", function(){
				var leftStatus = widget.model.get("leftStatus");
				widget.model.set("leftStatus", !leftStatus);
			});

			widget.model.on("change:isActive", widget.check, widget);
			widget.model.on("change:leftStatus", widget.switchLeft, widget);
			// 监听路由变化
			app.router.on('router', function() {
				var controller = this.activeController;
				var needHeader = ['index'];
				if($.inArray(controller, needHeader) > -1){
					widget.model.set("isActive", true);
				}else{
					widget.model.set("isActive", false);
				}
			});
		}
	});
	module.exports = HeaderWidget;
});