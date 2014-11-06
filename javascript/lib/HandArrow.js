(function() {

  window.HandArrow = function(parent) {
    this.parent = parent;
    this.mesh = undefined;

    new THREE.ObjectLoader().load("meshes/MozillaVR-3D-arrow-01.json", function(mesh) {
      this.mesh = mesh;
      this.mesh.position.set(0,0,-0.2);
      this.mesh.material = new THREE.MeshPhongMaterial( { color: 0x00FF00, shading: THREE.SmoothShading } );
      this.mesh.scale.set(0.03,0.03,0.03);
      this.parent.add(this.mesh);
      console.log("ADDED ARROW MESH");
    }.bind(this));
  };

  window.HandArrow.prototype = {
    update: function(toFollow, toPointTo) {
      if ( this.mesh !== undefined ) {
        // TODO: do some stuff.
      }

    }
  };
}).call(this);