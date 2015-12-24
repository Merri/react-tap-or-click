# react-tap-or-click

You know. That 300ms tap delay. This problem has been around for quite a while and there are various solutions to the
problem such as [fastclick](https://github.com/ftlabs/fastclick) and
[react-tap-event-plugin](https://github.com/zilverline/react-tap-event-plugin).

`tapOrClick` is the simplest solution to the problem: it triggers a given callback when `onTouchEnd` is
triggered, or `onClick` if there are no touch events. This covers most use cases where you simply want a click.

In addition `tapOrClick` hides the complexity of the issue so you don't need to think about what kind of hellish
wizardry needs to be done just to get an immediate click!

## How?

`react-tap-or-click` is only usable as npm module. Thus: `npm i react-tap-or-click`

### Babel and JSX

```jsx
'use strict'
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

1. Because about 2 kB of non-minified code (1 kB minified) should be enough to solve this problem.
2. `fastclick` causes nasty side effects and hard-to-understand bugs when used with React.
3. `react-tap-event-plugin` contains a lot of code, may require you to build your own minified React bundle and you
have to define two handlers for the same thing (`onTapEvent` and `onClick`).

## Notes

- `react-tap-or-click` always respects `event.preventDefault()`.
- Any existing `onTouchStart`, `onTouchEnd` or `onClick` will be overwritten.
- Up to 10000 callbacks are cached at once. Cache is flushed if going over limit. You may have a design flaw if you hit
this size on a regular page. This is warned about with a normal `console.log`.
- This markdown file is bigger than the code. So go ahead and study it.
