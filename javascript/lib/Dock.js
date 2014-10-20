(function() {

// A few hard-coded assumptions:
// The dock is on the left, and items slide to the right
window.Dock = function(scene, planeMesh, controller, options){
  (options.moveZ === undefined) && (options.moveZ = false);
  (options.moveY === undefined) && (options.moveY = false);

  this.plane = new InteractablePlane(planeMesh, controller, options);
  var halfHeight = planeMesh.geometry.parameters.height / 2;
  var halfWidth  = planeMesh.geometry.parameters.width  / 2;
  this.plane.constrainMovement({x: function(x){ return ( x < halfWidth && x > - halfWidth ) }});

  this.mesh = planeMesh;
  this.scene = scene;
  this.controller = controller;

  this.images = [];
  this.padding = 4;

  this.activationDistance = 50; // distance an image must be drawn out to be free.
  this.imageMinHeight = -33;
};

window.Dock.prototype = {

  pushImage: function(url){

    THREE.ImageUtils.loadTexture(url, undefined, function(texture){
        var height = this.mesh.geometry.parameters.height; // scale will be inherited.  Let's never scale dock so that we
        // don't have to compensate when removing item from dock.
        var scale = isNaN(height) ? 1 / 4 : height / texture.image.height;

        var imgGeometry = new THREE.PlaneGeometry(texture.image.width * scale, texture.image.height * scale);
        var material = new THREE.MeshPhongMaterial({map: texture});

        var imageMesh = new THREE.Mesh(imgGeometry, material);
        imageMesh.name = url;

        imageMesh.position.set(0, this.imageMinHeight, (this.images.length + 1) * 0.1);
        this.mesh.add(imageMesh);

        var image = new InteractablePlane(imageMesh, this.controller, {moveZ: false, moveX: false});
        image.constrainMovement({y: function(y){ return y > this.imageMinHeight}.bind(this) });
        this.images.push(image);

        this.arrangeImages();

        image.travel( this.onImageTravel.bind(this) );
        image.release( this.onRelease.bind(this) );

      }.bind(this)
    );

  },

  arrangeImages: function(){
    var imageMesh, lastImage, xPosition;

    for (var i = 0; i < this.images.length; i++){
      imageMesh = this.images[i].mesh;
      lastImage = this.images[i - 1] && this.images[i - 1].mesh;
      if (lastImage){
        xPosition = lastImage.position.x + (lastImage.geometry.parameters.width / 2) + (imageMesh.geometry.parameters.width / 2) + this.padding;
      } else {
        xPosition = - (this.mesh.geometry.parameters.width / 2) + (imageMesh.geometry.parameters.width / 2 + this.padding );
      }
      imageMesh.position.setX(xPosition);
      this.images[i].originPosition = imageMesh.position.clone();

    }
  },

  onImageTravel: function(interactablePlane, imageMesh){
    if (imageMesh.parent === this.mesh && imageMesh.position.y > this.activationDistance){

      interactablePlane.changeParent(this.scene);

      // remove constraints:
      interactablePlane.options.moveX = true;
      interactablePlane.options.moveZ = true;
      interactablePlane.clearMovementConstraints();



      for (var i = 0; i < this.images.length; i++){
        if (this.images[i] === interactablePlane){
          this.images.splice(i,1);
          break;
        }
      }

// this causes the images to jump down too quickly, and be grabbed.
//      this.arrangeImages();

      // this is crappy to have here
      this.scene.getObjectByName( "text").visible = false;

    }
  },

  // snap back in to position
  onRelease: function(interactablePlane){

    if (interactablePlane.mesh.parent !== this.mesh) return;

    console.assert(interactablePlane.originPosition);

    interactablePlane.mesh.position.copy(interactablePlane.originPosition);

  }

}

}).call(this);