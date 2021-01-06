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
    // if(!user.emailVerified) window.location="/account/verifyemail";
    // else
    window.location = "/c";
    // console.log(user.emailVerified);
  } else {
    console.log("not logged in");
  }
});
document.querySelector(".logo").addEventListener("click", () => {
  window.location = "/";
});

document.querySelector("#inButton").addEventListener("click", e => {
  e.preventDefault();
  document.querySelector("#signinText").innerHTML = "";
  document.querySelector(".loading-bro").style.display = "block";
  firebase
    .auth()
    .signInWithEmailAndPassword(
      document.querySelector("#inEmail").value,
      document.querySelector("#inPassword").value
    )
    .catch(function(error) {
      console.log(error.code);
      if (error.code == "auth/invalid-email") {
        document.querySelector("#signinText").innerHTML = "sign in";
        document.querySelector(".loading-bro").style.display = "none";
        document.querySelector(".wrong").innerHTML = "email doesn't exist";
        document.querySelector(".wrong").style.display = "block";
      } else if (error.code == "auth/wrong-password") {
        document.querySelector("#signinText").innerHTML = "sign in";
        document.querySelector(".loading-bro").style.display = "none";
        document.querySelector(".wrong").innerHTML = "wrong password";
        document.querySelector(".wrong").style.display = "block";
      } else if (error.code == "auth/user-not-found") {
        document.querySelector("#signinText").innerHTML = "sign in";
        document.querySelector(".loading-bro").style.display = "none";
        document.querySelector(".wrong").innerHTML =
          "we couldn't recognise you. <br> please make a new account";
        document.querySelector(".wrong").style.display = "block";
        document.querySelector(".forgot-pass").style.display = "none";
      }
    });
});

//passwords do not match
document.querySelector("#userPasswordConfirm").addEventListener("input", e => {
  if (
    document.querySelector("#userPasswordConfirm").value !=
    document.querySelector("#userPassword").value
  ) {
    document.querySelector("#passwordNoMatch").style.display = "block";
  } else document.querySelector("#passwordNoMatch").style.display = "none";
});

//show rollnumber input if radio checked is student
document.querySelector("#studentRadio").addEventListener("change", e => {
  if (document.querySelector("#studentRadio").checked)
    document.querySelector("#rollno").style.display = "block";
});
document.querySelector("#teacherRadio").addEventListener("change", e => {
  if (document.querySelector("#teacherRadio").checked)
    document.querySelector("#rollno").style.display = "none";
});


document.querySelector("#signUpButton").addEventListener("click", e => {
  e.preventDefault();

  document.querySelector("#signupText").innerHTML = "";
  document.querySelector(".loading-bro1").style.display = "block";

  let name = document.querySelector("#userName").value;
  let email = document.querySelector("#userMail").value;
  let password = document.querySelector("#userPasswordConfirm").value;
  let role;
  let rollno = document.querySelector("#rollno").value;

  if (document.querySelector("#studentRadio").checked)
    role = document.querySelector("#studentRadio").value;
  else if (document.querySelector("#teacherRadio").checked)
    role = document.querySelector("#teacherRadio").value;
  let stuff = JSON.stringify({
    name,
    email,
    password,
    role,
    rollno
  });
  fetch("/api/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: stuff
  })
    .then(response => response.json())
    .then(data => {
      if (data.response == "created") window.location.reload();
    });
});

//password reset
document.querySelector("#submitEmail").addEventListener("click", e => {
  let email = document.querySelector("#emailForgotPass").value;
  document.querySelector("#emailError").style.display = "none";
  document.querySelector("#submitEmail").style.display = "none";
  document.querySelector("#submittingEmail").style.display = "block";

  firebase
    .auth()
    .sendPasswordResetEmail(email)
    .then(function() {
      document.querySelector("#submittingEmail").style.display = "none";
      document.querySelector("#emailSent").style.display = "block";
    })
    .catch(function(error) {
      document.querySelector("#submitEmail").style.display = "block";
      document.querySelector("#submittingEmail").style.display = "none";
      document.querySelector("#emailError").style.display = "block";
      console.log(error.code);
      if (error.code == "auth/user-not-found") {
        document.querySelector("#emailError").innerHTML =
          "The email doesn't exist👎🏼 try again";
      } else if (error.code == "auth/invalid-email") {
        document.querySelector("#emailError").innerHTML =
          "Please enter a valid email🙄";
      }
    });
});
