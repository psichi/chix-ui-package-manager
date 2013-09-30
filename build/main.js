;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var MODEL = require('chix-ui-models'),
PackageNavigator = require('./lib/ui');

$.when(
  $.get('http://serve.chix.io/nodes'),
  $.get('http://serve.chix.io/packages')).
  then(function (nodes, pkgs) {

  new PackageNavigator($('#packages'), {
    nodes: nodes[0],
    packages: pkgs[0] 
  });

});


},{"./lib/ui":3,"chix-ui-models":4}],2:[function(require,module,exports){
/*!
 * stroll.js 1.2 - CSS scroll effects
 * http://lab.hakim.se/scroll-effects
 * MIT licensed
 * 
 * Copyright (C) 2012 Hakim El Hattab, http://hakim.se
 */
"use strict";

// When a list is configured as 'live', this is how frequently 
// the DOM will be polled for changes
var LIVE_INTERVAL = 500;

var IS_TOUCH_DEVICE = !!( 'ontouchstart' in window );

// All of the lists that are currently bound
var lists = [];

// Set to true when there are lists to refresh
var active = false;

/**
 * Updates all currently bound lists.
 */
function refresh() {
	if( active ) {
		requestAnimFrame( refresh );
		
		for( var i = 0, len = lists.length; i < len; i++ ) {
			lists[i].update();
		}
	}
}

/**
 * Starts monitoring a list and applies classes to each of 
 * its contained elements based on its position relative to 
 * the list's viewport.
 * 
 * @param {HTMLElement} element 
 * @param {Object} options Additional arguments;
 * 	- live; Flags if the DOM should be repeatedly checked for changes
 * 			repeatedly. Useful if the list contents is changing. Use 
 * 			scarcely as it has an impact on performance.
 */
function add( element, options ) {
	// Only allow ul/ol
	if( !element.nodeName || /^(ul|li)$/i.test( element.nodeName ) === false ) {
		return false;
	}
	// Delete duplicates (but continue and re-bind this list to get the 
	// latest properties and list items)
	else if( contains( element ) ) {
		remove( element );
	}

	var list = IS_TOUCH_DEVICE ? new TouchList( element ) : new List( element );

	// Handle options
	if( options && options.live ) {
		list.syncInterval = setInterval( function() {
			list.sync.call( list );
		}, LIVE_INTERVAL );
	}

	// Synchronize the list with the DOM
	list.sync();

	// Add this element to the collection
	lists.push( list );

	// Start refreshing if this was the first list to be added
	if( lists.length === 1 ) {
		active = true;
		refresh();
	}
}

/**
 * Stops monitoring a list element and removes any classes 
 * that were applied to its list items.
 * 
 * @param {HTMLElement} element 
 */
function remove( element ) {
	for( var i = 0; i < lists.length; i++ ) {
		var list = lists[i];

		if( list.element == element ) {
			list.destroy();
			lists.splice( i, 1 );
			i--;
		}
	}

	// Stopped refreshing if the last list was removed
	if( lists.length === 0 ) {
		active = false;
	}
}

/**
 * Checks if the specified element has already been bound.
 */
function contains( element ) {
	for( var i = 0, len = lists.length; i < len; i++ ) {
		if( lists[i].element == element ) {
			return true;
		}
	}
	return false;
}

/**
 * Calls 'method' for each DOM element discovered in 
 * 'target'.
 * 
 * @param target String selector / array of UL elements / 
 * jQuery object / single UL element
 * @param method A function to call for each element target
 */
function batch( target, method, options ) {
	var i, len;

	// Selector
	if( typeof target === 'string' ) {
		var targets = document.querySelectorAll( target );

		for( i = 0, len = targets.length; i < len; i++ ) {
			method.call( null, targets[i], options );
		}
	}
	// Array (jQuery)
	else if( typeof target === 'object' && typeof target.length === 'number' ) {
		for( i = 0, len = target.length; i < len; i++ ) {
			method.call( null, target[i], options );
		}
	}
	// Single element
	else if( target.nodeName ) {
		method.call( null, target, options );
	}
	else {
		throw 'Stroll target was of unexpected type.';
	}
}

/**
 * Checks if the client is capable of running the library.
 */
function isCapable() {
	return !!document.body.classList;
}

/**
 * The basic type of list; applies past & future classes to 
 * list items based on scroll state.
 */
function List( element ) {
	this.element = element;
}

/** 
 * Fetches the latest properties from the DOM to ensure that 
 * this list is in sync with its contents. 
 */
List.prototype.sync = function() {
	this.items = Array.prototype.slice.apply( this.element.children );

	// Caching some heights so we don't need to go back to the DOM so much
	this.listHeight = this.element.offsetHeight;

	// One loop to get the offsets from the DOM
	for( var i = 0, len = this.items.length; i < len; i++ ) {
		var item = this.items[i];
		item._offsetHeight = item.offsetHeight;
		item._offsetTop = item.offsetTop;
		item._offsetBottom = item._offsetTop + item._offsetHeight;
		item._state = '';
	}

	// Force an update
	this.update( true );
};

/** 
 * Apply past/future classes to list items outside of the viewport
 */
List.prototype.update = function( force ) {
	var scrollTop = this.element.pageYOffset || this.element.scrollTop,
		scrollBottom = scrollTop + this.listHeight;

	// Quit if nothing changed
	if( scrollTop !== this.lastTop || force ) {
		this.lastTop = scrollTop;

		// One loop to make our changes to the DOM
		for( var i = 0, len = this.items.length; i < len; i++ ) {
			var item = this.items[i];

			// Above list viewport
			if( item._offsetBottom < scrollTop ) {
				// Exclusion via string matching improves performance
				if( item._state !== 'past' ) {
					item._state = 'past';
					item.classList.add( 'past' );
					item.classList.remove( 'future' );
				}
			}
			// Below list viewport
			else if( item._offsetTop > scrollBottom ) {
				// Exclusion via string matching improves performance
				if( item._state !== 'future' ) {
					item._state = 'future';
					item.classList.add( 'future' );
					item.classList.remove( 'past' );
				}
			}
			// Inside of list viewport
			else if( item._state ) {
				if( item._state === 'past' ) item.classList.remove( 'past' );
				if( item._state === 'future' ) item.classList.remove( 'future' );
				item._state = '';
			}
		}
	}
};

/**
 * Cleans up after this list and disposes of it.
 */
List.prototype.destroy = function() {
	clearInterval( this.syncInterval );

	for( var j = 0, len = this.items.length; j < len; j++ ) {
		var item = this.items[j];

		item.classList.remove( 'past' );
		item.classList.remove( 'future' );
	}
};


/**
 * A list specifically for touch devices. Simulates the style 
 * of scrolling you'd see on a touch device but does not rely 
 * on webkit-overflow-scrolling since that makes it impossible 
 * to read the up-to-date scroll position.
 */
function TouchList( element ) {
	this.element = element;
	this.element.style.overflow = 'hidden';

	this.top = {
		value: 0,
		natural: 0
	};

	this.touch = {
		value: 0,
		offset: 0,
		start: 0,
		previous: 0,
		lastMove: Date.now(),
		accellerateTimeout: -1,
		isAccellerating: false,
		isActive: false
	};

	this.velocity = 0;
}
TouchList.prototype = new List();

/** 
 * Fetches the latest properties from the DOM to ensure that 
 * this list is in sync with its contents. This is typically 
 * only used once (per list) at initialization.
 */
TouchList.prototype.sync = function() {
	this.items = Array.prototype.slice.apply( this.element.children );

	this.listHeight = this.element.offsetHeight;

	var item;

	// One loop to get the properties we need from the DOM
	for( var i = 0, len = this.items.length; i < len; i++ ) {
		item = this.items[i];
		item._offsetHeight = item.offsetHeight;
		item._offsetTop = item.offsetTop;
		item._offsetBottom = item._offsetTop + item._offsetHeight;
		item._state = '';

		// Animating opacity is a MAJOR performance hit on mobile so we can't allow it
		item.style.opacity = 1;
	}

	this.top.natural = this.element.scrollTop;
	this.top.value = this.top.natural;
	this.top.max = item._offsetBottom - this.listHeight;

	// Force an update
	this.update( true );

	this.bind();
};

/**
 * Binds the events for this list. References to proxy methods 
 * are kept for unbinding if the list is disposed of.
 */
TouchList.prototype.bind = function() {
	var scope = this;

	this.touchStartDelegate = function( event ) {
		scope.onTouchStart( event );
	};

	this.touchMoveDelegate = function( event ) {
		scope.onTouchMove( event );
	};

	this.touchEndDelegate = function( event ) {
		scope.onTouchEnd( event );
	};

	this.element.addEventListener( 'touchstart', this.touchStartDelegate, false );
	this.element.addEventListener( 'touchmove', this.touchMoveDelegate, false );
	this.element.addEventListener( 'touchend', this.touchEndDelegate, false );
}

TouchList.prototype.onTouchStart = function( event ) {
	event.preventDefault();
	
	if( event.touches.length === 1 ) {
		this.touch.isActive = true;
		this.touch.start = event.touches[0].clientY;
		this.touch.previous = this.touch.start;
		this.touch.value = this.touch.start;
		this.touch.offset = 0;

		if( this.velocity ) {
			this.touch.isAccellerating = true;

			var scope = this;

			this.touch.accellerateTimeout = setTimeout( function() {
				scope.touch.isAccellerating = false;
				scope.velocity = 0;
			}, 500 );
		}
		else {
			this.velocity = 0;
		}
	}
};

TouchList.prototype.onTouchMove = function( event ) {
	if( event.touches.length === 1 ) {
		var previous = this.touch.value;

		this.touch.value = event.touches[0].clientY;
		this.touch.lastMove = Date.now();

		var sameDirection = ( this.touch.value > this.touch.previous && this.velocity < 0 )
							|| ( this.touch.value < this.touch.previous && this.velocity > 0 );
		
		if( this.touch.isAccellerating && sameDirection ) {
			clearInterval( this.touch.accellerateTimeout );

			// Increase velocity significantly
			this.velocity += ( this.touch.previous - this.touch.value ) / 10;
		}
		else {
			this.velocity = 0;

			this.touch.isAccellerating = false;
			this.touch.offset = Math.round( this.touch.start - this.touch.value );
		}

		this.touch.previous = previous;
	}
};

TouchList.prototype.onTouchEnd = function( event ) {
	var distanceMoved = this.touch.start - this.touch.value;

	if( !this.touch.isAccellerating ) {
		// Apply velocity based on the start position of the touch
		this.velocity = ( this.touch.start - this.touch.value ) / 10;
	}

	// Don't apply any velocity if the touch ended in a still state
	if( Date.now() - this.touch.lastMove > 200 || Math.abs( this.touch.previous - this.touch.value ) < 5 ) {
		this.velocity = 0;
	}

	this.top.value += this.touch.offset;

	// Reset the variables used to determne swipe speed
	this.touch.offset = 0;
	this.touch.start = 0;
	this.touch.value = 0;
	this.touch.isActive = false;
	this.touch.isAccellerating = false;

	clearInterval( this.touch.accellerateTimeout );

	// If a swipe was captured, prevent event propagation
	if( Math.abs( this.velocity ) > 4 || Math.abs( distanceMoved ) > 10 ) {
		event.preventDefault();
	}
};

/** 
 * Apply past/future classes to list items outside of the viewport
 */
TouchList.prototype.update = function( force ) {
	// Determine the desired scroll top position
	var scrollTop = this.top.value + this.velocity + this.touch.offset;

	// Only scroll the list if there's input
	if( this.velocity || this.touch.offset ) {
		// Scroll the DOM and add on the offset from touch
		this.element.scrollTop = scrollTop;

		// Keep the scroll value within bounds
		scrollTop = Math.max( 0, Math.min( this.element.scrollTop, this.top.max ) );

		// Cache the currently set scroll top and touch offset
		this.top.value = scrollTop - this.touch.offset;
	}

	// If there is no active touch, decay velocity
	if( !this.touch.isActive || this.touch.isAccellerating ) {
		this.velocity *= 0.95;
	}

	// Cut off early, the last fraction of velocity doesn't have 
	// much impact on movement
	if( Math.abs( this.velocity ) < 0.15 ) {
		this.velocity = 0;
	}

	// Only proceed if the scroll position has changed
	if( scrollTop !== this.top.natural || force ) {
		this.top.natural = scrollTop;
		this.top.value = scrollTop - this.touch.offset;

		var scrollBottom = scrollTop + this.listHeight;
		
		// One loop to make our changes to the DOM
		for( var i = 0, len = this.items.length; i < len; i++ ) {
			var item = this.items[i];

			// Above list viewport
			if( item._offsetBottom < scrollTop ) {
				// Exclusion via string matching improves performance
				if( this.velocity <= 0 && item._state !== 'past' ) {
					item.classList.add( 'past' );
					item._state = 'past';
				}
			}
			// Below list viewport
			else if( item._offsetTop > scrollBottom ) {
				// Exclusion via string matching improves performance
				if( this.velocity >= 0 && item._state !== 'future' ) {
					item.classList.add( 'future' );
					item._state = 'future';
				}
			}
			// Inside of list viewport
			else if( item._state ) {
				if( item._state === 'past' ) item.classList.remove( 'past' );
				if( item._state === 'future' ) item.classList.remove( 'future' );
				item._state = '';
			}
		}
	}
};

/**
 * Cleans up after this list and disposes of it.
 */
TouchList.prototype.destroy = function() {
	List.prototype.destroy.apply( this );

	this.element.removeEventListener( 'touchstart', this.touchStartDelegate, false );
	this.element.removeEventListener( 'touchmove', this.touchMoveDelegate, false );
	this.element.removeEventListener( 'touchend', this.touchEndDelegate, false );
};


/**
 * Public API
 */
module.exports = {
	/**
	 * Binds one or more lists for scroll effects.
	 * 
	 * @see #add()
	 */
	bind: function( target, options ) {
		if( isCapable() ) {
			batch( target, add, options );
		}
	},

	/**
	 * Unbinds one or more lists from scroll effects.
	 * 
	 * @see #remove()
	 */
	unbind: function( target ) {
		if( isCapable() ) {
			batch( target, remove );
		}
	}
};

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function( callback ){
				window.setTimeout(callback, 1000 / 60);
			};
})();

},{}],3:[function(require,module,exports){
var  Stroll = require('./stroll');
//  can = require('./can');

var IS_ANDROID = navigator.userAgent.match( /android/gi ),
  IS_IPHONE = navigator.userAgent.match( /iphone/gi );

// Keep the list height in sync with the window height
if(IS_ANDROID || IS_IPHONE) {
  /**
   * Updates the list height to match the window height for 
   * the demo. Also re-binds the list with stroll.js.
   */
  function updateHeight() {
    $('#packageList').css('height', window.innerHeight - $('#packageList').offset().top + 'px');
    $('ul.nodes').css('height', ( window.innerHeight - $('ul.nodes').offset().top) + 'px');

    Stroll.bind( $( 'ul#packageList' ) );
    Stroll.bind( $('ul.nodes'), { live: true } );
  }
  window.addEventListener( 'orientationchange', updateHeight, false );
  window.addEventListener( 'resize', updateHeight, false );
}

PackageNavigator = can.Control.extend({
   defaults: {
     view: 'views/navigator.ejs',
     nodes: {},
     packages: {}
   }
  },{

    init: function( element, options) {
      this.element.html( can.view(this.options.view, { packages: this.options.packages }) );
      if(IS_ANDROID || IS_IPHONE) {
        updateHeight();
      }
    },
    "#packageListNav button vclick": function (el, ev) {
       this.element.find('#packageList').show();
       this.element.find('#packageListNav span').html("Chiχ Packages");
       this.element.find('#packageListNav button, .nodes').hide();
    },
    "#packageList li vclick": function (el, ev) {

       // hide package list
       this.element.find('#packageList').hide();
       
       var str = can.view.render("views/nodes.ejs", { nodes: this.options.nodes[el.data('ns')] });
       // ok, onClick I want to add a model to the current list of nodes in the graph/flow
       // then this component is done. The other Controller must take care of what to do
       // when a node was added to the graph itself. I even should be able to add a node myself from
       // the console to the nodeList, and see the node appear within the graph.
       var node = this.options.packages[el.data('ns')];
       this.element.find('#packageListNav button').show().parent().find('span').html(node.description);
       this.element.find('ul.nodes').html(str).show();
    }
  }
);

module.exports = PackageNavigator;

},{"./stroll":2}],4:[function(require,module,exports){
var host = 'http://serve.chix.io';

var Package = can.Model({
  findAll: 'GET ' + host + '/packages'
}, {});

var Node = can.Model({
  findAll: 'GET ' + host + '/nodes',
  findOne: 'GET ' + host + '/nodes/{ns}/{id}',
  create:  'POST ' + host + '/nodes',
  update:  'PUT ' + host + '/nodes/{ns}/{id}',
  destroy: 'DELETE ' + host + '/nodes/{ns}/{id}'
}, {});

var Twig = can.Model({
  findAll: 'GET ' + host + '/twigs',
  findOne: 'GET ' + host + '/twigs/{ns}/{name}',
  create:  'POST ' + host + '/twigs',
  update:  'PUT ' + host + '/twigs/{ns}/{name}',
  destroy: 'DELETE ' + host + '/twigs/{ns}/{name}'
}, {});

module.exports = {
 Package: Package,
 Node: Node,
 Twig: Twig,
};

},{}]},{},[1])
;(function(window) {
can.view.preload('views_navigator_ejs',can.EJS(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];___v1ew.push("<div id=\"packageListNav\" class=\"panel-heading\">\n  <button class=\"btn\" style=\"display: none\">&lt;&lt;</button> <span>Chiχ Packages</span>\n</div>\n<div class=\"panel-content\">\n<ul id=\"packageList\" class=\"fan\">\n");___v1ew.push(can.view.txt(0,'ul',0,this,function(){var ___v1ew = []; for(var key in packages) { ___v1ew.push("\n<li data-ns=\"");___v1ew.push(can.view.txt(1,'li','data-ns',this,function(){ return key}));___v1ew.push("\"",can.view.pending(),">");___v1ew.push(can.view.txt(1,'li',0,this,function(){ return packages[key].description }));___v1ew.push("</li>\n"); } ;return ___v1ew.join('')}));
___v1ew.push("\n</ul>\n<ul class=\"nodes fan\" style=\"display: none\"></ul>\n</div>\n<hr />\n");; return ___v1ew.join('')}} }));
can.view.preload('views_nodes_ejs',can.EJS(function(_CONTEXT,_VIEW) { with(_VIEW) { with (_CONTEXT) {var ___v1ew = [];___v1ew.push(can.view.txt(0,'ul',0,this,function(){var ___v1ew = []; for(var key in nodes) { ___v1ew.push("\n<li>");___v1ew.push(can.view.txt(1,'li',0,this,function(){ return nodes[key].name }));___v1ew.push("</li>\n"); } ;return ___v1ew.join('')}));
___v1ew.push("\n");; return ___v1ew.join('')}} }));
})(this);