var PushButton = function(interactablePlane){
  this.plane = interactablePlane;

  this.longThrow  = -0.05;
  this.shortThrow = -0.03;

  this.pressed = false;
  this.canChangeState = true;
  this.plane.movementConstraints.z = this.releasedConstraint.bind(this);

  this.on('press', function(){
    this.pressed = true;

    this.plane.movementConstraints.z = this.pressedConstraint.bind(this);
    this.plane.mesh.material.color.setHex(0xccccff);

  }.bind(this));

  this.on('release', function(){
    this.pressed = false;

    this.plane.movementConstraints.z = this.releasedConstraint.bind(this);
    this.plane.mesh.material.color.setHex(0xeeeeee);

  }.bind(this));

};


// todo - make these oriented in the direction plane normal
// returns the correct position
PushButton.prototype.releasedConstraint = function(z){
  var origZ = this.plane.originalPosition.z;

  if (z > origZ) {
    this.canChangeState = true;
    return origZ;
  }

  if (z < origZ + this.longThrow){
    if (!this.pressed && this.canChangeState){
      this.canChangeState = false;
      console.log('press');
      this.emit('press');
    }
    return origZ + this.longThrow;
  }

  return z;

};

PushButton.prototype.pressedConstraint = function(z){
  var origZ = this.plane.originalPosition.z;

  if (z > origZ + this.shortThrow) {
    this.canRelease = true;
    return origZ + this.shortThrow;
  }

  if (z < origZ + this.longThrow){
    if (this.pressed && this.canRelease) {
      this.canRelease = false;
      console.log('release');
      this.emit('release');
    }
    return origZ + this.longThrow;
  }

  return z;

};


Leap._.extend(PushButton.prototype, Leap.EventEmitter.prototype);
