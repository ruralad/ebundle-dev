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

let classes = document.getElementById("classes");

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    document.querySelector("#user-name").innerText = user.displayName;
    document.querySelector("#user-avatar").src =
      "https://ui-avatars.com/api/?background=random&name=" + user.displayName;
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
            console.log(data);
            if (data.role == "student") {
              document.querySelector("#user-role").innerText = "Student";
              document.querySelector(".avatar").style.opacity = 1;
            } else if (data.role == "teacher") {
              document.querySelector("#user-role").innerText = "Student";
            }

            let iterateCount = 0;

            for (
              iterateCount;
              iterateCount < data.classes.length;
              iterateCount++
            ) {
              let currentClass = data.classes[iterateCount];
              let currentClassCode = "";
              let i = 0;
              while (currentClass[i] != null) {
                currentClassCode = currentClassCode + currentClass[i];
                i++;
              }

              fetch("/api/getClassData", {
                method: "GET",
                headers: {
                  Authorization: currentClassCode
                }
              })
                .then(response => response.json())
                .then(data => {
                  let a = document.createElement("a");
                  a.setAttribute("href", "/c/" + data.classCode);

                  let div = document.createElement("div");
                  div.classList.add("class-rectangle");
                  div.innerHTML = data.html;

                  a.appendChild(div);
                  classes.appendChild(a);
                });
            }
          });
      })
      .catch(function(error) {
        console.log(error);
      });
  } else {
    document.querySelector("h1").innerHTML = "Please Login";
  }
});

function goto(to){
  if(to == "c") window.location = "/c"
  else window.location = "/c/" + to
}
