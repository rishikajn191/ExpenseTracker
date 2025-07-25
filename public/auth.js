firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    sessionStorage.setItem("uid", user.uid);
    window.location.href = "index.html";
  }
});

async function login() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    await firebase.auth().signInWithEmailAndPassword(email, password);
  } catch (error) {
    alert("Login Error: " + error.message);
  }
}

async function signup() {
  const name = document.getElementById("signup-name").value;
  const phone = document.getElementById("signup-phone").value;
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;

  if (password !== confirm) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const result = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);

    await result.user.updateProfile({ displayName: name });

    alert("Account created!");
    hideModal("signup-modal");
  } catch (error) {
    alert("Signup Error: " + error.message);
  }
}

async function resetPassword() {
  const email = document.getElementById("reset-email").value;
  try {
    await firebase.auth().sendPasswordResetEmail(email);
    alert("Reset email sent!");
    hideModal("reset-modal");
  } catch (error) {
    alert("Reset Error: " + error.message);
  }
}

async function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await firebase.auth().signInWithPopup(provider);
  } catch (error) {
    alert("Google Login Error: " + error.message);
  }
}

function showSignup() {
  document.getElementById("signup-modal").classList.remove("hidden");
}
function showReset() {
  document.getElementById("reset-modal").classList.remove("hidden");
}
function hideModal(id) {
  document.getElementById(id).classList.add("hidden");
}
