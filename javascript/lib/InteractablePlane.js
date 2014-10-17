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


window.InteractablePlane = function(planeMesh, controller, options){
  this.options = options || {};
  this.options.cornerInteractionRadius || (this.options.cornerInteractionRadius = 20);
  this.options.resize !== undefined    || (this.options.resize  = true);
  this.options.moveX  !== undefined    || (this.options.moveX   = true);
  this.options.moveY  !== undefined    || (this.options.moveY   = true);
  this.options.moveZ  !== undefined    || (this.options.moveZ   = true);
  console.log(this, this.options);

  this.mesh = planeMesh;
  this.controller = controller;

  // holds the difference (offset) between the intersection point in world space and the local position,
  // at the time of intersection.
  this.intersections = {}; //keyed by the string: hand.id + handPointIndex

  // Maybe should replace these with some meta-programming to do the same.
  this.travelCallbacks  = [];
  this.touchCallbacks  = [];
  this.releaseCallbacks  = [];

  // note: movement constraints are implemented for X,Y, but not grab.
  this.movementConstraintsX = [];
  this.movementConstraintsY = [];
  this.movementConstraintsZ = [];

  this.grab = null; // hand id.  Limited to one hand for now.

  // If this is ever increased above one, that initial finger can not be counted when averaging position
  // otherwise, it causes jumpyness.
  this.fingersRequiredForMove = 1;

  if (this.options.resize){
    this.bindResize();
  }

  this.bindMove();

};

window.InteractablePlane.prototype = {

  emit: function(eventName, data1, data2, data3, data4, data5){

    // note: not ie-compatible indexOf:
    if (['travel', 'touch', 'release'].indexOf(eventName) === -1) {
      console.error("Invalid event name:", eventName);
      return
    }

    var callbacks = this[eventName + "Callbacks"];
    for (var i = 0; i < callbacks.length; i++){

      // could use arguments.slice here.
      callbacks[i].call(this, data1, data2, data3, data4, data5);

    }

  },

  // This is analagous to your typical scroll event.
  travel: function(callback){
    this.travelCallbacks.push(callback);
    return this
  },

  // This is analagous to your typical scroll event.
  touch: function(callback){
    this.touchCallbacks.push(callback);
    return this
  },

  // This is analagous to your typical scroll event.
  release: function(callback){
    this.releaseCallbacks.push(callback);
    return this
  },

  constrainMovement: function(options){
    if (options['x']) this.movementConstraintsX.push(options['x']);
    if (options['y']) this.movementConstraintsY.push(options['y']);
    if (options['z']) this.movementConstraintsZ.push(options['z']);

    return this;
  },

  changeParent: function(parent){
    var intersection, key, delta;


    // The InteractablePlane drag works by adding deltas to the position
    // Here add the delta between the dock and its scene

    for (key in this.intersections){

      intersection = this.intersections[key];

      delta = (new THREE.Vector3).setFromMatrixPosition( this.mesh.matrixWorld );
      intersection.sub(delta);
    }

    this.mesh.parent.remove(this.mesh);
    parent.add(this.mesh);

    this.getPosition(this.mesh.position);
    console.assert(this.mesh.position); // would fail if this is called with no intersections.
    console.log('repositioning');

  },

  // Returns the position of the mesh intersected
  // If position is passed in, sets it.
  // returns false if not enough intersections.
  getPosition: function(position){
    var newPosition = position || new THREE.Vector3, intersectionCount = 0;

    for ( var intersectionKey in this.intersections ){
      if( this.intersections.hasOwnProperty(intersectionKey) ){

        intersectionCount++;

        newPosition.add(
          this.moveProximity.intersectionPoints[intersectionKey].clone().sub(
            this.intersections[intersectionKey]
          )
        )

      }
    }

    if ( intersectionCount < this.fingersRequiredForMove) return;

    newPosition.divideScalar(intersectionCount);

    return newPosition;
  },

  // 1: count fingertips past zplace
  // 2: when more than 4, scroll
  // 3: when more than 5, move
  // 4: test/optimize with HMD.
  // note: this is begging for its own class (see all the local methods defined in the constructor??)
  bindMove: function(){

    // for every 2 index, we want to add (4 - 2).  That will equal the boneMesh index.
    // not sure if there is a clever formula for the following array:
    var indexToBoneMeshIndex = [0,1,2,3, 0,1,2,3, 0,1,2,3, 0,1,2,3, 0,1,2,3];

    var setBoneMeshColor = function(hand, index, color){

      // In `index / 2`, `2` is the number of joints per hand we're looking at.
      var meshes = hand.fingers[ Math.floor(index / 4) ].data('boneMeshes');

      if (!meshes) return;

      meshes[
        indexToBoneMeshIndex[index]
      ].material.color.setHex(color)

    };

    // determine if line and place intersect
    var proximity = this.moveProximity = this.controller.watch(
      this.mesh,
      this.interactiveEndBones
    );

    // this ties InteractablePlane to boneHand plugin - probably should have callbacks pushed out to scene.
    proximity.in( function(hand, intersectionPoint, key, index){
      var firstTouch;

      // Let's try out a one-way state machine
      // This doesn't allow intersections to count if I'm already pinching
      // So if they want to move after a pinch, they have to take hand out of picture and re-place.
      if (hand.data('resizing')) return;
      setBoneMeshColor(hand, index, 0xffffff);

      firstTouch = proximity.intersectionCount() > 0;

      this.intersections[key] = intersectionPoint.clone().sub(this.mesh.position);

      if (firstTouch) this.emit('touch', this);

    }.bind(this) );

    proximity.out( function(hand, intersectionPoint, key, index){

      setBoneMeshColor(hand, index, 0x222222);
      
      for ( var intersectionKey in this.intersections ){
        
        if (intersectionKey === key){
          delete this.intersections[intersectionKey];
          break;
        }
        
      }

      if (proximity.intersectionCount() == 0) this.emit('release', this);

    }.bind(this) );

    if (this.options.moveZ){

      this.controller.on('grab', function(hand){
        // check for existing grab
        // check for intersections
        // set grab offset to current offset.
        console.log('grab');

        // no two-handed grabs for now.
        if (this.grab) return;

        if (this.moveProximity.intersectionCount() < 1) return;

        // Todo - If there are multiple images, we are currently biased towards the one added first
        // We should instead do the one with more intersection points.

        // This is candidate for becoming its own class (possibly to handle the above todo).
        this.grab = {
          handId: hand.id,
          positionOffset: (new THREE.Vector3).fromArray(hand.palmPosition).sub(this.mesh.position)
          // later add: rotation offset - this will require a hand.quaternion() or bone.quaternion() method in LeapJS.
  //        rotationOffset: (new THREE.Quaternion)
        };
        console.assert(!isNaN(this.grab.positionOffset.x));
        console.assert(!isNaN(this.grab.positionOffset.y));
        console.assert(!isNaN(this.grab.positionOffset.z));

      }.bind(this) );

      this.controller.on('ungrab', function(hand){
        console.log('ungrab');
        if (this.grab && hand.id != this.grab.handId) return;

        this.grab = null;
      }.bind(this));

    }

    this.controller.on('frame', function(frame){
      var hand, i, moveX, moveY, moveZ;

      if (this.grab){

        hand = frame.hand(this.grab.handId);

        this.mesh.position.fromArray(hand.palmPosition).sub(this.grab.positionOffset);

        console.assert(!isNaN(this.mesh.position.x));
        console.assert(!isNaN(this.mesh.position.y));
        console.assert(!isNaN(this.mesh.position.z));

      } else {

        var newPosition = this.getPosition();

        if (!newPosition) return;

        // constrain movement to...
        // for now, let's discard z.
        // better:
        // Always move perpendicular to image normal
        // Then set normal equal to average of intersecting line normals
        // (Note: this will require some thought with grab.  Perhaps get carpal intersection, stop re-adjusting angle.)
        // (Note: can't pick just any face normal, so that we can distort the mesh later on.
        // This will allow (but hopefully not require?) expertise to use.

        if (this.options.moveX){
          moveX = true;
          for (i = 0; i < this.movementConstraintsX.length; i++){
            if (!this.movementConstraintsX[i](newPosition.x)) {
              moveX = false; break;
            }
          }
          if (moveX) this.mesh.position.x = newPosition.x;
        }
        if (this.options.moveY){
          moveY = true;
          for (i = 0; i < this.movementConstraintsY.length; i++){
            if (!this.movementConstraintsY[i](newPosition.y)) {
              moveY = false; break;
            }
          }
          if (moveY) this.mesh.position.y = newPosition.y;
        }

      }

      // note - include moveZ here when implemented.
      if (moveX || moveY) this.emit('travel', this, this.mesh);


    }.bind(this) );

  },

  bindResize: function(){

    var corners = this.mesh.geometry.corners();
    this.cornerMeshes = [];
    this.cornerProximities = [];
    var mesh, proximity;

    for (var i = 0; i < corners.length; i++) {

      this.cornerMeshes[i] = mesh = new THREE.Mesh(
        new THREE.SphereGeometry(this.options.cornerInteractionRadius, 32, 32),
        new THREE.MeshPhongMaterial({color: 0xffffff})
      );

      mesh.visible = false;
      mesh.name = "corner-" + i; // convenience

      var cornerXY = corners[i];
      mesh.position.set(cornerXY.x, cornerXY.y, 0); // hard coded for PlaneGeometry.. :-/

      this.mesh.add(mesh);

      this.cornerProximities[i] = proximity = this.controller.watch(
        mesh,
        this.cursorPoints
      ).in(
        function(hand, displacement, key, index){
          // test - this could be the context of the proximity.
          this.mesh.material.color.setHex(0x33ee22);
        }
      ).out(
        function(){
          this.mesh.material.color.setHex(0xffffff);
        }
      );

    }

    this.controller.on('hand',
      this.checkResizeProximity.bind(this)
    );

    // todo - make sure pinching on multiple corners is well-defined.  Should always take the closest one.
    // Right now it will always prefer the first-added Plane.
    this.controller.on('pinch', function(hand){

      var activeProximity, key = hand.id + '-0';

      for (var i = 0; i < this.cornerProximities.length; i++) {

        if (this.cornerProximities[i].states[key] === 'in') {
          activeProximity = this.cornerProximities[i];
          break;
        }

      }

      if (!activeProximity) return;

      if ( hand.data('resizing') ) return;

      hand.data('resizing', activeProximity);

    }.bind(this));

    this.controller.on('unpinch', function(hand){
      if (!hand.data('resizing')) return;

      hand.data('resizing', false);
    }.bind(this));
  },

  // Returns coordinates for the last two bones of every finger
  // Format: An array of tuples of ends
  // Order matters for our own use in this class
  // returns a collection of lines to be tested against
  // could be optimized to reuse vectors between frames
  interactiveEndBones: function(hand){
    var out = [], finger;

    for (var i = 0; i < 5; i++){
      finger = hand.fingers[i];

      out.push(
        [
          (new THREE.Vector3).fromArray(finger.metacarpal.nextJoint),
          (new THREE.Vector3).fromArray(finger.metacarpal.prevJoint)
        ],
        [
          (new THREE.Vector3).fromArray(finger.proximal.nextJoint),
          (new THREE.Vector3).fromArray(finger.proximal.prevJoint)
        ],
        [
          (new THREE.Vector3).fromArray(finger.medial.nextJoint),
          (new THREE.Vector3).fromArray(finger.medial.prevJoint)
        ],
        [
          (new THREE.Vector3).fromArray(finger.distal.nextJoint),
          (new THREE.Vector3).fromArray(finger.distal.prevJoint)
        ]
      );
    }

    return out;
  },

  // could be optimized to reuse vectors between frames
  // used for resizing
  cursorPoints: function(hand){
    return [
      (new THREE.Vector3).fromArray(hand.palmPosition)
    ]
  },

  checkResizeProximity: function(hand){
    var targetProximity = hand.data('resizing'), inverseScale;

    if (!targetProximity) return;

    var cursorPosition = this.cursorPoints( hand )[0];

    for (var i = 0; i < this.cornerProximities.length; i++) {

      if ( targetProximity === this.cornerProximities[i] ){

        if (hand.data('pinchEvent.pinching')) {

          this.mesh.setCorner(i, cursorPosition);

          inverseScale = (new THREE.Vector3(1,1,1)).divide(this.mesh.scale);

          for (var j = 0; j < this.cornerProximities.length; j++){
            this.cornerMeshes[j].scale.copy(inverseScale);
          }


        } else {

          hand.data('resizing', false);

        }

      }

    }

  }

}

}).call(this);