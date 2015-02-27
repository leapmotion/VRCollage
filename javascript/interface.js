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

}).call(this);