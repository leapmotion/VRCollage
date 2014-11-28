
// Determiens if a given point is to one side or the other of the plane
// Does this by transforming both the point and the plane to flat space,
// and comparing x and y values
// Returns false if not overlapping
// Or a number distance from plane, in the direction of the plane normal
// Could also return x and y offset pretty easily, if desired
THREE.Mesh.prototype.pointOverlap = function(point){

  // todo - find a way to memoize this operation...
  // also, make sure there's no frame lag in matrixWorld
  var inverseMatrix = (new THREE.Matrix4).getInverse(this.matrixWorld);
  
  // todo memoize this as well
  var cornerPositions = this.corners();
  
  point.applyMatrix4(inverseMatrix);
  
  if ( cornerPositions[3].y < point.y &&
       point.y < cornerPositions[0].y &&
       cornerPositions[3].x < point.x &&
       point.x < cornerPositions[2].x ){

    return point.z;

  }

  return false;

};