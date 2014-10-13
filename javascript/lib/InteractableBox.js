// This is a 3d box, or 2d immersed surface
// This takes in a Leap Controller and is added to a scene, or
// Would be great to use RequireJS, but that's not set up for this project currently.
// This is an experimental class
// it does:
// - Handle resizing
// -  with visual affordances made from DOM
// - Moving
// - Mesh deformations
// - etc?

(function() {

window.InteractableBox = function(boxMesh, controller){
  this.mesh = boxMesh;
  this.controller = controller;

  // create an invisible sphere mesh on the bottom right corner (Don't even add it to the scene? Or maybe yes as it must be offset from box and use world position later.)
  // For now, we calculate world Position once and leave it at that?
  // this is used for proximity.

  var interactionRadius = 20;

  this.lowerRightCorner = new THREE.Mesh(
    new THREE.SphereGeometry(interactionRadius, 32, 32),
    new THREE.MeshPhongMaterial({color: 0xffffff})
  );

  this.lowerRightCorner.name = "lowerRightCorner"; // convenience

  this.lowerRightCorner.position.copy(
    this.mesh.corners(2)
  );

  this.mesh.add(this.lowerRightCorner);

  this.controller.watch(
    this.lowerRightCorner,
    this.handFocalPoints
  ).in(
    function(hand, index, displacement, fraction){
      this.lowerRightCorner.material.color.setHex(0x33ee22);
    }.bind(this)
  ).out(
    function(){
      this.lowerRightCorner.material.color.setHex(0xffffff);
    }.bind(this)
  );

  this.controller.on('hand', this.checkResizeProximity.bind(this));

}

window.InteractableBox.prototype = {

  handFocalPoints: function(hand){
//      return [ hand.indexFinger.tipPosition ]
//      return [ hand.palmPosition ]
    return [
      (new THREE.Vector3).fromArray(hand.palmPosition)
    ]
  },

  checkResizeProximity: function(hand){
    var resizing = hand.data('resizing');

    if (resizing){

      if (hand.data('pinchEvent.pinching')) {
        this.handleResize(hand);
      }else{
        hand.data('resizing', false);
      }

    }

    if (hand.data('pinchEvent.pinching') && hand.data('proximity.in')){

      hand.data('resizing', this.lowerRightCorner);

      this.handleResize(hand);


    }
  },

  handleResize: function(hand){

    // change since last frame
    var displacement = this.handFocalPoints( hand )[0];
    this.mesh.setCorner(2, displacement);

    this.lowerRightCorner.scale.set(1,1,1).divide(this.mesh.scale);


  }

}

}).call(this);