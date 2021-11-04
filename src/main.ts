import * as THREE from 'three';
import Stats  from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GUI } from 'dat.gui';

const TWO_PI = Math.PI * 2;

// Create the renderer (no canvas fallback!)
const renderer = new THREE.WebGLRenderer({
    antialias		: true,	// to get smoother output
    preserveDrawingBuffer	: true	// to allow screenshot
});

renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0x000000, 1 );

// Add renderer to the DOM
const element = document.getElementById('container')

if(!element) {
    throw new Error('Could not find container element');
}

element.appendChild(renderer.domElement);

// create a scene
const scene = new THREE.Scene();

scene.add(new THREE.AxesHelper());

// put a camera in the scene
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.set(0, 0, 5);
scene.add(camera);

// Add the orbit control
const cameraControls = new OrbitControls(camera, renderer.domElement);
cameraControls.minDistance = 10;

// Add an ambient light
const ambientLight = new THREE.AmbientLight(0x00000, 0);
scene.add(new THREE.ArrowHelper(ambientLight.position));
scene.add(ambientLight);

// Add a directional light to the scene
const directionalLight = new THREE.DirectionalLight(new THREE.Color(1, 1, 1), 1);
directionalLight.position.set(2, 2, 0);
scene.add(directionalLight);
scene.add( directionalLight.target );

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)

scene.add(directionalLightHelper);

// Create some awesome torus geometry!
const torusGeometryData = {
    radius: 1,
    tube: 0.4,
    radialSegments: 16,
    tubularSegments: 100,
    arc: TWO_PI,
    flatShading: false
};

const bloomParams = {
    exposure: 1,
    bloomStrength: 1.5,
    bloomThreshold: 0,
    bloomRadius: 0
};

const torus = new THREE.Mesh();

// Generating the geometry is wrapped in a fuction so it can be called by the GUI plugin
function generateTorusGeometry() {
    torus.geometry = new THREE.TorusGeometry(torusGeometryData.radius, torusGeometryData.tube, torusGeometryData.radialSegments, torusGeometryData.tubularSegments, torusGeometryData.arc);
    torus.material = new THREE.MeshPhongMaterial( { color: 0x156289, emissive: 0x072534, flatShading: torusGeometryData.flatShading } );
}

generateTorusGeometry();

scene.add( torus );

// Track statistics
const stats = new Stats();
document.body.appendChild( stats.dom );

// Create GUI
const gui = new GUI();
const torusFolder = gui.addFolder( 'TorusGeometry' );
torusFolder.add( torusGeometryData, 'radius', 1, 20 ).onChange( generateTorusGeometry );
torusFolder.add( torusGeometryData, 'tube', 0.1, 10 ).onChange( generateTorusGeometry );
torusFolder.add( torusGeometryData, 'radialSegments', 2, 30 ).step( 1 ).onChange( generateTorusGeometry );
torusFolder.add( torusGeometryData, 'tubularSegments', 3, 200 ).step( 1 ).onChange( generateTorusGeometry );
torusFolder.add( torusGeometryData, 'arc', 0.1, TWO_PI ).onChange( generateTorusGeometry );
torusFolder.add( torusGeometryData, 'flatShading' ).onChange( generateTorusGeometry );

const directionalLightFolder = gui.addFolder( 'directionalLight' );
directionalLightFolder.add( directionalLight, 'intensity', 0, 20 ).onChange( (value) => directionalLight.intensity = value );

const bloomFolder = gui.addFolder( 'Bloom' );

bloomFolder.add( bloomParams, 'exposure', 0.1, 2 ).onChange((value) => {
    renderer.toneMappingExposure = Math.pow( value, 4.0 );
});

bloomFolder.add( bloomParams, 'bloomThreshold', 0.0, 1.0 ).onChange((value) => {
    bloomPass.threshold = Number(value);
});

bloomFolder.add( bloomParams, 'bloomStrength', 0.0, 3.0 ).onChange((value) => {
    bloomPass.strength = Number( value );
});

bloomFolder.add( bloomParams, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange((value) => {
    bloomPass.radius = Number( value );
});


const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );

const composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( bloomPass );

let count = 0;

// Write update loop here!
function update () {

    cameraControls.update();

    count += 0.01

    directionalLight.position.set(Math.sin(count) * 2, Math.cos(count), Math.cos(count) * 2);
    directionalLight.target.position.set(0,0,0)
    directionalLightHelper.update()

    torus.rotation.x += 0.01;
	torus.rotation.y += 0.01;
}

// Don't touch this one!
function render() {

    stats.begin();

	update();

    composer.render();

    stats.end();

    requestAnimationFrame( render );
}

render();