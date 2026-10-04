// Change each label and add its URL when a game or movie is ready.
// A blank URL keeps the button on this page and shows a friendly message.
const isMobileDevice = navigator.maxTouchPoints > 0
  && window.matchMedia('(pointer: coarse)').matches;

const items = {
  games: [
    { label: 'Math Blaster', url: 'games/math_blaster/index.html' },
    { label: 'Reading Knight', url: 'games/reading_knight/index.html' },
    { label: 'Multiple Choice', url: 'multiple_choice.html' },
    {
      label: "Amy's World",
      url: isMobileDevice
        ? 'games/amys_world/mobile/index.html'
        : 'games/amys_world/desktop/index.html',
    },
    { label: 'Photo Scavenger Hunt', url: 'games/photo_scavenger_hunt/Parks_and_Playgrounds_Photo_Scavenger_Hunt.html' },
  ],
  movies: [
    { label: 'Star Wars : Episode I', url: 'movies/star-wars-kids-movie-episode-1.html' },
    { label: 'Star Wars : Episode II', url: '' },
  ],
  multiple_choice_games: [
    { label: '1st Grade Math', url: 'games/multiple_choice/first_grade_math_game.html' },
    { label: '1st Grade Reading', url: 'games/multiple_choice/first_grade_reading_game.html' },
    { label: '3rd Grade Math', url: 'games/multiple_choice/third_grade_math_game.html' },
    { label: '3rd Grade Reading', url: 'games/multiple_choice/third_grade_reading_game.html' },
    { label: 'Home', url: 'index.html', image: 'assets/Button_Home.png' },
  ],
  other: [
    { label: 'BB8', url: 'other/bb8/index.html' },
  ],
};

const FOOTER_MESSAGE = 'This site and its contents were created by Gaby Garcia.';

const footer = document.querySelector('.site-footer');
if (footer) {
  const footerText = document.createElement('p');
  footerText.textContent = FOOTER_MESSAGE;
  footer.append(footerText);
}

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
    const buttonArt = category === 'movies' ? 'Movies' : category === 'other' ? 'Other' : 'Games';
    image.src = entry.image || `assets/Button_${buttonArt}.png`;
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
