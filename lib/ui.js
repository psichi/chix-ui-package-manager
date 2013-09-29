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
