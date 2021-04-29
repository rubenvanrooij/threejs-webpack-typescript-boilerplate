import * as THREE from 'three';
import Stats  from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui';

const TWO_PI = Math.PI * 2;

// Create the renderer (no canvas fallback!)
const renderer = new THREE.WebGLRenderer({
    antialias		: true,	// to get smoother output
    preserveDrawingBuffer	: true	// to allow screenshot
});

renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor( 0xbbbbbb, 1 );

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
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(new THREE.ArrowHelper(ambientLight.position));
scene.add(ambientLight);

// Add a directional light to the scene
const directionalLight = new THREE.DirectionalLight(new THREE.Color(1, 1, 1), 1);
directionalLight.position.set(0, 2, 0);
scene.add(directionalLight);
scene.add(new THREE.DirectionalLightHelper(directionalLight));

// Create some awesome torus geometry!
const torusGeometryData = {
    radius: 1,
    tube: 0.4,
    radialSegments: 16,
    tubularSegments: 100,
    arc: TWO_PI,
    flatShading: false
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
const folder = gui.addFolder( 'TorusGeometry' );
folder.add( torusGeometryData, 'radius', 1, 20 ).onChange( generateTorusGeometry );
folder.add( torusGeometryData, 'tube', 0.1, 10 ).onChange( generateTorusGeometry );
folder.add( torusGeometryData, 'radialSegments', 2, 30 ).step( 1 ).onChange( generateTorusGeometry );
folder.add( torusGeometryData, 'tubularSegments', 3, 200 ).step( 1 ).onChange( generateTorusGeometry );
folder.add( torusGeometryData, 'arc', 0.1, TWO_PI ).onChange( generateTorusGeometry );
folder.add( torusGeometryData, 'flatShading' ).onChange( generateTorusGeometry );

function update () {

    cameraControls.update();

    torus.rotation.x += 0.01;
	torus.rotation.y += 0.01;
}

function render() {
    renderer.render(scene, camera);
}

// Don't touch this one!
function animate() {

    stats.begin();

	update();
    render();

    stats.end();

    requestAnimationFrame( animate );
}

animate();