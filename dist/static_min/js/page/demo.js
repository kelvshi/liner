define("page/demo",function(a,b,c){var d=a("helper/base"),e=d.ActionView.extend({initialize:function(){this.$el.html('<h1>demo页</h1>返回首页-> <a href="#/index">首页</a><br><div id="cs"></div>')},viewWillAddStage:function(){},viewAddedStage:function(){},viewBeActive:function(a){this.$("#cs").html("参数:"+JSON.stringify(a))},viewBeInActive:function(){},viewWillRemoveStage:function(){},viewRemovedStage:function(){},destroy:function(){}});c.exports=d.ControllerView.extend({Actions:{index:e}})});