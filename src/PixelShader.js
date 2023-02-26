import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

const PixelShader = ({ amount }) => ({
  uniforms: {
    tDiffuse: { value: null },
    amount: { value: amount },
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
    uniform float amount;

    varying vec2 vUv;

    vec4 pixelate(sampler2D s, vec2 uv) {
      vec2 grid_uv = round(uv * amount) / amount;
      return texture2D(s, grid_uv);
    }

    void main() {
       vec4 color = pixelate(tDiffuse, vUv);
       gl_FragColor = vec4(round(color.rgb), 1.0);
	  }`,
});

class PixelPass extends ShaderPass {
  constructor(uniforms) {
    super(PixelShader({ amount: uniforms?.amount || 100 }));
  }
}

export { PixelPass };
