// this should get a new name, now that it includes grabEvent.
Leap.plugin('handBracket', function(scope){



  var controller = this;

  var emitting = false;

  return {

    frame: function(frame){

      if (frame.hands.length !== 2) {
        if (emitting){
          emitting = false;
          controller.emit('handBracket.end');
        }
        return
      }

      if (!emitting){
        this.emit('handBracket.start');
        emitting = true;
      }

      controller.emit('handBracket.update',
        frame.hands.map(function(hand) {
          return new THREE.Vector3().fromArray(hand.palmPosition);
        })
      );

    }
  };
});
