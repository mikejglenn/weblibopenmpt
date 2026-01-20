// Initialize player
let player;
let isPlaying = false;

// Fix for chiptune2.js expecting 'libopenmpt' global, while the script might export 'Module'
if (typeof libopenmpt === 'undefined' && typeof Module !== 'undefined') {
    window.libopenmpt = Module;
}


// DOM Elements
const fileInput = document.getElementById('file-input');
const playBtn = document.getElementById('btn-play');
const pauseBtn = document.getElementById('btn-pause');
const stopBtn = document.getElementById('btn-stop');
const statusOverlay = document.getElementById('status');
const songTitle = document.getElementById('song-title');
const songInfo = document.getElementById('song-info');
const canvas = document.getElementById('visualizer');
const ctx = canvas.getContext('2d');

// Config for ChiptuneJs
const config = new ChiptuneJsConfig(0); // 0 = no repeat

document.addEventListener('DOMContentLoaded', () => {
    // Check if libraries are loaded
    if (typeof ChiptuneJsPlayer === 'undefined' || typeof libopenmpt === 'undefined') {
        statusOverlay.textContent = 'Error: Libraries not loaded.';
        return;
    }

    player = new ChiptuneJsPlayer(config);

    // Setup event handlers
    setupHandlers();

    // Setup visualization loop (dummy for now or basic if connected)
    animate();
});

function setupHandlers() {
    fileInput.addEventListener('change', handleFileSelect);

    playBtn.addEventListener('click', () => {
        if (player) {
            player.unpause(); // If paused
            // If stopped, we might need to replay? 
            // chiptune2.js togglePause logic is weak, usually 'play' handles restart if passed buffer? 
            // But we don't have the buffer stored easily unless we keep it.
            updateControls(true);
        }
    });

    pauseBtn.addEventListener('click', () => {
        if (player) {
            player.togglePause();
            updateControls(false); // Update UI state
        }
    });

    stopBtn.addEventListener('click', () => {
        if (player) {
            player.stop();
            updateControls(false);
            resetMetadata();
        }
    });
}

let currentBuffer = null;

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    statusOverlay.textContent = 'Loading...';
    containerReset();

    player.load(file, (buffer) => {
        currentBuffer = buffer;
        player.play(buffer);
        updateControls(true);
        statusOverlay.style.display = 'none';

        // Update Metadata
        const meta = player.metadata();
        songTitle.textContent = meta['title'] || file.name;
        songInfo.textContent = `Tracker: ${meta['tracker'] || 'Unknown'}`;

        // Hook up simple visualization if possible
        // Note: chiptune2.js connects directly to destination. 
        // We can't easy visualize without patching.
    });
}

function updateControls(playing) {
    isPlaying = playing;
    playBtn.disabled = playing;
    pauseBtn.disabled = !playing;
    stopBtn.disabled = !playing;
    fileInput.disabled = playing;
}

function containerReset() {
    songTitle.textContent = 'Loading...';
    songInfo.textContent = '-- / --';
    playBtn.disabled = true;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
}

function resetMetadata() {
    songTitle.textContent = 'No Song Loaded';
    songInfo.textContent = '-- / --';
    statusOverlay.style.display = 'block';
    statusOverlay.textContent = 'Waiting for file...';
    fileInput.disabled = false;
    fileInput.value = '';
}

// Visualizer (Simulated since we can't easily tap into processNode)
function animate() {
    requestAnimationFrame(animate);

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(100, 255, 218, 0.1)';

    if (isPlaying) {
        ctx.beginPath();
        for (let i = 0; i < width; i += 10) {
            const h = Math.random() * height * 0.5;
            ctx.rect(i, height / 2 - h / 2, 8, h);
        }
        ctx.fill();
    }
}
