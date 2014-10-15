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

        var images = [
           "LARGE-3-175 UP3618 mallet 1929.tif.jpg                   ",
           "LARGE-3-420 oiling 9000.Tif.jpg                          ",
           "LARGE-6 sideview 9000.Tif.jpg                            ",
           "LARGE-7-40 depot Omaha Stimson.Tif.jpg                   ",
           "LARGE-7-67 coach shop.tif.jpg                            ",
           "LARGE-7-160 Durant FD 1910.tif.jpg                       ",
           "LARGE-68-13 UP3703 mallet 1918.tif.jpg                   ",
           "LARGE-68-80 Council Bluffs no date.jpg.jpg               ",
           "LARGE-001347H tour buses-1.psd.jpg                       ",
           "LARGE-1791A M10000 overhead.Tif.jpg                      ",
           "LARGE-1802 poster BW M10000 progress.Tif.jpg             ",
           "LARGE-5127A LA Ltd SPA semaphores.Tif.jpg                ",
           "LARGE-10233 through the pipe.tif.jpg                     ",
           "LARGE-14618 UP9026 Archer.tif.jpg                        ",
           "LARGE-73069 Lane cutoff.tif.jpg                          ",
           "LARGE-73209 4-4-2 SFA 97.tif.jpg                         ",
           "LARGE-74688  Children's Book of Yellowstone Bears.jpg.jpg",
           "LARGE-74690 poster Zion.tif.jpg                          ",
           "LARGE-74694 ad Grand Canyon.Tif.jpg                      ",
           "LARGE-504590 Joseph ag train.jpg.jpg                     ",
           "LARGE-ag train Pilot Rock OWRN.jpg.jpg                   ",
           "LARGE-CoP Rochester NY .tif.jpg                          ",
           "LARGE-EHHarriman Sale of UP.tif.jpg                      ",
           "LARGE-H7-74 Omaha Shop emp 1908.tif.jpg                  ",
           "LARGE-LA Ltd SPA crew 3413.Tif.jpg                       ",
           "LARGE-Lane cutoff fill .tif.jpg                          ",
           "LARGE-lane cutoff.jpg.jpg                                ",
           "LARGE-Mountain type 4-8-2.tif.jpg                        ",
           "LARGE-Omaha Shop ext air 1907.tif.jpg                    ",
           "LARGE-Omaha stores dept 1912.tif.jpg                     ",
           "LARGE-Papio trestle construction.tif.jpg                 ",
           "LARGE-PFE cars ice dock.tif.jpg                          ",
           "LARGE-PFE Las Vegas 1931.tif.jpg                         ",
           "LARGE-SPLA&SL #504.tif.jpg                               ",
           "LARGE-Streamliner 3 locos.Tif.jpg                        ",
           "LARGE-UP SP office KC.tif.jpg                            ",
           "LARGE-X1729 No 4038 near Truckee.tif.jpg                 ",
           "LARGE-X2313 Excursion Midlake.tif.jpg                    ",
           "LARGE-Zoin Lodge opening 04-15-25.tif.jpg                "
        ];

        // units - m or mm?
        var geometry = new THREE.BoxGeometry(100, 100, 20);

        var material = new THREE.MeshPhongMaterial({
          map: THREE.ImageUtils.loadTexture("images/" + images[0])
        });
//
//        var box = new THREE.Mesh(geometry, material);
//        box.position.set(-20, 0, -300);
//        scene.add(box);
//        new InteractableBox(box, Leap.loopController);
//
//
//        var box2 = new THREE.Mesh(geometry, material);
//        box2.position.set(-120, 40, -300);
//        scene.add(box2);
//        new InteractableBox(box2, Leap.loopController);


        /**
         * Parameters:
         *  dir - Vector3
         *  origin - Vector3
         *  length - Number
         *  color - color in hex value
         *  headLength - Number
         *  headWidth - Number
         */

        var pts = [];//points array - the path profile points will be stored here
        var detail = Math.PI / 3 / 10; //half-circle detail - how many angle increments will be used to generate points
        var radius = 20;//radius for half_sphere

        for(var angle = 0.0; angle < Math.PI / 3 ; angle+= detail) //loop from 0.0 radians to PI (0 - 180 degrees)
            pts.push(
              new THREE.Vector3(
                  Math.cos(angle) * radius,
                  0,
                  Math.sin(angle) * radius)
            ); //angle/radius to x,z

        geometry = new THREE.LatheGeometry(
          pts,
          24,
          0,
          Math.PI
        );//create the lathe with 12 radial repetitions of the profile

        var geometry = new THREE.RingGeometry( 15, 50, 8, 4 );
        window.ring = geometry;

//        var material = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
//        var mesh = new THREE.Mesh( geometry, material );
//        scene.add( mesh );

        var testLathe = new THREE.Mesh(
          geometry, new THREE.MeshPhongMaterial({
            color: 0xff0000,
            wireframe: true
          })
        );

        testLathe.position.set(-20, 0, -300)
        scene.add(testLathe);
        window.ringMesh = testLathe;

        var cursor = new THREE.ArrowHelper(
          new THREE.Vector3(1,1,1),
          new THREE.Vector3(-20, 0, -300),
          100,
          0xff0000
        );
        scene.add(cursor);

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