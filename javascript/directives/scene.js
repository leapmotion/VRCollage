(function() {


var images = [
   "3d-abstract_hdwallpaper_steam-engine_50474.jpg                   ",
   "52_8134_Hoentrop_2012-09-16.jpg                   ",
   "steam-engine-4.png                          ",
   "steam-engine-wallpaper-9.jpg                            ",
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
   "LARGE-SPLAandSL num504.tif.jpg                           ",
   "LARGE-Streamliner 3 locos.Tif.jpg                        ",
   "LARGE-UP SP office KC.tif.jpg                            ",
   "LARGE-X1729 No 4038 near Truckee.tif.jpg                 ",
   "LARGE-X2313 Excursion Midlake.tif.jpg                    ",
   "LARGE-Zoin Lodge opening 04-15-25.tif.jpg                "
];



angular.module('directives', [])
  .directive('scene', function() {
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
        scene.add( camera ); // so that we can add things to it later.

        //we don't actually want the leap hand as child of the camera, as we want the data itself properly transformed.
        // on every frame, we combine the base transformation with the camera transformation to the leap data
        // this is used in grab, proximity, etc.
        boneHand = Leap.loopController.plugins.boneHand;
        boneHand.scene = scene;
        // preload two hands in to the scene
        boneHand.HandMesh.create();
        boneHand.HandMesh.create();

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


        // these would be better off directed as services.  But for now, we use window for message passing.
        window.vrEffect = new THREE.VREffect(renderer);
        window.vrControls = new THREE.VRControls(camera);


        onResize = function() {
          camera.aspect = window.innerWidth / window.innerHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(window.innerWidth, window.innerHeight);

          if (!Leap.loopController.streaming()){
            render()
          }
        };

        window.addEventListener('resize', onResize, false);

        // idea - it would be ideal to have a 3d infinite grid - that would be much cooler
        // for now we suffice to a boring old floor.


        var light = new THREE.PointLight(0xffffff, 1, 1000);
        scene.add(light);


        var dockWidth = 1;
        var dockHeight = dockWidth * 0.15;


        var dockMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(dockWidth, dockHeight),
          new THREE.MeshPhongMaterial({
            wireframe: false,
            color: 0xffffff,
            map: THREE.ImageUtils.loadTexture("images/foto-viewer.jpg"),
            side: THREE.DoubleSide, // allow reverse raycasting.
            transparent: true,
            opacity: 1
          })
        );
        dockMesh.name = "dock";

        dockMesh.position.set(0, -0.15, -0.45);

        // for now, we don't create a scrollable object, but just let it be moved in the view
        var dock = new Dock(scene, dockMesh, Leap.loopController, {
          resize: false,
          moveZ: false,
          moveY: false,
          moveX: false,
          highlight: false
        });

//        dock.pushImage("images/trains/" + images[0]);
//        dock.pushImage("images/trains/" + images[1]);
//        dock.pushImage("images/trains/" + images[2]);
//        dock.pushImage("images/trains/" + images[3]);
        dock.pushImage("images/landscapes/landscape1.jpg");
        dock.pushImage("images/landscapes/landscape2.jpg");
        dock.pushImage("images/landscapes/landscape3.jpg");
        dock.pushImage("images/landscapes/landscape4.jpg");

        dock.setInteractable(false);

        window.dock = dock;

        var sortedLayoutContainer = window.sortedLayoutContainer = new SortedLayoutContainer(null, "collage", function(newState){

        });

        // When an image is removed from the doc, add it to the container.
        dock.imageRemoveCallbacks.push(function(data) {
          sortedLayoutContainer.addPlane(data[0]);
        });

        Leap.loopController.on('twoHand.start', function(hand1, hand2){
          if ( sortedLayoutContainer.planeCount() < 1) return;
          sortedLayoutContainer.begin(
            (new THREE.Vector3).fromArray(hand1.palmPosition),
            (new THREE.Vector3).fromArray(hand2.palmPosition)
          );
        });

        Leap.loopController.on('twoHand.update', function(hand1, hand2){
          if ( sortedLayoutContainer.planeCount() < 1) return;
          sortedLayoutContainer.update(
            (new THREE.Vector3).fromArray(hand1.palmPosition),
            (new THREE.Vector3).fromArray(hand2.palmPosition)
          );
        });

        Leap.loopController.on('twoHand.end', function(){
          if ( sortedLayoutContainer.planeCount() < 1) return;
          sortedLayoutContainer.release();
        });

        sortedLayoutContainer.on('mode', function(mode){
          ga('send', 'event', 'Mode', mode);
        });

// leap proximity does not at all do well with angled objects:
//        dockMesh.position.set(-90, 130 - dockHeight / 2, -300);
//        dockMesh.rotation.set(0, Math.PI / 4, 0, 0);
//        camera.add(dockMesh);

        scene.add(dockMesh);

        var text = createText('place images..');
        text.position.setZ(-250);
        text.position.setY(120);
        scene.add(text);

        var handArrow1 = new HandArrow(scene);
        var handArrow2 = new HandArrow(scene);

        Leap.loopController.on('twoHand.start', function(hand1, hand2) {
          if (handArrow1.mesh !== undefined) {
            handArrow1.mesh.visible = true;
          }
          if (handArrow2.mesh !== undefined) {
            handArrow2.mesh.visible = true;
          }
        });

        Leap.loopController.on('twoHand.update', function(hand1, hand2) {
          handArrow1.update(hand1.palmPosition, hand2.palmPosition );
          handArrow2.update(hand2.palmPosition, hand1.palmPosition);
        });

        Leap.loopController.on('twoHand.end', function() {
          if (handArrow1.mesh !== undefined) {
            handArrow1.mesh.visible = false;
          }
          if (handArrow2.mesh !== undefined) {
            handArrow2.mesh.visible = false;
          }
        });


//        var collageText = createText('Collage');
//        var stackText   = createText('Stack');
//        text.position.setZ(-250);
//        text.position.setY(120);
//        scene.add(text);

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
        };
        render();

        // By controlling render from frame, we make sure that rendering happens immediately after frame processing.
        Leap.loopController.on('frame', function(){
          TWEEN.update();
          render();
        });


        dock.on('imageLoad', function(image){

          if (!Leap.loopController.streaming()){
            render()
          }

          if (!isReady) {
            console.log("VRClient ready");
            VRClient.ready();
            VRClientReady = true;
          }

          // https://developers.google.com/analytics/devguides/collection/analyticsjs/events
          image.touch( function(){
            ga('send', 'event', 'Images', 'Touch', image.mesh.name);
          });

          image.release( function(){
            ga('send', 'event', 'Images', 'Release', image.mesh.name);
          });

        });



      }
    };
  });

}).call(this);