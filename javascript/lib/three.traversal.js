// Takes in a callback.  Returns true if all ancestors have it true.
// e.g., myObject.allAncestors(function(){
//  return this.visible
// });
THREE.Object3D.prototype.allAncestors = function(callback){
  return callback.call(this) && ( !this.parent || this.parent.allAncestors(callback) );
};