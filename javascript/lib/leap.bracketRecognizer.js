// Takes in camera object, from which it will call #position
// Waits for hand pose
// Emits pose start, update, and end events
// The pose is described as
// Maximize dot product of index and thumb distal bones.  This will describe a right angle.
// Minimize dot product of hand normal and direction from camera to palmPosition.
//   This will describe hands flat to the viewer.  (Think of it in polar space)
// There will be a rotated frame corrosponding to the direction to the palm and the camera's up vector.
// Comparing the thumb and index to this will allow "lock in" at right-angles.
// Will return the bracket angle rounded to the nearest PI / 2, and the current offset from that ideal,
// and the basis between the hand and the camera.
Leap.plugin("handBrackets", function(scope){

  return {}

});