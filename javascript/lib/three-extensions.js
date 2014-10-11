// Some custom extensions for THREE.js

// http://stackoverflow.com/questions/15302603/three-js-get-the-4-corner-coordinates-of-a-cube


// Returns the positions of all the corners of the box
// Uses CSS ordering conventions: CW from TL.  First front face corners, then back.
THREE.BoxGeometry.prototype.corners = function(position){
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

  var halfWidth = this.parameters.width / 2, halfHeight = this.parameters.height / 2, halfDepth = this.parameters.depth / 2;

  this._corners[0].set(position.x - halfWidth, position.y + halfHeight, position.z + halfDepth);
  this._corners[1].set(position.x + halfWidth, position.y + halfHeight, position.z + halfDepth);
  this._corners[2].set(position.x + halfWidth, position.y - halfHeight, position.z + halfDepth);
  this._corners[3].set(position.x - halfWidth, position.y - halfHeight, position.z + halfDepth);
  this._corners[4].set(position.x - halfWidth, position.y + halfHeight, position.z - halfDepth);
  this._corners[5].set(position.x + halfWidth, position.y + halfHeight, position.z - halfDepth);
  this._corners[6].set(position.x + halfWidth, position.y - halfHeight, position.z - halfDepth);
  this._corners[7].set(position.x - halfWidth, position.y - halfHeight, position.z - halfDepth);

  return this._corners

}

THREE.Mesh.prototype.corners = function(){

  if (!this.geometry instanceof THREE.BoxGeometry){
    console.warn('Unsupported geometry for #corners()')
    return
  }

  return this.geometry.corners(this.position)

};