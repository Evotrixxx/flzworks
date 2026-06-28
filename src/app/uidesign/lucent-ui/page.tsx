"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── GLSL Shaders (ported from UX_UI_samples/Lucent UI/shaders.js) ────────────
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

// ─── Component definitions ─────────────────────────────────────────────────────
interface Component {
  id: string;
  title: string;
  description: string;
  lensExpand: number;
  lensShape: number;
  htmlKey: string;
  cssKey: string;
}

const COMPONENTS: Component[] = [
  {
    id: "buttons",
    title: "Glass Buttons",
    description: "Buttons utilizing layered borders and soft box-shadows. The primary button features a gold-tinted glowing edge.",
    lensExpand: 1.0,
    lensShape: 8.0,
    htmlKey: "html-buttons",
    cssKey: "css-buttons",
  },
  {
    id: "inputs",
    title: "Form Controls",
    description: "Interactive inputs with high-contrast active states. Toggles and sliders feature custom WebGL-inspired accents.",
    lensExpand: 1.05,
    lensShape: 6.0,
    htmlKey: "html-inputs",
    cssKey: "css-inputs",
  },
  {
    id: "cards",
    title: "Profile Card",
    description: "A composite container showcasing avatar clipping, stat grids, and action buttons in a unified glass layout.",
    lensExpand: 1.1,
    lensShape: 12.0,
    htmlKey: "html-cards",
    cssKey: "css-cards",
  },
  {
    id: "tables",
    title: "Data Table",
    description: "Data grid styled with subtle row borders and highlighted headers. Perfect for dashboards and control panels.",
    lensExpand: 1.0,
    lensShape: 4.0,
    htmlKey: "html-tables",
    cssKey: "css-tables",
  },
];

// ─── WebGL hook ────────────────────────────────────────────────────────────────
function useWebGL(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  mouse: React.RefObject<[number, number]>,
  sliders: { mag: number; blur: number; glow: number; aberration: number }
) {
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  const textureRef = useRef<WebGLTexture | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(performance.now());
  const lensRef = useRef({ aspect: 1, size: 1, exponent: 6 });
  const lensTargetRef = useRef({ aspect: 1, size: 1, exponent: 6 });

  const setLensTarget = useCallback((aspect: number, size: number, exponent: number) => {
    lensTargetRef.current = { aspect, size, exponent };
  }, []);

  const resetLens = useCallback(() => {
    lensTargetRef.current = { aspect: 1, size: 1, exponent: 6 };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return;
    glRef.current = gl;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    // Compile shaders
    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = compile(gl.FRAGMENT_SHADER, FS_SOURCE);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);
    programRef.current = program;

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uniformNames = [
      "iResolution", "iTime", "iMouse", "iChannel0",
      "uPowerExponent", "uMaskMultiplier1", "uMaskMultiplier2", "uMaskMultiplier3",
      "uLensMultiplier", "uMaskStrength1", "uMaskStrength2", "uMaskStrength3",
      "uMaskThreshold1", "uMaskThreshold2", "uMaskThreshold3",
      "uSampleOffset", "uGradientRange", "uGradientOffset", "uGradientExtreme",
      "uLightingIntensity", "uAberration", "uLensAspect",
    ];
    uniformNames.forEach((n) => {
      uniformsRef.current[n] = gl!.getUniformLocation(program, n);
    });

    // Texture
    const tex = gl.createTexture()!;
    textureRef.current = tex;
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
      gl!.bindTexture(gl!.TEXTURE_2D, tex);
      gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, true);
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, img);
    };

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, [canvasRef]);

  // Render loop
  useEffect(() => {
    const gl = glRef.current;
    const u = uniformsRef.current;

    function render() {
      if (!gl || !u["iResolution"]) { rafRef.current = requestAnimationFrame(render); return; }
      const canvas = canvasRef.current!;
      const t = (performance.now() - startTimeRef.current) / 1000;

      // LERP lens
      const lerp = (a: number, b: number, s: number) => a + (b - a) * s;
      lensRef.current.aspect = lerp(lensRef.current.aspect, lensTargetRef.current.aspect, 0.08);
      lensRef.current.size   = lerp(lensRef.current.size, lensTargetRef.current.size, 0.08);
      lensRef.current.exponent = lerp(lensRef.current.exponent, lensTargetRef.current.exponent, 0.08);

      const { aspect, size, exponent } = lensRef.current;
      const scale = 1.0 / Math.pow(size, exponent);

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform3f(u["iResolution"]!, canvas.width, canvas.height, 1);
      gl.uniform1f(u["iTime"]!, t);
      gl.uniform4f(u["iMouse"]!, mouse.current[0], canvas.height - mouse.current[1], 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textureRef.current);
      gl.uniform1i(u["iChannel0"]!, 0);

      gl.uniform1f(u["uPowerExponent"]!, exponent);
      gl.uniform1f(u["uLensAspect"]!, aspect);
      gl.uniform1f(u["uMaskMultiplier1"]!, 10000 * scale);
      gl.uniform1f(u["uMaskMultiplier2"]!, 9500  * scale);
      gl.uniform1f(u["uMaskMultiplier3"]!, 11000 * scale);
      gl.uniform1f(u["uLensMultiplier"]!,  5000  * scale * sliders.mag);
      gl.uniform1f(u["uMaskStrength1"]!, 8);
      gl.uniform1f(u["uMaskStrength2"]!, 16);
      gl.uniform1f(u["uMaskStrength3"]!, 2);
      gl.uniform1f(u["uMaskThreshold1"]!, 0.95);
      gl.uniform1f(u["uMaskThreshold2"]!, 0.9);
      gl.uniform1f(u["uMaskThreshold3"]!, 1.5);
      gl.uniform1f(u["uSampleOffset"]!, sliders.blur);
      gl.uniform1f(u["uGradientRange"]!, 0.2);
      gl.uniform1f(u["uGradientOffset"]!, 0.1);
      gl.uniform1f(u["uGradientExtreme"]!, -1000);
      gl.uniform1f(u["uLightingIntensity"]!, sliders.glow);
      gl.uniform1f(u["uAberration"]!, sliders.aberration);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafRef.current);
  }, [canvasRef, mouse, sliders]);

  return { setLensTarget, resetLens };
}

// ─── Component previews ────────────────────────────────────────────────────────
function ButtonsPreview() {
  return (
    <div className="lu-preview-row">
      <button className="lu-btn-primary">Refractive Primary</button>
      <button className="lu-btn-secondary">Glass Secondary</button>
      <button className="lu-btn-icon" title="Settings">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 9a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  );
}

function InputsPreview() {
  return (
    <div className="lu-preview-col">
      <div className="lu-form-group">
        <label className="lu-label">Search Database</label>
        <div className="lu-input-wrap">
          <input type="text" className="lu-input" placeholder="Enter query..." />
          <svg className="lu-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>
      <div className="lu-form-row">
        <div className="lu-form-group">
          <label className="lu-label">Refraction Overlay</label>
          <label className="lu-toggle">
            <input type="checkbox" defaultChecked />
            <span className="lu-toggle-slider" />
          </label>
        </div>
        <div className="lu-form-group lu-flex1">
          <label className="lu-label">System Gain</label>
          <input type="range" className="lu-slider" min="0" max="100" defaultValue="70" />
        </div>
      </div>
    </div>
  );
}

function CardsPreview() {
  return (
    <div className="lu-profile-card">
      <div className="lu-profile-header">
        <div className="lu-avatar">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150" alt="Avatar" />
        </div>
        <div>
          <h4 className="lu-profile-name">Alexander Vance</h4>
          <span className="lu-profile-role">Lead Architect</span>
        </div>
      </div>
      <p className="lu-profile-bio">Specializing in WebGL shader development and interactive UX design systems.</p>
      <div className="lu-stats">
        <div className="lu-stat"><span className="lu-stat-val">42</span><span className="lu-stat-lbl">Assets</span></div>
        <div className="lu-stat"><span className="lu-stat-val">12K</span><span className="lu-stat-lbl">Downloads</span></div>
        <div className="lu-stat"><span className="lu-stat-val">99.8%</span><span className="lu-stat-lbl">Rating</span></div>
      </div>
      <button className="lu-btn-primary lu-w100">View Portfolio</button>
    </div>
  );
}

function TablesPreview() {
  return (
    <div className="lu-table-wrap">
      <table className="lu-table">
        <thead>
          <tr>
            <th>Module</th><th>Status</th><th>Performance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>refraction.glsl</td>
            <td><span className="lu-status lu-status-active">Active</span></td>
            <td>98.4 GFLOPS</td>
          </tr>
          <tr>
            <td>blur_filter.js</td>
            <td><span className="lu-status lu-status-active">Active</span></td>
            <td>120.1 FPS</td>
          </tr>
          <tr>
            <td>chroma_split.glsl</td>
            <td><span className="lu-status lu-status-idle">Idle</span></td>
            <td>—</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const COMPONENT_PREVIEWS = [ButtonsPreview, InputsPreview, CardsPreview, TablesPreview];

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function LucentUIPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<[number, number]>([0, 0]);
  const [activeComp, setActiveComp] = useState(0);
  const [animDir, setAnimDir] = useState<"left" | "right" | null>(null);
  const [animating, setAnimating] = useState(false);
  const [toast, setToast] = useState("");
  const [sliders, setSliders] = useState({ mag: 1.2, blur: 0.6, glow: 0.25, aberration: 0.8 });

  const { setLensTarget, resetLens } = useWebGL(canvasRef, mouseRef, sliders);

  // Mouse tracking
  useEffect(() => {
    const handler = (e: MouseEvent) => { mouseRef.current = [e.clientX, e.clientY]; };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") navigateComp("right");
      if (e.key === "ArrowLeft")  navigateComp("left");
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const navigateComp = (dir: "left" | "right") => {
    if (animating) return;
    setAnimDir(dir);
    setAnimating(true);
    setTimeout(() => {
      setActiveComp((prev) =>
        dir === "right" ? (prev + 1) % COMPONENTS.length : (prev - 1 + COMPONENTS.length) % COMPONENTS.length
      );
      setAnimating(false);
      setAnimDir(null);
    }, 280);
  };

  const comp = COMPONENTS[activeComp];
  const Preview = COMPONENT_PREVIEWS[activeComp];

  const handleCardHover = (c: Component) => {
    setLensTarget(Math.min(500 / 280, 2.2), c.lensExpand * 1.25, c.lensShape);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <div className="lu-root">
      {/* WebGL canvas */}
      <canvas ref={canvasRef} className="lu-canvas" />

      {/* Custom cursor */}
      <div className="lu-cursor" id="lu-cursor" />

      {/* Toast */}
      {toast && (
        <div className="lu-toast">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          {toast}
        </div>
      )}

      <div className="lu-app">
        {/* Navbar */}
        <nav className="lu-nav">
          <div className="lu-nav-brand">
            <span className="lu-nav-logo">Lucent UI</span>
            <span className="lu-nav-badge">v1.0.0</span>
          </div>
          <div className="lu-nav-links">
            {COMPONENTS.map((c, i) => (
              <button
                key={c.id}
                className={`lu-nav-link ${i === activeComp ? "active" : ""}`}
                onClick={() => {
                  if (i > activeComp) navigateComp("right");
                  else if (i < activeComp) navigateComp("left");
                  else setActiveComp(i);
                }}
              >
                {c.title}
              </button>
            ))}
          </div>
          <div className="lu-nav-info">
            <span className="lu-comp-counter">
              {String(activeComp + 1).padStart(2, "0")}/{String(COMPONENTS.length).padStart(2, "0")}
            </span>
          </div>
        </nav>

        {/* Main layout */}
        <div className="lu-layout">
          {/* Left: showcase */}
          <main className="lu-showcase">
            <header className="lu-showcase-header">
              <h1>Liquid Glass UI Showcase</h1>
              <p>A premium design system featuring physical WebGL refraction. Hover over any component to see the background grid warp and magnify through the glass elements.</p>
            </header>

            {/* Component panel with arrow nav */}
            <div className="lu-panel-nav">
              <button className="lu-panel-arrow" onClick={() => navigateComp("left")} aria-label="Previous component">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <div
                key={activeComp}
                className={`lu-component-card lu-glass-card ${animating ? `lu-slide-out-${animDir}` : "lu-slide-in"}`}
                onMouseEnter={() => handleCardHover(comp)}
                onMouseLeave={resetLens}
              >
                <div className="lu-comp-preview">
                  <Preview />
                </div>
                <div className="lu-comp-meta">
                  <div>
                    <h3 className="lu-comp-title">{comp.title}</h3>
                    <p className="lu-comp-desc">{comp.description}</p>
                  </div>
                  <div className="lu-code-actions">
                    <button
                      className="lu-btn-copy"
                      onClick={() => {
                        navigator.clipboard.writeText(`<!-- ${comp.title} HTML -->\n<!-- See flz.works/uidesign/lucent-ui for full source -->`).then(() => showToast("HTML template copied!"));
                      }}
                    >
                      Copy HTML
                    </button>
                    <button
                      className="lu-btn-copy"
                      onClick={() => {
                        navigator.clipboard.writeText(`/* ${comp.title} CSS */\n/* See flz.works/uidesign/lucent-ui for full source */`).then(() => showToast("CSS template copied!"));
                      }}
                    >
                      Copy CSS
                    </button>
                  </div>
                </div>
              </div>

              <button className="lu-panel-arrow" onClick={() => navigateComp("right")} aria-label="Next component">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>

            {/* Dot indicators */}
            <div className="lu-dots">
              {COMPONENTS.map((_, i) => (
                <button
                  key={i}
                  className={`lu-dot ${i === activeComp ? "active" : ""}`}
                  onClick={() => {
                    if (i > activeComp) navigateComp("right");
                    else navigateComp("left");
                  }}
                />
              ))}
            </div>
          </main>

          {/* Right: configurator */}
          <aside className="lu-sidebar lu-glass-panel">
            <div className="lu-sidebar-header">
              <h2>Lens Configurator</h2>
            </div>
            <div className="lu-sidebar-body">
              <div className="lu-info-box">
                <strong>Refraction Shader</strong> is active behind the page. Hover components to warp and magnify the background through the glass boundaries.
              </div>

              <div className="lu-ctrl-group">
                <h3 className="lu-ctrl-title">Global Adjustments</h3>
                {[
                  { key: "mag", label: "Lens Magnification", min: 0.2, max: 2.5, step: 0.05, fmt: (v: number) => `${v.toFixed(1)}x` },
                  { key: "blur", label: "Depth Blur", min: 0, max: 2, step: 0.05, fmt: (v: number) => v === 0 ? "None" : v <= 0.4 ? "Subtle" : v <= 0.8 ? "Medium" : "Deep" },
                  { key: "glow", label: "Refractive Glow", min: 0, max: 1, step: 0.05, fmt: (v: number) => v.toFixed(2) },
                  { key: "aberration", label: "Glass Aberration", min: 0, max: 3, step: 0.05, fmt: (v: number) => v === 0 ? "None" : v <= 0.5 ? "Subtle" : v <= 1.2 ? "Prismatic" : "Extreme" },
                ].map(({ key, label, min, max, step, fmt }) => (
                  <div key={key} className="lu-ctrl-item">
                    <div className="lu-ctrl-label">
                      <span>{label}</span>
                      <span>{fmt(sliders[key as keyof typeof sliders])}</span>
                    </div>
                    <input
                      type="range" min={min} max={max} step={step}
                      value={sliders[key as keyof typeof sliders]}
                      onChange={(e) => setSliders((prev) => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                      className="lu-range"
                    />
                  </div>
                ))}
              </div>

              <div className="lu-tokens-group">
                <h3 className="lu-ctrl-title">Design Tokens</h3>
                {[
                  { name: "--bg-color", hex: "#040406" },
                  { name: "--glass-bg", hex: "rgba(10,10,15,0.45)" },
                  { name: "--glass-border", hex: "rgba(255,255,255,0.08)" },
                  { name: "--accent-gold", hex: "#d1b894" },
                ].map((t) => (
                  <div key={t.name} className="lu-token">
                    <span className="lu-token-name">{t.name}</span>
                    <span className="lu-token-swatch" style={{ background: t.hex }} />
                    <span className="lu-token-val">{t.hex}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

        :root {
          --lu-bg: #040406;
          --lu-glass: rgba(12,12,18,0.45);
          --lu-panel: rgba(8,8,12,0.5);
          --lu-border: rgba(255,255,255,0.08);
          --lu-border-h: rgba(255,255,255,0.15);
          --lu-text: #f9fafb;
          --lu-text2: #d1d5db;
          --lu-muted: #6b7280;
          --lu-gold: #d1b894;
          --lu-glow: rgba(209,184,148,0.25);
          --lu-glow-s: rgba(209,184,148,0.5);
          --lu-serif: 'Cormorant Garamond', serif;
          --lu-sans: 'Inter', system-ui, sans-serif;
        }

        .lu-root {
          min-height: calc(100vh - 56px);
          background: var(--lu-bg);
          color: var(--lu-text);
          font-family: var(--lu-sans);
          position: relative;
          overflow: hidden;
        }

        .lu-canvas {
          position: fixed;
          top: 56px;
          left: 0;
          width: 100vw;
          height: calc(100vh - 56px);
          z-index: 1;
          pointer-events: none;
        }

        .lu-app {
          position: relative;
          z-index: 10;
          max-width: 1440px;
          margin: 0 auto;
          padding: 24px 40px 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          pointer-events: none;
        }

        /* Navbar */
        .lu-nav {
          background: var(--lu-panel);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--lu-border);
          border-radius: 50px;
          height: 64px;
          padding: 0 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          pointer-events: auto;
        }

        .lu-nav-brand { display: flex; align-items: center; gap: 10px; }
        .lu-nav-logo {
          font-family: var(--lu-serif);
          font-size: 22px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--lu-text);
        }
        .lu-nav-badge {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1px;
          color: var(--lu-gold);
          background: rgba(209,184,148,0.1);
          border: 1px solid rgba(209,184,148,0.2);
          padding: 2px 8px;
          border-radius: 12px;
          text-transform: uppercase;
        }

        .lu-nav-links { display: flex; gap: 28px; }
        .lu-nav-link {
          background: none;
          border: none;
          color: var(--lu-text2);
          font-family: var(--lu-sans);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 1px;
          text-transform: uppercase;
          cursor: pointer;
          padding: 6px 0;
          position: relative;
          transition: color 0.25s;
        }
        .lu-nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 1px;
          background: var(--lu-gold);
          transition: width 0.25s;
        }
        .lu-nav-link:hover, .lu-nav-link.active { color: var(--lu-gold); }
        .lu-nav-link:hover::after, .lu-nav-link.active::after { width: 100%; }

        .lu-nav-info { display: flex; align-items: center; }
        .lu-comp-counter { font-size: 11px; font-weight: 600; letter-spacing: 2px; color: rgba(255,255,255,0.25); }

        /* Layout */
        .lu-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 28px;
          pointer-events: none;
        }

        .lu-showcase {
          display: flex;
          flex-direction: column;
          gap: 32px;
          pointer-events: none;
        }

        .lu-showcase-header { padding: 16px 0; pointer-events: auto; }
        .lu-showcase-header h1 {
          font-family: var(--lu-serif);
          font-size: 40px;
          font-weight: 400;
          letter-spacing: 2px;
          margin-bottom: 12px;
        }
        .lu-showcase-header p { font-size: 14px; line-height: 1.65; color: var(--lu-text2); max-width: 680px; }

        /* Arrow nav + card */
        .lu-panel-nav {
          display: flex;
          align-items: center;
          gap: 12px;
          pointer-events: auto;
        }

        .lu-panel-arrow {
          flex-shrink: 0;
          width: 44px; height: 44px;
          border-radius: 50%;
          background: var(--lu-glass);
          border: 1px solid var(--lu-border);
          color: var(--lu-text2);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          backdrop-filter: blur(10px);
        }
        .lu-panel-arrow:hover {
          border-color: var(--lu-gold);
          color: var(--lu-gold);
          box-shadow: 0 0 12px var(--lu-glow);
        }

        /* Glass card */
        .lu-component-card {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 260px;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--lu-border);
          box-shadow: 0 15px 40px rgba(0,0,0,0.5);
          transition: border-color 0.25s;
        }
        .lu-glass-card {
          background: var(--lu-glass);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .lu-component-card:hover { border-color: var(--lu-border-h); }

        .lu-comp-preview {
          padding: 40px;
          background: rgba(255,255,255,0.008);
          border-right: 1px solid var(--lu-border);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 220px;
        }

        .lu-comp-meta {
          padding: 28px;
          background: rgba(5,5,8,0.3);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 16px;
        }
        .lu-comp-title {
          font-family: var(--lu-serif);
          font-size: 20px;
          font-weight: 400;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
          color: var(--lu-gold);
        }
        .lu-comp-desc { font-size: 13px; color: var(--lu-text2); line-height: 1.55; }

        .lu-code-actions { display: flex; gap: 8px; }
        .lu-btn-copy {
          flex: 1;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          color: var(--lu-muted);
          font-family: var(--lu-sans);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.5px;
          padding: 8px 10px;
          border-radius: 4px;
          cursor: pointer;
          text-transform: uppercase;
          transition: all 0.2s;
        }
        .lu-btn-copy:hover { background: rgba(209,184,148,0.08); border-color: var(--lu-gold); color: var(--lu-gold); }

        /* Dots */
        .lu-dots { display: flex; gap: 8px; justify-content: center; pointer-events: auto; }
        .lu-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: none; cursor: pointer; padding: 0;
          transition: all 0.3s;
        }
        .lu-dot.active { width: 20px; border-radius: 3px; background: var(--lu-gold); }

        /* Sidebar */
        .lu-sidebar {
          height: fit-content;
          position: sticky;
          top: 88px;
          pointer-events: auto;
        }
        .lu-glass-panel {
          background: var(--lu-panel);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid var(--lu-border);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.25s;
        }
        .lu-glass-panel:hover { border-color: var(--lu-border-h); }

        .lu-sidebar-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--lu-border);
        }
        .lu-sidebar-header h2 {
          font-family: var(--lu-serif);
          font-size: 20px;
          font-weight: 400;
          letter-spacing: 1px;
        }
        .lu-sidebar-body { padding: 24px; display: flex; flex-direction: column; gap: 24px; }

        .lu-info-box {
          background: rgba(209,184,148,0.04);
          border: 1px solid rgba(209,184,148,0.12);
          padding: 14px;
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.6;
          color: var(--lu-text2);
        }

        .lu-ctrl-group, .lu-tokens-group { display: flex; flex-direction: column; gap: 16px; }
        .lu-ctrl-title {
          font-family: var(--lu-serif);
          font-size: 16px;
          letter-spacing: 1px;
          color: var(--lu-gold);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          padding-bottom: 6px;
          margin-bottom: 4px;
        }
        .lu-ctrl-item { display: flex; flex-direction: column; gap: 6px; }
        .lu-ctrl-label { display: flex; justify-content: space-between; font-size: 11px; font-weight: 500; letter-spacing: 0.8px; text-transform: uppercase; color: var(--lu-muted); }
        .lu-ctrl-label span:last-child { color: var(--lu-gold); }

        .lu-range {
          -webkit-appearance: none;
          width: 100%; height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        .lu-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px; height: 12px;
          border-radius: 50%;
          background: var(--lu-gold);
          box-shadow: 0 0 6px var(--lu-glow);
          transition: transform 0.1s;
        }
        .lu-range::-webkit-slider-thumb:hover { transform: scale(1.25); }

        .lu-token { display: flex; align-items: center; gap: 8px; font-size: 11px; }
        .lu-token-name { font-family: 'JetBrains Mono', monospace; color: var(--lu-muted); flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lu-token-swatch { width: 14px; height: 14px; border-radius: 3px; border: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; }
        .lu-token-val { color: var(--lu-text2); font-family: monospace; font-size: 10px; }

        /* Component previews */
        .lu-preview-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .lu-preview-col { display: flex; flex-direction: column; gap: 20px; width: 100%; max-width: 400px; }
        .lu-form-group { display: flex; flex-direction: column; gap: 6px; }
        .lu-form-row { display: flex; gap: 16px; align-items: flex-end; }
        .lu-flex1 { flex: 1; }
        .lu-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: var(--lu-muted); }
        .lu-input-wrap { position: relative; }
        .lu-input {
          width: 100%;
          background: rgba(10,10,15,0.5);
          border: 1px solid var(--lu-border);
          border-radius: 8px;
          padding: 12px 14px 12px 40px;
          color: var(--lu-text);
          font-family: var(--lu-sans);
          font-size: 13px;
          outline: none;
          transition: all 0.25s;
        }
        .lu-input::placeholder { color: var(--lu-muted); }
        .lu-input:focus { border-color: var(--lu-gold); box-shadow: 0 0 12px rgba(209,184,148,0.15); }
        .lu-input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: var(--lu-muted); pointer-events: none; }

        .lu-toggle { position: relative; display: inline-block; width: 50px; height: 26px; }
        .lu-toggle input { opacity: 0; width: 0; height: 0; }
        .lu-toggle-slider {
          position: absolute; cursor: pointer;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--lu-border);
          border-radius: 26px;
          transition: 0.3s;
        }
        .lu-toggle-slider::before {
          content: ''; position: absolute;
          width: 18px; height: 18px;
          left: 3px; bottom: 3px;
          background: var(--lu-muted);
          border-radius: 50%;
          transition: 0.3s;
        }
        .lu-toggle input:checked + .lu-toggle-slider { background: rgba(209,184,148,0.15); border-color: var(--lu-gold); box-shadow: 0 0 8px var(--lu-glow); }
        .lu-toggle input:checked + .lu-toggle-slider::before { transform: translateX(24px); background: var(--lu-gold); }

        .lu-slider { -webkit-appearance: none; width: 100%; height: 5px; background: rgba(255,255,255,0.06); border-radius: 3px; cursor: pointer; outline: none; margin: 8px 0; }
        .lu-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--lu-gold); box-shadow: 0 0 6px var(--lu-glow); }

        .lu-btn-primary {
          background: rgba(209,184,148,0.08);
          border: 1px solid var(--lu-gold);
          color: var(--lu-text);
          font-family: var(--lu-sans);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 1px;
          padding: 11px 24px;
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 0 10px var(--lu-glow);
          transition: all 0.25s;
          text-transform: uppercase;
        }
        .lu-btn-primary:hover { background: rgba(209,184,148,0.16); box-shadow: 0 0 20px var(--lu-glow-s); transform: translateY(-1px); }
        .lu-btn-secondary {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--lu-border);
          color: var(--lu-text2);
          font-family: var(--lu-sans);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 1px;
          padding: 11px 24px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.25s;
          text-transform: uppercase;
        }
        .lu-btn-secondary:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.2); color: var(--lu-text); }
        .lu-btn-icon {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--lu-border);
          color: var(--lu-text2);
          width: 42px; height: 42px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.25s;
        }
        .lu-btn-icon:hover { border-color: var(--lu-gold); color: var(--lu-text); box-shadow: 0 0 10px var(--lu-glow); }
        .lu-w100 { width: 100%; }

        .lu-profile-card {
          width: 100%; max-width: 300px;
          background: rgba(15,15,22,0.3);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 22px;
          display: flex; flex-direction: column; gap: 18px;
        }
        .lu-profile-header { display: flex; align-items: center; gap: 14px; }
        .lu-avatar { width: 50px; height: 50px; border-radius: 50%; overflow: hidden; border: 2px solid rgba(255,255,255,0.1); }
        .lu-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .lu-profile-name { font-size: 15px; font-weight: 500; margin-bottom: 2px; }
        .lu-profile-role { font-size: 10px; color: var(--lu-gold); letter-spacing: 0.5px; text-transform: uppercase; }
        .lu-profile-bio { font-size: 12px; color: var(--lu-text2); line-height: 1.5; }
        .lu-stats { display: grid; grid-template-columns: repeat(3,1fr); border-top: 1px solid rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.05); padding: 12px 0; text-align: center; }
        .lu-stat { display: flex; flex-direction: column; gap: 2px; }
        .lu-stat-val { font-family: var(--lu-serif); font-size: 17px; color: var(--lu-text); }
        .lu-stat-lbl { font-size: 10px; color: var(--lu-muted); text-transform: uppercase; letter-spacing: 0.5px; }

        .lu-table-wrap { width: 100%; overflow-x: auto; background: rgba(15,15,22,0.2); border: 1px solid rgba(255,255,255,0.03); border-radius: 8px; }
        .lu-table { width: 100%; border-collapse: collapse; text-align: left; }
        .lu-table th { padding: 13px 18px; border-bottom: 1px solid rgba(255,255,255,0.06); color: var(--lu-gold); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
        .lu-table td { padding: 14px 18px; border-bottom: 1px solid rgba(255,255,255,0.03); color: var(--lu-text2); font-size: 13px; transition: background 0.2s; }
        .lu-table tr:last-child td { border-bottom: none; }
        .lu-table tr:hover td { background: rgba(255,255,255,0.02); color: var(--lu-text); }
        .lu-status { font-size: 10px; font-weight: 600; letter-spacing: 0.5px; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; }
        .lu-status-active { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: #34d399; }
        .lu-status-idle { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); color: #fbbf24; }

        /* Toast */
        .lu-toast {
          position: fixed;
          bottom: 32px; left: 50%; transform: translateX(-50%);
          z-index: 500;
          display: flex; align-items: center; gap: 10px;
          background: rgba(12,12,18,0.9);
          border: 1px solid var(--lu-gold);
          box-shadow: 0 0 20px var(--lu-glow);
          padding: 12px 24px;
          border-radius: 50px;
          font-size: 13px;
          color: var(--lu-text);
          backdrop-filter: blur(20px);
          animation: toastIn 0.3s ease;
        }
        @keyframes toastIn { from { opacity:0; transform: translateX(-50%) translateY(10px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }

        /* Slide animations */
        @keyframes luSlideIn { from { opacity:0; transform: translateX(40px); } to { opacity:1; transform: translateX(0); } }
        @keyframes luSlideInL { from { opacity:0; transform: translateX(-40px); } to { opacity:1; transform: translateX(0); } }
        .lu-slide-in { animation: luSlideIn 0.28s cubic-bezier(0.4,0,0.2,1) both; }
        .lu-slide-out-right { opacity:0; transform: translateX(-40px); transition: all 0.28s; }
        .lu-slide-out-left { opacity:0; transform: translateX(40px); transition: all 0.28s; }
      `}</style>
    </div>
  );
}
