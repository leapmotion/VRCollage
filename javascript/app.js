
// Plugin order is critical:
Leap.loop()
  .use('transform', {
    position: new THREE.Vector3(0,-200,-300),
    scale: 0.75
  })
  .use('boneHand', {
    scene: null // this tells boneHand to use defer scene usage/creation.
  })
  .use('proximity')
  .use('pinchEvent');

Leap.loopController.setBackground(true);

angular.module('index', ['factories', 'directives']);

