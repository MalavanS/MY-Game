import { isEmail, isPhone, getSession, saveSession } from './auth.js';

// Already logged in? Skip to the start page.
if (getSession()) window.location.replace('start.html');

// ---------- Storage (browser only for now) ----------
// BACKEND: replace getUsers/saveUsers with fetch() calls to your API.
const USERS_KEY = 'game_users';
const getUsers = () => JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
const saveUsers = users => localStorage.setItem(USERS_KEY, JSON.stringify(users));

async function hashPassword(password) {
    const bytes = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

const cleanPhone = v => v.replace(/[\s-]/g, '');

function startSession(user) {
    const saved = JSON.parse(localStorage.getItem('player_' + user.email) || 'null');
    saveSession(saved || {
        contact: user.email,
        username: user.username,
        lives: 2,
        bestScore: 0
    });
    window.location.href = 'start.html';
}

// ---------- Elements ----------
const signupForm = document.getElementById('signupForm');
const signinForm = document.getElementById('signinForm');
const tabSignup = document.getElementById('tabSignup');
const tabSignin = document.getElementById('tabSignin');
const signupError = document.getElementById('signupError');
const signinError = document.getElementById('signinError');

// ---------- Switch between sign in / create account ----------
function show(view) {
    const isSignup = view === 'signup';
    signupForm.classList.toggle('hidden', !isSignup);
    signinForm.classList.toggle('hidden', isSignup);
    tabSignup.classList.toggle('active', isSignup);
    tabSignin.classList.toggle('active', !isSignup);
    signupError.textContent = '';
    signinError.textContent = '';
}

tabSignup.addEventListener('click', () => show('signup'));
tabSignin.addEventListener('click', () => show('signin'));
document.querySelectorAll('[data-go]').forEach(btn =>
    btn.addEventListener('click', () => show(btn.dataset.go))
);

// ---------- Show / hide password ----------
document.querySelectorAll('[data-eye]').forEach(btn => {
    btn.addEventListener('click', () => {
        const input = document.getElementById(btn.dataset.eye);
        const showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
    });
});

// ---------- Create account ----------
signupForm.addEventListener('submit', async e => {
    e.preventDefault();
    signupError.textContent = '';

    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const username = document.getElementById('username').value.trim().toLowerCase();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const phone = cleanPhone(document.getElementById('phone').value);
    const password = document.getElementById('password').value;

    if (!firstName || !lastName || !username) {
        signupError.textContent = 'Fill in your name and a username.';
        return;
    }
    if (!isEmail(email)) {
        signupError.textContent = 'Enter a valid email address.';
        return;
    }
    if (!isPhone(phone)) {
        signupError.textContent = 'Enter a valid phone number.';
        return;
    }
    if (password.length < 6) {
        signupError.textContent = 'Password must be at least 6 characters.';
        return;
    }

    const users = getUsers();
    if (users.some(u => u.email === email)) {
        signupError.textContent = 'That email is already registered. Log in instead.';
        return;
    }
    if (users.some(u => u.username === username)) {
        signupError.textContent = 'That username is taken.';
        return;
    }
    if (users.some(u => u.phone === phone)) {
        signupError.textContent = 'That phone number is already registered.';
        return;
    }

    const user = {
        firstName, lastName, username, email, phone,
        passwordHash: await hashPassword(password)
    };
    users.push(user);
    saveUsers(users);
    startSession(user);
});

// ---------- Sign in ----------
signinForm.addEventListener('submit', async e => {
    e.preventDefault();
    signinError.textContent = '';

    const id = document.getElementById('loginId').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;

    if (!id || !password) {
        signinError.textContent = 'Enter your email, phone or username and password.';
        return;
    }

    const phoneId = cleanPhone(id);
    const user = getUsers().find(u =>
        u.email === id || u.username === id || u.phone === phoneId
    );

    if (!user || user.passwordHash !== await hashPassword(password)) {
        signinError.textContent = 'Wrong details. Check them and try again.';
        return;
    }
    startSession(user);
});

// ---------- Hero image fallback ----------
// If images/dog-hero.png doesn't exist yet, show a placeholder emoji.
const heroImg = document.getElementById('heroImg');
heroImg.addEventListener('error', () => {
    heroImg.classList.add('hidden');
    document.getElementById('heroFallback').classList.remove('hidden');
});