angular.module('directives', [])
  .directive('scene', function(vrControls) {
    return {
      restrict: 'E',
      template: '<canvas></canvas>',
      link: function(scope, element, attrs){

        var scene = new THREE.Scene();
        Arrows.scene = scene;

        // Seems weird to have this here? (don't just bung everything in scene.js)
        Leap.loopController.use('boneHand', {
          scene: scene
        });

        var camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          10000
        );

        var canvas = element.find('canvas')[0];
        canvas.style.position = 'absolute';
        canvas.style.top = 0;
        canvas.style.left = 0;

        var renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          canvas: canvas
        });
        renderer.shadowMapEnabled = false;
        renderer.setClearColor(0x202060, 0);

        renderer.setSize(window.innerWidth, window.innerHeight);


        // these would be better off directed as services.  But for now, we use window for message passing.
        window.vrEffect = new THREE.VREffect(renderer);

        vrControls._camera = camera;


        onResize = function() {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', onResize, false);

        // idea - it would be ideal to have a 3d infinite grid - that would be much cooler
        // for now we suffice to a boring old floor.


        var light = new THREE.PointLight(0xffffff, 1, 1000);
        scene.add(light);

        // units - m or mm?
        var geometry = new THREE.CubeGeometry(100, 100, 20);

        var material = new THREE.MeshPhongMaterial({
          color: 0x0000ff
        });

        var cube = new THREE.Mesh(geometry, material);
        cube.position.set(80, 0, -400);
        cube.receiveShadow = true;
        scene.add(cube);


        // how do we know if this is a frame removed from the render loop? -.-
        Leap.loopController.on('hand', function(hand){
          Arrows.show(hand.indexFinger.tipPosition, cube.position);
        });

        var render = function() {
          Arrows.update();
          vrControls.update();
          vrEffect.render(scene, camera);

          requestAnimationFrame(render);
        };

        render();

      }
    };
  });