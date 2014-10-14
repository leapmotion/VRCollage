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
THREE.Mesh.prototype.setCorner = function(cornerNo, newCornerPosition, preserveAspectRatio){

  var c = this.corners(cornerNo);

  var iinterimScale = this.scale;
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

  // p'
  this.position.copy(
    newCornerPosition.clone().sub(
      this.scale.clone().multiply(c)
    )
  );


  if (preserveAspectRatio){

    var scalePrime = this.scale;

    // to preserve aspect ratio
    // figure out the limiting side
    // multiply to get effective newCorner position
    // for now, just do xy

    var aspect = this.geometry.parameters.width / this.geometry.parameters.height;

    // aspect needs to be off of new center position.
    // new aspect = previous aspect * scale
    var requestedAspect = (this.geometry.parameters.width * this.scale.x) / (this.geometry.parameters.height * this.scale.y);


    if (requestedAspect > aspect){
      // too wide
      // use current height
      // multiply for width

      this.scale.x = aspect * (this.geometry.parameters.height * this.scale.y) / this.geometry.parameters.width;

    } else { // too tall

      this.scale.y = (this.geometry.parameters.width * this.scale.x) / aspect / this.geometry.parameters.height;

    }

    // reverse this out to get a new newCornerPosition
    // and re-apply scale calculation

    // if there is no change in scale, this should have no effect.
    newCornerPosition.copy(
      this.position.clone()
        .add(
          c.clone().multiply(
            this.scale.clone().multiplyScalar(2).sub(iinterimScale)
          )
        )
    );

  //  newCornerPosition.copy(
  //    this.position.clone()
  //      .add(
  //        c.clone().multiply(
  //          this.scale.clone().multiplyScalar(2).sub(scalePrime)
  //        )
  //      )
  //  );
  }


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