"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ─── GLSL Shaders for Lucent UI Refraction ──────────────────────────────────────
const VS_SOURCE = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const FS_SOURCE = `
  precision mediump float;
  varying vec2 vUv;
  uniform vec3 iResolution;
  uniform float iTime;
  uniform vec4 iMouse;
  uniform sampler2D iChannel0;
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
  uniform float uAberration;
  uniform float uLensAspect;

  void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    const float SAMPLE_RANGE = 4.0;
    vec2 uv = fragCoord / iResolution.xy;
    vec2 mouse = iMouse.xy;
    if (length(mouse) < 1.0) mouse = iResolution.xy / 2.0;
    vec2 m2 = (uv - mouse / iResolution.xy);
    float roundedBox = pow(abs(m2.x * iResolution.x / iResolution.y / uLensAspect), uPowerExponent) + pow(abs(m2.y), uPowerExponent);
    float rb1 = clamp((1.0 - roundedBox * uMaskMultiplier1) * uMaskStrength1, 0.0, 1.0);
    float rb2 = clamp((uMaskThreshold1 - roundedBox * uMaskMultiplier2) * uMaskStrength2, 0.0, 1.0) -
      clamp(pow(uMaskThreshold2 - roundedBox * uMaskMultiplier2, 1.0) * uMaskStrength2, 0.0, 1.0);
    float rb3 = clamp((uMaskThreshold3 - roundedBox * uMaskMultiplier3) * uMaskStrength3, 0.0, 1.0) -
      clamp(pow(1.0 - roundedBox * uMaskMultiplier3, 1.0) * uMaskStrength3, 0.0, 1.0);
    fragColor = vec4(0.0);
    float transition = smoothstep(0.0, 1.0, rb1 + rb2);
    if (transition > 0.0) {
      vec2 lens = ((uv - 0.5) * (1.0 - roundedBox * uLensMultiplier) + 0.5);
      float total = 0.0;
      vec4 blurColor = vec4(0.0);
      for (float x = -SAMPLE_RANGE; x <= SAMPLE_RANGE; x++) {
        for (float y = -SAMPLE_RANGE; y <= SAMPLE_RANGE; y++) {
          vec2 offset = vec2(x, y) * uSampleOffset / iResolution.xy;
          if (uAberration > 0.0) {
            vec2 rOffset = offset + (lens - 0.5) * uAberration * 0.02;
            vec2 bOffset = offset - (lens - 0.5) * uAberration * 0.02;
            blurColor.r += texture2D(iChannel0, rOffset + lens).r;
            blurColor.g += texture2D(iChannel0, offset + lens).g;
            blurColor.b += texture2D(iChannel0, bOffset + lens).b;
            blurColor.a += texture2D(iChannel0, offset + lens).a;
          } else {
            blurColor += texture2D(iChannel0, offset + lens);
          }
          total += 1.0;
        }
      }
      blurColor /= total;
      fragColor = blurColor;
      float gradient = clamp((clamp(m2.y, 0.0, uGradientRange) + uGradientOffset) / 2.0, 0.0, 1.0) +
        clamp((clamp(-m2.y, uGradientExtreme, uGradientRange) * rb3 + uGradientOffset) / 2.0, 0.0, 1.0);
      vec4 lighting = clamp(fragColor + vec4(rb1) * gradient + vec4(rb2) * uLightingIntensity, 0.0, 1.0);
      fragColor = mix(texture2D(iChannel0, uv), lighting, transition);
    } else {
      fragColor = texture2D(iChannel0, uv);
    }
  }

  void main() { mainImage(gl_FragColor, vUv * iResolution.xy); }
`;

// ─── Theme Configurations ──────────────────────────────────────────────────────
export type UiTheme = "lucent-ui" | "liquid-glass" | "dynamic-island" | "control-center" | "widget-space";

interface ThemeMeta {
  id: UiTheme;
  name: string;
  tagline: string;
  accentColor: string;
  next: UiTheme;
  prev: UiTheme;
  description: string;
  bgGlow: string;
}

const THEMES: Record<UiTheme, ThemeMeta> = {
  "lucent-ui": {
    id: "lucent-ui",
    name: "Lucent UI",
    tagline: "Liquid Glass Asset Library",
    accentColor: "#d1b894",
    next: "liquid-glass",
    prev: "widget-space",
    description: "WebGL-powered physical glass refraction, custom morphing lenses, and champagne gold accents.",
    bgGlow: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(209, 184, 148, 0.1), transparent 75%)"
  },
  "liquid-glass": {
    id: "liquid-glass",
    name: "Liquid Glass",
    tagline: "Frosted Color Bleeds",
    accentColor: "#a78bfa",
    next: "dynamic-island",
    prev: "lucent-ui",
    description: "Deep backdrop-filter blurs, color-tinted frosted panels, and soft organic glows.",
    bgGlow: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(167, 139, 250, 0.12), transparent 75%)"
  },
  "dynamic-island": {
    id: "dynamic-island",
    name: "Dynamic Island",
    tagline: "Fluid Pill Geometries",
    accentColor: "#34d399",
    next: "control-center",
    prev: "liquid-glass",
    description: "Pitch black minimal pills, smooth spring-based morphing, and high-contrast alert badges.",
    bgGlow: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(52, 211, 153, 0.1), transparent 75%)"
  },
  "control-center": {
    id: "control-center",
    name: "iOS Control Center",
    tagline: "Tactile Grid Panel",
    accentColor: "#60a5fa",
    next: "widget-space",
    prev: "dynamic-island",
    description: "Frosted iOS connectivity modules, wide vertical sliders, and deep pressable states.",
    bgGlow: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(96, 165, 250, 0.12), transparent 75%)"
  },
  "widget-space": {
    id: "widget-space",
    name: "iOS Widget Space",
    tagline: "Modular Home Screen Desk",
    accentColor: "#f472b6",
    next: "lucent-ui",
    prev: "control-center",
    description: "Frosted widget cards, concentric SVG fitness rings, and vibrant wallpaper gradients.",
    bgGlow: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(244, 114, 182, 0.12), transparent 75%)"
  }
};

interface UiDesignBoardProps {
  theme: UiTheme;
}

export function UiDesignBoard({ theme }: UiDesignBoardProps) {
  const router = useRouter();
  const current = THEMES[theme];

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<[number, number]>([0, 0]);

  // WebGL Refraction (only active for lucent-ui)
  useEffect(() => {
    if (theme !== "lucent-ui" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VS_SOURCE);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FS_SOURCE);
    gl.compileShader(fs);

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uniforms: Record<string, WebGLUniformLocation | null> = {};
    [
      "iResolution", "iTime", "iMouse", "iChannel0",
      "uPowerExponent", "uMaskMultiplier1", "uMaskMultiplier2", "uMaskMultiplier3",
      "uLensMultiplier", "uMaskStrength1", "uMaskStrength2", "uMaskStrength3",
      "uMaskThreshold1", "uMaskThreshold2", "uMaskThreshold3",
      "uSampleOffset", "uGradientRange", "uGradientOffset", "uGradientExtreme",
      "uLightingIntensity", "uAberration", "uLensAspect",
    ].forEach((n) => {
      uniforms[n] = gl.getUniformLocation(program, n);
    });

    // Texture
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([5, 5, 8, 255]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1600";
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    };

    let raf: number;
    const start = performance.now();
    const render = () => {
      const t = (performance.now() - start) / 1000;
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform3f(uniforms["iResolution"]!, canvas.width, canvas.height, 1);
      gl.uniform1f(uniforms["iTime"]!, t);
      gl.uniform4f(uniforms["iMouse"]!, mouseRef.current[0], canvas.height - mouseRef.current[1], 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.uniform1i(uniforms["iChannel0"]!, 0);

      // Lens settings
      gl.uniform1f(uniforms["uPowerExponent"]!, 6);
      gl.uniform1f(uniforms["uLensAspect"]!, 1);
      gl.uniform1f(uniforms["uMaskMultiplier1"]!, 10000);
      gl.uniform1f(uniforms["uMaskMultiplier2"]!, 9500);
      gl.uniform1f(uniforms["uMaskMultiplier3"]!, 11000);
      gl.uniform1f(uniforms["uLensMultiplier"]!, 5000 * 1.2);
      gl.uniform1f(uniforms["uMaskStrength1"]!, 8);
      gl.uniform1f(uniforms["uMaskStrength2"]!, 16);
      gl.uniform1f(uniforms["uMaskStrength3"]!, 2);
      gl.uniform1f(uniforms["uMaskThreshold1"]!, 0.95);
      gl.uniform1f(uniforms["uMaskThreshold2"]!, 0.9);
      gl.uniform1f(uniforms["uMaskThreshold3"]!, 1.5);
      gl.uniform1f(uniforms["uSampleOffset"]!, 0.6);
      gl.uniform1f(uniforms["uGradientRange"]!, 0.2);
      gl.uniform1f(uniforms["uGradientOffset"]!, 0.1);
      gl.uniform1f(uniforms["uGradientExtreme"]!, -1000);
      gl.uniform1f(uniforms["uLightingIntensity"]!, 0.25);
      gl.uniform1f(uniforms["uAberration"]!, 0.8);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const mouseHandler = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = [e.clientX - rect.left, e.clientY - rect.top];
    };
    window.addEventListener("mousemove", mouseHandler);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", mouseHandler);
      cancelAnimationFrame(raf);
    };
  }, [theme]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") router.push(`/uidesign/${current.next}`);
      if (e.key === "ArrowLeft") router.push(`/uidesign/${current.prev}`);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [current, router]);

  return (
    <div className={`uib-root ${theme}`}>
      {/* Lucent UI Refraction Canvas */}
      {theme === "lucent-ui" && <canvas ref={canvasRef} className="uib-canvas" />}

      {/* Dynamic Backgrounds */}
      {theme === "widget-space" && (
        <div className="uib-wallpaper">
          <div className="uib-orb uib-orb-1" />
          <div className="uib-orb uib-orb-2" />
        </div>
      )}
      <div className="uib-bg-glow" style={{ background: current.bgGlow }} />

      {/* Navigation Edge Arrows */}
      <Link href={`/uidesign/${current.prev}`} className="uib-arrow-nav left" aria-label="Previous style">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </Link>
      <Link href={`/uidesign/${current.next}`} className="uib-arrow-nav right" aria-label="Next style">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </Link>

      <div className="uib-container">
        {/* Top Header */}
        <header className="uib-header">
          <div className="uib-header-meta">
            <span className="uib-theme-badge" style={{ borderColor: `${current.accentColor}40`, color: current.accentColor }}>
              {current.name}
            </span>
            <h1 className="uib-title">{current.tagline}</h1>
          </div>
          <p className="uib-desc">{current.description}</p>
        </header>

        {/* The Standardized Preview Board Grid */}
        <div className="uib-board">

          {/* Left Column: UI Elements */}
          <div className="uib-column">
            
            {/* 1. Buttons Panel */}
            <div className="uib-panel uib-buttons-panel">
              <span className="uib-panel-label">Buttons</span>
              <div className="uib-panel-content row">
                <button className="uib-btn primary">Primary Action</button>
                <button className="uib-btn secondary">Secondary</button>
                <button className="uib-btn icon" title="Settings">
                  ⚙️
                </button>
              </div>
            </div>

            {/* 2. Form Controls Panel */}
            <div className="uib-panel uib-forms-panel">
              <span className="uib-panel-label">Form Controls</span>
              <div className="uib-panel-content col">
                <div className="uib-input-wrap">
                  <span className="uib-input-icon">⌕</span>
                  <input type="text" className="uib-input" placeholder="Search database..." defaultValue="Refraction..." />
                </div>
                <div className="uib-form-row">
                  <div className="uib-toggle-wrap">
                    <label className="uib-toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="uib-toggle-slider" />
                    </label>
                    <span className="uib-toggle-label">Active State</span>
                  </div>
                  <div className="uib-slider-wrap">
                    <input type="range" className="uib-slider" min="0" max="100" defaultValue="72" />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Containers & Data */}
          <div className="uib-column">

            {/* 3. Profile Card */}
            <div className="uib-panel uib-profile-card">
              <div className="uib-profile-header">
                <div className="uib-avatar" />
                <div className="uib-profile-info">
                  <h4 className="uib-profile-name">Alexander Vance</h4>
                  <span className="uib-profile-role" style={{ color: current.accentColor }}>Lead Architect</span>
                </div>
              </div>
              <p className="uib-profile-bio">WebGL developer building high-fidelity interactive interfaces.</p>
              <div className="uib-stats">
                <div className="uib-stat"><strong>42</strong><span>Assets</span></div>
                <div className="uib-stat"><strong>12K</strong><span>Loads</span></div>
                <div className="uib-stat"><strong>99%</strong><span>Rating</span></div>
              </div>
            </div>

            {/* 4. Data Table */}
            <div className="uib-panel uib-table-panel">
              <table className="uib-table">
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>Status</th>
                    <th>Metric</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>refraction.glsl</td>
                    <td><span className="uib-status active">Active</span></td>
                    <td>98.4 GFLOP</td>
                  </tr>
                  <tr>
                    <td>blur_filter.js</td>
                    <td><span className="uib-status active">Active</span></td>
                    <td>120 FPS</td>
                  </tr>
                  <tr>
                    <td>chroma_split.js</td>
                    <td><span className="uib-status idle">Idle</span></td>
                    <td>—</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
