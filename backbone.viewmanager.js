/* backbone.viewmanager.js v0.0.2 (coffeescript output) */ 

(function() {
  var Children, method, _i, _j, _len, _len1, _ref, _ref1,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  Backbone.ViewManager = (function(_super) {
    __extends(ViewManager, _super);

    function ViewManager() {
      var _this = this;
      ViewManager.__super__.constructor.apply(this, arguments);
      this.on('all', function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        _this.broadcast.apply(_this, args);
        return _this.emit.apply(_this, args);
      });
      if (this.children == null) {
        this.children = new Children(this.options.children || []);
      }
    }

    ViewManager.prototype.emit = function() {
      var args, event, eventName, name, newEvent, parent, _i, _len, _ref, _results;
      eventName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      parent = this.parent;
      if (parent) {
        if (/^(child:|request:)/.test(eventName)) {
          event = args[0];
          if (event == null) {
            event = new Base.Event({
              type: eventName,
              target: this
            });
          }
          if (!event.propagationStopped) {
            event.currentTarget = parent;
            return parent.trigger.apply(parent, arguments);
          }
        } else if (!/^(app:|parent:|firstChild:|firstParent:)/.test(eventName)) {
          name = uncapitalize(this.name);
          event = new Base.Event({
            name: eventName,
            target: this,
            currentTarget: parent
          });
          _ref = ["child:" + eventName, "child:" + name + ":" + eventName, "firstChild:" + eventName, "firstChild:" + name + ":" + eventName];
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            newEvent = _ref[_i];
            _results.push(parent.trigger.apply(parent, [newEvent, event].concat(__slice.call(args))));
          }
          return _results;
        }
      }
    };

    ViewManager.prototype.broadcast = function() {
      var args, child, event, eventName, name, newEvent, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      eventName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (this.children) {
        if (/^(parent:|app:)/.test(eventName)) {
          event = args[0] || new Base.Event({
            type: eventName,
            target: this
          });
          if (!event.propagationStopped) {
            event.currentTarget = child;
            _ref = this.children;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              child = _ref[_i];
              if (event.propagationStopped) {
                return;
              }
              child.trigger.apply(child, arguments);
            }
          }
        } else if (!/^(child:|request:|firstParent:|firstChild:)/.test(eventName)) {
          name = uncapitalize(this.name);
          event = new Base.Event({
            name: eventName,
            target: this
          });
          _ref1 = this.children;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            child = _ref1[_j];
            event.currentTarget = child;
            _ref2 = ["parent:" + eventName, "parent:" + name + ":" + eventName, "firstParent:" + eventName, "firstParent:" + name + ":" + eventName];
            for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
              newEvent = _ref2[_k];
              if (event.propagationStopped) {
                return;
              }
              child.trigger.apply(child, [newEvent, event].concat(__slice.call(args)));
            }
          }
        }
      }
    };

    ViewManager.prototype.destroy = function() {
      this.trigger('destroy');
      if (this.cleanup) {
        this.cleanup();
      }
      this.$el.removeData('view');
      this.$el.off();
      this.off();
      this.stopListening();
      this.undelegateEvents();
      this.remove();
      if (this.parent) {
        return this.parent.children.splice(this.parent.children.indexOf(this), 1);
      }
    };

    ViewManager.prototype.subView = function() {
      var args, name, view;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      if (!args[1]) {
        if (typeof args[0] === 'string') {
          return this.childView(args[0]);
        } else {
          view = args[0];
        }
      } else {
        view = args[1];
        name = args[0];
      }
      if (!view) {
        console.warn('No view passed to subView', args, arguments);
        return;
      }
      if (!(view instanceof Base.View)) {
        view = new view;
      }
      view.__viewName__ = name;
      view.parent = this;
      this.children.push(view);
      return view;
    };

    ViewManager.prototype.insertView = function(selector, view) {
      if (!view) {
        view = selector;
        selector = null;
      }
      this.subView(view);
      if (selector) {
        this.$(selector).append(view.$el);
      } else {
        this.$el.append(view.$el);
      }
      return this;
    };

    ViewManager.prototype.parentView = function(arg, findOne) {
      return this.parentViews(arg, findOne);
    };

    ViewManager.prototype.findView = function(arg) {
      return this.findViews(arg, true);
    };

    ViewManager.prototype.childView = function(arg) {
      return this.childViews(arg, true);
    };

    ViewManager.prototype.destroyView = function(arg, all) {
      var child;
      child = all ? this.findView(arg) : this.childView(arg);
      if (child) {
        child.destroy();
      }
      return child;
    };

    ViewManager.prototype.destroyViews = function(arg, all) {
      var child, children, _i, _len;
      children = all ? this.findViews(arg) : this.childViews(arg);
      for (_i = 0, _len = children.length; _i < _len; _i++) {
        child = children[_i];
        child.destroy();
      }
      return children;
    };

    ViewManager.prototype.childViews = function(arg, findOne) {
      return this.findViews(arg, findOne, true);
    };

    ViewManager.prototype.parentViews = function(arg, findOne) {
      var parent, res;
      res = [];
      if (!arg) {
        if (findOne) {
          return this.parent;
        } else {
          res.push(this.parent);
        }
      } else {
        parent = this;
        while (parent = parent.parent) {
          if (parent.is && parent.is(arg)) {
            if (findOne) {
              return parent;
            } else {
              res.push(parent);
            }
          }
        }
      }
      return res;
    };

    ViewManager.prototype.findViews = function(arg, findOne, shallow) {
      var foundView, recurse, views;
      views = [];
      foundView = void 0;
      recurse = function(view) {
        var childView, _i, _len, _ref, _results;
        _ref = view.children;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          childView = _ref[_i];
          if (childView.is(arg)) {
            views.push(childView);
            if (findOne) {
              foundView = childView;
              break;
            }
          }
          if (childView && !shallow) {
            _results.push(recurse(childView));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      recurse(this);
      if (findOne) {
        return foundView;
      } else {
        return views;
      }
    };

    ViewManager.prototype.is = function(arg) {
      var key, name, str, strip, thisKey, value;
      if (!arg || arg === this) {
        return true;
      }
      switch (typeof arg) {
        case 'string':
          strip = function(str) {
            return str.toLowerCase().replace(/view$/i, '');
          };
          str = strip(arg);
          name = this.__viewName__;
          return strip(this.name || "") === str || strip(name || '') === str;
        case 'function':
          return !!arg(this);
        default:
          for (key in arg) {
            value = arg[key];
            thisKey = this.get(key);
            if (thisKey == null) {
              thisKey = this[key];
            }
            if (value !== thisKey) {
              return false;
            }
          }
          return true;
      }
    };

    return ViewManager;

  })(Backbone.View);

  Children = (function() {
    function Children(items, options) {
      if (options == null) {
        options = {};
      }
      this.reset(items, options);
      if (!options.noState) {
        addState(this);
      }
      if (_.isFunction(this.initialize)) {
        this.initialize.apply(this, arguments);
      }
    }

    Children.prototype.unshift = function() {
      var item, items, _i, _len, _ref, _results;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _ref = items.reverse();
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _results.push(this.add(item, {
          at: 0
        }));
      }
      return _results;
    };

    Children.prototype.push = function() {
      var item, items, _i, _len, _results;
      items = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      _results = [];
      for (_i = 0, _len = items.length; _i < _len; _i++) {
        item = items[_i];
        _results.push(this.add(item, {
          at: this.length
        }));
      }
      return _results;
    };

    Children.prototype.shift = function() {
      return this.remove(null, {
        at: 0
      });
    };

    Children.prototype.pop = function() {
      return this.remove(null, {
        at: this.length - 1
      });
    };

    Children.prototype.empty = function() {
      return this.splice(0, Infinity);
    };

    Children.prototype.eventNamespace = 'child:';

    Children.prototype.bubbleEvents = true;

    Children.prototype.reset = function(items, options) {
      if (options == null) {
        options = {};
      }
      this.splice(this.length, this.length);
      this.push.apply(this, items);
      if (!options.silent) {
        return this.trigger('reset', this, options);
      }
    };

    Children.prototype.add = function(item, options) {
      var at,
        _this = this;
      if (options == null) {
        options = {};
      }
      at = options.at != null ? options.at : options.at = this.length;
      if (this.bubbleEvents && item && _.isFunction(item.on)) {
        this.listenTo(item, 'all', function() {
          var args, eventName;
          eventName = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          if (_this.bubbleEvents) {
            return _this.trigger.apply(_this, ["" + _this.eventNamespace + _this.eventName].concat(__slice.call(args)));
          }
        });
      }
      if (this.model) {
        item = new this.model(item);
      }
      this.splice(at, null, item);
      if (!options.silent) {
        return this.trigger('add', item, this, options);
      }
    };

    Children.prototype.remove = function(item, options) {
      var index;
      if (options == null) {
        options = {};
      }
      index = options.at || this.indexOf(item);
      if (item == null) {
        item = this[index];
      }
      this.splice(index, 1);
      if (!options.silent) {
        this.trigger('remove', item, this, options);
      }
      item;
      return this.stopChildrenening(item);
    };

    return Children;

  })();

  _.extend(Children.prototype, Backbone.Events);

  _ref = ['splice', 'indexOf', 'lastIndexOf', 'join', 'reverse', 'sort', 'valueOf', 'map', 'forEach', 'every', 'reduce', 'reduceRight', 'filter', 'some'];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    method = _ref[_i];
    if (!Children.prototype[method]) {
      Children.prototype[method] = arr[method];
    }
  }

  _ref1 = ['each', 'contains', 'find', 'filter', 'reject', 'contains', 'max', 'min', 'sortBy', 'groupBy', 'sortedIndex', 'shuffle', 'toArray', 'size', 'first', 'last', 'initial', 'rest', 'without', 'isEmpty', 'chain', 'where', 'findWhere', 'clone', 'pluck', 'invoke'];
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    method = _ref1[_j];
    if (!Children.prototype[method]) {
      Children.prototype[method] = _[method];
    }
  }

}).call(this);
