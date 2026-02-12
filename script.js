// --- CONFIGURATION DU GLOBE ---
const container = document.getElementById('globe-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xFDFBF7); 

const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.z = 2.2; 

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); 
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0xffffff, 0.8);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Texture Terre
const geometry = new THREE.SphereGeometry(0.65, 64, 64);
const textureLoader = new THREE.TextureLoader();
// Lien texture stable
const earthTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');

const material = new THREE.MeshPhongMaterial({
    map: earthTexture,
    color: 0xD30B2D, 
    emissive: 0x4a0000,
    shininess: 15
});

const globe = new THREE.Mesh(geometry, material);
scene.add(globe);

// Point Varsovie
function createMarker(lat, lon) {
    const radius = 0.65;
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = (radius * Math.sin(phi) * Math.sin(theta));
    const y = (radius * Math.cos(phi));

    const markerGeo = new THREE.SphereGeometry(0.02, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(x, y, z);
    
    const ringGeo = new THREE.RingGeometry(0.03, 0.04, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.set(x, y, z);
    ring.lookAt(0, 0, 0);

    globe.add(marker);
    globe.add(ring);
}
createMarker(52.2297, 21.0122); 

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false; 
controls.autoRotate = true;
controls.autoRotateSpeed = 1.5;

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    const width = container.clientWidth;
    const height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

// Traduction
function simulerTraduction() {
    const input = document.getElementById('input-text').value;
    const output = document.getElementById('output-text');
    if(input.trim() === "") { output.value = "Veuillez écrire du texte..."; return; }
    
    output.value = "Ouverture de Google Traduction...";
    setTimeout(() => {
        const url = `https://translate.google.com/?sl=en&tl=fr&text=${encodeURIComponent(input)}&op=translate`;
        window.open(url, '_blank');
        output.value = "Traduction ouverte !";
    }, 800);
}