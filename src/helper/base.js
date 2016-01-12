define('helper/base', function(require, exports, module) {
/**
 * MVC framework based Backbone 
 * @description origin app 
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'underscore', 'backbone'], factory);
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(exports, root._, root.Backbone);
    } else {
        // Browser globals
        factory((root.app = {}), root._, root.Backbone);
    }
}(window, function (exports, _, Backbone) {
    var app = exports;
    var singleton = function() {
        if(!this.__instache) {
            this.__instache = new this();
        }
        return this.__instache;
    };
    /**
     * 自动加载函数，cmd/amd
     * @abstract
     */
    app.autoload = function(module, callback) {
        throw new Error('app.autoload is abstract function, override it.');
    };
    /**
     * 添加支持.super函数来调用父层函数
     */
    var extend = function(protoProps, staticProps) {
        var args = _.toArray(arguments);
        var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
        // backbone deal with constructor unlike other prototype function
        if(_.has(protoProps, 'constructor')) {
            if(fnTest.test(protoProps.constructor)) {
                var constructor = protoProps.constructor;
                protoProps.constructor = function() {
                    var tmp = this._super;
                    this._super = _super.constructor;
                    var ret = constructor.apply(this, arguments);
                    this._super = tmp;
                    return ret;
                };
            }
        }


        var child = Backbone.Model.extend.apply(this, args);
        var prototype = child.prototype;
        var _super = child.__super__;

        for (var name in protoProps) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof protoProps[name] == "function" &&
                typeof _super[name] == "function" && fnTest.test(protoProps[name]) ?
                (function(name, fn) {
                    return function() {
                        var tmp = this._super;

                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = _super[name];

                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;

                        return ret;
                    };
                })(name, protoProps[name]) : protoProps[name];
        }

        return child;
    };
    /**
     * 扩展的View类，添加了ajax管理
     */
    app.BaseView = Backbone.View.extend({
        app: app,
        constructor: function() {   
            this.ajaxQueue = [];
            Backbone.View.apply(this, arguments);
        },
        ajax: function() {
            var view = this;
            var promise = Backbone.ajax.apply(this, arguments);

            if(!promise.abort) {
                throw new Error('');
            }
            promise.always(function() {
                var queue = view.ajaxQueue;
                var index = queue.indexOf(promise);
                queue.splice(index, 1);
            });
            this.ajaxQueue.push(promise);
            return promise;
        },
        abortAjaxQueue: function() {
            var view = this;
            _.each(view.ajaxQueue, function(promise) {
                if(promise && promise.abort) {
                    promise.abort();
                }
            });
            this.ajaxQueue = [];
        }
    }, {
        singleton: singleton,
        extend: extend
    });

    app.BaseModel = Backbone.Model.extend({
        app: app
    }, {
        singleton: singleton,
        extend: extend
    });

    app.BaseCollection = Backbone.Collection.extend({
        app: app
    }, {
        singleton: singleton,
        extend: extend
    });

    app.MainView = app.BaseView.extend({
        el: document.body
    });

    app.ActionView = app.BaseView.extend({
        onStage: false,
        viewWillAddStage: function() {},
        viewAddedStage: function() {},
        viewBeActive: function() {},
        viewBeInActive: function() {},
        viewWillRemoveStage: function() {},
        viewRemovedStage: function() {},
        destroy: function() {}
    });

    app.ControllerView = app.ActionView.extend({
        defaultAction: 'index',
        errorAction: null,
        Actions: {},
        activeParams: null,
        activeAction: null,
        prepareAction: function(action) {
            if(!action || !(action in this.Actions)) {
                action = this.errorAction || this.defaultAction;
            }
            if(!(action in this.actions)) {
                var ActionClass = this.Actions[action].extend({
                    controller: this
                });
                this.actions[action] = new ActionClass();
                this.actions[action].$el.addClass(action+'Action');
            }
            return action;
        },
        runAction: function(action) {
            var activeActionInstance = this.actions[action];
            if(!activeActionInstance.onStage) {
                activeActionInstance.onStage = true;
                activeActionInstance.viewWillAddStage();
                this.appendAction(activeActionInstance);
                activeActionInstance.viewAddedStage();
            }
        },
        appendAction: function(activeActionInstance) {
            this.$el.append(activeActionInstance.$el);
        },
        dispath: function(action, rawParams) {
            var actionInstance = this.actions[action];

            if(this.activeAction && this.activeAction != action && this.actions[this.activeAction]) {
                this.destroyAction(this.activeAction);
            }
            this.activeAction = action;
            actionInstance.$el.show();
            actionInstance.params = this.activeParams;
            actionInstance.viewBeActive(this.activeParams);
        },
        destroyAction: function(activeAction) {
            var controller = this;
            _.each(this.actions, function(action, name) {
                if(!activeAction || activeAction === name) {
                    action.abortAjaxQueue();
                    if(!action.mainTain) {
                        var done = function() {
                            if(action.onStage) {
                                action.onStage = false;
                            }
                            action.$el.remove();
                            action.viewRemovedStage();
                            action.destroy();
                            delete controller.actions[name];
                            if(!_.size(controller.actions)) {
                                controller.destroy();
                            }
                        };
                        if(action.viewWillRemoveStage.length > 0) {
                            action.viewWillRemoveStage(function() {
                                done();
                            });
                        } else {
                            action.viewWillRemoveStage();
                            done()
                        }
                    } else {
                        action.$el.hide();
                        action.viewBeInActive();
                    }
                }
            });
        },
        constructor: function() {
            this.actions = {};
            app.ControllerView.__super__.constructor.apply(this, arguments);
        },
        parseParams: function(rawParams) {
            if(!rawParams) {
                return {};
            }
            // normalize
            rawParams.replace(/\/+/g, '\/');
            // split by /
            rawParams = rawParams.split('/');

            var keys = _.reject(rawParams, function(value, key){ return key % 2 == 1; });
            var values = _.reject(rawParams, function(value, key){ return key % 2 == 0; });

            return _.object(keys, values);
        },
        destroy: function() {
            this.viewWillRemoveStage();
            this.$el.remove();
            this.viewRemovedStage();
            _.map(this.router.controllers, function(controller, name) {
                if(controller == this) {
                    delete this.router.controllers[name];
                }
            }, this);
            return true;
        },
        viewWillRemoveStage: function() {},
        viewRemovedStage: function() {}
    });

    /**
     * router 控制controller行为
     * controller 控制action行为
     */
    app.Router = Backbone.Router.extend({
        app: app,
        module: null,
        routes: {
            '': 'caRoute',
            ':controller': 'caRoute',
            ':controller/:action': 'caRoute',
            ':controller/:action/*params': 'caRoute'
        },
        previousController: null,
        activeController: null,
        previousAction: null,
        activeAction: null,
        rawParams: null,
        Controller: {},
        defaultController: 'index',
        errorController: null,
        mainView: null,
        /**
         * 路由路口
         * @description 
         * 由url上取得controller、action
         * -》解析controller是否存在，不存在则使用errorController，若无则defaultController
         */
        caRoute: function(controller, action, params) {
            params || (params = '');
            var rawParams;
            var router = this;

            if(!(controller in router.Controller)) {
                rawParams = _.compact([controller, action, params]).join('/');
                controller = router.errorController || router.defaultController;
            }

            router.prepareController(controller, function(controllerInstance) {
                var activeAction = controllerInstance.prepareAction(action);
                router.previousAction = router.activeAction;
                router.activeAction = activeAction;

                if(!rawParams) {
                    if(activeAction != action) {
                        rawParams = _.compact([action, params]).join('/');
                    } else {
                        rawParams = params;
                    }
                }
                // 判断路由controller和当前controller是否一致
                if(controller != router.activeController) {
                    if(router.activeController) {
                        var preControllerInstance = router.controllers[router.activeController];
                        preControllerInstance.destroyAction();
                        router.previousAction = preControllerInstance.activeAction;
                        router.previousController = router.activeController;
                    }
                    if(!controllerInstance.onStage) {
                        controllerInstance.viewWillAddStage();
                        router.mainView.$el.append(controllerInstance.$el);
                        controllerInstance.viewAddedStage();
                        controllerInstance.onStage = true;
                    }
                    controllerInstance.$el.show();
                }
                router.activeController = controller;
                controllerInstance.runAction(activeAction);

                controllerInstance.activeParams = controllerInstance.parseParams(rawParams);
                controllerInstance.viewBeActive();
                controllerInstance.dispath(activeAction, rawParams);
                router.trigger('router', controller, activeAction);
            });
        },
        prepareController: function(controller, callback) {
            var self = this;
            if(!(controller in this.controllers)) {
                app.autoload(this.Controller[controller], function(Controller) {
                    var instance = self.controllers[controller] = new Controller;
                    instance.router = self;
                    instance.$el.addClass(controller+'Controller');
                    callback(instance);
                });
            } else {
                callback(this.controllers[controller]);
            }
        },
        constructor: function(options) {
            this.controllers = {};
            if(options) {
                _.extend(this, options);
            }
            if(this.module) {
                var module = this.module;
                var routes = {};
                _.each(this.routes, function(value, key) {
                    if(key) {
                        routes[module+'/'+key] = value;
                    } else {
                        routes[module+key] = value;
                    }
                }, this);
                options.routes = routes;
            }
            app.Router.__super__.constructor.apply(this,arguments);

            if(!this.mainView) {
                throw new Error('Router.mainView is abstract property, override it.');
            }
        }
    });
}));

});