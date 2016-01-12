define('page/demo', function(require, exports, module) {
    var app = require('helper/base');

    var IndexAction = app.ActionView.extend({
        initialize: function() {
            this.$el.html('<h1>demo页</h1>返回首页-> <a href="#/index">首页</a><br><div id="cs"></div>');
            console.log('[demo]状态 initialize');
        },
        viewWillAddStage: function() {
            console.log('[demo]状态 viewWillAddStage');
        },
        viewAddedStage: function() {
            console.log('[demo]状态 viewAddedStage');
        },
        viewBeActive: function(params) {
            this.$('#cs').html('参数:'+JSON.stringify(params));
            console.log('[demo]状态 viewBeActive');
        },
        // 没有mainTain标志，viewBeInActive不会触发，直接viewWillRemoveStage
        viewBeInActive: function() {
            console.log('[demo]状态 viewBeInActive');
        },
        viewWillRemoveStage: function() {
            console.log('[demo]状态 viewWillRemoveStage');
        },
        viewRemovedStage: function() {
            console.log('[demo]状态 viewRemovedStage');
        },
        destroy: function() {
            console.log('[demo]状态 destroy');
        }
    });

    module.exports = app.ControllerView.extend({
        Actions: {
            index: IndexAction
        }
    });
});