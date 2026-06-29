// ==========================================
// WebGL Shader Background Controller
// ==========================================

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");
const img = document.getElementById("sourceImage");

// Set canvas size and notify WebGL viewport
const setCanvasSize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};
setCanvasSize();

// Shader Compilation helper
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

// Setup Quad Buffer
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
};

// Mouse interaction (tracking globally on window for smoother experience)
let mouse = [0, 0];
let targetMouse = [0, 0];
window.addEventListener("mousemove", (e) => {
  targetMouse = [e.clientX, canvas.height - e.clientY];
});

// Texture Setup
const texture = gl.createTexture();
const setupTexture = () => {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  // Set texture parameters for smooth scaling and edge clamping
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // Load image into texture
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    img
  );
};

// Check if image is loaded, if not wait for onload
if (img.complete) {
  setupTexture();
} else {
  img.onload = setupTexture;
}

// Render loop
const startTime = performance.now();
const render = () => {
  const currentTime = (performance.now() - startTime) / 1000;

  // Smooth mouse interpolation (ease-out)
  mouse[0] += (targetMouse[0] - mouse[0]) * 0.1;
  mouse[1] += (targetMouse[1] - mouse[1]) * 0.1;

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform3f(uniforms.resolution, canvas.width, canvas.height, 1.0);
  gl.uniform1f(uniforms.time, currentTime);
  gl.uniform4f(uniforms.mouse, mouse[0], mouse[1], 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(uniforms.texture, 0);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(render);
};

window.addEventListener("resize", setCanvasSize);
render();


// ==========================================
// Music Player Logic
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

// DOM elements
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

// Web Audio API Elements for Real-time Visualizer
let audioCtx = null;
let analyser = null;
let source = null;
let dataArray = null;

const initAudioAnalyser = () => {
  if (audioCtx) return; // Already initialized

  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64; // Small size for 12 bars
    
    // Connect audio to analyser and destination
    source = audioCtx.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
  } catch (e) {
    console.warn("Web Audio API not fully supported or blocked:", e);
  }
};

// Format time utility (e.g. 124 seconds -> 2:04)
const formatTime = (seconds) => {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

// Load Track details into UI
const loadTrack = (index) => {
  currentTrackIndex = index;
  audio.src = playlist[index].url;
  trackTitle.textContent = playlist[index].title;
  trackArtist.textContent = playlist[index].artist;
  albumArt.src = playlist[index].cover;
  
  // Reset progress bar
  progressBarFill.style.width = "0%";
  currentTimeEl.textContent = "0:00";
  
  // Update playlist items active state
  document.querySelectorAll(".playlist-item").forEach((item, idx) => {
    if (idx === index) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  if (isPlaying) {
    audio.play().catch(err => console.log("Audio play blocked: ", err));
  }
};

// Play / Pause Logic
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

// Next Track
const nextTrack = () => {
  let nextIndex = currentTrackIndex + 1;
  if (nextIndex >= playlist.length) {
    nextIndex = 0;
  }
  loadTrack(nextIndex);
};

// Prev Track
const prevTrack = () => {
  let prevIndex = currentTrackIndex - 1;
  if (prevIndex < 0) {
    prevIndex = playlist.length - 1;
  }
  loadTrack(prevIndex);
};

// Toggle Loop
const toggleLoop = () => {
  isLooping = !isLooping;
  audio.loop = isLooping;
  if (isLooping) {
    loopBtn.classList.add("active");
  } else {
    loopBtn.classList.remove("active");
  }
};

// Timeline update listener
audio.addEventListener("timeupdate", () => {
  const current = audio.currentTime;
  const duration = audio.duration;
  
  if (duration) {
    const progressPercent = (current / duration) * 100;
    progressBarFill.style.width = `${progressPercent}%`;
    
    // Also position the knob
    const knob = document.querySelector(".progress-bar-knob");
    if (knob) {
      knob.style.left = `${progressPercent}%`;
    }
    
    currentTimeEl.textContent = formatTime(current);
    totalDurationEl.textContent = formatTime(duration);
  }
});

// Auto-advance track when finished
audio.addEventListener("ended", () => {
  if (!isLooping) {
    nextTrack();
  }
});

// Scrubbing progress timeline
progressBarBg.addEventListener("click", (e) => {
  const width = progressBarBg.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;
  
  if (duration) {
    audio.currentTime = (clickX / width) * duration;
  }
});

// Volume slider logic
volumeSlider.addEventListener("input", (e) => {
  audio.volume = e.target.value;
});

// Build Playlist UI
const buildPlaylistUI = () => {
  playlistList.innerHTML = "";
  playlist.forEach((track, index) => {
    const item = document.createElement("div");
    item.className = `playlist-item ${index === currentTrackIndex ? "active" : ""}`;
    
    // Mock duration for tracks (as loading each metadata takes time)
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
      if (!isPlaying) {
        togglePlay();
      }
    });
    
    playlistList.appendChild(item);
  });
};

// Toggle Playlist Accordion
playlistHeader.addEventListener("click", () => {
  playlistCard.classList.toggle("expanded");
});

// ==========================================
// Real-time & Procedural Visualizer
// ==========================================
let proceduralTime = 0;

const updateVisualizer = () => {
  proceduralTime += 0.05;
  
  if (isPlaying && analyser && dataArray) {
    // Real-time audio frequency animation
    analyser.getByteFrequencyData(dataArray);
    
    // Distribute frequency bins across our 12 bars
    visualizerBars.forEach((bar, index) => {
      // Map 12 bars to first 16-20 frequency bins
      const dataIndex = Math.floor((index / visualizerBars.length) * 20);
      const value = dataArray[dataIndex] || 0;
      
      // Calculate height (max 24px)
      const height = (value / 255) * 24;
      bar.style.height = `${Math.max(3, height)}px`;
    });
  } else if (isPlaying) {
    // Procedural wave animation when playing but audio API isn't initialized yet
    visualizerBars.forEach((bar, index) => {
      const wave = Math.sin(proceduralTime + index * 0.5) * 0.5 + 0.5;
      const height = wave * 20 + 3;
      bar.style.height = `${height}px`;
    });
  } else {
    // Idle state: gentle breathing wave
    visualizerBars.forEach((bar, index) => {
      const wave = Math.sin(proceduralTime * 0.3 + index * 0.3) * 0.5 + 0.5;
      const height = wave * 6 + 3;
      bar.style.height = `${height}px`;
    });
  }
  
  requestAnimationFrame(updateVisualizer);
};

// Bind Button Clicks
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextTrack);
prevBtn.addEventListener("click", prevTrack);
loopBtn.addEventListener("click", toggleLoop);

// Initialize App
buildPlaylistUI();
loadTrack(currentTrackIndex);
updateVisualizer();

// Pre-fill total duration once metadata loads
audio.addEventListener("loadedmetadata", () => {
  totalDurationEl.textContent = formatTime(audio.duration);
});
