(function() {

  var onkey = function(event) {
    console.log('key');

    if (event.key === 'z') {
      vrControls.zeroSensor();
    }
    if (event.key === 'f') {
      // it looks like this does two things:
      // #1: But browser in VR effect mode
      // #2 Do magic w/ the canvas to make it work fullscreen
      return vrEffect.setFullScreen(true);
    }
  };

  window.addEventListener("keypress", onkey, true);

}).call(this);