// File:src/extras/geometries/SphereGeometry.js

THREE.SphereGeometry.prototype.setPhiLength = function(phiLength){

  this.parameters.phiLength = phiLength;

  var heightSegments  = this.parameters.heightSegments,
      widthSegments   = this.parameters.widthSegments,
      radius          = this.parameters.radius,
      phiStart        = this.parameters.phiStart,
      thetaLength     = this.parameters.thetaLength,
      thetaStart      = this.parameters.thetaStart;


  var x, y;

  	for ( y = 0; y <= heightSegments; y ++ ) {

  		for ( x = 0; x <= widthSegments; x ++ ) {

  			var u = x / widthSegments;
  			var v = y / heightSegments;

  			var vertex = this.vertices[(y * (widthSegments + 1)) + x];
        vertex.x = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
  			vertex.y = radius * Math.cos( thetaStart + v * thetaLength );
  			vertex.z = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

  		}

  	}

  this.verticesNeedUpdate = true;

};