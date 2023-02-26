import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

const DropShadowShader = ({ amount }) => ({
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

    vec4 pixelate(sampler2D s, vec2 uv, int amount) {
        vec2 grid_uv = round(uv * float(amount)) / float(amount);
        return texture2D(s, grid_uv);
    }

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec4 backgroundColor = vec4(0.55, 0.67, 0.06, 1.);
      vec4 shadowColor = backgroundColor; 
      float shadowSize = 10.0;

      bool isShadow = false;
      for(float i=0.0; i < shadowSize; i++) {
        vec4 topRight = texelFetch(tDiffuse, ivec2(gl_FragCoord.xy + vec2(i, i)), 0);
        if(topRight != vec4(1.0, 1.0, 1.0, 1.0) && color.rgb == vec3(1.0,1.0,1.0)) {
          isShadow = true;
        } 
      }

      if(isShadow) {
        gl_FragColor = shadowColor;
      } else if(color == vec4(1.0)) {
        vec2 grid_uv = round(vUv * amount) / amount;
        float test = round(grid_uv.x * amount);
        float test2 = round(grid_uv.y * amount);

        if(mod(test, 2.0) != 0.0 && mod(test2, 2.0) != 0.0) {
          gl_FragColor = backgroundColor * 0.7;
        }  else {
          gl_FragColor = backgroundColor * 0.9;
        }
      } else {
        gl_FragColor = color;
      }
	}`,
});

class DropShadowPass extends ShaderPass {
  constructor(uniforms) {
    super(DropShadowShader({ amount: uniforms?.amount || 150 }));
  }
}

export { DropShadowPass };
