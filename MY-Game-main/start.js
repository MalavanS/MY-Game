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

    document.getElementById('playBtn').addEventListener('click', () => {
        if (session.lives <= 0) {
            // Later: send the player to the Banana API math game here
            document.getElementById('msg').textContent =
                'No lives left. Win the math game to earn one.';
            return;
        }
        window.location.href = 'index.html';
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        clearSession();
        window.location.href = 'login.html';
    });
}