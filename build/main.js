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


},{"./lib/ui":2,"chix-ui-models":3}],2:[function(require,module,exports){
PackageNavigator = can.Control.extend({
   defaults: {
     view: 'views/navigator.ejs',
     nodes: {},
     packages: {}
   }
  },{

    init: function( element, options) {
      this.element.html( can.view(this.options.view, { packages: this.options.packages }) );

    },
    "#packageListNav button click": function (el, ev) {
       this.element.find('#packageList').show();
       this.element.find('#packageListNav, .nodes').hide();
    },
    "#packageList button click": function (el, ev) {

       // hide package list
       this.element.find('#packageList').hide();
       
       var str = can.view.render("views/nodes.ejs", { nodes: this.options.nodes[el.data('ns')] });
       // ok, onClick I want to add a model to the current list of nodes in the graph/flow
       // then this component is done. The other Controller must take care of what to do
       // when a node was added to the graph itself. I even should be able to add a node myself from
       // the console to the nodeList, and see the node appear within the graph.
       var node = this.options.packages[el.data('ns')];
       this.element.find('#packageListNav').show().find('span').html(node.description);
       this.element.find('.nodes').html(str).show();
    }
  }
);

module.exports = PackageNavigator;

},{}],3:[function(require,module,exports){
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
;