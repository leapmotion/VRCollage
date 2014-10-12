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

// 1: create an object-fingertip pairing to watch proximity of
// 2: attach handlers

// This could be a THREEx extension?



(function() {

window.InteractableBox = function(boxMesh, controller){
  this.mesh = boxMesh;
  this.controller = controller;

  // create an invisible sphere mesh on the bottom right corner (Don't even add it to the scene? Or maybe yes as it must be offset from box and use world position later.)
  // For now, we calculate world Position once and leave it at that?
  // this is used for proximity.

  var interactionRadius = 20;

  var lowerRightCorner = new THREE.Mesh(
    new THREE.SphereGeometry(interactionRadius, 32, 32),
    new THREE.MeshPhongMaterial({color: 0xffffff})
  );

  lowerRightCorner.position.copy(
    this.mesh.corners(2)
  );

  this.mesh.add(lowerRightCorner);

  this.controller.watch(
    lowerRightCorner,
    function(hand){
      return [ hand.indexFinger.tipPosition ]
    }
  ).in(function(){
      lowerRightCorner.material.color.setHex(0x33ee22)
  }).out(function(){
      lowerRightCorner.material.color.setHex(0xffffff)
  });

}

}).call(this);