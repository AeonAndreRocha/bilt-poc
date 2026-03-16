import {
  ArcRotateCamera,
  Color4,
  DirectionalLight,
  HemisphericLight,
  Scene,
  ShadowGenerator,
  Vector3,
} from '@babylonjs/core';

export function setupScene(scene: Scene) {
  scene.clearColor = new Color4(0.95, 0.95, 0.95, 1);

  // Camera - orbit around the center
  const camera = new ArcRotateCamera(
    'camera',
    -Math.PI / 4,   // alpha (horizontal rotation)
    Math.PI / 3,    // beta (vertical tilt)
    2.5,            // radius
    new Vector3(0, 0.35, 0), // target (center of shelf)
    scene
  );
  camera.lowerRadiusLimit = 1;
  camera.upperRadiusLimit = 5;
  camera.lowerBetaLimit = 0.2;
  camera.upperBetaLimit = Math.PI / 2 - 0.1;
  camera.wheelPrecision = 50;
  camera.panningSensibility = 0; // disable panning — orbit only
  camera.attachControl(scene.getEngine().getRenderingCanvas()!, true);

  // Ambient light
  const hemi = new HemisphericLight('hemi', new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.6;

  // Directional light for shadows
  const dir = new DirectionalLight('dir', new Vector3(-1, -2, 1).normalize(), scene);
  dir.position = new Vector3(2, 4, -2);
  dir.intensity = 0.8;

  const shadowGen = new ShadowGenerator(1024, dir);
  shadowGen.useBlurExponentialShadowMap = true;
  shadowGen.blurKernel = 16;

  return { camera, shadowGen };
}
