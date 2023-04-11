const fragmentShader = /* glsl */ `
    varying vec2 vUv;
    varying vec3 vColors;
    varying float vRotation;
    varying float vAlpha;

    uniform sampler2D uTexture;
    float PI = 3.141592653;

    vec2 rotate(vec2 v, float a) {
        float s = sin(a);
        float c = cos(a);
        mat2 m = mat2(c, -s, s, c);
        return m * v;
    }

    void main() {
        vec2 uv1 = gl_PointCoord;

        uv1 = rotate(uv1 - vec2(0.5), vRotation) + vec2(0.5);

        vec4 texture = texture2D(uTexture, uv1);

        // gl_FragColor = vec4( vUv, 0., 1.);
        // gl_FragColor = texture;
        gl_FragColor = vec4(vColors, texture.a * vAlpha);
    }
`;

export default fragmentShader;
