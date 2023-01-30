import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.138.0/examples/jsm/controls/OrbitControls.js?module';

//Adds a light to the scene
function addlight(x, y, z, intensity) {
  let light = new THREE.PointLight(0xffffff, intensity, 0);
  light.position.set(x, y, z);
  scene.add(light);
}

function resizeCanvasToDisplaySize() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  if (canvas.width !== width || canvas.height !== height) {
    // you must pass false here or three.js fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

//Hide the spinner once the model is loaded
const loadingManager = new THREE.LoadingManager();
loadingManager.onLoad = function(){
  let spinner = document.getElementById('spinner')
  spinner.style.visibility = 'hidden'
}

const renderer = new THREE.WebGLRenderer({ canvas: document.querySelector("canvas") });
renderer.setPixelRatio(window.devicePixelRatio);

let loadedModel;
let mixer;

var camwidth
const glftLoader = new GLTFLoader(loadingManager);
glftLoader.load('./snoopy.glb', (assembly) => {
  loadedModel = assembly;
  mixer = new THREE.AnimationMixer(assembly.scene);
  const clips = assembly.animations;

  clips.forEach(function (clip) {
    const action = mixer.clipAction(clip);
    action.play();
  });

  assembly.scene.traverse(function (child) {
    // console.log(child)
    if (child.name == "Sketchfab_model") {
      console.log(child.name)
      child.position.y = -.35
    }
  })

  //rotate the model's initial position
  assembly.scene.rotation.y = Math.PI / 2;
  

  var dist =  camera.position.distanceTo(loadedModel.scene.position );
  var vFOV = THREE.MathUtils.degToRad( camera.fov ); // convert vertical fov to radians
  var camheight = 2 * Math.tan( vFOV / 2 ) * dist; // visible height
  camwidth = camheight * camera.aspect;           // visible width
  var multiplicador = 1
  loadedModel.scene.position.x = -camwidth/2 -2
  loadedModel.scene.position.y = loadedModel.scene.position.y + 0.65

  var scale = 12
  loadedModel.scene.scale.set(scale, scale, scale);
  scene.add(loadedModel.scene);
});

//set the camera
const camera = new THREE.PerspectiveCamera(3, 2, 1, 2000);

camera.position.z = 100;
camera.position.y = -2.5;
//set the scene with a white background
const scene = new THREE.Scene();

scene.background = new THREE.Color(0xffffff);

// Add lights to the scene
var position = 30;
// addlight(20, position, position, 1.5);
// // addlight(-20, position, 0, .75);
// addlight(0, 0, -100, 1.8);
// addlight(0, -20, 20, 0.2);
addlight(0, 0, 100, 1.75);
addlight(0, 0, -100, 1.75);


// controls
var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;

//Max/Min zoom
controls.minDistance = 175;
controls.maxDistance = 250;
//Disable users ability to move object out of frame
controls.enablePan = false;
let multiplicador = 1
const clock = new THREE.Clock();
function animate(time) {

  time *= 0.001;  // seconds
  if (mixer) {
    mixer.update(clock.getDelta());
  }
  //Move the model from left to right
  if (loadedModel) {

    if (loadedModel.scene.position.x >= camwidth/2 +3.5){
      loadedModel.scene.rotation.y += Math.PI;
      multiplicador = -1;
    }
    if (loadedModel.scene.position.x <= -camwidth/2 -3.5 && multiplicador ==-1){
      loadedModel.scene.rotation.y += Math.PI;
      multiplicador = 1;
    }
    loadedModel.scene.position.x += .05 * multiplicador
    // console.log(loadedModel.scene.position.x)

  }

  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  resizeCanvasToDisplaySize();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

// In firefox the css ":active" property doesn't work properly for some reason; the following code fixes it.
var grab = document.getElementById('grab')
grab.onpointerdown = function () {
  document.getElementById('grab').style.cursor = 'grabbing'
}
grab.onpointerup = function () {
  document.getElementById('grab').style.cursor = 'grab'
}
grab.onpointerleave = function () {
  document.getElementById('grab').style.cursor = 'grab'
}
