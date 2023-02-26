import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

const OutlineShader = ({ threshold }) => ({
  uniforms: {
    tDiffuse: { value: null },
    threshold: {
      value: threshold / 1000,
    },
  },
  vertexShader: /* glsl */ `
      varying vec2 vUv;

      void main()
      {
      	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

      	vUv = uv;
      	gl_Position = projectionMatrix * mvPosition;
      }`,

  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float threshold;

    varying vec2 vUv;

    const float robertsCrossX[4] = float[](1.0, 0.0, 0.0, -1.0);
    const float robertsCrossY[4] = float[](0.0, 1.0, -1.0, 0.0);

    vec3 grayscale(vec3 color) {
        return vec3((color.r + color.g + color.b) / 3.0);
    }

    vec3 outline() {
        vec4 topLeft = texelFetch(tDiffuse, ivec2(gl_FragCoord.xy + vec2(-1.0, 1.0)), 0);
        vec4 bottomLeft = texelFetch(tDiffuse, ivec2(gl_FragCoord.xy + vec2(-1.0, -1.0)), 0);
        vec4 topRight = texelFetch(tDiffuse, ivec2(gl_FragCoord.xy + vec2(1.0, 1.0)), 0);
        vec4 bottomRight = texelFetch(tDiffuse, ivec2(gl_FragCoord.xy + vec2(1.0, -1.0)), 0);

        vec3 horizontal = grayscale(topLeft.rgb) * robertsCrossX[0];
        horizontal += grayscale(bottomRight.rgb) * robertsCrossX[3];

        vec3 vertical = grayscale(bottomLeft.rgb) * robertsCrossY[2];
        vertical += grayscale(topRight.rgb) * robertsCrossY[1];

        float edge = sqrt(dot(horizontal, horizontal) + dot(vertical, vertical));

        edge = step(threshold, edge);

        return vec3(1.0 - edge);
    }

    void main() {
        gl_FragColor = vec4(outline(), 1.0);
	}`,
});

class OutlinePass extends ShaderPass {
  constructor(uniforms) {
    super(OutlineShader({ threshold: uniforms?.threshold || 75 }));
  }
}

export { OutlinePass };
