import * as THREE from "https://cdn.skypack.dev/three@0.129.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, control, skybox, renderer, sun;


let isPaused = false;
let lastTime = 0;


// Data for all planets
const planetData = [
  {
    name: "mercury",
    radius: 3,
    orbit: 100,
    revolution: 2,
    texture: "/public/mercury.jpg",
  },
  {
    name: "venus",
    radius: 5,
    orbit: 130,
    revolution: 0.8,
    texture: "/public/venus.jpg",
  },
  {
    name: "earth",
    radius: 8,
    orbit: 180,
    revolution: 0.3,
    texture: "/public/earth.jpg",
  },
  {
    name: "mars",
    radius: 12,
    orbit: 250,
    revolution: 0.6,
    texture: "/public/mars.jpg",
  },
  {
    name: "jupiter",
    radius: 18,
    orbit: 330,
    revolution: 0.8,
    texture: "/public/jupiter.jpg",
  },
  {
    name: "saturn",
    radius: 15,
    orbit: 400,
    revolution: 0.9,
    texture: "/public/saturn.jpg",
  },
  {
    name: "uranus",
    radius: 8,
    orbit: 490,
    revolution: 1,
    texture: "/public/uranus.jpg",
  },
  {
    name: "neptune",
    radius: 3,
    orbit: 550,
    revolution: 0.4,
    texture: "/public/neptune.jpg",
  }
];

// To store the actual THREE.Mesh planet objects
const planets = {};

function planet(texture, radius, width, height) {
  const geometry = new THREE.SphereGeometry(radius, width, height);
  const planet_texture = new THREE.TextureLoader().load(texture);
  const material = new THREE.MeshBasicMaterial({ map: planet_texture });
  return new THREE.Mesh(geometry, material);
}

function ring(radius) {
  const outerRadius = radius - 0.5;
  const geometry = new THREE.RingGeometry(radius, outerRadius, 65);
  const material = new THREE.MeshBasicMaterial({ color: 'grey', side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = Math.PI / 2;
  scene.add(mesh);
}

function matrixImage() {
  const skybox_image = [
    '/public/skybox/bottom.png', '/public/skybox/s1.png', '/public/skybox/s2.png',
    '/public/skybox/s3.png', '/public/skybox/s4.png', '/public/skybox/top.png'
  ];
  return skybox_image.map(image => {
    const tex = new THREE.TextureLoader().load(image);
    return new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide });
  });
}

function setskybox() {
  const materials = matrixImage();
  const skyboxGeometry = new THREE.BoxGeometry(3000, 3000, 3000);
  skybox = new THREE.Mesh(skyboxGeometry, materials);
  scene.add(skybox);
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(80
    
    , window.innerWidth / window.innerHeight, 0.2, 3000);
  camera.position.set(0, 0, 300);

  setskybox();

  // Sun
  sun = planet("/public/sun.jpg", 40, 110, 110);
  scene.add(sun);

  // Create planets dynamically
  for (const p of planetData) {
    const mesh = planet(p.texture, p.radius, 100, 100);
    mesh.position.x = sun.position.x + p.orbit;
    planets[p.name] = mesh;
    scene.add(mesh);
    ring(p.orbit);
  }

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.id = "c";

  control = new OrbitControls(camera, renderer.domElement);
  control.maxDistance = 1000;
  control.minDistance = 10;
}

function planetRevolve(time, speed, planet, orbit_r) {
  const orbitSpeed = 0.001;
  const angle = time * orbitSpeed * speed;
  planet.position.x = sun.position.x + orbit_r * Math.cos(angle);
  planet.position.z = sun.position.z + orbit_r * Math.sin(angle);
}

function animate(time) {

  const rotationSpeed = 0.009;
 
   requestAnimationFrame(animate);

   if(!isPaused){
     sun.rotation.y += rotationSpeed;
     for (const p of planetData) {
    const mesh = planets[p.name];
    mesh.rotation.y += rotationSpeed;
    planetRevolve(time, p.revolution, mesh, p.orbit);
  }

   }

 

 
  renderer.render(scene, camera);
}

function windowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", windowResize, true);

init();
document.getElementById("toggleBtn").addEventListener("click", () => {
    isPaused = !isPaused;
    document.getElementById("toggleBtn").innerText = isPaused ? "Play" : "Pause";
});

document.getElementById("speed").addEventListener("input", ()=>{
    const planet_name = document.getElementById("planet").value ; 
    for(const p of planetData){
        if(planet_name.toLowerCase() == p.name.toLowerCase()){
            const speed = parseFloat(document.getElementById("speed").value) ;
            if(speed){
                p.revolution = speed ; 
            } 
        }
    }
})

animate(0);
