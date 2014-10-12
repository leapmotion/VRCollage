Leap.loop()
  .use('transform', {
    position: new THREE.Vector3(0,-200,-300),
    scale: 0.75
  })
  .use('proximity');

Leap.loopController.setBackground(true);

angular.module('index', ['factories', 'directives']);

