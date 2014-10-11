// Generated by CoffeeScript 1.7.1
(function() {
  var baseBoneRotation, boneHand, boneHandLost, boneWhite, initScene, jointColor, jointSize, scene;

  scene = null;

  initScene = function(targetEl) {
    var camera, directionalLight, height, render, renderer, width;
    scene = scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({
      alpha: true
    });
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.domElement.className = "leap-boneHand";
    targetEl.appendChild(renderer.domElement);
    directionalLight = directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0, 0.5, 1);
    scene.add(directionalLight);
    directionalLight = directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(0.5, -0.5, -1);
    scene.add(directionalLight);
    directionalLight = directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(-0.5, 0, -0.2);
    scene.add(directionalLight);
    camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    camera.position.fromArray([0, 300, 500]);
    camera.lookAt(new THREE.Vector3(0, 160, 0));
    scene.add(camera);
    renderer.render(scene, camera);
    window.addEventListener('resize', function() {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      return renderer.render(scene, camera);
    }, false);
    render = function() {
      renderer.render(scene, camera);
      return window.requestAnimationFrame(render);
    };
    return render();
  };

  baseBoneRotation = (new THREE.Quaternion).setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));

  jointColor = (new THREE.Color).setHex(0x5daa00);

  boneWhite = (new THREE.Color).setHex(0xffffff);

  jointSize = 8;

  boneHand = function(hand) {
    return hand.fingers.forEach(function(finger) {
      var boneMeshes, jointMesh, jointMeshes;
      boneMeshes = finger.data("boneMeshes");
      jointMeshes = finger.data("jointMeshes");
      if (!boneMeshes) {
        boneMeshes = [];
        jointMeshes = [];
        if (!finger.bones) {
          console.warn("error, no bones on", hand.id);
          return;
        }
        finger.bones.forEach(function(bone) {
          var boneMesh, jointMesh;
          boneMesh = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, bone.length), new THREE.MeshPhongMaterial());
          boneMesh.material.color.copy(boneWhite);
          scene.add(boneMesh);
          boneMeshes.push(boneMesh);
          jointMesh = new THREE.Mesh(new THREE.SphereGeometry(jointSize), new THREE.MeshPhongMaterial());
          jointMesh.material.color.copy(jointColor);
          scene.add(jointMesh);
          return jointMeshes.push(jointMesh);
        });
        jointMesh = new THREE.Mesh(new THREE.SphereGeometry(jointSize), new THREE.MeshPhongMaterial());
        jointMesh.material.color.copy(jointColor);
        scene.add(jointMesh);
        jointMeshes.push(jointMesh);
        finger.data("boneMeshes", boneMeshes);
        finger.data("jointMeshes", jointMeshes);
      }
      boneMeshes.forEach(function(mesh, i) {
        var bone;
        bone = finger.bones[i];
        mesh.position.fromArray(bone.center());
        mesh.setRotationFromMatrix((new THREE.Matrix4).fromArray(bone.matrix()));
        return mesh.quaternion.multiply(baseBoneRotation);
      });
      return jointMeshes.forEach(function(mesh, i) {
        var bone;
        bone = finger.bones[i];
        if (bone) {
          return mesh.position.fromArray(bone.prevJoint);
        } else {
          bone = finger.bones[i - 1];
          return mesh.position.fromArray(bone.nextJoint);
        }
      });
    });
  };

  boneHandLost = function(hand) {
    var armMesh;
    hand.fingers.forEach(function(finger) {
      var boneMeshes, jointMeshes;
      boneMeshes = finger.data("boneMeshes");
      jointMeshes = finger.data("jointMeshes");
      if (!boneMeshes) {
        return;
      }
      boneMeshes.forEach(function(mesh) {
        return scene.remove(mesh);
      });
      jointMeshes.forEach(function(mesh) {
        return scene.remove(mesh);
      });
      finger.data({
        boneMeshes: null
      });
      return finger.data({
        jointMeshes: null
      });
    });
    armMesh = hand.data('armMesh');
    scene.remove(armMesh);
    return hand.data('armMesh', null);
  };

  Leap.plugin('boneHand', function(scope) {
    if (scope == null) {
      scope = {};
    }
    this.use('handEntry');
    this.use('handHold');
    if (scope.scene) {
      scene = scope.scene;
    } else {
      console.assert(scope.targetEl);
      initScene(scope.targetEl);
    }
    this.on('handLost', boneHandLost);
    return {
      hand: boneHand
    };
  });

}).call(this);