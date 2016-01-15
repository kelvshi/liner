define('page/index', function(require, exports, module) {
    var app = require('helper/base');

    var IndexAction = app.ActionView.extend({
        mainTain: true, // mainTain标志标明不销毁，viewWillRemoveStage、viewRemovedStage、destroy不会触发
        initialize: function() {
            var template = "<div class=\"p_index\"><div class=\"w_header\"><div class=\"left\"></div><div class=\"content\">首页</div><div class=\"right\"></div></div></div>";
            var data = {
                ss:"thisis",
            }
            var html = _.template(template)(data);
            this.$el.html(html);
            console.log('[index]状态 initialize');
        },
        viewWillAddStage: function() {
            console.log('[index]状态 viewWillAddStage');
        },
        viewAddedStage: function() {
            console.log('[index]状态 viewAddedStage');
        },
        viewBeActive: function() {
            console.log('[index]状态 viewBeActive');
        },
        viewBeInActive: function() {
            console.log('[index]状态 viewBeInActive');
        },
        viewWillRemoveStage: function() {
            console.log('[index]状态 viewWillRemoveStage');
        },
        viewRemovedStage: function() {
            console.log('[index]状态 viewRemovedStage');
        },
        destroy: function() {
            console.log('[index]状态 destroy');
        }
    });

    var DemoAction = IndexAction.extend({
        initialize:function(){
            console.log("初始化了这个demo!");
        }
    })

    module.exports = app.ControllerView.extend({
        defaultAction: 'index',
        Actions: {
            index: IndexAction,
            demo: DemoAction
        }
    });
});