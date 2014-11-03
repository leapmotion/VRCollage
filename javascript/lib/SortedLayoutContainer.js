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

//The external API for the object is:
// - Update( Vec3 hand1Position, Vec3 hand2Position)
//   Update takes two hand positions and if the container's current
//   state allows programatic layout ( as opposed to manual user layout  )
//   will sort the InteractablePlane(s) in the container accordingly
//
//  Update will return false if the current container state does not support
//  programatic layout
//
// - AddPlane( InteractablePlane newPlane )
//   AddPlane will add the given plane to list of planes managed by the container.
//
// - RemovePlane( InteractablePLane toRemove )
//   RemovePlane will remove the given plane from the list of planes.


(function () {
  // SortedLayoutContainer Constructor
  // Optional argument "planeList" is a list of InteractivePlanes to be added to the container on creation
  window.SortedLayoutContainer = function(planeList){
    this.planeList = planeList || [];

  };

  window.SortedLayoutContainer.prototype = {
    update: function(hand1Position, hand2Position) {

    },

    addPlane: function(newPlane) {

    },

    removePlane: function(newPlane) {

    }
  };
}).call(this);