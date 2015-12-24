'use strict'

// http://ariatemplates.com/blog/2014/05/ghost-clicks-in-mobile-browsers/
var bustableClicks = []

function addBuster(touchEvent) {
    if (!touchEvent || !('changedTouches' in touchEvent)) {
        throw new Error('No event or no changedTouches in event object')
    }

    bustableClicks.push({
        element: touchEvent.target,
        x: touchEvent.changedTouches[0].screenX,
        y: touchEvent.changedTouches[0].screenY
    })
}

function buster(event) {
    if (bustableClicks.length === 0) {
        return
    }

    var x = ~~event.screenX
    var y = ~~event.screenY
    var i
    var b

    var xMin = x - 50
    var xMax = x + 50
    var yMin = y - 50
    var yMax = y + 50

    for (i = 0; i < bustableClicks.length; i++) {
        b = bustableClicks[i]
        if (b.x > xMin && b.x < xMax && b.y > yMin && b.y < yMax) {
            event.preventDefault()
            event.stopImmediatePropagation()
            break
        }
    }
}

function removeBusterByElement(element) {
    for (var i = bustableClicks.length - 1; i >= 0; i--) {
        if (bustableClicks[i].element === element) {
            bustableClicks.splice(i, 1)
        }
    }
}

if (typeof document !== 'undefined' && 'addEventListener' in document) {
    document.addEventListener('click', buster, true)
}

// handler cache to
// 1) avoid unnecessary duplicates for same callback, and
// 2) to warn in case of possible issues in renders
var cache = []

function endTouch(state) {
    state.touches = 0
    state.touchTimeout = null
    removeBusterByElement(this)
}

function createHandlers(callback) {
    if (cache.length > 10000) {
        if (typeof console !== 'undefined' && 'log' in console) {
            console.log('tapOrClick cache flushed after 10000 items; check your renders if this happens often')
        }
        cache.length = 0
    }

    var state = { touches: 0 }

    var handler = {
        callback: callback,
        touchStart: function(event) {
            if (event.defaultPrevented) {
                return
            }
            clearTimeout(state.touchTimeout)
            state.touches++
            state.touchTimeout = setTimeout(endTouch.bind(event.target, state), 250)
            state.x = event.changedTouches[0].screenX
            state.y = event.changedTouches[0].screenY
        },
        touchEnd: function(event) {
            if (event.defaultPrevented || state.touches !== 1) {
                return
            }

            var deltaX = state.x - event.changedTouches[0].screenX
            var deltaY = state.y - event.changedTouches[0].screenY

            if (Math.abs(deltaX) < 5 && Math.abs(deltaY) < 5) {
                clearTimeout(state.touchTimeout)
                addBuster(event)
                event.preventDefault()
                callback(event)
                state.touchTimeout = setTimeout(endTouch.bind(event.target, state), 425)
            }
        },
        click: function(event) {
            if (event.defaultPrevented || state.touches > 0) {
                return
            }
            callback(event)
        }
    }

    cache.push(handler)

    return handler
}

function getHandlers(callback) {
    for (var i = 0; i < cache.length; i++) {
        if (cache[i].callback === callback) {
            return cache[i]
        }
    }

    return createHandlers(callback)
}

var isFunction = (function() {
    function typeOfFn(fn) {
        return typeof fn === 'function'
    }

    function objectFn(fn) {
        return Object.prototype.toString.call(fn) === '[object Function]'
    }

    // typeof is fastest way to check if a function but older IEs don't support it for functions and Chrome had a bug
    if (typeof typeOfFn === 'function' && typeof /./ !== 'function') {
        return typeOfFn
    }

    return objectFn
})()

module.exports = function tapOrClick(callback, props) {
    if (!isFunction(callback)) {
        throw new Error('First argument to tapOrClick must be a callback function')
    }

    if (props == null) {
        props = {}
    } else if (typeof props !== 'object') {
        throw new Error('Optional second argument to tapOrClick must be a mutable object')
    }

    var handlers = getHandlers(callback)

    props.onTouchStart = handlers.touchStart
    props.onTouchEnd = handlers.touchEnd
    props.onClick = handlers.click

    return props
}
