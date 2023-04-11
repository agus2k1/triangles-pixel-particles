const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vColors;
  varying float vRotation;
  varying float vAlpha;

  uniform float uTime;
  uniform float uProgress;

  attribute vec3 aColors;
  attribute float aRotation;
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aPosition;

  void main() {
    vUv = uv;
    vColors = aColors;
    vRotation = aRotation;
    vAlpha = aAlpha * (1. - uProgress);

    vec3 newPosition = position;

    float dist = distance(newPosition, vec3(-1., 0., 0.));

    newPosition = mix(newPosition, aPosition, uProgress);
    newPosition.x += sin(dist * 5. + uTime) * 0.002;
    newPosition.y += sin(dist * 5. + uTime) * 0.008;

    vec4 mvPosition = modelViewMatrix * vec4( newPosition, 1. );
    gl_PointSize = aSize * 40. * ( 1. / - mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export default vertexShader;
