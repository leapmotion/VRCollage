
window.HMDTransformation = {
  quaternion: (new THREE.Quaternion).setFromEuler(
    new THREE.Euler( Math.PI * -0.3, 0, Math.PI, 'ZXY' )
  ),
  position: new THREE.Vector3(0,100,-30),
  scale: 0.75
};

window.DesktopTransformation = {
  quaternion: (new THREE.Quaternion),
  position: new THREE.Vector3(0,-200,-300),
  scale: 0.75
};


// Plugin order is critical:
Leap.loop()
  .use('transform', window.DesktopTransformation)
  .use('boneHand', {
    scene: null, // this tells boneHand to use defer scene usage/creation.
    opacity: 0.7,
//    jointColor: new THREE.Color(0xffffff)
    jointColor: new THREE.Color(0x222222)
  })
  .use('proximity')
  .use('pinchEvent');

Leap.loopController.setBackground(true);


angular.module('index', ['factories', 'directives']);

