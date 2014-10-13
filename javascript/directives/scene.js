angular.module('directives', [])
  .directive('scene', function(vrControls) {
    return {
      restrict: 'E',
      template: '<canvas></canvas>',
      link: function(scope, element, attrs){

        window.plotter = new LeapDataPlotter();

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
        var geometry = new THREE.BoxGeometry(100, 100, 20);

        var material = new THREE.MeshPhongMaterial({
          color: 0x0000ff
        });

        var box = new THREE.Mesh(geometry, material);
        box.position.set(-20, 0, -300);
        scene.add(box);
        new InteractableBox(box, Leap.loopController);

        var render = function() {
          Arrows.update();
          vrControls.update();
          vrEffect.render(scene, camera);

//          plotter.update();
          requestAnimationFrame(render);
        };

        render();

      }
    };
  });