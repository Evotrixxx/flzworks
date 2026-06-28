// LUCENT UI: WebGL Lens Showcase Application
import { vsSource, fsSource } from './shaders.js';

// Application State
let mouseCurrent = [window.innerWidth / 2, window.innerHeight / 2];
let mouseTarget = [window.innerWidth / 2, window.innerHeight / 2];
let mouseReal = [window.innerWidth / 2, window.innerHeight / 2];

// Morphing Lens Targets
let currentAspect = 1.0;
let targetAspect = 1.0;
let currentSize = 1.0;
let targetSize = 1.0;
let currentExponent = 6.0;
let targetExponent = 6.0;

// WebGL variables
let gl, program, positionBuffer, mainTexture;
let uniforms = {};

// DOM Elements
const canvas = document.getElementById("canvas");
const cursor = document.getElementById("custom-cursor");
const toast = document.getElementById("toast");
const toastMsg = document.getElementById("toast-message");
const infoBtn = document.getElementById("info-btn");
const infoModal = document.getElementById("info-modal");
const closeModalBtn = document.getElementById("close-modal-btn");
const refractionSource = document.getElementById("refraction-source");

// Global Sliders
const sliderSize = document.getElementById("slider-size");
const sliderMag = document.getElementById("slider-mag");
const sliderBlur = document.getElementById("slider-blur");
const sliderGlow = document.getElementById("slider-glow");
const sliderAberration = document.getElementById("slider-aberration");

// Value Labels
const valSize = document.getElementById("val-size");
const valMag = document.getElementById("val-mag");
const valBlur = document.getElementById("val-blur");
const valGlow = document.getElementById("val-glow");
const valAberration = document.getElementById("val-aberration");

// --- Initialization ---

function init() {
  initWebGL();
  setupEventListeners();
  setupHoverTracking();
  initUI();
  
  // Show intro modal on first visit
  setTimeout(() => {
    infoModal.style.display = "flex";
    setTimeout(() => infoModal.style.opacity = "1", 50);
  }, 500);

  // Start render loop
  requestAnimationFrame(render);
}

function initWebGL() {
  gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) {
    showToast("WebGL not supported in your browser.", true);
    return;
  }

  resizeCanvas();

  // Create shaders
  const vs = compileShader(gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
  
  if (!vs || !fs) {
    showToast("Failed to compile shaders.", true);
    return;
  }

  // Create program
  program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program linking failed:", gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  // Set up position buffer (full-screen quad)
  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const positionLocation = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Retrieve uniform locations
  const uniformNames = [
    "iResolution", "iTime", "iMouse", "iChannel0",
    "uPowerExponent", "uMaskMultiplier1", "uMaskMultiplier2", "uMaskMultiplier3",
    "uLensMultiplier", "uMaskStrength1", "uMaskStrength2", "uMaskStrength3",
    "uMaskThreshold1", "uMaskThreshold2", "uMaskThreshold3",
    "uSampleOffset", "uGradientRange", "uGradientOffset", "uGradientExtreme",
    "uLightingIntensity", "uAberration", "uLensAspect"
  ];

  uniformNames.forEach(name => {
    uniforms[name] = gl.getUniformLocation(program, name);
  });

  // Create WebGL texture
  mainTexture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, mainTexture);
  
  // Set placeholder color while loading
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([5, 5, 8, 255]));
  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Load default refraction background
  if (refractionSource.complete) {
    updateWebGLTexture(refractionSource);
  } else {
    refractionSource.onload = () => updateWebGLTexture(refractionSource);
  }
}

function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(`Shader compilation error (${type === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT'}):`, gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function resizeCanvas() {
  const displayWidth = window.innerWidth;
  const displayHeight = window.innerHeight;
  
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
}

function updateWebGLTexture(imageSource) {
  gl.bindTexture(gl.TEXTURE_2D, mainTexture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageSource);
}

// --- Hover Tracking for Lens Morphing ---

function setupHoverTracking() {
  const cards = document.querySelectorAll(".component-card");
  
  cards.forEach(card => {
    card.addEventListener("mouseenter", () => {
      const rect = card.getBoundingClientRect();
      // Calculate aspect ratio (capped at 2.0 to prevent overly distorted lenses)
      const aspect = Math.min(rect.width / rect.height, 2.2);
      
      // Fetch custom attributes
      const expand = parseFloat(card.getAttribute("data-lens-expand")) || 1.0;
      const shape = parseFloat(card.getAttribute("data-lens-shape")) || 8.0;

      targetAspect = aspect;
      targetSize = expand * 1.25; // Slightly larger when hovering cards
      targetExponent = shape;
    });

    card.addEventListener("mouseleave", () => {
      // Revert to global slider settings
      resetLensToGlobal();
    });
  });
}

function resetLensToGlobal() {
  targetAspect = 1.0; // Perfect circle/square based on shape
  targetSize = parseFloat(sliderSize.value);
  targetExponent = 6.0; // Standard circle
}

// --- UI Controls & Event Listeners ---

function setupEventListeners() {
  // Mouse movement
  window.addEventListener("mousemove", (e) => {
    mouseReal = [e.clientX, canvas.height - e.clientY];
    mouseTarget = mouseReal;
  });

  // Touch support for mobile
  window.addEventListener("touchmove", (e) => {
    if (e.touches.length > 0) {
      const t = e.touches[0];
      mouseReal = [t.clientX, canvas.height - t.clientY];
      mouseTarget = mouseReal;
    }
  }, { passive: true });

  // Custom Cursor Hover Effect
  document.querySelectorAll(".interactive-ui, input, button, a").forEach(el => {
    el.addEventListener("mouseenter", () => cursor.classList.add("active"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("active"));
  });

  // Handle Resizing
  window.addEventListener("resize", () => {
    resizeCanvas();
  });

  // Info Modal
  infoBtn.addEventListener("click", () => {
    infoModal.style.display = "flex";
    setTimeout(() => infoModal.style.opacity = "1", 10);
  });

  closeModalBtn.addEventListener("click", () => {
    infoModal.style.opacity = "0";
    setTimeout(() => infoModal.style.display = "none", 300);
  });

  // Copy Code Functionality
  document.querySelectorAll(".btn-copy").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-copy-target");
      const codeElement = document.getElementById(`code-${targetId}`);
      
      if (codeElement) {
        const codeText = codeElement.textContent;
        navigator.clipboard.writeText(codeText)
          .then(() => {
            const isHTML = targetId.startsWith("html");
            showToast(`Copied ${isHTML ? "HTML" : "CSS"} template to clipboard!`);
          })
          .catch(err => {
            showToast("Failed to copy code.", true);
            console.error(err);
          });
      }
    });
  });

  // Sliders Change
  const sliders = [sliderSize, sliderMag, sliderBlur, sliderGlow, sliderAberration];
  sliders.forEach(slider => {
    slider.addEventListener("input", () => {
      updateLabelValues();
      if (targetAspect === 1.0) {
        // Only update targetSize if we aren't currently hovering over a card
        targetSize = parseFloat(sliderSize.value);
      }
    });
  });
}

function updateLabelValues() {
  valSize.textContent = parseFloat(sliderSize.value).toFixed(1);
  valMag.textContent = parseFloat(sliderMag.value).toFixed(1) + "x";

  const blurVal = parseFloat(sliderBlur.value);
  if (blurVal === 0.0) valBlur.textContent = "None";
  else if (blurVal <= 0.4) valBlur.textContent = "Subtle";
  else if (blurVal <= 0.8) valBlur.textContent = "Medium";
  else valBlur.textContent = "Deep";

  valGlow.textContent = parseFloat(sliderGlow.value).toFixed(2);

  const abVal = parseFloat(sliderAberration.value);
  if (abVal === 0) valAberration.textContent = "None";
  else if (abVal <= 0.5) valAberration.textContent = "Subtle";
  else if (abVal <= 1.2) valAberration.textContent = "Prismatic";
  else valAberration.textContent = "Extreme";
}

function showToast(message, isError = false) {
  toastMsg.textContent = message;
  toast.style.borderColor = isError ? "#ef4444" : "var(--accent-color)";
  toast.style.boxShadow = isError ? "0 0 15px rgba(239, 68, 68, 0.3)" : "0 0 15px var(--accent-glow)";
  toast.classList.add("show");
  
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function initUI() {
  updateLabelValues();
  resetLensToGlobal();
}

// --- Rendering Loop ---

const startTime = performance.now();

function render(timestamp) {
  const currentTime = (timestamp - startTime) / 1000;

  // LERP mouse position for smooth gliding
  const mouseLerp = 0.12;
  mouseCurrent[0] += (mouseTarget[0] - mouseCurrent[0]) * mouseLerp;
  mouseCurrent[1] += (mouseTarget[1] - mouseCurrent[1]) * mouseLerp;

  // LERP lens shape and aspect ratios for fluid morphing
  const morphLerp = 0.08; // Smooth, slow morphing transition
  currentAspect += (targetAspect - currentAspect) * morphLerp;
  currentSize += (targetSize - currentSize) * morphLerp;
  currentExponent += (targetExponent - currentExponent) * morphLerp;

  // Update Custom Cursor Position
  cursor.style.left = `${mouseCurrent[0]}px`;
  cursor.style.top = `${canvas.height - mouseCurrent[1]}px`;

  // Draw WebGL
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Pass basic uniforms
  gl.uniform3f(uniforms.iResolution, canvas.width, canvas.height, 1.0);
  gl.uniform1f(uniforms.iTime, currentTime);
  gl.uniform4f(uniforms.iMouse, mouseCurrent[0], mouseCurrent[1], 0, 0);

  // Active texture (refraction background)
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, mainTexture);
  gl.uniform1i(uniforms.iChannel0, 0);

  // Fetch slider values
  const mag = parseFloat(sliderMag.value);
  const blur = parseFloat(sliderBlur.value);
  const glow = parseFloat(sliderGlow.value);
  const aberration = parseFloat(sliderAberration.value);

  // Scale multipliers based on current size and exponent to maintain crisp boundaries
  const scale = 1.0 / Math.pow(currentSize, currentExponent);

  gl.uniform1f(uniforms.uPowerExponent, currentExponent);
  gl.uniform1f(uniforms.uLensAspect, currentAspect);
  
  gl.uniform1f(uniforms.uMaskMultiplier1, 10000.0 * scale);
  gl.uniform1f(uniforms.uMaskMultiplier2, 9500.0 * scale);
  gl.uniform1f(uniforms.uMaskMultiplier3, 11000.0 * scale);
  gl.uniform1f(uniforms.uLensMultiplier, 5000.0 * scale * mag);
  
  // Base strengths
  gl.uniform1f(uniforms.uMaskStrength1, 8.0);
  gl.uniform1f(uniforms.uMaskStrength2, 16.0);
  gl.uniform1f(uniforms.uMaskStrength3, 2.0);
  
  // Thresholds
  gl.uniform1f(uniforms.uMaskThreshold1, 0.95);
  gl.uniform1f(uniforms.uMaskThreshold2, 0.9);
  gl.uniform1f(uniforms.uMaskThreshold3, 1.5);
  
  // Custom controls
  gl.uniform1f(uniforms.uSampleOffset, blur);
  gl.uniform1f(uniforms.uGradientRange, 0.2);
  gl.uniform1f(uniforms.uGradientOffset, 0.1);
  gl.uniform1f(uniforms.uGradientExtreme, -1000.0);
  gl.uniform1f(uniforms.uLightingIntensity, glow);
  gl.uniform1f(uniforms.uAberration, aberration);

  // Draw full screen quad
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  requestAnimationFrame(render);
}

// Launch the app
window.onload = init;
