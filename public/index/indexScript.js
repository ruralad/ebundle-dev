const firebaseConfig = {
  apiKey: "AIzaSyCcACVfcvnEkLXPuhJAqOPsu9nZGCdiNM0",
  authDomain: "ebundle-dev.firebaseapp.com",
  databaseURL: "https://ebundle-dev.firebaseio.com",
  projectId: "ebundle-dev",
  storageBucket: "ebundle-dev.appspot.com",
  messagingSenderId: "296531095713",
  appId: "1:296531095713:web:5d9ce135564c7f0e7f40e0"
};
firebase.initializeApp(firebaseConfig);

let userPresent = false;
let popupOpen = false;
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    userPresent = true;
    document.querySelector(
      "#toAccountButton"
    ).innerHTML = user.displayName.split(" ")[0];
  } else {
    console.log("not logged in");
  }
});

document
  .querySelector("#goToDashboard")
  .addEventListener("click", () => (window.location = "/c"));
document.querySelector("#logout").addEventListener("click", () =>
  firebase
    .auth()
    .signOut()
    .then(d => location.reload())
    .catch(error => {
      console.log(error);
    })
);
document.querySelector(".logo").addEventListener("click", () => {
  window.location = "/";
});
document.querySelector("#toAccountButton").addEventListener("click", () => {
  if (userPresent && !popupOpen) {
    document.querySelector(".pop-account").style.display = "block";
    popupOpen = !popupOpen;
  } else if (popupOpen) {
    document.querySelector(".pop-account").style.display = "none";
    popupOpen = !popupOpen;
  } else if (!userPresent) window.location = "/account";
});

//typing effect
const typedTextSpan = document.querySelector(".typed-text");
const cursorSpan = document.querySelector(".cursor");

const textArray = ["fun", "easy", "eeeeeeeeeeeeeasy."];
const typingDelay = 200;
const erasingDelay = 100;
const newTextDelay = 2000; // Delay between current and next text
let textArrayIndex = 0;
let charIndex = 0;

function type() {
  if (charIndex < textArray[textArrayIndex].length) {
    if (!cursorSpan.classList.contains("typing"))
      cursorSpan.classList.add("typing");
    typedTextSpan.textContent += textArray[textArrayIndex].charAt(charIndex);
    charIndex++;
    setTimeout(type, typingDelay);
  } else {
    cursorSpan.classList.remove("typing");
    setTimeout(erase, newTextDelay);
  }
}

function erase() {
  if (charIndex > 0) {
    if (!cursorSpan.classList.contains("typing"))
      cursorSpan.classList.add("typing");
    typedTextSpan.textContent = textArray[textArrayIndex].substring(
      0,
      charIndex - 1
    );
    charIndex--;
    setTimeout(erase, erasingDelay);
  } else {
    cursorSpan.classList.remove("typing");
    textArrayIndex++;
    if (textArrayIndex >= textArray.length) textArrayIndex = 0;
    setTimeout(type, typingDelay + 1100);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  if (textArray.length) setTimeout(type, newTextDelay + 250);
});
