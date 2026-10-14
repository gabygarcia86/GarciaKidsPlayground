const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const lettersArray = letters.split("");
const fontSize = 20;
const columns = Math.floor(canvas.width / fontSize);
const drops = Array(columns).fill(0);
const matrixColors = ["#0aff0a", "#a020f0", "#0a55ff", "#ff6c0a", "#ff0a0a", "#ffef0a", "#ff63f2", "#00fff2"];
let colorIndex = 0;
const matrixSound = document.querySelector("#matrix-sound");
const AudioContext = window.AudioContext || window.webkitAudioContext;

matrixSound.loop = true;
window.setInterval(() => {
  colorIndex = (colorIndex + 1) % matrixColors.length;
}, 2000);

const createSeamlessLoopBuffer = (sourceBuffer, audioContext) => {
  const crossfadeFrames = Math.min(
    Math.floor(sourceBuffer.sampleRate * 0.15),
    Math.floor(sourceBuffer.length / 2),
  );
  const loopBuffer = audioContext.createBuffer(
    sourceBuffer.numberOfChannels,
    sourceBuffer.length - crossfadeFrames,
    sourceBuffer.sampleRate,
  );

  for (let channel = 0; channel < sourceBuffer.numberOfChannels; channel += 1) {
    const source = sourceBuffer.getChannelData(channel);
    const loop = loopBuffer.getChannelData(channel);

    for (let frame = 0; frame < crossfadeFrames; frame += 1) {
      const blend = frame / crossfadeFrames;
      const tail = source[sourceBuffer.length - crossfadeFrames + frame];
      const head = source[frame];
      loop[frame] = tail * (1 - blend) + head * blend;
    }

    loop.set(
      source.subarray(crossfadeFrames, sourceBuffer.length - crossfadeFrames),
      crossfadeFrames,
    );
  }

  return loopBuffer;
};

const startFallbackSound = () => {
  matrixSound.play().catch((error) => {
    if (error.name !== "NotAllowedError") {
      console.error("Could not play the Matrix sound:", error);
      return;
    }

    const resumeSound = () => {
      window.removeEventListener("pointerdown", resumeSound);
      window.removeEventListener("keydown", resumeSound);
      startFallbackSound();
    };

    window.addEventListener("pointerdown", resumeSound);
    window.addEventListener("keydown", resumeSound);
  });
};

if (AudioContext) {
  const audioContext = new AudioContext();
  let audioBuffer;
  let loadBuffer;
  let loopSource;
  let listeningForGesture = false;

  const removeGestureListeners = () => {
    window.removeEventListener("pointerdown", resumeSound);
    window.removeEventListener("keydown", resumeSound);
    listeningForGesture = false;
  };

  const resumeSound = () => {
    removeGestureListeners();
    startSeamlessLoop();
  };

  const waitForGesture = () => {
    if (listeningForGesture) return;
    listeningForGesture = true;
    window.addEventListener("pointerdown", resumeSound);
    window.addEventListener("keydown", resumeSound);
  };

  const startSeamlessLoop = async () => {
    try {
      if (!audioBuffer) {
        if (!loadBuffer) {
          loadBuffer = fetch(matrixSound.src)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Audio request failed: ${response.status}`);
              }
              return response.arrayBuffer();
            })
            .then((data) => audioContext.decodeAudioData(data));
        }
        audioBuffer = await loadBuffer;
      }

      if (loopSource) return;
      if (audioContext.state !== "running") {
        waitForGesture();
        await audioContext.resume();
      }
      if (audioContext.state !== "running" || loopSource) return;
      removeGestureListeners();

      loopSource = audioContext.createBufferSource();
      loopSource.buffer = createSeamlessLoopBuffer(audioBuffer, audioContext);
      loopSource.loop = true;
      loopSource.connect(audioContext.destination);
      loopSource.start();
    } catch (error) {
      if (audioContext.state === "suspended" || error.name === "NotAllowedError") {
        waitForGesture();
        return;
      }

      console.error("Could not start the seamless Matrix sound loop:", error);
      startFallbackSound();
    }
  };

  startSeamlessLoop();
} else {
  startFallbackSound();
}

function draw() {
  ctx.fillStyle = "rgba(0,0,0,0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = matrixColors[colorIndex];
  ctx.font = fontSize + "px monospace";
  for (let i = 0; i < drops.length; i++) {
    const text = lettersArray[Math.floor(Math.random() * lettersArray.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height || Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
  requestAnimationFrame(draw);
}
draw();
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
