// this should get a new name, now that it includes grabEvent.
Leap.plugin('twoHandRecognizer', function(scope){

  var controller = this;

  var gestureState = "INACTIVE";

  function calcHandOutAndOpenAmount(hand) {
    var inverseYComponent = 1 - Math.abs(hand.direction[2]);
    var inverseGrabStrength = 1 - hand.grabStrength;

    return inverseYComponent * inverseGrabStrength;
  }

  function outOpenComponent() {
    if ( controller.handQueue !== undefined && controller.handQueue.length >= 2 ) {
      var comp1 = calcHandOutAndOpenAmount(controller.handQueue[0]);
      var comp2 = calcHandOutAndOpenAmount(controller.handQueue[1]);
      return Math.min(comp1, comp2);
    }
    else {
      return 0;
    }
  }

  return {
    frame: function(frame){
      var outOpen = outOpenComponent();

      if ( gestureState == "INACTIVE" ) {
        if ( controller.handQueue !== undefined && controller.handQueue.length >= 2 && outOpen >= 0.7) {
          controller.emit("twoHand.start", controller.handQueue[0], controller.handQueue[1]);
          gestureState = "ACTIVE";
        }
      }
      else if( gestureState == "ACTIVE" ) {
        if ( controller.handQueue === undefined || controller.handQueue.length < 2 || outOpen < 0.6) {
          controller.emit("twoHand.end");
          gestureState = "INACTIVE";
        }
        else {
          controller.emit("twoHand.update", controller.handQueue[0], controller.handQueue[1]);
        }
      }
    }
  };
});
