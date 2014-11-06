(function() {

  window.HandArrow = function(parent) {
    this.followRadius = 0.5;
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
        var diff = new THREE.Vector3().copy(toPointTo).sub(toFollow);
        var direction = new THREE.Vector3().copy(diff).normalize();
        this.mesh.position = new  THREE.Vector3().copy(toFollow).add(new THREE.Vector3().copy(direction).multiplyScalar(diff.length() / 2.0));
      }

    }
  };
}).call(this);