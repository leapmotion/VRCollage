// Plugin order is critical:
Leap.loop()
  .use('transform', {
    vr: true
  })
  .use('boneHand', {
    scene: null, // this tells boneHand to use defer scene usage/creation.
    opacity: 0.7,
    jointColor: new THREE.Color(0x222222),
    arm: true
  })
  .use('proximity')
  .use('pinchEvent')
  .use('playback', {
    pauseOnHand: true,
    loop: false,
    overlay: false,
    resumeOnHandLost: false,
    autoPlay: false
  })
  .use('twoHandRecognizer');

Leap.loopController.setBackground(true);

Leap.loopController.on('ready', function(){
  console.log('Leap Motion Controller ready');
  ga('send', 'event', 'Leap', 'ready');

  var connection = this.connection;
  this.connection.on('focus', function(){
    if (!VRClientReady) return;

    connection.reportFocus(VRClientFocused);
  });

});


var VRClientReady = false;
var VRClientFocused = true;
VRClient.onFocus = function(){
  VRClientFocused = true;

  var connection = Leap.loopController.connection;
  if (!connection) return;

  connection.reportFocus(true);
};

VRClient.onBlur = function(){
  VRClientFocused = false;

  var connection = Leap.loopController.connection;
  if (!connection) return;

  connection.reportFocus(false);
};


angular.module('index', ['factories', 'directives']);

