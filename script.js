/**
 * Configuration et constantes
 */
const COLORS = {
    polishRed: 0xD30B2D,
    white: 0xFFFFFF,
    globeEmissive: 0x4a0000
};

/**
 * Classe pour la scène de gauche (Malo sur son socle)
 */
class MaloScene {
    constructor() {
        this.container = document.getElementById('malo-socle-container');
        this.photo = document.querySelector('.malo-photo');
        if (!this.container) return;

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 1.2, 3.2);
        this.camera.lookAt(0, 0.2, 0);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);

        // Lumières
        const ambient = new THREE.AmbientLight(0xffffff, 0.9);
        const point = new THREE.PointLight(0xffffff, 0.6);
        point.position.set(2, 5, 2);
        this.scene.add(ambient, point);

        // Socle
        this.base = this.createHexBase(0.2);
        this.base.position.y = 0.2;
        this.scene.add(this.base);
    }

    createHexBase(depth) {
        const shape = new THREE.Shape();
        const size = 0.8;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = size * Math.cos(angle);
            const y = size * Math.sin(angle);
            i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y);
        }
        shape.closePath();

        const geo = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false });
        const matTop = new THREE.MeshPhongMaterial({ color: COLORS.polishRed });
        const matSide = new THREE.MeshPhongMaterial({ color: COLORS.white });
        
        const mesh = new THREE.Mesh(geo, [matTop, matSide]);
        mesh.rotation.x = -Math.PI / 2;
        return mesh;
    }

    update(time) {
        const floatingY = Math.sin(time * 2) * 0.03;
        
        // Animation du socle 3D
        this.base.position.y = 0.2 + floatingY;
        this.base.rotation.z += 0.002;

        // Synchronisation de la photo HTML (Malo)
        if (this.photo) {
            // On multiplie par un facteur pour compenser la perspective
            this.photo.style.transform = `translateX(-50%) translateY(${floatingY * -40}px)`;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
}

/**
 * Classe pour la scène de droite (Le Globe)
 */
class GlobeScene {
    constructor() {
        this.container = document.getElementById('globe-container');
        if (!this.container) return;

        this.loader = new THREE.TextureLoader();
        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.camera.position.set(0, 0, 2.5);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);

        this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));
        const sun = new THREE.PointLight(0xffffff, 1);
        sun.position.set(5, 5, 5);
        this.scene.add(sun);

        // Création Globe
        const radius = 0.65;
        const texture = this.loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg');
        
        const mat = new THREE.MeshPhongMaterial({
            map: texture,
            color: COLORS.polishRed,
            emissive: COLORS.globeEmissive,
            shininess: 15
        });

        this.globe = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 64), mat);
        this.scene.add(this.globe);

        // Marqueur Varsovie (52.2, 21.0)
        this.addMarker(52.2297, 21.0122, radius);

        // Contrôles
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableZoom = false;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.6;
        this.controls.enableDamping = true;
    }

    addMarker(lat, lon, radius) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const pos = new THREE.Vector3(
            -(radius * Math.sin(phi) * Math.cos(theta)),
            radius * Math.cos(phi),
            radius * Math.sin(phi) * Math.sin(theta)
        );

        const marker = new THREE.Mesh(
            new THREE.SphereGeometry(0.02, 16, 16),
            new THREE.MeshBasicMaterial({ color: COLORS.white })
        );
        marker.position.copy(pos);

        const ring = new THREE.Mesh(
            new THREE.RingGeometry(0.03, 0.05, 32),
            new THREE.MeshBasicMaterial({ color: COLORS.white, side: THREE.DoubleSide })
        );
        ring.position.copy(pos);
        ring.lookAt(0, 0, 0);

        this.globe.add(marker, ring);
    }

    update() {
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
}

/**
 * Lancement et Gestion des évènements
 */
document.addEventListener('DOMContentLoaded', () => {
    const malo = new MaloScene();
    const globe = new GlobeScene();

    function mainLoop() {
        requestAnimationFrame(mainLoop);
        const time = Date.now() * 0.001;

        if (malo.container) malo.update(time);
        if (globe.container) globe.update();
    }

    mainLoop();

    window.addEventListener('resize', () => {
        malo.onResize();
        globe.onResize();
    });
});