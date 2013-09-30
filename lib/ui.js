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
