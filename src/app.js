define('app', function(require, exports, module) {
    var app = require('helper/base');

    app.autoload = function(module, callback) {
        require.async(module, callback);
    };

    app.error = function(msg) {
        app.tips(msg);
    };

    app.success = function(msg) {
        app.tips(msg);
    };

    app.tips = function(msg) {
        alert(msg);
    };

    var MainView = app.MainView.extend({
        events: {}
    });

    app.mainView = new MainView();

    app.router = new app.Router({
        mainView: app.mainView,
        defaultController: 'index',
        Controller: {
            'index': 'page/index',
            'demo': 'page/demo'
        }
    });

    Backbone.oldAjax = Backbone.ajax;
    Backbone.ajax = function(request) {
        request.dataType = 'jsonp';

        if(request.url.indexOf('http') != 0 || request.url.indexOf('https') != 0) {
            request.url = seajs.config().data.apiBase + (request.url.indexOf('/') == 0 ? request.url : '/' + request.url);
        }

        var oldSuccess = request.success;
        var oldError = request.error;

        request.success = request.error = null;
        var ajax = Backbone.oldAjax.apply(Backbone, arguments);
        var def = $.Deferred();

        ajax.done(function(data) {
            if(data.code !== 0) {
                def.reject(ajax, data);
            } else {
                def.resolve(data.data);
            }
        });

        ajax.fail(function(ajax, textStatus, errorThrown) {
            def.reject(ajax, {});
        });

        def.done(function(data) {
            oldSuccess && oldSuccess(data);
            return data;
        });

        var reject = def.reject;
        def.reject = function(ajax, info) {
            var hasErrorTips = true;
            if (def.state() !== 'rejected') {
                def.fail(function(ajax, data) {
                    var msg = '网络错误，请重试！';
                    if(data.msg) {
                        msg = data.msg;
                    }
                    if(ajax.statusText !== 'abort' && hasErrorTips) {
                        app.error(msg);
                    }
                    oldError && oldError(data);
                    return data;
                });
            }

            return reject.call(def, ajax, info, function(showError) {
                hasErrorTips = showError;
            });
        };

        var promise = def.promise();
        promise.abort = function() {
            ajax.abort.apply(ajax, arguments);
        };

        return promise;
    };

    Backbone.history.start();
});