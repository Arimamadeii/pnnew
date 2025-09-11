import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://zcgflkxqyborzbltroes.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZ2Zsa3hxeWJvcnpibHRyb2VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc1MjQxMTgsImV4cCI6MjA3MzEwMDExOH0.66fp8DIVxHyQeRsF0ZyzdzutKTWtn2yWik43-QMhKKI';
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const form = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const mmInput = document.getElementById('mm');
const inchInput = document.getElementById('inch');
const cmInput = document.getElementById('cm');
const timeZoneDiv = document.getElementById('time-zone');

const VALID_USERNAME = 'Farrindo';
const VALID_PASSWORD = 'Farrindo365';

// Session persistence
function checkSession() {
    if (localStorage.getItem('isLoggedIn') === 'true') {
        window.location.href = 'part-number.html';
    }
}

// Form validation
function validateInput(input, isValid, message) {
    if (!isValid) {
        input.classList.add('is-invalid');
        let feedback = input.nextElementSibling;
        if (!feedback || !feedback.classList.contains('invalid-feedback')) {
            feedback = document.createElement('div');
            feedback.classList.add('invalid-feedback');
            input.parentNode.appendChild(feedback);
        }
        feedback.textContent = message;
    } else {
        input.classList.remove('is-invalid');
        const feedback = input.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.remove();
        }
    }
}

// Login handling
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    validateInput(usernameInput, username === VALID_USERNAME, 'Invalid username');
    validateInput(passwordInput, password === VALID_PASSWORD, 'Invalid password');

    if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = 'part-number.html';
    }
});

// Real-time input validation
usernameInput.addEventListener('input', () => {
    validateInput(usernameInput, usernameInput.value.trim() !== '', 'Username is required');
});

passwordInput.addEventListener('input', () => {
    validateInput(passwordInput, passwordInput.value !== '', 'Password is required');
});

// Unit conversion with debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const convertFromMM = debounce(() => {
    const mm = parseFloat(mmInput.value);
    if (!isNaN(mm) && mm >= 0) {
        inchInput.value = (mm / 25.4).toFixed(2);
        cmInput.value = (mm / 10).toFixed(2);
    } else {
        inchInput.value = '';
        cmInput.value = '';
    }
}, 300);

const convertFromInch = debounce(() => {
    const inch = parseFloat(inchInput.value);
    if (!isNaN(inch) && inch >= 0) {
        mmInput.value = (inch * 25.4).toFixed(2);
        cmInput.value = (inch * 2.54).toFixed(2);
    } else {
        mmInput.value = '';
        cmInput.value = '';
    }
}, 300);

const convertFromCM = debounce(() => {
    const cm = parseFloat(cmInput.value);
    if (!isNaN(cm) && cm >= 0) {
        mmInput.value = (cm * 10).toFixed(2);
        inchInput.value = (cm / 2.54).toFixed(2);
    } else {
        mmInput.value = '';
        inchInput.value = '';
    }
}, 300);

mmInput.addEventListener('input', convertFromMM);
inchInput.addEventListener('input', convertFromInch);
cmInput.addEventListener('input', convertFromCM);

// Display Jakarta time
function updateTime() {
    const options = {
        timeZone: 'Asia/Jakarta',
        hour12: false,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    timeZoneDiv.textContent = new Date().toLocaleString('en-US', options) + ' WIB';
}

updateTime();
setInterval(updateTime, 1000);

// Initial session check
checkSession();
