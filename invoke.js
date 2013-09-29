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

