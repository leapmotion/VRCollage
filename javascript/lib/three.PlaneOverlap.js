
// Determiens if a given point is to one side or the other of the plane
// Does this by transforming both the point and the plane to flat space,
// and comparing x and y values
// Returns undefined if not overlapping
// Or a number distance from plane, in the direction of the plane normal
// Could also return x and y offset pretty easily, if desired
THREE.Mesh.prototype.pointOverlap = function(point, inverseMatrix){

  inverseMatrix || (inverseMatrix = (new THREE.Matrix4).getInverse(this.matrixWorld));

  return this.geometry.pointOverlap(
    point.applyMatrix4(inverseMatrix)
  )

};

THREE.PlaneGeometry.prototype.pointOverlap = function(point){

  var cornerPositions = this.corners();

  if ( cornerPositions[3].y < point.y &&
       point.y < cornerPositions[0].y &&
       cornerPositions[3].x < point.x &&
       point.x < cornerPositions[2].x ){

    return point.z;

  }

  // We return undefined here to explicitly prevent any math. (false or null == 0).
  return undefined;

};

// Note that this works so nicely because point has already had inverseMatrixWorld applied,
// Causing it to have a 0 origin. :-)
THREE.CircleGeometry.prototype.pointOverlap = function(point){

  return this.parameters.radius > point.length() ? point.z : undefined;

  // To get dish effect:
  //return this.parameters.radius > point.length() ? point.z + ((this.parameters.radius - point.length()) / 2 ) : undefined;

};