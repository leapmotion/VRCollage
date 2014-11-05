// SortedLayout Container
// Original Author: Daniel Plemmons
// Created: Nov. 3, 2014
//
// This is a container for InteractablePlanes that:
// - Allows the planes to be interactively layed out on screen
//   (via sorting) by given properties
// - Allows users to determine the behavior of the on-screen
//   sorting based on the position of their hands
// - Allows the user to manually layout the items in the
//   container and persists that layout in application state
//   (for the duration of the application runtime)
//
// For the moment, the container will make all calculations for
// the plane locations in world space. Eventually this class
// should be modified to give each container it's own local
// coordinate space.
//
// The container currently handles it's own list of child planes.
// This means that multiple containers could reasonably contain
// the same plane. This class should eventually be refactored to
// have the plane's parent determine its container. ( this goes along
// with the proposed coordinate space refactor. )

(function () {
  //The list of valid states for the manner of sorting.
  var validSortStates = [
    "USER_SORTED",
    "DYNAMIC_SORTED"
  ];
  // SortedLayoutContainer Constructor
  // Optional argument "planeList" is a list of InteractivePlanes to be added to the container on creation
  // Optional argument "sortState" is a string given one of the validSortStates listed above.
  window.SortedLayoutContainer = function(planeList, sortState){
    this.planeList = planeList || [];

    if (sortState !== undefined && validSortStates.indexOf(sortState) != -1) {
      this.sortState = sortState;
    }
    else {
      this.sortState = "DYNAMIC_SORTED";
    }
  };

  // Pubic Methods
  window.SortedLayoutContainer.prototype = {
    // Takes two hand positions
    // if the container's current state allows programatic layout (as opposed to manual user layout )
    // will sort the InteractablePlane(s) in the container accordingly (and return true).
    // Update will return false if the current container state does not support
    // programatic layout
    update: function(hand1Position, hand2Position) {
      if ( this.sortState == "DYNAMIC_SORTED" ) {
        var diff = new THREE.Vector3().subVectors(hand2Position, hand1Position);
        var weightX = diff.x / (diff.x + diff.y);
        var weightY = diff.y / (diff.x + diff.y);
        var alphabeticalLayout = listLayout(this.planeList, hand1Position, new THREE.Vector3(hand1Position.x + diff.x, hand1Position.y, hand1Position.z)).alphabetical();
        var chronologicalLayout = listLayout(this.planeList, hand1Position, new THREE.Vector3(hand1Position.x, hand1Position.y + diff.y, hand1Position.z)).alphabetical();
        var blendedLayout = blendLayouts([alphabeticalLayout, chronologicalLayout], [weightX, weightY]);
        applyLayoutList(blendedLayout);
        return true;
      }
      else {
        return false;
      }
    },

    // Adds the given plane to list of planes managed by the container.
    // Returns true if the plane is successfully added.
    // Returns false if the plane is a duplicate and cannot be added.
    addPlane: function(newPlane) {
      if ( this.planeList.indexOf(newPlane) == -1 ) {
        this.planeList.push(newPlane);
        return true;
      }
      else {
        return false;
      }
    },

    // Removes the given plane from the list of planes.
    // Returns true if the plane was successfully removed.
    // Returns false if the plane could not be found and was not removed.
    removePlane: function(toRemove) {
      var planeIndex;
      if ( (planeIndex = this.planeList.indexOf(toRemove)) != -1 ) {
        this.planeList.splice(planeIndex, 1);
        return true;
      }
      else {
        return false;
      }
    }
  };

  // Generates a LayoutNode object which is just a
  // simple structure to hold a plane and the position
  // generated for it.
  function LayoutNode(plane, position) {
    var returnNode = {
      "plane": plane,
      "position": position
    };
    return returnNode;
  }

  // If called with a sort comparitor, returns an array of layoutNodes specifying the InteractivePlane and the
  // location in space according to the supplied sort comparitor function.
  // Locations are given in a 0-1 space if no positions are specified.
  //
  // if called with just start and end position, returns an object that containts the relevant
  // calls to generate the layout with different sorting properties.
  function listLayout(planeList, startPosition, endPosition, sortComparitor) {
    // If only start and end position are given, utilize partial evaluation
    // to allow a call formated like: listLayout(startPosition, endPosition).alphabetical();
    if (arguments.length == 3) {
      return {
        alphabetical: (function() {
          listLayout(planeList, startPosition, endPosition, function(a,b) {
            if ( a.mesh.name <= b.mesh.name ) { return -1; }
            else { return 1; }
          });
        }),
        chronological: (function() {
          listLayout(planeList, startPosition, endPosition, function(a,b) {
            if ( a.uid <= b.uid ) { return -1; }
            else { return 1; }
          });
        })
      };
    }
    else if (arguments.length == 4) {
      var layoutList = [];
      var ittr = 0;
      startPosition || (startPosition = 0);
      endPosition || (endPosition = 0);
      reverse || (reverse = false);

      // Sort the planelist alphabetically by "plane.mesh.name"
      planeList.sort(sortComparitor);

      // Generate the layout list full of layout nodes
      for ( var plane in planeList ) {
        var listPercentage = (ittr*1.0) / (planeList.length*1.0); // force double division
        var position = startPosition.lerp(endPosition, listPercentage);
        layoutList.push(LayoutNode(plane, position));
        ittr += 1;
      }

      return layoutList;
    }
    else {
      return false;
    }
  }

  // - Retruns a weighted mean of the given layout node lists as an array of layout nodes
  // - Assumes that each index of each list in layout lists referes to the
  //   same node.
  // - The length of the weightList and the layoutList must be equal.
  function blendLayouts(layoutLists, weightList) {
    var ittr = 0;
    var weightSumList = [];
    var vectorSumList = [];
    var blendedLayoutList = [];

    // Confirm arguments are valid(ish)
    if( layoutList === undefined || weightList === undefined) { return false; }
    else if ( layoutList.length != weightList.length ) { return false; }
    else if ( layoutList.length === 0 ) { return false; }

    // For each node, calculate the weighted sum of vectors
    // along with the sum of weights.
    for( var layoutList in layoutLists ) {
      var weight = weightList[ittr];
      for ( var layoutNode in layoutList ) {
        if (vectorSumList[ittr] === undefined) { vectorSumList[ittr] = layoutNode.position; }
        else { vectorSumList[ittr].add(layoutNode.position.multiplyScalar(weight)); }
        weightSum += weight;
      }
      ittr+=1;
    }

    ittr = 0; // reset itterator

    //Calculate the weighted mean for each node
    for ( var vecSum in sumList ) {
      var plane = layoutLists[0][ittr].plane;
      var weightSum = weightSumList[ittr];
      blendedLayoutList[ittr] = LayoutNode(plane, vecSum.divideScalar(weightSum));
      ittr += 1;
    }

    return weightedMeanList;
  }

  // Itterate through a layout list and move the given elements to the
  // given positions.
  function applyLayoutList(layoutList) {
    for(var node in layoutList) {
      var plane = node.plane;
      var localSpace = plane.worldToLocal(node.position); // Convert our global coordinates to local space.
      plane.position = localSpace; // Set the local space position of the plane.
    }
  }
}).call(this);