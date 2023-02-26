import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";

const StrokeOutlineShader = ({ size }) => ({
  uniforms: {
    tDiffuse: { value: null },
    strokeSize: { value: size },
    windowWidth: { value: window.innerWidth },
    windowHeight: { value: window.innerHeight },
  },
  vertexShader: /* glsl */ `
      varying vec2 vUv;

      void main()
      {
      	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

      	vUv = uv;
      	gl_Position = (projectionMatrix * mvPosition);
      }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float strokeSize;
    uniform float windowWidth;
    uniform float windowHeight;

    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec4 strokeColor = vec4(0.0, 0.0, 0.0, 1.0);

      bool isStroke = false;
      for(float i=0.0; i < strokeSize; i++) {
        if(gl_FragCoord.x + i < windowWidth && gl_FragCoord.y + i < windowHeight) {
            vec4 topRight = texelFetch(tDiffuse, ivec2(gl_FragCoord.xy + vec2(i, i)), 0);
            if(topRight != vec4(1.0) && color.rgb == vec3(1.0,1.0,1.0)) {
                isStroke = true;
            }
        } 
      }

      if(isStroke == true) {
        gl_FragColor = strokeColor;
      } else {
        gl_FragColor = color;
      }
	}`,
});

class StrokeOutlinePass extends ShaderPass {
  constructor(uniforms) {
    super(StrokeOutlineShader({ size: uniforms?.size || 15 }));
  }
}
export { StrokeOutlinePass };
