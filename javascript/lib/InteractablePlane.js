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
// there's very nothing in this class which cares if it is a box or a plane.

(function() {

window.InteractableBox = function(planeMesh, controller){
  this.mesh = planeMesh;
  this.controller = controller;

  // create an invisible sphere mesh on the bottom right corner (Don't even add it to the scene? Or maybe yes as it must be offset from box and use world position later.)
  // For now, we calculate world Position once and leave it at that?
  // this is used for proximity.

  var interactionRadius = 20;

  this.lowerRightCorner = new THREE.Mesh(
    new THREE.SphereGeometry(interactionRadius, 32, 32),
    new THREE.MeshPhongMaterial({color: 0xffffff})
  );

//  this.lowerRightCorner.visible = false;
//
  this.lowerRightCorner.name = "lowerRightCorner"; // convenience

  this.lowerRightCorner.position.copy(
    this.mesh.geometry.corners(2)
  );

  this.mesh.add(this.lowerRightCorner);

//  this.bindResize();

  this.bindMove();

};

window.InteractableBox.prototype = {

  // 1: count fingertips past zplace
  // 2: when more than 4, scroll
  // 3: when more than 5, move
  // 4: test/optimize with HMD.
  bindMove: function(){

    // determine if line and place intersect
    var proximity = this.controller.watch(
      this.mesh,
      this.fingerTips
    )
      .in( function(){console.log('in' , arguments) })
      .out(function(){console.log('out', arguments) })

  },

  bindResize: function(){

    // todo: handle four corners, not just one.
    this.lowerRightCornerProximity = this.controller.watch(
      this.lowerRightCorner,
      this.cursorPoints
    ).in(
      function(hand, index, displacement, fraction){
        this.lowerRightCorner.material.color.setHex(0x33ee22);
      }.bind(this)
    ).out(
      function(){
        this.lowerRightCorner.material.color.setHex(0xffffff);
      }.bind(this)
    );

    this.controller.on('hand',
      this.checkResizeProximity.bind(this)
    );

    this.controller.on('pinch', function(hand){
      if (this.lowerRightCornerProximity.states[0] !== 'in') return;

      hand.data('resizing', this.lowerRightCornerProximity);

    }.bind(this));

    this.controller.on('unpinch', function(hand){
      if (!hand.data('resizing')) return;

      hand.data('resizing', false);
    }.bind(this));
  },

  // returns a collection of lines to be tested against
  // tuples of... origin and relative displacement of the line?
  //          ... the two points on the line?
  //          ... starting implementation to determine which is more natural
  // could be optimized to reuse vectors between frames
  fingerTips: function(hand){
    return [
      [
        (new THREE.Vector3).fromArray(hand.indexFinger.tipPosition), // todo - this may be better as btip position.
        (new THREE.Vector3).fromArray(hand.indexFinger.dipPosition)
      ]
    ]
  },

  // could be optimized to reuse vectors between frames
  cursorPoints: function(hand){
    return [
      (new THREE.Vector3).fromArray(hand.palmPosition)
    ]
  },

  checkResizeProximity: function(hand){
    var resizeTarget = hand.data('resizing');

    if (resizeTarget && (resizeTarget == this.lowerRightCornerProximity) ){

      if (hand.data('pinchEvent.pinching')) {
        this.handleResize(hand);
      }else{
        hand.data('resizing', false);
      }

    }
  },

  handleResize: function(hand){

    // change since last frame
    var displacement = this.cursorPoints( hand )[0];
    this.mesh.setCorner(2, displacement);

    this.lowerRightCorner.scale.set(1,1,1).divide(this.mesh.scale);

  }

}

}).call(this);