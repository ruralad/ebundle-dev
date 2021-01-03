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

let currentClassCode = window.location.pathname.slice(3).split("/")[0];
let workCode = window.location.pathname.split("works/")[1];
let currentUser;

firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
    window.location = "/account";
  } else {
    currentUser = user;
    document.querySelector("#user-name").innerText = user.displayName;
    document.querySelector("#user-avatar").src =
      "https://ui-avatars.com/api/?background=92ef87&name=" + user.displayName;
    firebase
      .auth()
      .currentUser.getIdToken(/* forceRefresh */ true)
      .then(function(idToken) {
        fetch("/api/getData", {
          method: "GET",
          headers: {
            Authorization: idToken
          }
        })
          .then(response => response.json())
          .then(data => {
            if (data.role == "student") {
              document.querySelector("#user-role").innerText = "Student";
              document.querySelector(".loading-bro1").style.display = "none";
              document.querySelector(".avatar").style.opacity = 1;
            } else if (data.role == "teacher") {
              document.querySelector("#user-role").innerText = "Teacher";
              document.querySelector(".loading-bro1").style.display = "none";
              document.querySelector(".avatar").style.opacity = 1;
            }
          });
      })
      .catch(function(error) {
        console.log(error);
      });
    firebase
      .auth()
      .currentUser.getIdToken(/* forceRefresh */ true)
      .then(function(idToken) {
        fetch("/api/getWorkData", {
          method: "GET",
          headers: {
            Authorization: currentClassCode + "/" + workCode + "#" + idToken
          }
        })
          .then(response => response.json())
          .then(data => {
            console.log(data);
            let d = new Date(data.dueDate).toUTCString();
            let date = d.split("");

            document.querySelector("#pageTitle").innerHTML = data.title;
            document.querySelector(".work-type").innerHTML = data.typeOfWork;
            document.querySelector(".work-due").innerHTML = date;
            document.querySelector(".work-due").style.display = "block";
            if (data.description != "")
              document.querySelector(".work-desc").innerHTML = data.description;
            if (data.fileUrl != "none")
              document.querySelector(".work-title").style.display = "flex";
          });
      });
  }
});

function goto(to) {
  if (to == "c") window.location = "/c";
  else window.location = "/" + to;
}
