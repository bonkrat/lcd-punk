import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "./OutlineShader";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { PixelPass } from "./PixelShader";
import { DropShadowPass } from "./DropShadowShader";
import { StrokeOutlinePass } from "./StrokeOutlineShader";

function loadModel(url) {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        resolve(gltf);
      },
      undefined,
      (error) => reject(error)
    );
  });
}

export async function init() {
  const container = document.getElementById("container");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    3000
  );
  camera.position.z = 10;

  const model = (await loadModel("/banana.glb")).scene.children[0];
  model.scale.multiplyScalar(0.03);
  model.rotation.x = -1.5;
  model.rotation.z = 2.5;
  scene.add(model);

  const lightColor = new THREE.Color(0xffffff);
  const ambientLight = new THREE.AmbientLight(lightColor);
  scene.add(ambientLight);

  const dLight = new THREE.DirectionalLight(lightColor);
  dLight.position.set(1, 2.5, 1);
  dLight.target = model;
  scene.add(dLight);

  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const passes = [OutlinePass, StrokeOutlinePass, PixelPass, DropShadowPass];
  passes.forEach((pass) => {
    composer.addPass(new pass());
  });

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 3;
  controls.update();

  onWindowResize();

  window.addEventListener("resize", onWindowResize);

  Array.from(document.getElementsByClassName("uniform")).forEach((uniform) => {
    uniform.addEventListener("input", onUniformChange);
  });

  animate();

  function onUniformChange(e) {
    const shaderIndexes = Array.from(e.target.dataset.shader.split(","));
    shaderIndexes.forEach((shader) => {
      const shaderIndex = parseInt(shader);
      const uniformKey = e.target.dataset.uniform;
      composer.removePass(composer.passes[shaderIndex]);
      const shaderPass = passes[shaderIndex - 1];
      composer.insertPass(
        new shaderPass({ [uniformKey]: e.target.value }),
        shaderIndex
      );
    });
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    controls.enablePan = false;

    render();
  }

  function render() {
    composer.render(scene, camera);
  }
}
