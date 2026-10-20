// Shared auth/session helpers.
// For now everything is stored in the browser (localStorage).
// When your backend is ready, replace sendCode() and verifyCode() with fetch() calls.

const SESSION_KEY = 'game_session';
const PENDING_KEY = 'game_pending_code';

export function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export function isPhone(v) {
    return /^\+?\d{9,15}$/.test(v.replace(/[\s-]/g, ''));
}

export function getSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY));
    } catch {
        return null;
    }
}

export function saveSession(session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

// Call at the top of any page that needs a logged-in player
export function requireLogin() {
    const s = getSession();
    if (!s) {
        window.location.replace('login.html');
        return null;
    }
    return s;
}

// STEP 1: send a 6-digit code to the email/phone.
// DEMO: the code is generated here and returned so the page can show it.
// BACKEND: POST /api/send-code { contact } and return nothing.
export async function sendCode(contact) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({
        contact,
        code,
        expires: Date.now() + 5 * 60 * 1000
    }));
    return code;
}

// STEP 2: check the code and create the session.
// BACKEND: POST /api/verify-code { contact, code } -> { token, user }
export async function verifyCode(code) {
    const pending = JSON.parse(sessionStorage.getItem(PENDING_KEY) || 'null');
    if (!pending) throw new Error('Request a new code first.');
    if (Date.now() > pending.expires) throw new Error('Code expired. Request a new one.');
    if (pending.code !== code) throw new Error('Wrong code. Try again.');

    sessionStorage.removeItem(PENDING_KEY);

    // Keep lives/score if this player has played before
    const saved = JSON.parse(localStorage.getItem('player_' + pending.contact) || 'null');
    const session = saved || {
        contact: pending.contact,
        lives: 2,
        bestScore: 0
    };
    saveSession(session);
    return session;
}

// Call whenever lives/score change so progress survives logout
export function updateSession(changes) {
    const s = getSession();
    if (!s) return;
    const next = { ...s, ...changes };
    saveSession(next);
    localStorage.setItem('player_' + next.contact, JSON.stringify(next));
}