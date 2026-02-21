// --- FONCTION COMMUNE POUR LE SOCLE HEXAGONAL ---
function createHexBase(depth = 0.4) {
    const shape = new THREE.Shape();
    const size = 0.8;
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = size * Math.cos(angle);
        const y = size * Math.sin(angle);
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = { depth: depth, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    
    // Index 0: dessus (Rouge), Index 1: côtés (Blanc)
    const matTop = new THREE.MeshPhongMaterial({ color: 0xD30B2D }); // Rouge polonais
    const matSide = new THREE.MeshPhongMaterial({ color: 0xFFFFFF }); // Blanc
    
    const mesh = new THREE.Mesh(geometry, [matTop, matSide]);
    mesh.rotation.x = -Math.PI / 2; // Mise à plat
    return mesh;
}

// --- FONCTION POUR LE MARQUEUR (VARSOVIE) ---
function createMarker(lat, lon, globe, radius) {
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

function initScenes() {
    const loader = new THREE.TextureLoader();

    // --- 1. SETUP GAUCHE (MALO SUR SON SOCLE) ---
    const containerMalo = document.getElementById('malo-socle-container');
    const sceneMalo = new THREE.Scene();
    const cameraMalo = new THREE.PerspectiveCamera(45, containerMalo.clientWidth / containerMalo.clientHeight, 0.1, 1000);
    // On recule un peu la caméra pour voir tout l'hexagone
    cameraMalo.position.set(0, 1.2, 3.2); 
    cameraMalo.lookAt(0, 0.2, 0);

    const rendererMalo = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererMalo.setSize(containerMalo.clientWidth, containerMalo.clientHeight);
    containerMalo.appendChild(rendererMalo.domElement);
    
    sceneMalo.add(new THREE.AmbientLight(0xffffff, 0.9));
    const lightMalo = new THREE.PointLight(0xffffff, 0.6);
    lightMalo.position.set(2, 5, 2);
    sceneMalo.add(lightMalo);

    // Socle épais (0.4) remonté (position y: 0.2) pour ne pas être coupé
    const baseMalo = createHexBase(0.2);
    baseMalo.position.y = 0.2; 
    sceneMalo.add(baseMalo);

    // --- 2. SETUP DROITE (GLOBE) ---
    const containerGlobe = document.getElementById('globe-container');
    const sceneGlobe = new THREE.Scene();
    const cameraGlobe = new THREE.PerspectiveCamera(45, containerGlobe.clientWidth / containerGlobe.clientHeight, 0.1, 1000);
    cameraGlobe.position.set(0, 0, 2.5);

    const rendererGlobe = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererGlobe.setSize(containerGlobe.clientWidth, containerGlobe.clientHeight);
    containerGlobe.appendChild(rendererGlobe.domElement);

    sceneGlobe.add(new THREE.AmbientLight(0xffffff, 0.8));
    const lightGlobe = new THREE.PointLight(0xffffff, 1);
    lightGlobe.position.set(5, 5, 5);
    sceneGlobe.add(lightGlobe);

    // Création du Globe Rouge
    const radius = 0.65;
    const earthTexture = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
    const globeMat = new THREE.MeshPhongMaterial({
        map: earthTexture,
        color: 0xD30B2D,
        emissive: 0x4a0000,
        shininess: 15
    });
    const globe = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 64), globeMat);
    sceneGlobe.add(globe);

    // Ajout du marqueur Varsovie
    createMarker(52.2297, 21.0122, globe, radius);

    const controls = new THREE.OrbitControls(cameraGlobe, rendererGlobe.domElement);
    controls.enableZoom = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4; // Rotation lente
    controls.enableDamping = true;

    // --- ANIMATION ---
    function animate() {
        requestAnimationFrame(animate);
        const time = Date.now() * 0.002;
        
        // Flottement et Rotation lente du socle
        baseMalo.position.y = 0.2 + Math.sin(time) * 0.02;
        baseMalo.rotation.z += 0.001; 
        
        controls.update();
        rendererMalo.render(sceneMalo, cameraMalo);
        rendererGlobe.render(sceneGlobe, cameraGlobe);
    }
    animate();

    window.addEventListener('resize', () => {
        const wM = containerMalo.clientWidth; const hM = containerMalo.clientHeight;
        rendererMalo.setSize(wM, hM); cameraMalo.aspect = wM/hM; cameraMalo.updateProjectionMatrix();

        const wG = containerGlobe.clientWidth; const hG = containerGlobe.clientHeight;
        rendererGlobe.setSize(wG, hG); cameraGlobe.aspect = wG/hG; cameraGlobe.updateProjectionMatrix();
    });
}

document.addEventListener('DOMContentLoaded', initScenes);