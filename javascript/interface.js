(function() {

  var onkey = function(event) {
    if (event.key === 'z' || event.keyCode == 122) {
      vrControls.zeroSensor();
    }
    if (event.key === 'f' || event.keyCode == 102) {
      return vrEffect.setFullScreen(true);
    }
  };

  window.addEventListener("keypress", onkey, true);
  window.addEventListener("dblclick", function(){
    // TODO: add a toggleFullScreen method to VREffect
    var isFullscreen = document.mozFullScreenElement || document.webkitFullscreenElement;
    vrEffect.setFullScreen(!isFullscreen);
  });

}).call(this);