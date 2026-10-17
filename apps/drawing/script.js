(() => {
const canvas = document.getElementById("drawing-canvas");
const context = canvas.getContext("2d");
const brushSizeInput = document.getElementById("brush-size");
const brushSizeValue = document.getElementById("brush-size-value");
const undoButton = document.getElementById("undo-button");
const redoButton = document.getElementById("redo-button");
const drawingNotice = document.getElementById("notice");

let color = "#27324b";
let brushSize = Number(brushSizeInput.value);
let activeTool = "pencil";
let activeSticker = "";
let drawing = false;
let currentStroke = null;
let items = [];
let redoItems = [];
let noticeTimer;

function updateHistoryButtons() {
  undoButton.disabled = items.length === 0;
  redoButton.disabled = redoItems.length === 0;
}

function showNotice(message) {
  drawingNotice.textContent = message;
  drawingNotice.hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => {
    drawingNotice.hidden = true;
  }, 2500);
}

function drawItem(item) {
  if (item.type === "sticker") {
    context.save();
    const pixelRatio = canvas.width / canvas.clientWidth;
    context.font = `${item.size * pixelRatio}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(item.emoji, item.x * canvas.width, item.y * canvas.height);
    context.restore();
    return;
  }

  if (item.points.length === 0) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.lineWidth = item.size * (canvas.width / width);
  context.strokeStyle = item.tool === "eraser" ? "#ffffff" : item.color;
  context.beginPath();
  context.moveTo(item.points[0].x * canvas.width, item.points[0].y * canvas.height);

  if (item.points.length === 1) {
    context.lineTo(item.points[0].x * canvas.width, item.points[0].y * canvas.height);
  } else {
    for (const point of item.points.slice(1)) {
      context.lineTo(point.x * canvas.width, point.y * canvas.height);
    }
  }
  context.stroke();
  context.restore();
}

function redraw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  for (const item of items) drawItem(item);
  if (currentStroke) drawItem(currentStroke);
}

function resizeCanvas() {
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  const pixelRatio = window.devicePixelRatio || 1;
  const width = Math.round(bounds.width * pixelRatio);
  const height = Math.round(bounds.height * pixelRatio);
  if (canvas.width === width && canvas.height === height) return;
  canvas.width = width;
  canvas.height = height;
  redraw();
}

function getPoint(event) {
  const bounds = canvas.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)),
    y: Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height)),
  };
}

function addSticker(point) {
  items.push({
    type: "sticker",
    emoji: activeSticker,
    x: point.x,
    y: point.y,
    size: Math.max(34, brushSize * 4),
  });
  redoItems = [];
  redraw();
  updateHistoryButtons();
}

canvas.addEventListener("pointerdown", (event) => {
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();
  canvas.setPointerCapture(event.pointerId);
  const point = getPoint(event);

  if (activeSticker) {
    addSticker(point);
    return;
  }

  drawing = true;
  currentStroke = {
    type: "stroke",
    tool: activeTool,
    color,
    size: brushSize,
    points: [point],
  };
  redraw();
});

canvas.addEventListener("pointermove", (event) => {
  if (!drawing || !currentStroke) return;
  currentStroke.points.push(getPoint(event));
  redraw();
});

function finishStroke() {
  if (!drawing || !currentStroke) return;
  items.push(currentStroke);
  currentStroke = null;
  drawing = false;
  redoItems = [];
  redraw();
  updateHistoryButtons();
}

canvas.addEventListener("pointerup", finishStroke);
canvas.addEventListener("pointercancel", finishStroke);
canvas.addEventListener("lostpointercapture", finishStroke);

document.querySelectorAll(".tool-button").forEach((button) => {
  button.addEventListener("click", () => {
    activeTool = button.dataset.tool;
    activeSticker = "";
    canvas.classList.remove("is-sticker-mode");
    document.querySelectorAll(".tool-button").forEach((toolButton) => {
      const selected = toolButton === button;
      toolButton.classList.toggle("is-active", selected);
      toolButton.setAttribute("aria-pressed", String(selected));
    });
    document.querySelectorAll(".sticker-button").forEach((stickerButton) => {
      const selected = stickerButton.dataset.sticker === "none";
      stickerButton.classList.toggle("is-selected", selected);
      stickerButton.setAttribute("aria-pressed", String(selected));
    });
  });
});

function setColor(nextColor) {
  color = nextColor;
  document.querySelectorAll(".color-swatch").forEach((swatch) => {
    const selected = swatch.dataset.color === color;
    swatch.classList.toggle("is-selected", selected);
    swatch.setAttribute("aria-pressed", String(selected));
  });
}

document.querySelectorAll(".color-swatch").forEach((swatch) => {
  swatch.addEventListener("click", () => setColor(swatch.dataset.color));
});

document.getElementById("custom-color").addEventListener("input", (event) => {
  setColor(event.target.value);
  document.querySelectorAll(".color-swatch").forEach((swatch) => {
    swatch.classList.remove("is-selected");
    swatch.setAttribute("aria-pressed", "false");
  });
});

brushSizeInput.addEventListener("input", () => {
  brushSize = Number(brushSizeInput.value);
  brushSizeValue.textContent = brushSize;
});

document.querySelectorAll(".sticker-button").forEach((button) => {
  button.addEventListener("click", () => {
    activeSticker = button.dataset.sticker === "none" ? "" : button.dataset.sticker;
    document.querySelectorAll(".sticker-button").forEach((stickerButton) => {
      const selected = stickerButton === button;
      stickerButton.classList.toggle("is-selected", selected);
      stickerButton.setAttribute("aria-pressed", String(selected));
    });
    if (activeSticker) {
      activeTool = "pencil";
      document.querySelectorAll(".tool-button").forEach((toolButton) => {
        const selected = toolButton.dataset.tool === activeTool;
        toolButton.classList.toggle("is-active", selected);
        toolButton.setAttribute("aria-pressed", String(selected));
      });
    }
    canvas.classList.toggle("is-sticker-mode", Boolean(activeSticker));
  });
});

undoButton.addEventListener("click", () => {
  if (items.length === 0) return;
  redoItems.push(items.pop());
  redraw();
  updateHistoryButtons();
});

redoButton.addEventListener("click", () => {
  if (redoItems.length === 0) return;
  items.push(redoItems.pop());
  redraw();
  updateHistoryButtons();
});

document.getElementById("clear-button").addEventListener("click", () => {
  if (items.length === 0) {
    showNotice("Your paper is already empty. Start drawing!");
    return;
  }
  if (!window.confirm("Start a fresh picture? You can undo this if you change your mind.")) {
    return;
  }
  redoItems = items.slice().reverse();
  items = [];
  redraw();
  updateHistoryButtons();
});

document.getElementById("save-button").addEventListener("click", () => {
  canvas.toBlob((blob) => {
    if (!blob) {
      showNotice("Sorry, we couldn't save this picture. Please try again.");
      return;
    }
    const imageUrl = URL.createObjectURL(blob);
    const download = document.createElement("a");
    download.href = imageUrl;
    download.download = "my-doodle.png";
    download.click();
    URL.revokeObjectURL(imageUrl);
    showNotice("Your picture is ready to save!");
  }, "image/png");
});

new ResizeObserver(resizeCanvas).observe(canvas);
resizeCanvas();
updateHistoryButtons();
})();
