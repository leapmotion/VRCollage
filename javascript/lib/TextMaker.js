(function() {

window.createText = function(text, options) {

  options || (options = {});

  var color = options.color || 0xaaaaaa;

  options.size || (options.size = 20);
  options.height || (options.height = 2);
  options.curveSegments || (options.curveSegments = 4);
  options.bevelThickness || (options.bevelThickness = 1.5);
  options.bevelSize || (options.bevelSize = 1.5);
  options.bevelEnabled || (options.bevelEnabled = 2);

  var material = new THREE.MeshFaceMaterial( [
    new THREE.MeshPhongMaterial( { color: color, shading: THREE.FlatShading } ), // front
    new THREE.MeshPhongMaterial( { color: color, shading: THREE.SmoothShading } ) // side
  ] );

  var textGeo = new THREE.TextGeometry( text, options );

  textGeo.computeBoundingBox();
  textGeo.computeVertexNormals();

  var mesh = new THREE.Mesh( textGeo, material );
  mesh.name = "text";

  mesh.position.x = -0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

  return mesh;
}



}).call(this);