angular.module('directives', [])
  .directive('scene', function() {
    return {
      restrict: 'E',
      template: '<canvas></canvas>',
      link: function(scope, element, attrs){

        var scene = new THREE.Scene();

        var camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          10000
        );

        var canvas = element.find('canvas')[0];

        var renderer = new THREE.WebGLRenderer({
          antialias: true,
          canvas: canvas
        });
        renderer.shadowMapEnabled = true;

        renderer.setSize(window.innerWidth, window.innerHeight);

        window.vrEffect = new THREE.VREffect(renderer);

        window.vrControls = new THREE.VRControls(camera);


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
        var geometry = new THREE.CubeGeometry(75, 75, 16);

        var material = new THREE.MeshPhongMaterial({
          color: 0x0000ff
        });

        var cube = new THREE.Mesh(geometry, material);
        cube.position.set(80, 0, -400);
        cube.receiveShadow = true;
        scene.add(cube);



        var render = function() {
          cube.rotation.x += 0.004;
          cube.rotation.y += 0.002;
          vrControls.update();
          vrEffect.render(scene, camera);

          requestAnimationFrame(render);
        };

        render();

      }
    };
  });