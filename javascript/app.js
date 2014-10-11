Leap.loop()
  .use('transform', {
    position: new THREE.Vector3(0,-100,-300),
    scale: new THREE.Vector3(0.5,0.5,0.5)
  });

Leap.loopController.setBackground(true);

angular.module('index', ['factories', 'directives']);

