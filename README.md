# react-tap-or-click

You know. That 300ms tap delay. This problem has been around for quite a while and there are various solutions to the
problem such as [fastclick](https://github.com/ftlabs/fastclick) and
[react-tap-event-plugin](https://github.com/zilverline/react-tap-event-plugin).

`tapOrClick` is the simplest solution to the problem: it triggers a given callback when `onTouchEnd` is
triggered, or `onClick` if there are no touch events. This probably covers all use cases where you simply want an
immediate click.

In addition `tapOrClick` hides the complexity of the issue so you don't need to think about what kind of hellish
wizardry needs to be done just to get an immediate click! `tapOrClick` is scrolling aware and does not trigger clicks
when scrolling. Also, [ghost clicks](http://ariatemplates.com/blog/2014/05/ghost-clicks-in-mobile-browsers/) are busted.

This utility has been designed to be easy to use with React, but you can use it elsewhere; it just might not be as
convenient as with React. If you wish to have easier support for your use case then please open a new issue and we'll
see what can be done!

## How?

`react-tap-or-click` is only usable as npm module. Thus: `npm i react-tap-or-click`

### Babel and JSX

```jsx
import React from 'react'
import tapOrClick from 'react-tap-or-click'

const YourComponent = React.createClass({
    handleClick(event) {
        alert(event.type)
    },

    render() {
        return <div {...tapOrClick(this.handleClick)}>
            My Component
        </div>  
    }
})

export default YourComponent
```

### ES5

```js
'use strict'
var React = require('react')
var tapOrClick = require('react-tap-or-click')

var YourComponent = React.createClass({
    handleClick: function(event) {
        alert(event.type)
    },

    render: function() {
        var props = {
            style: {
                backgroundColor: '#EEE'
            }
        }

        // you can pass props as second argument to extend that props object
        return React.DOM.div(
            tapOrClick(this.handleClick, props),
            'My Component'
        )
    }
})

module.exports = YourComponent
```

## Why?

1. Because about 4 kB of non-minified code (2.3 kB minified) should be enough to solve this problem.
2. `fastclick` causes nasty side effects and hard-to-understand bugs when used with React.
3. `react-tap-event-plugin` contains a lot of code, may require you to build your own minified React bundle and you
have to define two handlers for the same thing (`onTapEvent` and `onClick`).

## Notes

- `react-tap-or-click` always respects `event.preventDefault()`.
- Any existing `onTouchStart`, `onTouchEnd` or `onClick` will be overwritten.
- Up to 10000 callbacks are cached at once. Cache is flushed if going over limit. You may have a design flaw if you hit
this size on a regular page. This is warned about with a normal `console.log`.
- The code could be more compact if it had less abstractions; the current code ought to be readable enough so you can
understand it, too!
