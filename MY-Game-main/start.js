import { requireLogin, clearSession } from './auth.js';

const session = requireLogin();

if (session) {
    document.getElementById('welcome').textContent = 'Logged in as ' + session.contact;
    document.getElementById('best').textContent = session.bestScore;

    const livesEl = document.getElementById('lives');
    livesEl.textContent = session.lives > 0
        ? '\u2764'.repeat(session.lives)
        : 'None';
    livesEl.setAttribute('aria-label', session.lives + ' lives left');

    const playBtn = document.getElementById('playBtn');

    if (session.lives <= 0) {
        document.getElementById('msg').textContent =
            'No lives left. Solve banana puzzles to earn one.';
        playBtn.textContent = 'Earn a life';
    }

    playBtn.addEventListener('click', () => {
        window.location.href = session.lives <= 0 ? 'banana.html' : 'index.html';
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        clearSession();
        window.location.href = 'login.html';
    });
}