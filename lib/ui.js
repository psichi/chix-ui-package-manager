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
       
       // show nodeDefinitions in this package.
       //
       
       // show back navigation
       // ok, how to get the namespace and the name of the package we have clicked?
       console.log(el.data('ns'));
       console.log(el.data('package'));
       var str = can.view.render("views/nodes.ejs", { nodes: this.options.nodes[el.data('ns')] });
       var node = this.options.packages[el.data('ns')];
       this.element.find('#packageListNav').show().find('span').html(node.description);
       this.element.find('.nodes').html(str).show();

       console.log(el);
    }
  }
);

module.exports = PackageNavigator;
