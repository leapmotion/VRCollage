// Adds a method to a PlaneGeometry which figures out if a line segment intersects it.



// http://en.wikipedia.org/wiki/Line-plane_intersection
// - calculate d (intersection point)
// - see if point is on line segment (add vectors A B C)
//   http://stackoverflow.com/questions/328107/how-can-you-determine-a-point-is-between-two-other-points-on-a-line-segment
// - see if point is on plane segment (dot product of vectors to corners should be positive)
//   http://stackoverflow.com/questions/9638064/check-if-a-point-is-inside-a-plane-segment
//   Sort of like ^^, we transform our four corners to a flat x,y space with the bottom left at 0,0,
//   and compare components of the point d (intersectionPoint)

// Returns the intersectionPoint is it is intersecting
// Returns false otherwise.
THREE.Mesh.prototype.intersectedByLine = function(lineStart, lineEnd){

  if ( ! (this.geometry instanceof THREE.PlaneGeometry ) ) {
    throw "Not sure if geometry is supported"
  }

  var p0 = this.position;
  var l0 = lineStart;
  // the normal of any face will be the normal of the plane.
  var n  = this.geometry.faces[0].normal.clone().applyMatrix4(this.matrixWorld); // but.. these need to be transformed by matrix?
  var l = lineEnd.clone().sub(lineStart);  // order shouldn't matter here.  And they didn't SAY normalize.

  var numerator = p0.clone().sub(l0).dot(n);
  var denominator = l.dot(n);

  if (numerator === 0){
    // no intersection or intersects everywhere.
    return false;
  }

  if (denominator === 0){
    // parallel
    return false;
  }

  var intersectionPoint = l.clone().multiplyScalar(numerator / denominator).add(l0);

  // see if point is on line segment (add vectors A B C)

  // a,b = lineEnds 1,2
  // c = interSectionPoint

  var dot = lineEnd.clone().sub(lineStart).dot(
    intersectionPoint.clone().sub(lineStart)
  );

  if (dot < 0) return false;

  var lengthSq = lineEnd.clone().sub(lineStart).lengthSq();

  if (dot > lengthSq) return false;

  // we're on the line!

  // see if point is on the plane segment.

  var inverseMatrix = (new THREE.Matrix4).getInverse(this.matrixWorld);

  // mesh.corners() does not (currently) memoize values
  var corners = this.corners();

  for (var i = 0; i < corners.length; i++){

    // technically, there's an unused corner inversion here. - the top right.
    corners[i].applyMatrix4(inverseMatrix);

  }

  // convert point by multiplying by the inverse of the plane's transformation matrix. hope.
  var intersectionPoint2d = intersectionPoint.clone().applyMatrix4(inverseMatrix); // clone may be unnecessary here.

  // check y bottom up, then x left rightwards
  if ( corners[3].y < intersectionPoint2d.y &&
       intersectionPoint2d.y < corners[0].y &&
       corners[3].x < intersectionPoint2d.x &&
       intersectionPoint2d.x < corners[2].x ){

    return intersectionPoint;

  }


  return false;

};