// WebGL Shader Sources

export const vsSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    // Map clip space [-1, 1] to UV [0, 1]
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

export const fsSource = `
  precision mediump float;

  varying vec2 vUv;

  uniform vec3 iResolution;
  uniform float iTime;
  uniform vec4 iMouse;
  uniform sampler2D iChannel0;

  // Parameterized Uniforms for Lens Customization
  uniform float uPowerExponent;
  uniform float uMaskMultiplier1;
  uniform float uMaskMultiplier2;
  uniform float uMaskMultiplier3;
  uniform float uLensMultiplier;
  uniform float uMaskStrength1;
  uniform float uMaskStrength2;
  uniform float uMaskStrength3;
  uniform float uMaskThreshold1;
  uniform float uMaskThreshold2;
  uniform float uMaskThreshold3;
  uniform float uSampleOffset;
  uniform float uGradientRange;
  uniform float uGradientOffset;
  uniform float uGradientExtreme;
  uniform float uLightingIntensity;
  uniform float uAberration; // Chromatic Aberration intensity
  uniform float uLensAspect; // Aspect ratio of the lens (width / height)

  void mainImage(out vec4 fragColor, in vec2 fragCoord)
  {
    // Constants
    const float NUM_ZERO = 0.0;
    const float NUM_ONE = 1.0;
    const float NUM_HALF = 0.5;
    const float NUM_TWO = 2.0;
    const float SAMPLE_RANGE = 4.0;

    vec2 uv = fragCoord / iResolution.xy;
    vec2 mouse = iMouse.xy;
    if (length(mouse) < NUM_ONE) {
      mouse = iResolution.xy / NUM_TWO;
    }
    vec2 m2 = (uv - mouse / iResolution.xy);

    // Compute the rounded box shape based on exponent and aspect ratio
    float roundedBox = pow(abs(m2.x * iResolution.x / iResolution.y / uLensAspect), uPowerExponent) + pow(abs(m2.y), uPowerExponent);
    
    // Mask calculations
    float rb1 = clamp((NUM_ONE - roundedBox * uMaskMultiplier1) * uMaskStrength1, NUM_ZERO, NUM_ONE);
    float rb2 = clamp((uMaskThreshold1 - roundedBox * uMaskMultiplier2) * uMaskStrength2, NUM_ZERO, NUM_ONE) -
      clamp(pow(uMaskThreshold2 - roundedBox * uMaskMultiplier2, NUM_ONE) * uMaskStrength2, NUM_ZERO, NUM_ONE);
    float rb3 = clamp((uMaskThreshold3 - roundedBox * uMaskMultiplier3) * uMaskStrength3, NUM_ZERO, NUM_ONE) -
      clamp(pow(NUM_ONE - roundedBox * uMaskMultiplier3, NUM_ONE) * uMaskStrength3, NUM_ZERO, NUM_ONE);

    fragColor = vec4(NUM_ZERO);
    float transition = smoothstep(NUM_ZERO, NUM_ONE, rb1 + rb2);

    if (transition > NUM_ZERO) {
      // Lens distortion
      vec2 lens = ((uv - NUM_HALF) * NUM_ONE * (NUM_ONE - roundedBox * uLensMultiplier) + NUM_HALF);
      
      // Blur sampling loop
      float total = NUM_ZERO;
      vec4 blurColor = vec4(0.0);
      
      for (float x = -SAMPLE_RANGE; x <= SAMPLE_RANGE; x++) {
        for (float y = -SAMPLE_RANGE; y <= SAMPLE_RANGE; y++) {
          vec2 offset = vec2(x, y) * uSampleOffset / iResolution.xy;
          
          // Apply Chromatic Aberration inside the lens if enabled
          if (uAberration > 0.0) {
            vec2 rOffset = offset + (lens - NUM_HALF) * uAberration * 0.02;
            vec2 bOffset = offset - (lens - NUM_HALF) * uAberration * 0.02;
            
            blurColor.r += texture2D(iChannel0, rOffset + lens).r;
            blurColor.g += texture2D(iChannel0, offset + lens).g;
            blurColor.b += texture2D(iChannel0, bOffset + lens).b;
            blurColor.a += texture2D(iChannel0, offset + lens).a;
          } else {
            blurColor += texture2D(iChannel0, offset + lens);
          }
          total += NUM_ONE;
        }
      }
      blurColor /= total;
      fragColor = blurColor;

      // Lighting and gradient highlights
      float gradient = clamp((clamp(m2.y, NUM_ZERO, uGradientRange) + uGradientOffset) / NUM_TWO, NUM_ZERO, NUM_ONE) +
        clamp((clamp(-m2.y, uGradientExtreme, uGradientRange) * rb3 + uGradientOffset) / NUM_TWO, NUM_ZERO, NUM_ONE);
      vec4 lighting = clamp(fragColor + vec4(rb1) * gradient + vec4(rb2) * uLightingIntensity, NUM_ZERO, NUM_ONE);

      fragColor = mix(texture2D(iChannel0, uv), lighting, transition);
    } else {
      fragColor = texture2D(iChannel0, uv);
    }
  }

  void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
  }
`;
