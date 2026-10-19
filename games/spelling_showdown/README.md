# Spelling Showdown

A browser-based spelling practice and test game built with plain HTML, CSS, and JavaScript. It is designed for GitHub Pages and mobile/desktop browsers.

## Run it locally

**Recommended:** use a simple local web server so the browser can load `words.json`.

If you have Python installed, open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

You can also upload the files to a GitHub repository and enable GitHub Pages in **Settings → Pages**. Choose the branch and folder containing `index.html`.

## Update spelling words

### Option A — Parent Zone (quick, on this device)
1. Open the game and choose **Parent Zone**.
2. Enter a week/list name and put one word on each line.
3. Click **Save This Week**.

This saves to the current browser's local storage. It does **not** update the website for other devices or browsers.

### Option B — Update `words.json` (for everyone using the hosted website)
Edit `words.json` and replace the sample list. Commit/push the file to GitHub. The same website link will load the updated list after the deployment/cache refresh.

Supported format:

```json
{
  "week": "Week 2 · Long vowels",
  "words": [
    "train",
    "coast",
    { "word": "bright", "sentence": "The bright moon lit the path." }
  ]
}
```

Each word can be a string, or an object with a `word` and optional `sentence`. The optional sentence is used as a practice hint after a wrong answer. Keep the spelling words out of the visible screen during the test itself.

### Option C — Bridge the two
Use Parent Zone to make the new list, then choose **Download current list as words.json**. Replace the repository's `words.json` with the downloaded file and push it to GitHub to update the hosted game on all devices.

## Features
- Practice mode and test mode
- Browser text-to-speech with replay button
- Randomized word order
- Score, streak, percentage, and missed-word review
- Practice missed words again
- Responsive design for desktop, tablet, and phone
- No frameworks, external libraries, accounts, or paid services

## Notes
- Text-to-speech voice quality depends on the device/browser and installed voices. Chrome, Edge, and Safari generally support the Web Speech API.
- For the test, a wrong answer is recorded but the correct spelling is not revealed until the results screen.
- Browser-local changes are saved only on that device. For a shared weekly list, update `words.json` in GitHub.
- This is a starter project. It doesn't send scores to a server or sync parent edits between devices.
