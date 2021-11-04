import { Plane } from './plane';
import { Mesh, Vector, Vector2, Vector3, MathUtils } from 'three';
import { Particle } from './particle';
import * as THREE from 'three';
import Stats  from 'stats.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { TWO_PI, GRAVITY_FORCE, TIMESTEP_SQ } from './constants';
import { getImageData } from './image-loader';

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
camera.position.set(0, 0, 20);
scene.add(camera);

// setup effecet composer and add passes
const composer = new EffectComposer( renderer );
const renderPass = new RenderPass( scene, camera );
composer.addPass( renderPass );

const filmPass = new FilmPass();

filmPass.enabled =true
console.log(filmPass)
composer.addPass( filmPass );

// const bloomPass = new BloomPass(2, 0, 1.5, 0);
// composer.addPass( bloomPass );


// const glitchPass = new GlitchPass();
// console.log(glitchPass)
// composer.addPass( glitchPass );


// Add the orbit control
const cameraControls = new OrbitControls(camera, renderer.domElement);
cameraControls.minDistance = 50;

// Add an ambient light
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(new THREE.ArrowHelper(ambientLight.position));
scene.add(ambientLight);

const light = new THREE.PointLight( 0xff0000, 1, 100 );
light.position.set( 50, 50, 50 );
scene.add( light );

// Add a directional light to the scene

const lightData = {
    color: new THREE.Color(1, 1, 1),
    intensity: 1,
    position: new THREE.Vector3(0, 2, 0)
};

const directionalLight = new THREE.DirectionalLight(lightData.color, lightData.intensity);
directionalLight.position.set(lightData.position.x, lightData.position.y, lightData.position.z)
scene.add(directionalLight);
scene.add(new THREE.DirectionalLightHelper(directionalLight));

// Track statistics
const stats = new Stats();
document.body.appendChild( stats.dom );

const particles = new Array<Particle>();

const WIDTH = 150;
const HEIGHT = 150;
const SPACING = 0.25;

for(let x = 0; x < WIDTH; x++ ) {
    for(let y =0; y <HEIGHT; y++) {
        const particle = new Particle(new Vector3((x - WIDTH*0.5) * SPACING, (y - HEIGHT*0.5) * SPACING, 0), 0.3);
        particles.push(particle);
    }
}

const texture = (new THREE.TextureLoader).load("https://cdn.rawgit.com/akella/dots-animation/b9abad87/img/particle.png");
const material = new THREE.PointsMaterial({
    size: 1,
    map: texture,
    alphaTest: 0.5,
    vertexColors: true
});

const geometry = new Plane(WIDTH, HEIGHT);
const pointCloud = new THREE.Points(geometry, material);
scene.add(pointCloud);

const images = ['frontmen-logo.jpeg', 'intracto-logo.png'];
let imageIndex = 0;

function loadImage(url: string) {
    getImageData(url).then((data) => {
        for(let x = 0; x < WIDTH; x++ ) {
            for(let y =0; y <HEIGHT; y++) {
                const px = Math.floor(x / WIDTH * data.width);
                const py = Math.floor(y / HEIGHT * data.height);
                // console.log(`${px}, ${py} ${x / WIDTH}`)
                const i = (y*WIDTH)+x;
                const pi = (py*data.width+px) * 4;

    
                geometry.attributes.color.setXYZ( i, data.data[pi]/255, data.data[pi+1]/255,data.data[pi+2]/255 );
                geometry.attributes.color.needsUpdate = true;
            }
        }
        
        //geometry.attributes.color.setXYZ( index, Math.random(), Math.random(), Math.random() );
    });
}

loadImage(images[imageIndex]);

let mousePosition = new Vector3();

document.addEventListener('keyup', (event) => {
    console.log(event);
    imageIndex++;

    if(imageIndex > images.length - 1) {
        imageIndex = 0;
    }

    loadImage(images[imageIndex]);
});

document.addEventListener('mousemove', (event) => {
    event.preventDefault();
	const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
	const mouseY = - (event.clientY / window.innerHeight) * 2 + 1;
    const vector = new THREE.Vector3(mouseX, mouseY, 0);
	vector.unproject( camera );
	const dir = vector.sub( camera.position ).normalize();
	const distance = - camera.position.z / dir.z;
	mousePosition = camera.position.clone().add( dir.multiplyScalar( distance ) );
});

function update () {

    cameraControls.update();

    particles.forEach((particle, index) => {

        // Get the distance between the particle and the mouse
        const distance = mousePosition.distanceTo(particle.position);

        // Get the direction vector
        const direction = new Vector3().subVectors(particle.position, mousePosition).normalize()

        // normalize the distance
        const normalizedDistance = 1 - MathUtils.clamp(distance / 10, 0, 1);

        // update the particle
        particle.update();

        // Push the particle away
        particle.addForce( direction.multiplyScalar( normalizedDistance * Math.random() * 100  ) );

        // Run verlet integration
        particle.integrate(TIMESTEP_SQ)

        // update position attribute
        geometry.attributes.position.setXYZ( index, particle.position.x, particle.position.y, particle.position.z );
    });

    geometry.attributes.position.needsUpdate = true;
   

    geometry.computeVertexNormals();
}

function render() {
    composer.render();
}

// Don't touch this one!
function animate(time: number) {

    stats.begin();

	update();
    render();

    stats.end();

    requestAnimationFrame( animate );
}

animate(0);