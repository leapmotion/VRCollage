window.HelpMessage = function(){
  
  var helpWidth = 0.5;
  var helpHeight = 0.18;

  this.helpMaterials = {};
  var helpMaterialNames = ['desktopMode', 'riftMode', 'desktopHover', 'riftHover', 'recordingHover'];
  var matName;
  for (var i = 0; i < helpMaterialNames.length; i++){
    matName = helpMaterialNames[i];
    this.helpMaterials[matName] = THREE.ImageUtils.loadTexture("images/domStates/" + matName + ".png");
  }
  
  var helpMat = new THREE.MeshPhongMaterial({
    wireframe: false,
    color: 0xffffff,
    map: this.helpMaterials['desktopMode'],
    transparent: true,
    opacity: 1
  });

  this.mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(helpWidth, helpHeight),
    helpMat
  );
  this.mesh.name = "helpText";

  this.mesh.addEventListener('click', function(){

    console.log('click', arguments);

    this.setMap('riftMode');

  }.bind(this));

//  this.mesh.addEventListener('mouseover', onMouseover);
//  this.mesh.addEventListener('mouseout', onMouseout);

};

window.HelpMessage.prototype = {
  
  setMap: function(mapName){
    this.mesh.map = this.helpMaterials[mapName];
    this.mesh.needsUpdate = true;
  }
  
};