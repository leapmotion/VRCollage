// Accepts a point in 3d space and a radius length

Leap.plugin('proximity', function(scope){

  var proximities = [];

  var makeVector3 = function(p){

    if (p instanceof THREE.Vector3){
      return p;
    } else {
      return (new THREE.Vector3).fromArray(p)
    }

  }

  var Proximity = function(mesh, handPoints){
    this.mesh = mesh;
    this.handPoints = handPoints;
    this.inCallbacks  = [];
    this.outCallbacks = [];
    this.states = []; // one state for each handPoint, either in or out.
  }

  Proximity.prototype = {

    // unlike "over" events, we emit when "in" an object.
    in: function(callback){
      this.inCallbacks.push(callback);
      return this
    },

    out: function(callback){
      this.outCallbacks.push(callback);
      return this
    },

    emit: function(eventName, data1, data2, data3){

      // note: not ie-compatible indexOf:
      if (['in', 'out'].indexOf(eventName) === -1) {
        console.error("Invalid event name:", eventName)
        return
      }

      var callbacks = this[eventName + "Callbacks"];
      for (var i = 0; i < callbacks.length; i++){

        callbacks[i](data1, data2, data3);

      }

    }

  }

  // can be a sphere or a plane.  Here we'll use an invisible sphere first
  // ideally, we would then emit events off of the object
  // Expects a THREE.js mesh
  // and a function which receives a hand and returns an array of points to check against
  // Returns an object which will emit events.
  // the in event is emitted for a handpoint entering the region
  // the out event is emitted for a handpoint exiting the region
  // note: this architecture is brittle to changing numbers of handPoints.
  this.watch = function(mesh, handPoints){
    console.assert(mesh);
    console.assert(handPoints);
    console.assert(typeof handPoints === 'function');

    var proximity = new Proximity(mesh, handPoints);

    proximities.push(proximity);

    return proximity;
  };

  // After setting up a proximity to watch, you can watch for events like so:
  // controller
  //   .watch(myMesh, myPointGetterFunction)
  //   .in(function(index, displacement, fraction){
  //
  //   });
  // Where
  //  - index is the index of the point returned by myPointGetterFunction for which we are responding
  //  - displacement is the THREE.Vector3 from hand point to the mesh.  (Testing a new convention - always send arrows out of the hand, as that expresses intention.)
  //  - fraction is distanceToMeshCenter / meshRadius.


  return {

    hand: function(hand){

      var proximity, mesh, length, state,
        handPoints, handPoint, meshWorldPosition = new THREE.Vector3,
        displacement = new THREE.Vector3;

      for (var i = 0; i < proximities.length; i++){

        proximity = proximities[i];
        mesh = proximity.mesh;

        // Handles Spheres. Planes. Boxes? other shapes? custom shapes?

        // only support sphere for now
        // Can't find a good way to test constructor name, so we test parameters for now.
        if (!mesh.geometry.parameters.radius){
          console.error("Unsupported geometry", mesh.geometry);
          return
        }

        handPoints = proximity.handPoints(hand);

        for (var j = 0; j < handPoints.length; j++){

          handPoint = makeVector3( handPoints[j] );
          console.assert(!isNaN(handPoint.x));
          console.assert(!isNaN(handPoint.y));
          console.assert(!isNaN(handPoint.z));

          meshWorldPosition.setFromMatrixPosition( mesh.matrixWorld ); // note - this is last frame's position. Should be no problem.
          console.assert(!isNaN(meshWorldPosition.x));
          console.assert(!isNaN(meshWorldPosition.y));
          console.assert(!isNaN(meshWorldPosition.z));

//          Arrows.show(
//            handPoint,
//            meshWorldPosition
//          );


          // subtract position from handpoint, compare to radius
          displacement.subVectors(handPoint, meshWorldPosition);
          length = displacement.length();
          window.plotter.plot('length', length);

          state = (length < mesh.geometry.parameters.radius) ? 'in' : 'out';

          if (state !== proximity.states[j]){
            proximity.emit(state, j, displacement, length / mesh.geometry.parameters.radius);
            proximity.states[j] = state;
          }

        }


      }

    }

  }
});