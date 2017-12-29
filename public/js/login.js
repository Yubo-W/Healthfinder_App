/*
 * Creates user and redirects to doctor search
 */
// Sign in form elements
var loginForm = document.getElementById('login-form');
var emailInput = document.getElementById('login-email');
var passwordInput = document.getElementById('login-password');
var loginError = document.getElementById('login-error');

var auth = firebase.auth();

// Helper function to set the login error message
function setLoginError(message) {
    loginError.textContent = message;
    loginError.classList.remove('hidden');
}

function clearLoginError() {
    loginError.textContent = '';
    loginError.classList.add('hidden');
}

// When the user logs in, send the email and password to firebase.
// Firebase will determine whether or not the user logged in correctly.
loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    var email = emailInput.value;
    var password = passwordInput.value;

    // First, check that an email and password have been entered,
    // and if not, display an error message.
    if (!email || !password) {
        setLoginError('Email and password are required');
    } else {
        // If the login was successful, the .then callback will be called.
        // Otherwise, the .catch callback will be called,
        // with an error object containing the error message.
        auth.signInWithEmailAndPassword(email, password)
        .then(function(user) {

        })
        .catch(function(error) {
            setLoginError(error.message);
        });
    }
});

// Sign up form elements
var signUpForm = document.getElementById('signup-form');
var displayNameInput = document.getElementById('signup-name');
var signUpEmailInput = document.getElementById('signup-email');
var signUpPasswordInput = document.getElementById('signup-password');
var signUpPasswordConfirmInput = document.getElementById('signup-password-confirm');
var signupError = document.getElementById('signup-error');
var displayNameInput = document.getElementById('signup-name');

var isSigningUp = false;

// Helper function to set the sign up error message
function setSignUpError(message) {
    signupError.textContent = message;
    signupError.classList.remove('hidden');
}

// Helper function to reset teh sign up error message
function clearSignupError() {
    signupError.textContent = '';
    signupError.classList.add('hidden');
}

signUpForm.addEventListener('submit', function (e) {
    e.preventDefault();

    // When the user clicks to sign up,
    // clear any sign up error messages.
    clearSignupError();

    isSigningUp = true;

    var email = signUpEmailInput.value;
    var password = signUpPasswordInput.value;
    var passwordConfirm = signUpPasswordConfirmInput.value;
    var displayNameValue = displayNameInput.value;

    // First, check that an email has been provided.
    if (!email) {
        setSignUpError('Email is required');
    } else if (password !== passwordConfirm) {
        // Next, check the passwords match
        setSignUpError('Passwords do not match');
    } else if (displayNameValue.length < 1) {
        setSignUpError('Display name must be at least one character')
    } else {
        // First, create the user's account
        auth.createUserWithEmailAndPassword(email, password)
        .then(function (user) {
            // Add name to profile
            user.updateProfile({
                displayName: displayNameValue
            })
            .then(function () {
                // When that operation is complete,
                // send the verification email.
                return user.sendEmailVerification();
            })
            .then(function() {
                // Redirect back to doctor search
                window.location.href = 'index.html';
            });

        })
        .catch(function (error) {
            // Display error messages
            setSignUpError(error.message);
        });
    }
});

// This callback is called whenever the user's logged in state changes,
// e.g. when the page first loads, when a user logs in, when a user logs out.
auth.onAuthStateChanged(function(user) {
    // We only want to redirect the user
    // in this callback if they have just signed in
    // or if they are returning to the page
    // and are already signed.
    if (user && !isSigningUp) {
        // User is logged in
        window.location.href = 'index.html';
    }
});
