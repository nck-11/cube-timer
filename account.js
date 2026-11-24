import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { supabaseConfig } from "./supabase-config.js";

const supabase = createClient(supabaseConfig.url, supabaseConfig.publishableKey);
const notice = document.querySelector("#account-notice");
const accountAuth = document.querySelector("#account-auth");
const accountSession = document.querySelector("#account-session");
const accountEmail = document.querySelector("#account-email");
const form = document.querySelector("#account-form");
const emailInput = document.querySelector("#account-email-input");
const passwordInput = document.querySelector("#account-password");
const passwordLabel = document.querySelector("#account-password-label");
const formHeading = document.querySelector("#account-form-heading");
const formDescription = document.querySelector("#account-form-description");
const submitButton = document.querySelector("#account-submit");
const signInModeButton = document.querySelector("#sign-in-mode");
const signUpModeButton = document.querySelector("#sign-up-mode");
const forgotPasswordButton = document.querySelector("#forgot-password");
const backToLoginButton = document.querySelector("#back-to-login");
const signOutButton = document.querySelector("#sign-out");

const recoveryParams = new URLSearchParams(window.location.hash.slice(1));
const isPasswordRecovery =
  recoveryParams.get("type") === "recovery" ||
  new URLSearchParams(window.location.search).has("reset");
const isSignUpRequested = new URLSearchParams(window.location.search).get("signup") === "1";
let mode = isPasswordRecovery ? "update-password" : isSignUpRequested ? "signup" : "login";
let session = null;
let isSubmitting = false;

function setNotice(message = "", isError = false) {
  notice.textContent = message;
  notice.classList.toggle("is-error", isError);
}

function render() {
  const isRecovery = mode === "update-password";
  const isReset = mode === "reset";
  const showSession = Boolean(session) && !isRecovery;
  accountSession.hidden = !showSession;
  accountAuth.hidden = showSession;

  if (showSession) {
    accountEmail.textContent = session.user.email || "Signed-in account";
    return;
  }

  const isSignUp = mode === "signup";
  signInModeButton.hidden = isRecovery || isReset;
  signUpModeButton.hidden = isRecovery || isReset;
  signInModeButton.classList.toggle("is-selected", mode === "login");
  signUpModeButton.classList.toggle("is-selected", isSignUp);
  signInModeButton.setAttribute("aria-pressed", String(mode === "login"));
  signUpModeButton.setAttribute("aria-pressed", String(isSignUp));
  forgotPasswordButton.hidden = mode !== "login";
  backToLoginButton.hidden = mode !== "reset";

  passwordInput.hidden = isReset;
  passwordInput.required = !isReset;
  passwordLabel.hidden = isReset;
  passwordLabel.style.display = isReset ? "none" : "";
  passwordInput.autocomplete = isRecovery ? "new-password" : "current-password";
  passwordInput.minLength = isRecovery || isSignUp ? 8 : 1;
  passwordInput.value = "";

  if (isRecovery) {
    formHeading.textContent = "Choose a new password";
    formDescription.textContent = "Enter a new password of at least 8 characters.";
    submitButton.textContent = "Update password";
  } else if (isReset) {
    formHeading.textContent = "Reset your password";
    formDescription.textContent = "We’ll email you a secure link to choose a new password.";
    submitButton.textContent = "Send reset link";
  } else if (isSignUp) {
    formHeading.textContent = "Create your account";
    formDescription.textContent = "Sign up with your email and a password of at least 8 characters.";
    submitButton.textContent = "Sign up";
  } else {
    formHeading.textContent = "Log in";
    formDescription.textContent = "Enter your email and password to continue.";
    submitButton.textContent = "Log in";
  }
}

function accountRedirect(path = "account.html") {
  return new URL(path, window.location.href).toString();
}

function setBusy(busy) {
  isSubmitting = busy;
  form.querySelectorAll("button, input").forEach((control) => {
    control.disabled = busy;
  });
  signInModeButton.disabled = busy;
  signUpModeButton.disabled = busy;
  forgotPasswordButton.disabled = busy;
  backToLoginButton.disabled = busy;
  signOutButton.disabled = busy;
}

signInModeButton.addEventListener("click", () => {
  mode = "login";
  setNotice();
  render();
});

signUpModeButton.addEventListener("click", () => {
  mode = "signup";
  setNotice();
  render();
});

forgotPasswordButton.addEventListener("click", () => {
  mode = "reset";
  setNotice();
  render();
});

backToLoginButton.addEventListener("click", () => {
  mode = "login";
  setNotice();
  render();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isSubmitting) return;

  setBusy(true);
  setNotice();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: accountRedirect() }
      });
      if (error) throw error;

      session = data.session;
      if (!session) {
        mode = "login";
        setNotice("Check your email for a confirmation link, then log in.");
      } else {
        setNotice("Your account is ready.");
      }
    } else if (mode === "login") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      session = data.session;
      setNotice("You’re signed in.");
    } else if (mode === "reset") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: accountRedirect("account.html?reset=1")
      });
      if (error) throw error;
      mode = "login";
      setNotice("If an account exists for that email, a password reset link is on its way.");
    } else {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      session = data.user ? { user: data.user } : session;
      mode = "login";
      window.history.replaceState(null, "", accountRedirect());
      setNotice("Your password has been updated.");
    }
  } catch (error) {
    setNotice(error.message || "The account request could not be completed.", true);
  } finally {
    setBusy(false);
    render();
  }
});

signOutButton.addEventListener("click", async () => {
  if (isSubmitting) return;

  signOutButton.disabled = true;
  setNotice();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    session = null;
    mode = "login";
    setNotice("You’re signed out.");
    render();
  } catch (error) {
    setNotice(error.message || "Could not sign out.", true);
  } finally {
    signOutButton.disabled = false;
  }
});

supabase.auth.onAuthStateChange((event, nextSession) => {
  session = nextSession;
  if (event === "PASSWORD_RECOVERY") mode = "update-password";
  render();
});

const { data, error } = await supabase.auth.getSession();
if (error) {
  setNotice(error.message || "Could not check your account session.", true);
} else {
  session = data.session;
}
render();
