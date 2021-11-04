import { Vector3 } from 'three';
import * as THREE from 'three';
import Stats  from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GUI } from 'dat.gui';
import { BlobGeometry } from './blob-geometry';

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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(new THREE.ArrowHelper(ambientLight.position));
scene.add(ambientLight);

// Add a directional light to the scene
const directionalLight = new THREE.DirectionalLight(new THREE.Color(1, 1, 1), 1);
directionalLight.position.set(2, 2, 0);
scene.add(directionalLight);
scene.add( directionalLight.target );

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight)

scene.add(directionalLightHelper);

let blobParams = {
    scale: 0.3,
    octaves: 6,
    persistance: 0.5,
    lacunarity: 1.3,
    amplitude: 1,
    frequency: 1,
}

const bloomParams = {
    exposure: 1,
    bloomStrength: 1.5,
    bloomThreshold: 0,
    bloomRadius: 0
};

const blob = new THREE.Mesh();
scene.add(blob);

const blobGeometry = new BlobGeometry(2, 64)
const blobMaterial = new THREE.MeshPhongMaterial( { color: 0x156289, emissive: 0x072534, flatShading: false, wireframe: false } );
blob.geometry = blobGeometry.geometry
blob.material = blobMaterial;

// Track statistics
const stats = new Stats();
document.body.appendChild( stats.dom );



const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );

const composer = new EffectComposer( renderer );
composer.addPass( renderScene );
composer.addPass( bloomPass );



// Create GUI
const gui = new GUI();

const directionalLightFolder = gui.addFolder( 'directionalLight' );
directionalLightFolder.add( directionalLight, 'intensity', 0, 20 ).onChange( (value) => directionalLight.intensity = value );


const materialFolder = gui.addFolder( 'Material' );

materialFolder.add( blobMaterial, 'shininess', 0, 200, 1 ).onChange((value) => {
    blobMaterial.shininess = value
});

materialFolder.add( blobMaterial, 'reflectivity', 0, 1, 0.1 ).onChange((value) => {
    blobMaterial.reflectivity = value
});

materialFolder.add( blobMaterial, 'reflectivity', 0, 1, 0.1 ).onChange((value) => {
    blobMaterial.shininess = value
});


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

const blobFolder = gui.addFolder( 'Blob' );
blobFolder.add(blobParams, 'scale', 0, 2, 0.01).onChange((value) => {
    blobParams = {
        ...blobParams,
        scale: value
    }
});

blobFolder.add(blobParams, 'octaves', 0, 50, 1).onChange((value) => {
    blobParams = {
        ...blobParams,
        octaves: value
    }
});

blobFolder.add(blobParams, 'persistance', 0, 2, 0.01).onChange((value) => {
    blobParams = {
        ...blobParams,
        persistance: value
    }
});

blobFolder.add(blobParams, 'lacunarity', 0, 2, 0.01).onChange((value) => {
    blobParams = {
        ...blobParams,
        lacunarity: value
    }
});

blobFolder.add(blobParams, 'frequency', 0, 2, 0.01).onChange((value) => {
    blobParams = {
        ...blobParams,
        frequency: value
    }
});


blobFolder.add(blobParams, 'amplitude', 0, 2, 0.01).onChange((value) => {
    blobParams = {
        ...blobParams,
        amplitude: value
    }
});


// Write update loop here!
function update (a: number) {

    cameraControls.update();

    blobGeometry.update2(a * 0.001, blobParams.scale, blobParams.octaves, blobParams.persistance, blobParams.lacunarity, blobParams.amplitude, blobParams.frequency)
}

// Don't touch this one!
function render(a: number) {
    stats.begin();

	update(a);

    composer.render();

    stats.end();

    requestAnimationFrame( render );
}

requestAnimationFrame( render );