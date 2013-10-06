# ViewManager - - - - - - - - - - - - - - - - - - - - - - -

class Backbone.ViewManager extends Backbone.View
  constructor: ->
    super

    @on 'all', (args...) =>
      @broadcast args...
      @emit args...

    @children ?= new Children @options.children or []

  emit: (eventName, args...) ->
    parent = @parent
    if parent
      if /^(child:|request:)/.test eventName
        event = args[0]
        event ?= new Base.Event type: eventName, target: @
        if not event.propagationStopped
          event.currentTarget = parent
          # console.log 'trigger args', arguments
          parent.trigger arguments...
      else if not /^(app:|parent:|firstChild:|firstParent:)/.test eventName
        name = uncapitalize @name
        event = new Base.Event name: eventName, target: @, currentTarget: parent
        for newEvent in ["child:#{eventName}", "child:#{name}:#{eventName}"
          "firstChild:#{eventName}", "firstChild:#{name}:#{eventName}"]
          # console.log 'trigger args', [event].concat args
          parent.trigger newEvent, event, args...

  broadcast: (eventName, args...) ->
    if @children
      if /^(parent:|app:)/.test eventName
        event = args[0] or new Base.Event type: eventName, target: @
        if not event.propagationStopped
          event.currentTarget = child
          for child in @children
            return if event.propagationStopped
            # console.log 'trigger args', arguments
            child.trigger arguments...
      else if not /^(child:|request:|firstParent:|firstChild:)/.test eventName
        name = uncapitalize @name
        event = new Base.Event name: eventName, target: @
        for child in @children
          event.currentTarget = child
          for newEvent in ["parent:#{eventName}", "parent:#{name}:#{eventName}"
            "firstParent:#{eventName}", "firstParent:#{name}:#{eventName}"]
            return if event.propagationStopped
            # console.log 'trigger args', [event].concat args
            child.trigger newEvent, event, args...

  destroy: ->
    @trigger 'destroy'
    @cleanup() if @cleanup
    @$el.removeData('view')
    @$el.off()
    @off()
    @stopListening()
    @undelegateEvents()
    @remove()

    if @parent
      @parent.children.splice @parent.children.indexOf(@), 1

  subView: (args...) ->
    if not args[1]
      if typeof args[0] is 'string'
        return @childView args[0]
      else
        view = args[0]
    else
      view = args[1]
      name = args[0]


    unless view
      console.warn 'No view passed to subView', args, arguments
      return

    if view not instanceof Base.View
      view = new view

    view.__viewName__ = name

    view.parent = @
    @children.push view
    view

  insertView: (selector, view) ->
    if not view
      view = selector
      selector = null

    @subView view

    if selector
      @$(selector).append view.$el
    else
      @$el.append view.$el
    @

  parentView: (arg, findOne) ->
    @parentViews arg, findOne

  findView: (arg) ->
    @findViews arg, true

  childView: (arg) ->
    @childViews arg, true

  destroyView: (arg, all) ->
    child = if all then @findView arg else @childView arg
    child.destroy() if child
    child

  destroyViews: (arg, all) ->
    children = if all then @findViews arg else @childViews arg
    child.destroy() for child in children
    children

  childViews: (arg, findOne) ->
    @findViews arg, findOne, true

  parentViews: (arg, findOne) ->
    res = []
    if not arg
      if findOne then return @parent else res.push @parent
    else
      parent = @
      while parent = parent.parent
        if parent.is and parent.is arg
          if findOne then return parent else res.push parent
    res

  findViews: (arg, findOne, shallow) ->
    views = []
    foundView = undefined

    recurse = (view) ->
      for childView in view.children
        if childView.is(arg)
          views.push childView
          if findOne
            foundView = childView
            break

        recurse childView if childView and not shallow

    recurse @
    if findOne then foundView else views

  is: (arg) ->
    if not arg or arg is @ # or @$el.is arg
      return true

    switch typeof arg
      when 'string'
        strip = (str) -> str.toLowerCase().replace /view$/i, ''
        str = strip arg
        name = @__viewName__
        strip(@name or "") is str or strip(name or '') is str
      when 'function'
        !!arg @
      else
        for key, value of arg
          thisKey = @get key
          if not thisKey?
            thisKey = @[key]
          if value isnt thisKey
            return false
        return true


# Children - - - - - - - - - - - - - - - - - - - - - - - - - - -

class Children
  constructor: (items, options = {}) ->
    @reset items, options
    if not options.noState
      addState @
    @initialize arguments... if _.isFunction @initialize

  unshift: (items...) -> @add item, at: 0 for item in items.reverse()
  push: (items...) -> @add item, at: @length for item in items
  shift: -> @remove null, at: 0
  pop: -> @remove null, at: @length - 1
  empty: -> @splice 0, Infinity

  eventNamespace: 'child:'
  bubbleEvents: true

  reset: (items, options = {}) ->
    @splice @length, @length
    @push items...
    @trigger 'reset', @, options unless options.silent

  add: (item, options = {}) ->
    at = options.at ?= @length

    # Bubble events like backbone does
    if @bubbleEvents and item and _.isFunction item.on
      @listenTo item, 'all', (eventName, args...) =>
        if @bubbleEvents
          @trigger "#{@eventNamespace}#{@eventName}", args...

    # Allow models of any type (e.g. a model here can be a view!)
    item = new @model item if @model

    @splice at, null, item
    @trigger 'add', item, @, options unless options.silent

  remove: (item, options = {}) ->
    index = options.at or @indexOf item
    item ?= @[index]
    @splice index, 1
    @trigger 'remove', item, @, options unless options.silent
    item
    @stopChildrenening item

_.extend Children::, Backbone.Events

for method in ['splice', 'indexOf', 'lastIndexOf', 'join', 'reverse', 'sort',
  'valueOf', 'map', 'forEach', 'every', 'reduce', 'reduceRight', 'filter',
  'some']
  Children::[method] = arr[method] unless Children::[method]

for method in ['each', 'contains', 'find', 'filter', 'reject', 'contains',
  'max', 'min', 'sortBy', 'groupBy', 'sortedIndex', 'shuffle', 'toArray', 'size'
  'first', 'last', 'initial', 'rest', 'without', 'isEmpty', 'chain', 'where',
  'findWhere', 'clone', 'pluck', 'invoke']
  Children::[method] = _[method] unless Children::[method]

