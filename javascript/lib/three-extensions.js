// Some custom extensions for THREE.js


(function() {

// Returns the positions of all the corners of the box
// Uses CSS ordering conventions: CW from TL.  First front face corners, then back.
// http://stackoverflow.com/questions/15302603/three-js-get-the-4-corner-coordinates-of-a-cube
// returns the relative corner positions, unaffected by scale of the box.
THREE.BoxGeometry.prototype.corners = function(){
  this._corners || (this._corners = [
    new THREE.Vector3,
    new THREE.Vector3,
    new THREE.Vector3,
    new THREE.Vector3,
    new THREE.Vector3,
    new THREE.Vector3,
    new THREE.Vector3,
    new THREE.Vector3
  ]);

  var halfWidth  = this.parameters.width  / 2,
      halfHeight = this.parameters.height / 2,
      halfDepth  = this.parameters.depth  / 2;

  this._corners[0].set( - halfWidth, + halfHeight, + halfDepth);
  this._corners[1].set( + halfWidth, + halfHeight, + halfDepth);
  this._corners[2].set( + halfWidth, - halfHeight, + halfDepth);
  this._corners[3].set( - halfWidth, - halfHeight, + halfDepth);
  this._corners[4].set( - halfWidth, + halfHeight, - halfDepth);
  this._corners[5].set( + halfWidth, + halfHeight, - halfDepth);
  this._corners[6].set( + halfWidth, - halfHeight, - halfDepth);
  this._corners[7].set( - halfWidth, - halfHeight, - halfDepth);

  return this._corners

};

// Doesn't change any other corner positions
// scale is a factor of change in corner position, from the original corner position.
THREE.Mesh.prototype.setCorner = function(cornerNo, newCornerPosition){

  var c = this.corners(cornerNo);

  // this works. Has some error.
  // Formulation is here:
  // https://drive.google.com/file/d/0B7cqxyA6LUpUcmd5MWtfc2JULTg/view
  this.scale.copy(
    (
      (
        newCornerPosition.clone().sub(this.position).divide(c)
      ).add(this.scale)
    ).divideScalar(2)
  );

  this.position.copy(
    newCornerPosition.clone().sub(
      this.scale.clone().multiply(c)
    )
  );

};

THREE.Mesh.prototype.corners = function(num){

  if (!this.geometry instanceof THREE.BoxGeometry){
    console.warn('Unsupported geometry for #corners()');
    return
  }

  if (!isNaN(num)){
    return this.geometry.corners()[num]
  }else{
    return this.geometry.corners()
  }


};

}).call(this);