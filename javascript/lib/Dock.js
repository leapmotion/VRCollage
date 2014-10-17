(function() {

// A few hard-coded assumptions:
// The dock is on the left, and items slide to the right
window.Dock = function(scene, planeMesh, controller, options){
  this.plane = new InteractablePlane(planeMesh, controller, options);
  var halfHeight = planeMesh.geometry.parameters.height / 2;
  this.plane.constrainMovement({y: function(y){ return ( y < halfHeight && y > - halfHeight ) }});

  this.mesh = planeMesh;
  this.scene = scene;
  this.controller = controller;

  this.images = [];
  this.padding = 4;

  this.activationDistance = 50; // distance an image must be drawn out to be free.
};

window.Dock.prototype = {

  pushImage: function(url){

    THREE.ImageUtils.loadTexture(url, undefined, function(texture){
        var width = this.mesh.geometry.parameters.width; // scale will be inherited.  Let's never scale dock so that we
        // don't have to compensate when removing item from dock.
        var scale = isNaN(width) ? 1 / 4 : width / texture.image.width;

        var imgGeometry = new THREE.PlaneGeometry(texture.image.width * scale, texture.image.height * scale);
        var material = new THREE.MeshPhongMaterial({map: texture});

        var imageMesh = new THREE.Mesh(imgGeometry, material);
        imageMesh.name = url;

        var yPosition = (this.mesh.geometry.parameters.height / 2) - (imgGeometry.parameters.height / 2 + this.padding );
        var lastImage = this.images[this.images.length - 1];
        if (lastImage){
          yPosition = lastImage.mesh.position.y - (lastImage.mesh.geometry.parameters.height / 2) - (imgGeometry.parameters.height / 2) - this.padding * 2;
        }
        imageMesh.position.set(0, yPosition, (this.images.length + 1) * 0.1);

        this.mesh.add(imageMesh);

        var image = new InteractablePlane(imageMesh, this.controller, {moveZ: false, moveY: false});
        image.constrainMovement({x: function(x){ return x > 0 } });
        image.originalPosition = imageMesh.position.clone();
        this.images.push(image);

        image.travel( this.onImageTravel.bind(this) );
        image.release( this.onRelease.bind(this) );

      }.bind(this)
    );

  },

  onImageTravel: function(interactablePlane, imageMesh){
    if (imageMesh.parent === this.mesh && imageMesh.position.x > this.activationDistance){

      interactablePlane.changeParent(this.scene);

      // remove constraints:
      interactablePlane.options.moveY = true;
      interactablePlane.options.moveZ = true;
      interactablePlane.clearMovementConstraints();

    }
  },

  // snap back in to position
  onRelease: function(interactablePlane){

    if (interactablePlane.mesh.parent !== this.mesh) return;

    interactablePlane.mesh.position.copy(interactablePlane.originalPosition);

  }

}

}).call(this);