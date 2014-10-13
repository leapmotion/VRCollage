Leap.plugin('pinchEvent', function(scope){

  this.use('handHold');

  // no hysteresis, first time around.
  scope.threshold || (scope.threshold = 0.5);

  var controller = this;

  return {

    hand: function(hand){
      var pinching = hand.pinchStrength > scope.threshold;

      if (hand.data('pinchEvent.pinching') != pinching){

        controller.emit(
          pinching ? 'pinch' : 'unpinch',
          hand
        );

        hand.data('pinchEvent.pinching', pinching)
      }

    }

  }
});