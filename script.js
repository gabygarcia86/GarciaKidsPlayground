// Change each label and add its URL when a game or movie is ready.
// A blank URL keeps the button on this page and shows a friendly message.
const items = {
  games: [
    { label: 'Math Blaster', url: 'games/math_blaster/index.html' },
    { label: 'Reading Knight', url: 'games/reading_knight/index.html' },
    { label: 'Multiple Choice', url: 'index_multiple_choice.html' },
    { label: "Amys World", url: 'games/amys_world/index.html' },
  ],
  movies: [
    { label: 'Star Wars : Episode I', url: 'movies/star-wars-kids-movie.html' },
    { label: 'Star Wars : Episode II', url: '' },
  ],
  multiple_choice_games: [
    { label: '1st Grade Math', url: 'games/multiple_choice/first_grade_math_game.html' },
    { label: '1st Grade Reading', url: 'games/multiple_choice/first_grade_reading_game.html' },
    { label: '3rd Grade Math', url: 'games/multiple_choice/third_grade_math_game.html' },
    { label: '3rd Grade Reading', url: 'games/multiple_choice/third_grade_reading_game.html' },
    { label: 'Home', url: 'index.html' },
  ],
};

const notice = document.getElementById('notice');
let noticeTimer;
const labelMeasure = document.createElement('canvas').getContext('2d');
const labelResizer = new ResizeObserver((entries) => {
  for (const { target } of entries) {
    const label = target.querySelector('span');
    const styles = getComputedStyle(target);
    labelMeasure.font = styles.font;
    const textWidth = labelMeasure.measureText(label.textContent).width;
    const scale = Math.min(1, label.clientWidth / textWidth);
    label.style.fontSize = scale < 1 ? `${parseFloat(styles.fontSize) * scale}px` : '';
  }
});

function showNotice(label) {
  notice.textContent = `${label} is coming soon!`;
  notice.hidden = false;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => { notice.hidden = true; }, 3000);
}

for (const [category, entries] of Object.entries(items)) {
  const list = document.getElementById(`${category}-list`);
  if (!list) continue;
  for (const entry of entries) {
    const element = document.createElement(entry.url ? 'a' : 'button');
    element.className = 'play-button';
    if (entry.url) {
      element.href = entry.url;
    } else {
      element.type = 'button';
      element.addEventListener('click', () => showNotice(entry.label));
    }
    const image = document.createElement('img');
    image.src = `assets/Button_${category === 'games' ? 'Games' : 'Movies'}.png`;
    image.alt = '';
    image.width = 492;
    image.height = 109;
    const label = document.createElement('span');
    label.textContent = entry.label;
    element.append(image, label);
    list.append(element);
    labelResizer.observe(element);
  }
}
