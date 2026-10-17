// Change each label and add its URL when a game or movie is ready.
// A blank URL keeps the button on this page and shows a friendly message.
const isMobileDevice =
  navigator.maxTouchPoints > 0 &&
  window.matchMedia("(pointer: coarse)").matches;

const items = {
  games: [
    { label: "Math Blaster", url: "games/math_blaster/index.html" },
    { label: "Reading Knight", url: "games/reading_knight/index.html" },
    { label: "Multiple Choice", url: "multiple_choice.html" },
    {
      label: "Rock Paper Scissors",
      url: "games/rock_paper_scissors/index.html",
    },
    {
      label: "Tic Tac Toe",
      url: "games/tic_tac_toe/index.html",
    },
    {
      label: "Amy's World",
      url: isMobileDevice
        ? "games/amys_world/mobile/index.html"
        : "games/amys_world/desktop/index.html",
    },
    {
      label: "Photo Scavenger Hunt",
      url: "games/photo_scavenger_hunt/Parks_and_Playgrounds_Photo_Scavenger_Hunt.html",
    },
  ],
  movies: [
    {
      label: "Star Wars : Episode I",
      url: "movies/star-wars-kids-movie-episode-1.html",
    },
    { label: "Star Wars : Episode II", url: "" },
  ],
  multiple_choice_games: [
    {
      label: "1st Grade Math",
      url: "games/multiple_choice/first_grade_math_game.html",
    },
    {
      label: "1st Grade Reading",
      url: "games/multiple_choice/first_grade_reading_game.html",
    },
    {
      label: "3rd Grade Math",
      url: "games/multiple_choice/third_grade_math_game.html",
    },
    {
      label: "3rd Grade Reading",
      url: "games/multiple_choice/third_grade_reading_game.html",
    },
    { label: "Home", url: "index.html", image: "assets/Button_Home.png" },
  ],
  apps: [
    { label: "Calculator", url: "apps/calculator/index.html" },
    { label: "Stop Watch", url: "apps/stopwatch/index.html" },
    { label: "Calendar", url: "apps/calendar/index.html" },
    { label: "Drawing Studio", url: "apps/drawing/index.html" },
  ],
  other: [
    { label: "BB8", url: "other/bb8/index.html" },
    {
      label: "Happy Halloween",
      url: "",
      creepy: true,
      message: "BOO Happy Halloween!",
    },
    { label: "Enter The Matrix", url: "other/matrix/index.html" },
    { label: "Lava Lamp", url: "other/lavalamp/index.html" },
  ],
};

// Footer message

const FOOTER_MESSAGE = "Created by Gaby Garcia";

const footer = document.querySelector(".site-footer");
if (footer) {
  const footerText = document.createElement("p");
  footerText.textContent = FOOTER_MESSAGE;
  footer.append(footerText);
}

// Coming soon notice and label resizing

const notice = document.getElementById("notice");
let noticeTimer;
const labelMeasure = document.createElement("canvas").getContext("2d");
const labelResizer = new ResizeObserver((entries) => {
  for (const { target } of entries) {
    const label = target.querySelector(".play-button__label");
    const styles = getComputedStyle(target);
    labelMeasure.font = styles.font;
    const textWidth = labelMeasure.measureText(label.textContent).width;
    const scale = Math.min(1, label.clientWidth / textWidth);
    label.style.fontSize =
      scale < 1 ? `${parseFloat(styles.fontSize) * scale}px` : "";
  }
});

function showNotice(message) {
  notice.textContent = message;
  notice.hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => {
    notice.hidden = true;
  }, 3000);
}

// Create buttons for each item

for (const [category, entries] of Object.entries(items)) {
  const list = document.getElementById(`${category}-list`);
  if (!list) continue;
  for (const entry of entries) {
    const element = document.createElement(entry.url ? "a" : "button");
    element.className = "play-button";
    if (entry.url) {
      element.href = entry.url;
    } else {
      element.type = "button";
      element.addEventListener("click", () =>
        showNotice(entry.message || `${entry.label} is coming soon!`),
      );
    }
    const image = document.createElement("img");
    const buttonArt =
      {
        movies: "Movies",
        other: "Other",
        apps: "Other",
      }[category] || "Games";
    image.src = entry.image || `assets/Button_${buttonArt}.png`;
    image.alt = "";
    image.width = 492;
    image.height = 109;
    const label = document.createElement("span");
    label.className = "play-button__label";
    label.textContent = entry.label;
    if (entry.creepy) {
      element.classList.add("creepy-btn");
      const eyes = document.createElement("span");
      eyes.className = "creepy-btn__eyes";
      eyes.setAttribute("aria-hidden", "true");
      for (let i = 0; i < 2; i += 1) {
        const eye = document.createElement("span");
        eye.className = "creepy-btn__eye";
        const pupil = document.createElement("span");
        pupil.className = "creepy-btn__pupil";
        eye.append(pupil);
        eyes.append(eye);
      }
      const cover = document.createElement("span");
      cover.className = "creepy-btn__cover";
      cover.append(image, label);
      element.append(eyes, cover);
    } else {
      element.append(image, label);
    }
    list.append(element);
    labelResizer.observe(element);
  }
}

// Creepy button eye movement

for (const button of document.querySelectorAll(".creepy-btn")) {
  const eyes = button.querySelector(".creepy-btn__eyes");
  const pupils = button.querySelectorAll(".creepy-btn__pupil");
  let closeTimer;

  if (isMobileDevice) {
    button.addEventListener("click", () => {
      button.classList.add("is-open");
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        button.classList.remove("is-open");
        button.blur();
      }, 5000);
    });
  }

  button.addEventListener("pointermove", (event) => {
    const rect = eyes.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy) || 1;
    const x = (dx / distance) * 25;
    const y = (dy / distance) * 25;
    for (const pupil of pupils) {
      pupil.style.transform = `translate(${x - 50}%, ${y - 50}%)`;
    }
  });
  button.addEventListener("pointerleave", () => {
    for (const pupil of pupils) {
      pupil.style.transform = "";
    }
  });
}
