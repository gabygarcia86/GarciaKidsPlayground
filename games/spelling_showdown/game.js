const DEFAULT_LIST = {
  week: "Spelling Words",
  words: [
    { word: "car" },
    { word: "fun" },
    { word: "cheerful" },
    { word: "adventure" },
  ],
};

const PARENT_PIN = "1644";
const $ = (id) => document.getElementById(id);
const screens = {
  home: $("homeScreen"),
  game: $("gameScreen"),
  results: $("resultsScreen"),
};
let jsonList = DEFAULT_LIST;
let currentList = DEFAULT_LIST;
let sessionWords = [];
let currentIndex = 0;
let mode = "practice";
let score = 0;
let streak = 0;
let bestStreak = 0;
let answered = false;
let attempts = [];
let missedWords = [];
let speechVoice = null;

function normalizeList(data) {
  if (!data || !Array.isArray(data.words))
    throw new Error("The list needs a words array.");
  const words = data.words
    .map((item) => {
      if (typeof item === "string") return { word: item.trim(), sentence: "" };
      if (item && typeof item.word === "string")
        return {
          word: item.word.trim(),
          sentence:
            typeof item.sentence === "string" ? item.sentence.trim() : "",
        };
      return null;
    })
    .filter((item) => item && item.word);
  if (!words.length) throw new Error("Add at least one spelling word.");
  if (words.some((item) => /[\r\n]/.test(item.word)))
    throw new Error("Each word must be on its own line.");
  return {
    week:
      typeof data.week === "string" && data.week.trim()
        ? data.week.trim()
        : "This Week's Challenge",
    words,
  };
}

async function loadJsonList() {
  try {
    const response = await fetch("words.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load words.json");
    jsonList = normalizeList(await response.json());
  } catch (error) {
    // file:// previews often block fetch; the built-in sample list still works.
    jsonList = normalizeList(DEFAULT_LIST);
    console.info(
      "Using built-in sample list. For words.json loading, run from a local server or GitHub Pages.",
      error,
    );
  }
  currentList = getSavedList() || jsonList;
  updateWeekLabel();
}

function getSavedList() {
  try {
    const saved = localStorage.getItem("spellingShowdownList");
    return saved ? normalizeList(JSON.parse(saved)) : null;
  } catch {
    return null;
  }
}

function updateWeekLabel() {
  $("weekLabel").textContent = currentList.week;
}

function showScreen(name) {
  Object.entries(screens).forEach(
    ([key, element]) => (element.hidden = key !== name),
  );
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function shuffle(items) {
  const copy = items.map((item) => ({ ...item }));
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickVoice() {
  if (!("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  speechVoice =
    voices.find(
      (v) => /^en(-|_)/i.test(v.lang) && /natural|neural|premium/i.test(v.name),
    ) ||
    voices.find((v) => /^en(-|_)/i.test(v.lang)) ||
    voices[0] ||
    null;
}
if ("speechSynthesis" in window) {
  pickVoice();
  window.speechSynthesis.onvoiceschanged = pickVoice;
}

function speak(text, repeat = 1) {
  if (!("speechSynthesis" in window)) {
    setFeedback(
      "This browser does not support speech. Try Chrome, Edge, or Safari.",
      "bad",
    );
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  if (speechVoice) utterance.voice = speechVoice;
  utterance.rate = 0.82;
  utterance.pitch = 1.02;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
  if (repeat > 1) {
    utterance.onend = () => {
      const second = new SpeechSynthesisUtterance(text);
      if (speechVoice) second.voice = speechVoice;
      second.rate = 0.82;
      window.speechSynthesis.speak(second);
    };
  }
}

function startGame(nextMode, customWords = null) {
  if (!currentList.words.length) return;
  mode = nextMode;
  sessionWords = shuffle(customWords || currentList.words);
  currentIndex = 0;
  score = 0;
  streak = 0;
  bestStreak = 0;
  attempts = [];
  missedWords = [];
  answered = false;
  $("modePill").textContent =
    mode === "practice" ? "PRACTICE MODE" : "TEST MODE";
  showScreen("game");
  showCurrentWord(true);
}

function showCurrentWord(autoSpeak = false) {
  if (currentIndex >= sessionWords.length) return showResults();
  answered = false;
  const item = sessionWords[currentIndex];
  $("progressLabel").textContent =
    `Word ${currentIndex + 1} of ${sessionWords.length}`;
  $("progressBar").style.width =
    `${(currentIndex / sessionWords.length) * 100}%`;
  $("promptEyebrow").textContent =
    mode === "practice" ? "PRACTICE ROUND" : "TEST ROUND";
  $("promptTitle").textContent =
    mode === "practice" ? "Let's practice!" : "Spell this word";
  $("sentenceHint").hidden = true;
  $("sentenceHint").textContent = "";
  $("answerInput").value = "";
  $("answerInput").disabled = false;
  $("submitAnswer").disabled = false;
  $("submitAnswer").hidden = false;
  $("nextButton").hidden = true;
  $("feedback").textContent =
    mode === "practice"
      ? "Listen to the word, then type it below."
      : "Take your time. You can do it!";
  $("feedback").className = "feedback neutral";
  $("scoreValue").textContent = score;
  $("streakValue").textContent = `🔥 Streak: ${streak}`;
  if (autoSpeak) {
    // Brief delay lets mobile browsers finish the screen transition before speech.
    window.setTimeout(() => speak(item.word), 180);
  }
  $("answerInput").focus({ preventScroll: true });
}

function setFeedback(message, kind) {
  $("feedback").textContent = message;
  $("feedback").className = `feedback ${kind}`;
}

function checkAnswer(event) {
  event.preventDefault();
  if (answered) return;
  const item = sessionWords[currentIndex];
  const typed = $("answerInput").value.trim();
  if (!typed) return;
  answered = true;
  const correct = typed.toLocaleLowerCase() === item.word.toLocaleLowerCase();
  attempts.push({ word: item.word, typed, correct });
  $("answerInput").disabled = true;
  $("submitAnswer").disabled = true;
  $("submitAnswer").hidden = true;
  $("nextButton").hidden = false;
  $("nextButton").textContent =
    currentIndex === sessionWords.length - 1
      ? "See My Results →"
      : "Next Word →";

  if (correct) {
    const points = mode === "practice" ? 10 : 20;
    score += points;
    streak += 1;
    bestStreak = Math.max(bestStreak, streak);
    setFeedback(
      mode === "practice"
        ? `Correct! Great spelling! +${points} points ⭐`
        : `Correct! +${points} points ⭐`,
      "good",
    );
  } else {
    streak = 0;
    missedWords.push(item);
    if (mode === "practice") {
      setFeedback(`Good try! The correct spelling is “${item.word}”.`, "bad");
      if (item.sentence) {
        $("sentenceHint").textContent = `Hint: ${item.sentence}`;
        $("sentenceHint").hidden = false;
      }
      // In practice, reveal and speak the correct answer to teach the spelling.
      speak(item.word);
    } else {
      setFeedback(
        "Not quite — keep going! You'll review this word at the end.",
        "bad",
      );
    }
  }
  $("scoreValue").textContent = score;
  $("streakValue").textContent = `🔥 Streak: ${streak}`;
}

function nextWord() {
  currentIndex += 1;
  showCurrentWord(true);
}

function showResults() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  showScreen("results");
  const correct = attempts.filter((a) => a.correct).length;
  const total = attempts.length;
  const percent = total ? Math.round((correct / total) * 100) : 0;
  $("progressBar").style.width = "100%";
  $("finalPercent").textContent = `${percent}%`;
  $("correctCount").textContent = correct;
  $("totalCount").textContent = total;
  $("finalScore").textContent = score;
  $("resultsEyebrow").textContent =
    mode === "practice" ? "PRACTICE ROUND COMPLETE" : "SHOWDOWN COMPLETE";
  $("resultsTitle").textContent =
    percent === 100
      ? "Perfect spelling!"
      : percent >= 80
        ? "Fantastic work!"
        : percent >= 50
          ? "Keep it up!"
          : "Practice makes progress!";
  $("resultsSubtitle").textContent =
    percent === 100
      ? "You nailed every word. You're a spelling superstar!"
      : "Every round helps your spelling skills grow.";
  $("resultsMedal").textContent =
    percent === 100 ? "🏆" : percent >= 80 ? "🥇" : percent >= 50 ? "🌟" : "💪";
  const review = $("reviewArea");
  review.replaceChildren();
  const heading = document.createElement("h3");
  heading.textContent = missedWords.length
    ? "Answer review"
    : "You spelled every word correctly!";
  review.appendChild(heading);
  const list = document.createElement("div");
  list.className = "review-list";
  attempts.forEach(({ word, typed, correct: isCorrect }) => {
    const row = document.createElement("div");
    row.className = `review-row ${isCorrect ? "correct" : "incorrect"}`;
    const submitted = document.createElement("span");
    submitted.className = "review-answer";
    submitted.textContent = `You wrote: ${typed}`;
    const expected = document.createElement("span");
    expected.className = "review-answer";
    expected.textContent = `Correct: ${word}`;
    row.append(submitted, expected);
    list.appendChild(row);
  });
  review.appendChild(list);
  $("retryMissed").hidden = missedWords.length === 0;
  $("lastResult").hidden = false;
  $("lastResult").textContent =
    `Last session: ${percent}% correct · ${correct}/${total} words`;
}

function openParent() {
  $("weekInput").value = currentList.week;
  $("wordsInput").value = currentList.words.map((item) => item.word).join("\n");
  $("parentMessage").textContent = "";
  $("parentMessage").className = "parent-message";
  $("parentDialog").showModal();
}
function requestParentAccess() {
  $("pinMessage").textContent = "";
  $("parentPin").value = "";
  $("pinDialog").showModal();
  $("parentPin").focus();
}
function saveParentList(event) {
  event.preventDefault();
  const words = $("wordsInput")
    .value.split(/\r?\n/)
    .map((word) => word.trim())
    .filter(Boolean);
  try {
    const next = normalizeList({
      week: $("weekInput").value.trim() || "This Week's Challenge",
      words,
    });
    currentList = next;
    localStorage.setItem("spellingShowdownList", JSON.stringify(currentList));
    updateWeekLabel();
    $("parentMessage").textContent =
      `Saved ${words.length} words on this device.`;
    $("parentMessage").className = "parent-message";
  } catch (error) {
    $("parentMessage").textContent = error.message;
    $("parentMessage").className = "parent-message error";
  }
}
function resetToJson() {
  currentList = jsonList;
  localStorage.removeItem("spellingShowdownList");
  updateWeekLabel();
  $("weekInput").value = currentList.week;
  $("wordsInput").value = currentList.words.map((item) => item.word).join("\n");
  $("parentMessage").textContent =
    "Reloaded the list from words.json (or the built-in sample if JSON could not load).";
  $("parentMessage").className = "parent-message";
}
function downloadJson() {
  const payload = {
    week: currentList.week,
    words: currentList.words.map((item) =>
      item.sentence ? { word: item.word, sentence: item.sentence } : item.word,
    ),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "words.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  $("parentMessage").textContent =
    "Downloaded words.json. Upload it to your GitHub Pages repository to update the hosted list.";
  $("parentMessage").className = "parent-message";
}

$("practiceStart").addEventListener("click", () => startGame("practice"));
$("testStart").addEventListener("click", () => startGame("test"));
$("answerForm").addEventListener("submit", checkAnswer);
$("speakButton").addEventListener("click", () =>
  speak(sessionWords[currentIndex].word),
);
$("nextButton").addEventListener("click", nextWord);
$("exitGame").addEventListener("click", () => {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  showScreen("home");
});
$("homeButton").addEventListener("click", () => showScreen("home"));
$("retryMissed").addEventListener("click", () =>
  startGame("practice", missedWords),
);
$("parentOpen").addEventListener("click", requestParentAccess);
$("pinForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if ($("parentPin").value !== PARENT_PIN) {
    $("pinMessage").textContent = "That PIN is not correct. Please try again.";
    $("parentPin").select();
    return;
  }
  $("pinDialog").close();
  openParent();
});
$("pinCancel").addEventListener("click", () => $("pinDialog").close());
$("pinCancelAction").addEventListener("click", () => $("pinDialog").close());
$("pinDialog").addEventListener("click", (event) => {
  if (event.target === $("pinDialog")) $("pinDialog").close();
});
$("parentClose").addEventListener("click", () => $("parentDialog").close());
$("parentForm").addEventListener("submit", saveParentList);
$("resetWords").addEventListener("click", resetToJson);
$("downloadJson").addEventListener("click", downloadJson);
$("parentDialog").addEventListener("click", (event) => {
  if (event.target === $("parentDialog")) $("parentDialog").close();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && "speechSynthesis" in window)
    window.speechSynthesis.cancel();
});

loadJsonList();
