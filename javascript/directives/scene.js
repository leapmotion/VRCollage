(function() {


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
   "LARGE-SPLAandSL num504.tif.jpg                             ",
   "LARGE-Streamliner 3 locos.Tif.jpg                        ",
   "LARGE-UP SP office KC.tif.jpg                            ",
   "LARGE-X1729 No 4038 near Truckee.tif.jpg                 ",
   "LARGE-X2313 Excursion Midlake.tif.jpg                    ",
   "LARGE-Zoin Lodge opening 04-15-25.tif.jpg                "
];

angular.module('directives', [])
  .directive('scene', function(vrControls) {
    return {
      restrict: 'E',
      template: '<canvas></canvas>',
      link: function(scope, element, attrs){

        window.plotter = new LeapDataPlotter();

        var scene = new THREE.Scene();
        Arrows.scene = scene;

        var camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          10000
        );

        //we don't actually want the leap hand as child of the camera, as we want the data itself properly transformed.
        // on every frame, we combine the base transformation with the camera transformation to the leap data
        // this is used in grab, proximity, etc.
        Leap.loopController.plugins.boneHand.scene = scene;
        Leap.loopController.plugins.transform.effectiveParent = camera;

        var canvas = element.find('canvas')[0];
        canvas.style.position = 'absolute';
        canvas.style.top = 0;
        canvas.style.left = 0;

        var renderer = new THREE.WebGLRenderer({
          antialias: true,
          canvas: canvas
        });
        renderer.shadowMapEnabled = false;
        renderer.setClearColor(0x000000, 0);

        renderer.setSize(window.innerWidth, window.innerHeight);


        var transformPlugin = Leap.loopController.plugins.transform;
        // these would be better off directed as services.  But for now, we use window for message passing.
        window.vrEffect = new THREE.VREffect(renderer, null, {
          onWindowed: function(){
            Leap.loopController.setOptimizeHMD(false);
             transformPlugin.quaternion = window.DesktopTransformation.quaternion;
             transformPlugin.position   = window.DesktopTransformation.position;
             transformPlugin.scale      = window.DesktopTransformation.scale;
          },
          onFullscreen: function(){
            Leap.loopController.setOptimizeHMD(true);

            transformPlugin.quaternion = window.HMDTransformation.quaternion;
            transformPlugin.position   = window.HMDTransformation.position;
            transformPlugin.scale      = window.HMDTransformation.scale;
          }
        });

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


        var dockWidth = 150;
        var dockHeight = dockWidth / 750 * 2588;


        var dockMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(dockWidth, dockHeight),
          new THREE.MeshPhongMaterial({
            wireframe: false,
            color: 0x222222//,
//            map: THREE.ImageUtils.loadTexture("images/steam-engine-search.png")
          })
        );
        dockMesh.name = "dock";

//        dockMesh.position.set(-90, 130 - dockHeight / 2, -300);
        // while the dock is not attached to the camera, move it closer
        dockMesh.position.set(-90, 130 - dockHeight / 2, -200);

//        dockMesh.rotation.set(0, Math.PI / 4, 0, 0);
        // leap proximity does not at all do well with angled objects.

        // for now, we don't create a scrollable object, but just let it be moved in the view
        var dock = new Dock(scene, dockMesh, Leap.loopController, {
          resize: false,
          moveZ: false,
          moveX: false
        });

        dock.pushImage("images/" + images[Math.floor(Math.random()*images.length)]);
        dock.pushImage("images/" + images[Math.floor(Math.random()*images.length)]);
        dock.pushImage("images/" + images[Math.floor(Math.random()*images.length)]);
        dock.pushImage("images/" + images[Math.floor(Math.random()*images.length)]);

        scene.add( camera );
//        camera.add(dockMesh);
        scene.add(dockMesh);


        Leap.loopController.on('hand', function(hand){
          return;
          if (hand.data('cursor')) return;

          var boneMeshes = hand.indexFinger.data('boneMeshes');

          console.log(boneMeshes);

          if (!boneMeshes) return;

          var cursorTarget = new THREE.Vector3(-5,-39,25);
          var cursorDirection = new THREE.Vector3(0,-1,0);
          var cursorLength = 40;

          var cursor = new THREE.ArrowHelper(
            cursorDirection,
            cursorTarget.clone().sub(cursorDirection.normalize().multiplyScalar(cursorLength)),
            cursorLength,
            0x5daa00,
            20,
            10
          );


          boneMeshes[0].add(cursor);

          hand.data('cursor', cursor);
        });


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

}).call(this);