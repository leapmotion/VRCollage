/**
 * @author Kaleb Murphy
 */

THREE.RingGeometry = function ( innerRadius, outerRadius, thetaSegments, phiSegments, thetaStart, thetaLength ) {

	THREE.Geometry.call( this );

	this.innerRadius = innerRadius = innerRadius || 0;
	this.outerRadius = outerRadius = outerRadius || 50;

	this.thetaStart = thetaStart = thetaStart !== undefined ? thetaStart : 0;
	this.thetaLength = thetaLength = thetaLength !== undefined ? thetaLength : Math.PI * 2;

	this.thetaSegments = thetaSegments = thetaSegments !== undefined ? Math.max( 3, thetaSegments ) : 8;
	this.phiSegments = phiSegments = phiSegments !== undefined ? Math.max( 1, phiSegments ) : 8;

	var i, o, uvs = [], radius = innerRadius, radiusStep = ( ( outerRadius - innerRadius ) / phiSegments );

	for ( i = 0; i < phiSegments + 1; i ++ ) { // concentric circles inside ring

		for ( o = 0; o < thetaSegments + 1; o ++ ) { // number of segments per circle

			var vertex = new THREE.Vector3();
			var segment = thetaStart + o / thetaSegments * thetaLength;
			vertex.x = radius * Math.cos( segment );
			vertex.y = radius * Math.sin( segment );

			this.vertices.push( vertex );
			uvs.push( new THREE.Vector2( ( vertex.x / outerRadius + 1 ) / 2, ( vertex.y / outerRadius + 1 ) / 2 ) );
		}

		radius += radiusStep;

	}

	var n = new THREE.Vector3( 0, 0, 1 );

	for ( i = 0; i < phiSegments; i ++ ) { // concentric circles inside ring

		var thetaSegment = i * (thetaSegments + 1);

		for ( o = 0; o < thetaSegments ; o ++ ) { // number of segments per circle

			var segment = o + thetaSegment;

			var v1 = segment;
			var v2 = segment + thetaSegments + 1;
			var v3 = segment + thetaSegments + 2;

			this.faces.push( new THREE.Face3( v1, v2, v3, [ n.clone(), n.clone(), n.clone() ] ) );
			this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ].clone(), uvs[ v2 ].clone(), uvs[ v3 ].clone() ]);

			v1 = segment;
			v2 = segment + thetaSegments + 2;
			v3 = segment + 1;

			this.faces.push( new THREE.Face3( v1, v2, v3, [ n.clone(), n.clone(), n.clone() ] ) );
			this.faceVertexUvs[ 0 ].push( [ uvs[ v1 ].clone(), uvs[ v2 ].clone(), uvs[ v3 ].clone() ]);

		}
	}

	this.computeFaceNormals();

	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );

};

THREE.RingGeometry.prototype = Object.create( THREE.Geometry.prototype );

// This looks doable with:
// http://stackoverflow.com/questions/10330342/threejs-assign-different-colors-to-each-vertex-in-a-geometry
// but - more work than I want to do right now
THREE.RingGeometry.prototype.setThetaLength = function(thetaLength){

//  this.thetaLength = thetaLength;


  var i, o, uvs = [], radius = this.innerRadius, radiusStep = ( ( this.outerRadius - this.innerRadius ) / this.phiSegments );

	for ( i = 0; i < this.phiSegments + 1; i ++ ) { // concentric circles inside ring

		for ( o = 0; o < this.thetaSegments + 1; o ++ ) { // number of segments per circle

			var vertex = this.vertices[i + o]; // maybe i need to query vertex indices here.
			var segment = this.thetaStart + o / this.thetaSegments * this.thetaLength;
			vertex.x = radius * Math.cos( segment );
			vertex.y = radius * Math.sin( segment );

			uvs.push( new THREE.Vector2( ( vertex.x / this.outerRadius + 1 ) / 2, ( vertex.y / this.outerRadius + 1 ) / 2 ) );
		}

		radius += radiusStep;

	}



 	this.computeFaceNormals();

 	this.boundingSphere = new THREE.Sphere( new THREE.Vector3(), radius );

  this.verticesNeedUpdate = true;
  this.elementsNeedUpdate = true;
  this.morphTargetsNeedUpdate = true;
  this.uvsNeedUpdate = true;
  this.normalsNeedUpdate = true;
  this.colorsNeedUpdate = true;
  this.tangentsNeedUpdate = true;
  this.dynamic = true;


}