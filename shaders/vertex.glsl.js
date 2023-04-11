const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vColors;
  varying float vRotation;
  varying float vAlpha;

  attribute vec3 aColors;
  attribute float aRotation;
  attribute float aSize;
  attribute float aAlpha;

  void main() {
    vUv = uv;
    vColors = aColors;
    vRotation = aRotation;
    vAlpha = aAlpha;

    vec4 mvPosition = modelViewMatrix * vec4( position, 1. );
    gl_PointSize = aSize * 40. * ( 1. / - mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export default vertexShader;
