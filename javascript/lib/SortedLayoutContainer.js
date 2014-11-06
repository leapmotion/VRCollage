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
  // todo - these become collage, vertical, stack, and transitioning
  var validSortStates = [
    "transitioning"
  ];

  Layout = function(options){
    options || (options = {});

    this.planes = [];
    this.planePositions = []; // Array of LayoutNodes
    this.planePositionOffsets = []; // Array of positions

    this.p1 = new THREE.Vector3;
    this.p2 = new THREE.Vector3;

    this.weight = 0;

    this.sorter = options.sorter;
    this.onRelease = options.onRelease;

  };

  Layout.prototype = {

    sort: function(){

      this.planes.sort(this.sorter);

    },

    // save position of planes in layout
    // stored as offsets from the lerp percentage positions
    // these get scaled on later.
    // assumes that updatePositions has been recently called, but without actually moving the planes (!)
    // todo - adding a plane when in non-collage mode will cause bad ordering.
    persist: function(){

      this.planePositionOffsets = [];
      this.updatePositions(); // updates the positions stored

      for (var i=0; i<this.planes.length; i++) {

        this.planePositionOffsets.push(
          (new THREE.Vector3).subVectors(this.planes[i].mesh.position, this.planePositions[i].position)
        );

      }
    },

    updatePositions: function () {
      var plane, listPercentage, position, i;

      this.planePositions = [];

      for (i = 0; i < this.planes.length; i++) {
        plane = this.planes[i];
        listPercentage = i / this.planes.length;
        listPercentage = Math.min(1.0, Math.max(0.0, listPercentage));

        position = new THREE.Vector3()
          .copy(this.p1)
          .lerp(this.p2, listPercentage);

        // uses weight as percentageComplete

        this.planePositions.push(LayoutNode(plane, position));
      }

      if (this.planePositionOffsets.length > 0){
        for (i = 0; i < this.planes.length; i++){

          this.planePositions[i].position.add(
            this.planePositionOffsets[i].clone().multiplyScalar(this.weight)
          )

        }
      }

    }

  }

  // SortedLayoutContainer Constructor
  // Optional argument "planes" is a list of InteractivePlanes to be added to the container on creation
  // Optional argument "sortState" is a string given one of the validSortStates listed above.
  window.SortedLayoutContainer = function(planes, sortState, onStateChange){
    this.z = -0.25; // this is a global, to be set only by pushing or pulling on the stack with one hand.

    this.layouts = {

      stack:  new Layout({
        onRelease: function(){
          this.p2 = this.p1; // todo - check order

          // Show stack depth.
          this.p2.x += 0.01;
          this.p2.y += 0.01;
          this.p2.z += 0.01;
        }
      }),

//      alpha:  new Layout({
//        sorter: function(a,b) {
//          return a.mesh.name <= b.mesh.name  ? -1 : 1;
//        },
//        onRelease: function(){
//          this.p2.x = this.p1.x = (this.p2.x + this.p1.x) / 2;
//        }
//      }),

      collage: new Layout({
        onRelease: function(){
          this.p2.y = this.p1.y = (this.p2.y + this.p1.y) / 2;
        }
      })

    };

    for (var key in this.layouts){
      validSortStates.push(key);
    }

    this.sortState = null;
    this.onStateChange = onStateChange;

    this.changeSortState(sortState);
  };

  // Pubic Methods
  window.SortedLayoutContainer.prototype = {
    // Takes two hand positions
    // if the container's current state allows programatic layout (as opposed to manual user layout )
    // will sort the InteractablePlane(s) in the container accordingly (and return true).
    // Update will return false if the current container state does not support
    // programatic layout
    update: function(position1, position2) {

      console.log('update');

      if (this.sortState == 'collage'){
        // todo - DRY this shite.
        var leftmost   = position1.x < position2.x ? position1 : position2;
        var rightmost  = position1.x < position2.x ? position2 : position1;

        this.layouts.collage.p1 = leftmost;
        this.layouts.collage.p2 = rightmost;

        this.layouts.collage.persist();
      }

      if (this.sortState !== 'transitioning'){
        this.changeSortState('transitioning');
      }

      this.update2(position1, position2)

    },

    update2: function(position1, position2) {
      var leftmost   = position1.x < position2.x ? position1 : position2;
      var rightmost  = position1.x < position2.x ? position2 : position1;
//      var topmost    = position1.y < position2.y ? position1 : position2;
//      var bottommost = position1.y < position2.y ? position2 : position1;

      // Figure out the weighting of each layout
      var diff = new THREE.Vector3().subVectors(rightmost, leftmost);
//      var weightX = diff.x / (diff.x + diff.y); // horizontal
//      var weightY = diff.y / (diff.x + diff.y); // vertical
//        var weightX = diff.x / diff.length(); // horizontal
//        var weightY = diff.y / diff.length(); // vertical

//      // todo - these (layout?) objects should not be created here
//      var alphabeticalLayout = listLayout(
//        this.planesAlpha,
//        bottommost,
//        new THREE.Vector3(bottommost.x, topmost.y, bottommost.z)
//      );

      // reposition based off of p1 and p2
//      this.layouts.alpha.update();

      this.layouts.stack.p1.x = leftmost.x;
      this.layouts.stack.p1.y = leftmost.y;
      this.layouts.stack.p1.z = this.z;
      this.layouts.stack.p2.copy(this.layouts.stack.p1);

      this.layouts.collage.p1.x = leftmost.x;
      this.layouts.collage.p1.y = leftmost.y;
      this.layouts.collage.p1.z = this.z;
      this.layouts.collage.p2.copy(leftmost);
      this.layouts.collage.p2.x = rightmost.x;

      this.layouts.collage.weight =  diff.x / 0.2;  // 20 cm
      this.layouts.stack.weight = 1 / this.layouts.collage.weight;

      for (var key in this.layouts){
        this.layouts[key].updatePositions()
      }

      applyLayoutList(
        this.blendLayouts()
      );

    },

    // focuses the existing stuff to the nearest position
    release: function(){
      // todo - snap to position.
      // stack - move p2 to p1
      // collage - make hands horizontal
      // alpha - lock to vertical

      this.changeSortState(
        this.closestLayout()
      );

      var layout = this.layouts[this.sortState];
      // todo - animate
      layout.onRelease(); // updates p1 and p2

      this.update2(layout.p1, layout.p2);

    },

    closestLayout: function(){

      var max = -Infinity, state = this.sortState;

      for (var key in this.layouts){

        if (this.layouts[key].weight > max){
          max = this.layouts[key].weight;
          state = key;
        }

      }

      return state;

    },

    changeSortState: function(newSortState) {
      if (validSortStates.indexOf(newSortState) == -1 || newSortState == this.sortState) {
        return false;
      }
      console.log('change state', newSortState);

      var interactable = (newSortState === "collage");

      // we just grab the plane from the first layout.. not so great, but they all should match up.
      for(var i=0; i<this.layouts.collage.planes.length; i++) {
        this.layouts.collage.planes[i].interactable = interactable;
      }

      this.sortState = newSortState;

      if (this.onStateChange){
        this.onStateChange(newSortState);
      }
    },

    // Adds the given plane to list of planes managed by the container.
    // Returns true if the plane is successfully added.
    // Returns false if the plane is a duplicate and cannot be added.
    addPlane: function(plane) {
      if ( this.sortState !== "collage" ) {
        plane.interactable = false;
      }

      for (var key in this.layouts){
        this.layouts[key].planes.push(plane);
        this.layouts[key].planePositions.push(LayoutNode(plane, plane.mesh.position));
        this.layouts[key].sort();
      }

      return true;
    },

//    // Removes the given plane from the list of planes.
//    // Returns true if the plane was successfully removed.
//    // Returns false if the plane could not be found and was not removed.
//    removePlane: function(toRemove) {
//      var planeIndex;
//      if ( (planeIndex = this.planes.indexOf(toRemove)) != -1 ) {
//        toRemove.interactable = true;
//        this.planes.splice(planeIndex, 1);
//
//        var userIndex;
//        if ( (userIndex = this.userLayout.indexOf(toRemove)) != -1 ) {
//          this.userLayout.splice(userIndex, 1);
//        }
//
//        return true;
//      }
//      else {
//        return false;
//      }
//    },



  // - Returns a weighted mean of the given layout node lists as an array of layout nodes
  // - Assumes that each index of each list in layout lists refers to the
  //   same node.
  // - The length of the weightList and the layoutList must be equal.
    blendLayouts: function(layoutLists, weightList) {

      layoutLists = [];
      weightList = [];

      for (key in this.layouts){
        layoutLists.push(this.layouts[key].planePositions);
        weightList. push(this.layouts[key].weight        );
      }

      var weightSumList = [];
      var vectorSumList = [];
      var blendedLayoutList = [];

      var layoutNode, vectorSum;


      // For each node, calculate the weighted sum of vectors
      // along with the sum of weights.
      for( var i=0; i < layoutLists.length; i++ ) {

        var layoutList = layoutLists[i],
          weight = weightList[i];

        for ( var j=0; j<layoutList.length; j++ ) {
          layoutNode = layoutList[j];

          vectorSum = new THREE.Vector3().copy(layoutNode.position).multiplyScalar(weight);

          if (vectorSumList[j] === undefined) {

            vectorSumList[j] = vectorSum;

          } else {

            vectorSumList[j].add(vectorSum);

          }

          if (weightSumList[j] === undefined) {

            weightSumList[j] = weight;

          } else {

            weightSumList[j] += weight;

          }

        }
      }

      //Calculate the weighted mean for each node
      for ( var i=0; i < vectorSumList.length; i++) {
        var vecSum = vectorSumList[i];
        var plane = layoutLists[0][i].plane;
        var weightSum = weightSumList[i];
        blendedLayoutList[i] = LayoutNode(plane, new THREE.Vector3().copy(vecSum).divideScalar(weightSum));
      }

      return blendedLayoutList;
    }


  };

  // Generates a LayoutNode object which is just a
  // simple structure to hold a plane and the position
  // generated for it.
  function LayoutNode(plane, position) {
    return {
      plane:    plane,
      position: position
    };
  }

  // Iterate through a layout list and move the given elements to the
  // given positions.
  function applyLayoutList(layoutList) {
    for(var i=0; i<layoutList.length; i++) {
      var node = layoutList[i];
      var plane = node.plane;
      plane.mesh.position.copy(node.position);
      plane.lastPosition.copy(node.position);
    }
  }
}).call(this);