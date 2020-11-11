const form = document.getElementById("signinForm");
form.addEventListener("submit", e => {
  e.preventDefault();
  firebase
    .auth()
    .signInWithEmailAndPassword(
      form.elements["email"].value,
      form.elements["password"].value
    )
    .then(console.log("signed in"))
    .catch(function(error) {
      console.log(error.code);
      console.log(error.message);
    });
});

const signOutButton = document.getElementById("signout");
signOutButton.addEventListener("click", () => {
  firebase
    .auth()
    .signOut()
    .catch(error => {
      console.log(error);
    });
});
