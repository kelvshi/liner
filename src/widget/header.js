define('widget/header', function(require, exports, module) {
	var app = require('helper/base');
	var undef;

	var Model = app.BaseModel.extend({
		defaults: {
			isActive:undef,
		},
	});

	var HeaderWidget = app.BaseView.extend({
		template: '/* include("~/src/template/widget/header.html", {minify: true, escape: true}) */',
		events: {
			"click .left": function() {
				console.log("left");
			},
			"click .right": function() {
				console.log("right");
			}
		},

		show:function() {
			this.model.set("isActive", true);
		},

		hide:function() {
			this.model.set("isActive", false);
		},

		check:function (argument) {
			var widget = this;
			var status = widget.model.get("isActive");
			if(status){
				widget.$el.removeClass('fn_hide');
			}else{
				widget.$el.addClass('fn_hide');
			}
		},

		initialize: function() {
			var widget = this;
			widget.model = new Model();

			// 渲染头部
			widget.$el.html(widget.template);
			$("body").prepend(widget.$el);
			widget.el = ".w_header";

			// 监听路由变化
			widget.model.on("change:isActive", widget.check, widget);
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