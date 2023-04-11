import './main.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import fragment from './shaders/fragment.glsl.js';
import vertex from './shaders/vertex.glsl.js';
import texture from './images/textures/triangle.png';
import GUI from 'lil-gui';

const loadImages = (paths, whenLoaded) => {
  const imgs = [];
  const img0 = [];

  paths.forEach((path) => {
    const img = new Image();

    img.onload = () => {
      imgs.push(img);
      img0.push({ path, img });

      if (imgs.length === paths.length) whenLoaded(img0);
    };
    img.src = path;
  });
};

export default class Sketch {
  constructor() {
    this.scene = new THREE.Scene();
    this.container = document.getElementById('container');
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({ alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    // this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.useLegacyLights = true;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.001,
      1000
    );

    let frustumSize = 10;
    let aspect = 2.083;
    this.camera = new THREE.OrthographicCamera(
      this.width / -2 / (frustumSize * aspect * 14),
      this.width / 2 / (frustumSize * aspect * 14),
      this.height / 2 / (frustumSize * aspect * 14),
      this.height / -2 / (frustumSize * aspect * 14),
      0.001,
      1000
    );
    this.camera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.time = 0;

    loadImages(['1-mask.jpg'], (images) => {
      this.img = images[0].img;

      // Setup scene
      this.addMesh();
      this.settings();
      // this.setupResize();
      // this.resize();
    });
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    // image cover
    this.imageAspect = 853 / 1280;
    let a1;
    let a2;
    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = this.height / this.width / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;

    // optional - cover with quad
    const distance = this.camera.position.z;
    const height = 1;
    this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * distance));

    // if (w/h > 1)
    // if (this.width / this.height > 1) {
    //   this.plane.scale.x = this.camera.aspect;
    // } else {
    //   this.plane.scale.y = 1 / this.camera.aspect;
    // }

    this.camera.updateProjectionMatrix();
  }

  addMesh() {
    // Canvas
    let precision = 100;
    const imageArray = Array.from(Array(precision), () => new Array(precision));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.height = precision;
    ctx.drawImage(this.img, 0, 0, precision, precision);
    // document.body.appendChild(canvas);

    // Image data
    let imageData = ctx.getImageData(0, 0, precision, precision);

    // Get coordinates
    let positions = [];
    let positions2 = [];
    let rotation = [];
    let size = [];
    let colors = [];
    let alpha = [];
    this.speed = [];
    this.precision = precision;

    for (let i = 0; i < imageData.data.length; i += 4) {
      let x = (i / 4) % precision; // Columns
      let y = Math.floor(i / 4 / precision); // Rows
      imageArray[x][y] = imageData.data[i];

      // Get only black points positions
      if (imageData.data[i] > 50) {
        positions.push(
          (2.08 * (x - precision / 2)) / 50,
          (-y + precision / 2) / 50,
          0
        );
        positions2.push(
          6 * (Math.random() - 0.5),
          6 * (Math.random() - 0.5),
          0
        );
        rotation.push(Math.random() * 2 * Math.PI);
        size.push(Math.random() * 0.5 + 0.5);
        alpha.push(Math.random() * 0.5 + 0.5);

        if (Math.random() > 0.5) {
          colors.push(1, 1, 1);
        } else {
          colors.push(1, 222 / 255, 41 / 255);
        }

        this.speed.push(Math.random() * 0.1 + 0.1);
      }
    }

    this.image = imageArray;

    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
      },
      uniforms: {
        uTime: { value: 0 },
        resolution: { value: new THREE.Vector4() },
        uTexture: { value: new THREE.TextureLoader().load(texture) },
        uProgress: { value: 0 },
      },
      fragmentShader: fragment,
      vertexShader: vertex,
      side: THREE.DoubleSide,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      // wireframe: true,
    });

    // this.geometry = new THREE.PlaneGeometry(1, 1, 10, 10);
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(positions), 3)
    );
    this.geometry.setAttribute(
      'aPosition',
      new THREE.BufferAttribute(new Float32Array(positions2), 3)
    );
    this.geometry.setAttribute(
      'aRotation',
      new THREE.BufferAttribute(new Float32Array(rotation), 1)
    );
    this.geometry.setAttribute(
      'aSize',
      new THREE.BufferAttribute(new Float32Array(size), 1)
    );
    this.geometry.setAttribute(
      'aColors',
      new THREE.BufferAttribute(new Float32Array(colors), 3)
    );
    this.geometry.setAttribute(
      'aAlpha',
      new THREE.BufferAttribute(new Float32Array(alpha), 1)
    );

    this.plane = new THREE.Points(this.geometry, this.material);
    // this.plane.position.set(0, -0.5, 0);
    // this.plane.rotation.set(Math.PI, 0, 0);
    this.scene.add(this.plane);

    this.render();
  }

  moveTriangles() {
    let pos = this.geometry.attributes.position;
    let rot = this.geometry.attributes.aRotation;

    const posArray = pos.array;
    const rotArray = rot.array;

    for (let i = 0; i < posArray.length; i += 3) {
      let speed = this.speed[i / 3];

      let x = posArray[i];
      let y = posArray[i + 1];
      let rotation = rotArray[i / 3];

      let tx = (x * 50) / 2.08 + this.precision / 2;
      let ty = -y * 50 + this.precision / 2;

      if (tx <= 0 || tx >= this.precision || ty <= 0 || ty >= this.precision) {
        rotation += Math.PI;
      } else {
        let pixelColor = this.image[Math.floor(tx)][Math.floor(ty)];

        if (pixelColor < 50) {
          rotation += Math.PI + 0.5;
        }
      }

      x = x + Math.cos(rotation) * speed * 0.01;
      y = y + Math.sin(rotation) * speed * 0.01;

      posArray[i] = x;
      posArray[i + 1] = y;
      rotArray[i / 3] = rotation;
    }

    pos.needsUpdate = true;
    rot.needsUpdate = true;
  }

  settings() {
    this.settings = {
      progress: 0,
    };
    this.gui = new GUI();
    this.gui.add(this.settings, 'progress', 0, 1, 0.001);
  }

  render() {
    this.time += 0.05;
    this.moveTriangles();
    this.material.uniforms.uTime.value = this.time;
    this.material.uniforms.uProgress.value = this.settings.progress;
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render.bind(this));
  }
}

new Sketch();
