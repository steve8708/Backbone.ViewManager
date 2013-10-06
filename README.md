# Backbone.ViewManager

Elegant Backbone view hierarchy management and eventing.

### Defining Nestings


```coffeescript
class View extends Backbone.ViewManager
  constructor: ->

  render: ->
    super
    # Inserts a view into @$el
    @insertView new SomeView
    # Inserts a view at selector
    @insertView '.some-selector', new SomeView
    # Subviews a view without inserting it (e.g. if it is already in the DOM)
    @subView new SomeView
```


### Event Bubbling, Emitting, and Broadcasting

```coffeescript
class MyView extends Backbone.ViewManager
  render: ->
    super
    # broadcasts an event to all children
    @broadcast 'rendered'

    # emits an event to all children
    @emit 'rendered'

    # broadcasts and emits an event to all parents and children
    @trigger 'rendered'

    @on
      # Runs when any child emits 'rendered'
      'child:rendered': ->
      # Runs when any immediate child emits 'rendered'
      'firstChild:rendered': ->
      # Runs when any parent emits 'rendered'
      'parent:rendered': ->
      # Runs when this view's immediate parent emits 'rendered'
      'firstParent:rendered': ->

```


### Event Object

```coffeescript
# All emitted and broadcasted events inject a first
# argument, a Base.Event (similar to a DOM event object)
# that gives listeners some extra information and actions

class View extends Backbone.ViewManager
  onChildChangeActive: (e) ->
    if e.target.is 'listItem'
      # Stop this event from further propagating (to parents
      # if the event was emitted, to children if the event was
      # broadcasted)
      e.stopPropagation()

      # Sets e.defaultPrevented to true
      e.preventDefault()

    # in this case the currentTarget is this view
    if e.currentTarget is @
      true
```

### Accessing View Nesting and Management

```coffeescript
view.children           # => Base.List (evented array) of children
view.parent             # => view's immediate parent

view.findView 'name'    # => first view named 'name'
view.findViews 'name'   # => array of subviews named 'name'

view.childView 'name'   # => first immediate child named 'name'
view.childViews 'name'  # => array of immediate children with name 'name'

view.parentView 'name'  # => first parent with name 'name'
view.parentViews 'name' # => array of parents with name 'name'

# All view accesors also take objects
view.findViews model: model
view.parentView foo: 'bar', bar: 'foo'

# All view accessors can also take iterators (functions)
view.childView (view) -> view.isActive()
view.parentViews (view) -> view.
```


### Child List

```coffeescript
# Or you can always loop through children yourself
# view.children inherits from Base.List, so it supports
# all native array methods as well as all underscore
# array and collection methods
view.children.map (child) -> child.toJSON()
view.children.reduce (child, lastVal) -> lastValue += 1 if child.isActive()
view.children.isEmpty()
view.children.max (child) -> child.get 'height'
view.children.sortBy (child) -> child.isActive()
view.children.last()
```

### Child List Events

```coffeescript
view.children.on 'add', (childView) ->    #  a new child view as added
view.children.on 'remove', (childView) -> #  a child view was removed
view.childre.non 'reset', ->              # children were reset
```

Full documentation coming soon...