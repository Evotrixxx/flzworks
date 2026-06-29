// Gallery data configuration
const galleryData = [
  {
    title: "Sylvan Sanctuary",
    artist: "By Pixabay &bull; 2024",
    desc: "A serene exploration of light filtering through a dense forest canopy. Move your cursor to focus the lens and reveal the hidden textures of nature.",
    url: "https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  },
  {
    title: "Neo-Tokyo Noir",
    artist: "By Antigravity &bull; 2026",
    desc: "A cinematic, rain-soaked cyberpunk street illuminated by neon signage. Peer through the lens to inspect the intricate details of a futuristic city.",
    url: "assets/cityscape.png"
  },
  {
    title: "Cosmic Genesis",
    artist: "By Pexels &bull; 2024",
    desc: "A mesmerizing stellar nursery overflowing with cosmic gas clouds. Zoom in with the lens to resolve distant stars and microscopic celestial dust.",
    url: "https://images.pexels.com/photos/1279813/pexels-photo-1279813.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
  }
];

// UI elements
const elArtTitle = document.getElementById("artTitle");
const elArtMeta = document.getElementById("artMeta");
const elArtDesc = document.getElementById("artDesc");

const paramSize = document.getElementById("paramSize");
const paramZoom = document.getElementById("paramZoom");
const paramShape = document.getElementById("paramShape");
const paramGlow = document.getElementById("paramGlow");

const valSize = document.getElementById("valSize");
const valZoom = document.getElementById("valZoom");
const valShape = document.getElementById("valShape");
const valGlow = document.getElementById("valGlow");

const cards = document.querySelectorAll(".gallery-card");
const zenBtn = document.getElementById("zenBtn");
const restoreBtn = document.getElementById("restoreBtn");

// WebGL Context setup
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

if (!gl) {
  alert("WebGL not supported in this browser.");
}

// Set canvas dimensions
const setCanvasSize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};
setCanvasSize();
window.addEventListener("resize", () => {
  setCanvasSize();
});

// Create and compile shaders
const vsSource = document.getElementById("vsShader").textContent;
const fsSource = document.getElementById("fragShader").textContent;

const createShader = (type, source) => {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
};

const vs = createShader(gl.VERTEX_SHADER, vsSource);
const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
const program = gl.createProgram();

gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  console.error("Shader program linking error:", gl.getProgramInfoLog(program));
}
gl.useProgram(program);

// Quad buffer setup (draws over the entire viewport)
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
  gl.STATIC_DRAW
);

const position = gl.getAttribLocation(program, "position");
gl.enableVertexAttribArray(position);
gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

// Get uniform locations
const uniforms = {
  resolution: gl.getUniformLocation(program, "iResolution"),
  time: gl.getUniformLocation(program, "iTime"),
  mouse: gl.getUniformLocation(program, "iMouse"),
  channel0: gl.getUniformLocation(program, "iChannel0"),
  channel1: gl.getUniformLocation(program, "iChannel1"),
  transition: gl.getUniformLocation(program, "uTransition"),
  lensScale: gl.getUniformLocation(program, "uLensScale"),
  zoom: gl.getUniformLocation(program, "uZoom"),
  glow: gl.getUniformLocation(program, "uGlow"),
  shape: gl.getUniformLocation(program, "uShape")
};

// Texture management
const textures = [];
let currentTexIdx = 0;
let targetTexIdx = 0;
let transitionVal = 0.0;
let isTransitioning = false;
const transitionDuration = 0.8; // seconds
let transitionStartTime = 0;

// Load textures
const loadTexture = (url, index) => {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  
  // Set placeholder color while loading (black)
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 255])
  );

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };
  img.src = url;
  textures[index] = tex;
};

// Load all gallery items
galleryData.forEach((item, idx) => {
  loadTexture(item.url, idx);
});

// Interactive state & mouse easing (inertia)
let mouseTarget = [window.innerWidth / 2, window.innerHeight / 2];
let mouseCurrent = [window.innerWidth / 2, window.innerHeight / 2];
const mouseEasingFactor = 0.08; // Lower = more lag/inertia

window.addEventListener("mousemove", (e) => {
  mouseTarget = [e.clientX, window.innerHeight - e.clientY];
});

// Touch support for mobile
window.addEventListener("touchmove", (e) => {
  if (e.touches.length > 0) {
    mouseTarget = [e.touches[0].clientX, window.innerHeight - e.touches[0].clientY];
  }
});

// Slider handlers & value scaling
let sliderLensScale = parseFloat(paramSize.value);
let sliderZoom = parseFloat(paramZoom.value);
let sliderShape = parseFloat(paramShape.value);
let sliderGlow = parseFloat(paramGlow.value);

const updateLabels = () => {
  // Size label
  if (sliderLensScale < 0.7) valSize.textContent = "Small";
  else if (sliderLensScale < 1.3) valSize.textContent = "Medium";
  else if (sliderLensScale < 1.8) valSize.textContent = "Large";
  else valSize.textContent = "Cinema";

  // Zoom label
  valZoom.textContent = `${(sliderZoom / 2500).toFixed(1)}x`;

  // Shape label
  if (sliderShape <= 2.5) valShape.textContent = "Circle";
  else if (sliderShape <= 4.5) valShape.textContent = "Rounded Circle";
  else if (sliderShape <= 8.0) valShape.textContent = "Squircle";
  else valShape.textContent = "Box";

  // Glow label
  valGlow.textContent = `${Math.round(sliderGlow * 100)}%`;
};
updateLabels();

paramSize.addEventListener("input", (e) => {
  sliderLensScale = parseFloat(e.target.value);
  updateLabels();
});
paramZoom.addEventListener("input", (e) => {
  sliderZoom = parseFloat(e.target.value);
  updateLabels();
});
paramShape.addEventListener("input", (e) => {
  sliderShape = parseFloat(e.target.value);
  updateLabels();
});
paramGlow.addEventListener("input", (e) => {
  sliderGlow = parseFloat(e.target.value);
  updateLabels();
});

// Gallery selection & transitions
const switchArtwork = (newIdx) => {
  if (newIdx === currentTexIdx || isTransitioning) return;

  targetTexIdx = newIdx;
  isTransitioning = true;
  transitionStartTime = performance.now();

  // Update active card styling
  cards.forEach(card => card.classList.remove("active"));
  cards[newIdx].classList.add("active");

  // Animate text info with a sleek CSS transition
  const infoSection = document.querySelector(".artwork-info");
  infoSection.style.opacity = 0;
  infoSection.style.transform = "translateY(10px)";
  infoSection.style.transition = "opacity 0.3s ease, transform 0.3s ease";

  setTimeout(() => {
    const data = galleryData[newIdx];
    elArtTitle.innerHTML = data.title;
    elArtMeta.innerHTML = data.artist;
    elArtDesc.innerHTML = data.desc;

    infoSection.style.opacity = 1;
    infoSection.style.transform = "translateY(0)";
  }, 300);
};

cards.forEach(card => {
  card.addEventListener("click", () => {
    const idx = parseInt(card.getAttribute("data-index"), 10);
    switchArtwork(idx);
  });
});

// Zen Mode Toggle
zenBtn.addEventListener("click", () => {
  document.body.classList.add("zen-mode");
});

restoreBtn.addEventListener("click", () => {
  document.body.classList.remove("zen-mode");
});

// Main Render Loop
const startTime = performance.now();

const render = () => {
  const timeTotal = (performance.now() - startTime) / 1000;

  // Handle transition interpolation
  if (isTransitioning) {
    const elapsed = (performance.now() - transitionStartTime) / 1000;
    transitionVal = Math.min(elapsed / transitionDuration, 1.0);
    
    // Smoothstep transition curve
    const t = transitionVal;
    const smoothT = t * t * (3 - 2 * t);

    gl.uniform1f(uniforms.transition, smoothT);

    if (transitionVal >= 1.0) {
      currentTexIdx = targetTexIdx;
      isTransitioning = false;
      transitionVal = 0.0;
      gl.uniform1f(uniforms.transition, 0.0);
    }
  } else {
    gl.uniform1f(uniforms.transition, 0.0);
  }

  // Smooth mouse inertia
  mouseCurrent[0] += (mouseTarget[0] - mouseCurrent[0]) * mouseEasingFactor;
  mouseCurrent[1] += (mouseTarget[1] - mouseCurrent[1]) * mouseEasingFactor;

  // Set viewport
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Set standard uniforms
  gl.uniform3f(uniforms.resolution, canvas.width, canvas.height, 1.0);
  gl.uniform1f(uniforms.time, timeTotal);
  gl.uniform4f(uniforms.mouse, mouseCurrent[0], mouseCurrent[1], 0, 0);

  // Set customizer uniforms
  // Invert size so that a higher slider value = larger lens (smaller divisor in shader)
  const lensScaleUniform = 1.0 / sliderLensScale;
  gl.uniform1f(uniforms.lensScale, lensScaleUniform);
  gl.uniform1f(uniforms.zoom, sliderZoom);
  gl.uniform1f(uniforms.shape, sliderShape);
  gl.uniform1f(uniforms.glow, sliderGlow);

  // Bind textures
  // Texture 0: Current active image
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[currentTexIdx] || null);
  gl.uniform1i(uniforms.channel0, 0);

  // Texture 1: Target image (only relevant during transitions)
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textures[targetTexIdx] || null);
  gl.uniform1i(uniforms.channel1, 1);

  // Draw quad
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(render);
};

// Start WebGL render loop once initial texture loading kicks off
requestAnimationFrame(render);
