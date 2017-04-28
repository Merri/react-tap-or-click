'use strict'

var isFunction = (function() {
    function typeOfFn(fn) {
        return typeof fn === 'function'
    }

    function objectFn(fn) {
        return Object.prototype.toString.call(fn) === '[object Function]'
    }

    // typeof is fastest way to check if a function but older IEs don't support it for that and Chrome had a bug
    if (typeof typeOfFn === 'function' && typeof /./ !== 'function') {
        return typeOfFn
    }

    return objectFn
})()

var cache = []

function getCallbackHandlers(callback) {
    // flush cache if we have too many items
    if (cache.length > 10000) {
        if (typeof console !== 'undefined' && 'log' in console) {
            console.log('tapOrClick cache flushed after 10000 items; check your renders if this happens often')
        }
        cache.length = 0
    }

    var handler = cache.filter(function(handler) {
        return handler.callback === callback
    })[0]

    if (!handler) {
        var state = {}

        handler = {
            callback: callback,
            touchStart: function(event) {
                if (event.defaultPrevented) {
                    return
                }

                clearTimeout(state.touchTimeout)
                state.touchClick = true
                callback(event)
            },
            touchEnd: function(event) {
                if (state.touchClick) {
                    state.touchTimeout = setTimeout(function() {
                        state.touchClick = false
                        state.touchTimeout = null
                    }, 300)
                }
            },
            click: function(event) {
                if (event.defaultPrevented || state.touchClick) {
                    return
                }
                callback(event)
            }
        }

        cache.push(handler)
    }

    return handler
}

// event handlers are unnecessary server side
if (typeof window === 'undefined') {
    module.exports = function(callback, props) {
        if (props == null) {
            props = {}
        }
        return props
    }
} else {
    module.exports = function tapOrClick(callback, props) {
        if (props == null) {
            props = {}
        } else if (typeof props !== 'object') {
            throw new Error('Optional second argument to tapOrClick must be a mutable object')
        }

        var handlers = getCallbackHandlers(callback)

        props.onTouchStart = handlers.touchStart
        props.onTouchEnd = handlers.touchEnd
        props.onClick = handlers.click

        return props
    }
}
