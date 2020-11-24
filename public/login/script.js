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

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // window.location = "/c";
    console.log(user.emailVerified)
  } else {
    console.log("not logged in");
  }
});

document.getElementById("inButton").addEventListener("click", e => {
  e.preventDefault();
  firebase
    .auth()
    .signInWithEmailAndPassword(
      document.getElementById("inEmail").value,
      document.getElementById("inPassword").value
    )
    .catch(function(error) {
      console.log(error.code);
      console.log(error.message);
    });
});

document.getElementById("signUpButton").addEventListener("click", e => {
  e.preventDefault();
  let name = document.getElementById("userName").value;
  let email = document.getElementById("userMail").value;
  let password = document.getElementById("userPasswordConfirm").value;
  firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then(user => {
      console.log(user.email);
      user
        .updateProfile({
          displayName: name
        })
        .then(function() {
          console.log("updateProfile");
        })
        .catch(function(error) {
          console.log("couldnt");
        });

      user
        .sendEmailVerification()
        .then(function() {
          console.log("sendverification");
        })
        .catch(function(error) {
          console.log("couldnt send verification mail");
        });
    })
    .catch(error => {
      var errorCode = error.code;
      var errorMessage = error.message;
      // ..
    });
});

const signOutButton = document.getElementById("signoutButton");
signOutButton.addEventListener("click", () => {
  firebase
    .auth()
    .signOut()
    .catch(error => {
      console.log(error);
    });
});
