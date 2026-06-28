// ==========================================
// WebGL Shader Background Controller
// ==========================================

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

// Set canvas size
const setCanvasSize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};
setCanvasSize();

// Shader Helper
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

// Shader Sources
const vsSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;
const fsSource = document.getElementById("fragShader").textContent;

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

// Quad Buffer Setup
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

// Get Uniform Locations
const uniforms = {
  resolution: gl.getUniformLocation(program, "iResolution"),
  time: gl.getUniformLocation(program, "iTime"),
  mouse: gl.getUniformLocation(program, "iMouse"),
  texture: gl.getUniformLocation(program, "iChannel0"),
  
  // Customizer Uniforms
  speed: gl.getUniformLocation(program, "uSpeed"),
  frequency: gl.getUniformLocation(program, "uFrequency"),
  distortion: gl.getUniformLocation(program, "uDistortion"),
  chromatic: gl.getUniformLocation(program, "uChromatic"),
  specular: gl.getUniformLocation(program, "uSpecular"),
};

// Shader Settings (Synchronized with UI Sliders)
const shaderSettings = {
  speed: 0.15,
  frequency: 2.5,
  distortion: 0.035,
  chromatic: 0.12,
  specular: 0.22,
};

// Mouse tracking
let mouse = [0, 0];
let targetMouse = [0, 0];
window.addEventListener("mousemove", (e) => {
  targetMouse = [e.clientX, canvas.height - e.clientY];
});

// Texture Setup & Management
const textures = {};
const setupTexture = (id, imgElement) => {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgElement);
  textures[id] = tex;
};

// Initialize textures from HTML images
const img1 = document.getElementById("sourceImage");
const img2 = document.getElementById("texture2");
const img3 = document.getElementById("texture3");

const initAllTextures = () => {
  if (img1.complete) setupTexture("sourceImage", img1);
  else img1.onload = () => setupTexture("sourceImage", img1);

  if (img2.complete) setupTexture("texture2", img2);
  else img2.onload = () => setupTexture("texture2", img2);

  if (img3.complete) setupTexture("texture3", img3);
  else img3.onload = () => setupTexture("texture3", img3);
};
initAllTextures();

let activeTextureId = "sourceImage";

// Render Loop
const startTime = performance.now();
const render = () => {
  const currentTime = (performance.now() - startTime) / 1000;

  // Smooth mouse easing
  mouse[0] += (targetMouse[0] - mouse[0]) * 0.1;
  mouse[1] += (targetMouse[1] - mouse[1]) * 0.1;

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Bind Standard Uniforms
  gl.uniform3f(uniforms.resolution, canvas.width, canvas.height, 1.0);
  gl.uniform1f(uniforms.time, currentTime);
  gl.uniform4f(uniforms.mouse, mouse[0], mouse[1], 0, 0);

  // Bind Customizer Uniforms
  gl.uniform1f(uniforms.speed, shaderSettings.speed);
  gl.uniform1f(uniforms.frequency, shaderSettings.frequency);
  gl.uniform1f(uniforms.distortion, shaderSettings.distortion);
  gl.uniform1f(uniforms.chromatic, shaderSettings.chromatic);
  gl.uniform1f(uniforms.specular, shaderSettings.specular);

  // Bind Active Texture
  if (textures[activeTextureId]) {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[activeTextureId]);
    gl.uniform1i(uniforms.texture, 0);
  }

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(render);
};

window.addEventListener("resize", setCanvasSize);
render();


// ==========================================
// Dashboard Navigation & Interactive UI Logic
// ==========================================

// Section Switching
const navLinks = document.querySelectorAll(".nav-link");
const contentSections = document.querySelectorAll(".content-section");

navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const targetSectionId = link.getAttribute("data-section");
    
    // Update Active Nav Link
    navLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");
    
    // Update Active Section
    contentSections.forEach(sec => sec.classList.remove("active"));
    document.getElementById(targetSectionId).classList.add("active");
    
    // Smooth scroll main content to top
    document.querySelector(".main-content").scrollTop = 0;
  });
});

// Toggle Button Demo
const demoToggle = document.getElementById("demoToggle");
demoToggle.addEventListener("click", () => {
  demoToggle.classList.toggle("active");
});

// Slider Inputs (Shader Customizer)
const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
speedSlider.addEventListener("input", (e) => {
  shaderSettings.speed = parseFloat(e.target.value);
  speedValue.textContent = e.target.value;
});

const freqSlider = document.getElementById("freqSlider");
const freqValue = document.getElementById("freqValue");
freqSlider.addEventListener("input", (e) => {
  shaderSettings.frequency = parseFloat(e.target.value);
  freqValue.textContent = e.target.value;
});

const distSlider = document.getElementById("distSlider");
const distValue = document.getElementById("distValue");
distSlider.addEventListener("input", (e) => {
  shaderSettings.distortion = parseFloat(e.target.value);
  distValue.textContent = e.target.value;
});

const chromaSlider = document.getElementById("chromaSlider");
const chromaValue = document.getElementById("chromaValue");
chromaSlider.addEventListener("input", (e) => {
  shaderSettings.chromatic = parseFloat(e.target.value);
  chromaValue.textContent = e.target.value;
});

const specularSlider = document.getElementById("specularSlider");
const specularValue = document.getElementById("specularValue");
specularSlider.addEventListener("input", (e) => {
  shaderSettings.specular = parseFloat(e.target.value);
  specularValue.textContent = e.target.value;
});

// Card Blur customizer slider
const blurSlider = document.getElementById("blurSlider");
const blurValue = document.getElementById("blurValue");
blurSlider.addEventListener("input", (e) => {
  const value = e.target.value;
  document.documentElement.style.setProperty("--card-blur", `${value}px`);
  blurValue.textContent = `${value}px`;
});

// Texture Selection
const textureButtons = document.querySelectorAll(".texture-btn");
textureButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    textureButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeTextureId = btn.getAttribute("data-texture");
  });
});

// Toast Notifications
const toastContainer = document.getElementById("toastContainer");
const triggerToast = document.getElementById("triggerToast");

const showToast = (message) => {
  const toast = document.createElement("div");
  toast.className = "glass-toast glass-container";
  toast.innerHTML = `
    <div class="glass-filter"></div>
    <div class="glass-overlay"></div>
    <div class="glass-specular"></div>
    <div class="glass-content">
      <svg viewBox="0 0 24 24" style="width: 1.25rem; height: 1.25rem; fill: var(--lg-accent);"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
      <span>${message}</span>
    </div>
  `;
  toastContainer.appendChild(toast);
  
  // Auto-remove toast after 3 seconds
  setTimeout(() => {
    toast.style.animation = "slideIn 0.3s ease reverse forwards";
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 3000);
};

triggerToast.addEventListener("click", () => {
  showToast("Action completed successfully!");
});

// Modal Dialog
const triggerModal = document.getElementById("triggerModal");
const modalOverlay = document.getElementById("modalOverlay");
const modalClose = document.getElementById("modalClose");
const modalCancel = document.getElementById("modalCancel");
const modalConfirm = document.getElementById("modalConfirm");

const openModal = () => modalOverlay.classList.add("active");
const closeModal = () => modalOverlay.classList.remove("active");

triggerModal.addEventListener("click", openModal);
modalClose.addEventListener("click", closeModal);
modalCancel.addEventListener("click", closeModal);
modalConfirm.addEventListener("click", () => {
  closeModal();
  showToast("Modal settings confirmed!");
});

// Close modal when clicking outside of card
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});

// Copy to Clipboard Logic
const copyButtons = document.querySelectorAll(".copy-btn");
copyButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const codeId = btn.getAttribute("data-clipboard");
    const codeElement = document.getElementById(codeId);
    if (codeElement) {
      navigator.clipboard.writeText(codeElement.textContent).then(() => {
        btn.textContent = "Copied!";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "Copy Code";
          btn.classList.remove("copied");
        }, 1500);
      }).catch(err => {
        console.error("Failed to copy code: ", err);
      });
    }
  });
});


// ==========================================
// Music Player Controller
// ==========================================

const playlist = [
  {
    title: "Dreamy Glass flow",
    artist: "Aetherial Lofi",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=300&auto=format&fit=crop"
  },
  {
    title: "Cybernetic Refraction",
    artist: "Neon Cascade",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=300&auto=format&fit=crop"
  },
  {
    title: "Liquid Reflections",
    artist: "Vapor Wave Collective",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=300&auto=format&fit=crop"
  }
];

let currentTrackIndex = 0;
let isPlaying = false;
let isLooping = false;

const audio = new Audio();
audio.src = playlist[currentTrackIndex].url;
audio.volume = 0.7;

// DOM Player Elements
const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const loopBtn = document.getElementById("loopBtn");
const albumArt = document.getElementById("albumArt");
const trackTitle = document.getElementById("trackTitle");
const trackArtist = document.getElementById("trackArtist");
const currentTimeEl = document.getElementById("currentTime");
const totalDurationEl = document.getElementById("totalDuration");
const progressBarBg = document.getElementById("progressBarBg");
const progressBarFill = document.getElementById("progressBarFill");
const volumeSlider = document.getElementById("volumeSlider");
const playlistCard = document.getElementById("playlistCard");
const playlistHeader = document.getElementById("playlistHeader");
const playlistList = document.getElementById("playlistList");
const visualizerBars = document.querySelectorAll(".visualizer .bar");

// Audio Analyser
let audioCtx = null;
let analyser = null;
let source = null;
let dataArray = null;

const initAudioAnalyser = () => {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  } catch (e) {
    console.warn("Web Audio API blocked or not supported:", e);
  }
};

const formatTime = (seconds) => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

const loadTrack = (index) => {
  currentTrackIndex = index;
  audio.src = playlist[index].url;
  trackTitle.textContent = playlist[index].title;
  trackArtist.textContent = playlist[index].artist;
  albumArt.src = playlist[index].cover;
  progressBarFill.style.width = "0%";
  currentTimeEl.textContent = "0:00";
  
  document.querySelectorAll(".playlist-item").forEach((item, idx) => {
    if (idx === index) item.classList.add("active");
    else item.classList.remove("active");
  });

  if (isPlaying) {
    audio.play().catch(err => console.log("Audio play blocked:", err));
  }
};

const togglePlay = () => {
  initAudioAnalyser();
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    playBtn.querySelector(".icon-play").style.display = "block";
    playBtn.querySelector(".icon-pause").style.display = "none";
    albumArt.style.animationPlayState = "paused";
  } else {
    audio.play().then(() => {
      isPlaying = true;
      playBtn.querySelector(".icon-play").style.display = "none";
      playBtn.querySelector(".icon-pause").style.display = "block";
      albumArt.style.animationPlayState = "running";
    }).catch(err => {
      console.error("Playback failed:", err);
    });
  }
};

const nextTrack = () => {
  let nextIndex = currentTrackIndex + 1;
  if (nextIndex >= playlist.length) nextIndex = 0;
  loadTrack(nextIndex);
};

const prevTrack = () => {
  let prevIndex = currentTrackIndex - 1;
  if (prevIndex < 0) prevIndex = playlist.length - 1;
  loadTrack(prevIndex);
};

const toggleLoop = () => {
  isLooping = !isLooping;
  audio.loop = isLooping;
  if (isLooping) loopBtn.classList.add("active");
  else loopBtn.classList.remove("active");
};

// Progress / scrubbing
audio.addEventListener("timeupdate", () => {
  const current = audio.currentTime;
  const duration = audio.duration;
  if (duration) {
    const progressPercent = (current / duration) * 100;
    progressBarFill.style.width = `${progressPercent}%`;
    const knob = document.querySelector(".progress-bar-knob");
    if (knob) knob.style.left = `${progressPercent}%`;
    currentTimeEl.textContent = formatTime(current);
    totalDurationEl.textContent = formatTime(duration);
  }
});

audio.addEventListener("ended", () => {
  if (!isLooping) nextTrack();
});

progressBarBg.addEventListener("click", (e) => {
  const width = progressBarBg.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  if (duration) {
    audio.currentTime = (clickX / width) * duration;
  }
});

volumeSlider.addEventListener("input", (e) => {
  audio.volume = e.target.value;
});

// Build playlist UI items
const buildPlaylistUI = () => {
  playlistList.innerHTML = "";
  playlist.forEach((track, index) => {
    const item = document.createElement("div");
    item.className = `playlist-item ${index === currentTrackIndex ? "active" : ""}`;
    const mockDurations = ["3:45", "4:12", "5:02"];
    item.innerHTML = `
      <img class="playlist-item-art" src="${track.cover}" alt="${track.title}">
      <div class="playlist-item-info">
        <span class="playlist-item-title">${track.title}</span>
        <span class="playlist-item-artist">${track.artist}</span>
      </div>
      <span class="playlist-item-duration">${mockDurations[index % mockDurations.length]}</span>
    `;
    item.addEventListener("click", () => {
      loadTrack(index);
      if (!isPlaying) togglePlay();
    });
    playlistList.appendChild(item);
  });
};

playlistHeader.addEventListener("click", () => {
  playlistCard.classList.toggle("expanded");
});

// Visualizer animation
let proceduralTime = 0;
const updateVisualizer = () => {
  proceduralTime += 0.05;
  if (isPlaying && analyser && dataArray) {
    analyser.getByteFrequencyData(dataArray);
    visualizerBars.forEach((bar, index) => {
      const dataIndex = Math.floor((index / visualizerBars.length) * 20);
      const value = dataArray[dataIndex] || 0;
      const height = (value / 255) * 24;
      bar.style.height = `${Math.max(3, height)}px`;
    });
  } else if (isPlaying) {
    visualizerBars.forEach((bar, index) => {
      const wave = Math.sin(proceduralTime + index * 0.5) * 0.5 + 0.5;
      bar.style.height = `${wave * 20 + 3}px`;
    });
  } else {
    visualizerBars.forEach((bar, index) => {
      const wave = Math.sin(proceduralTime * 0.3 + index * 0.3) * 0.5 + 0.5;
      bar.style.height = `${wave * 6 + 3}px`;
    });
  }
  requestAnimationFrame(updateVisualizer);
};

// Bind Button Clicks
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextTrack);
prevBtn.addEventListener("click", prevTrack);
loopBtn.addEventListener("click", toggleLoop);

// Initialize playlist
buildPlaylistUI();
loadTrack(currentTrackIndex);
updateVisualizer();

audio.addEventListener("loadedmetadata", () => {
  totalDurationEl.textContent = formatTime(audio.duration);
});
