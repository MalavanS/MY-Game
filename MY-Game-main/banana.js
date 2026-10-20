import { requireLogin, updateSession } from './auth.js';

const session = requireLogin();

const API = 'https://marcconrad.com/uob/banana/api.php?out=json';
const REQUIRED = 1;    // correct answers needed to earn a life
const MAX_LIVES = 2;

const img = document.getElementById('puzzleImg');
const answerInput = document.getElementById('answer');
const msg = document.getElementById('msg');
const progress = document.getElementById('progress');
const submitBtn = document.getElementById('submitBtn');

let solution = null;
let streak = 0;

document.getElementById('backBtn').addEventListener('click', () => {
    window.location.href = 'start.html';
});

function setMessage(text, good = false) {
    msg.textContent = text;
    msg.classList.toggle('ok', good);
}

async function loadPuzzle() {
    solution = null;
    answerInput.value = '';
    submitBtn.disabled = true;
    img.removeAttribute('src');
    progress.textContent = 'Solved ' + streak + ' / ' + REQUIRED;

    try {
        const res = await fetch(API, { cache: 'no-store' });
        if (!res.ok) throw new Error('Bad response');
        const data = await res.json();
        solution = Number(data.solution);
        img.src = data.question;
        submitBtn.disabled = false;
        answerInput.focus();
    } catch (err) {
        console.error(err);
        setMessage('Could not load a puzzle. Check your internet and click "Check answer" to retry.');
        submitBtn.disabled = false;
    }
}

function award() {
    const lives = Math.min(MAX_LIVES, (session.lives || 0) + 1);
    updateSession({ lives });
    setMessage('You earned a life! Heading back...', true);
    submitBtn.disabled = true;
    setTimeout(() => { window.location.href = 'start.html'; }, 1200);
}

submitBtn.addEventListener('click', () => {
    // Retry if the puzzle failed to load
    if (solution === null) {
        setMessage('');
        loadPuzzle();
        return;
    }

    const value = answerInput.value.trim();
    if (value === '') {
        setMessage('Type your answer first.');
        return;
    }

    if (Number(value) === solution) {
        streak++;
        if (streak >= REQUIRED) {
            award();
            return;
        }
        setMessage('Correct! Next puzzle.', true);
    } else {
        setMessage('Not quite. Here is a new puzzle, no penalty.');
    }
    loadPuzzle();
});

document.getElementById('skipBtn').addEventListener('click', () => {
    setMessage('');
    loadPuzzle();
});

answerInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitBtn.click();
});

// Only players who are missing a life need this page
if (session) {
    if ((session.lives || 0) >= MAX_LIVES) {
        setMessage('You already have full lives.', true);
        submitBtn.disabled = true;
        img.style.display = 'none';
    } else {
        loadPuzzle();
    }
}