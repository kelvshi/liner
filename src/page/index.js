define('page/index', function(require, exports, module) {
    var app = require('helper/base');

    var IndexAction = app.SaasActionView.extend({
        mainTain: true, // mainTain标志标明不销毁，viewWillRemoveStage、viewRemovedStage、destroy不会触发
        initialize: function() {
            this._super();
            var template = "/* include('../template/index/index.html', {minify: true, escape: true}) */";
            this.$el.html(template);
            console.log('[demo]状态 initialize');
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

    module.exports = app.ControllerView.extend({
        defaultAction: 'index',
        Actions: {
            index: IndexAction
        }
    });
});