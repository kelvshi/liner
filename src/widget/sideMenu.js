define('widget/sideMenu', function(require, exports, module) {
	var app = require('helper/base');
	var undef;

	var Model = app.BaseModel.extend({
		defaults: {
			isActive:undef,
		},
	});

	var sideMenuWidget = app.BaseView.extend({
		classNames: "w_sidemenu_box",
		template: '/* include("~/src/template/widget/sideMenu.html", {minify: true, escape: true}) */',
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

		check:function () {
			var widget = this;
			var status = widget.model.get("isActive");
			if(status){
				widget.$el.find(".w_sidemenu").addClass('active');
			}else{
				widget.$el.find(".w_sidemenu").removeClass('active');
			}
		},

		initialize: function() {
			var widget = this;
			widget.model = new Model();

			// 渲染组件
			widget.$el.html(widget.template);
			$("body").append(widget.$el);
			widget.$el.addClass(widget.classNames);
			widget.model.on("change:isActive", widget.check, widget);
		}
	});
	module.exports = sideMenuWidget;
});