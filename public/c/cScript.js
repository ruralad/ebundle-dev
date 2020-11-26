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

function goto(to) {
  if (to == "c") window.location = "/c";
  else window.location = "/" + to;
}

let currentUser;

//load initial stuff for classes
firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
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
              document.querySelector("#joinOrCreate").innerText = "Join Class";
              document.querySelector(".join-create-class").style.display =
                "flex";
              document.querySelector(".avatar").style.opacity = "1";

              document
                .querySelector(".join-create-class")
                .addEventListener("click", () => {
                  console.log("join class");
                });
            } else if (data.role == "teacher") {
              document.querySelector("#user-role").innerText = "Teacher";
              document.querySelector("#joinOrCreate").innerText =
                "Create Class";
              document.querySelector("#joinOrCreate").href = "#open-create";
              document.querySelector(".join-create-class").style.display =
                "flex";
              document.querySelector(".avatar").style.opacity = "1";
            }

            let iterateCount = 0;

            for (
              iterateCount;
              iterateCount < data.classes.length;
              iterateCount++
            ) {
              let currentClassCode = data.classes[iterateCount]._id;
              fetch("/api/getPartialClassData", {
                method: "GET",
                headers: {
                  Authorization: currentClassCode
                }
              })
                .then(response => response.json())
                .then(classData => {
                  let a = document.createElement("a");
                  a.setAttribute("href", "/c/" + classData.classCode);

                  let div = document.createElement("div");
                  div.classList.add("class-rectangle");
                  div.innerHTML = classData.html;

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

//create new class (only for teachers)
document.querySelector("#createClassButton").addEventListener("click", e => {
  e.preventDefault();
  document.querySelector("#createClassButton").style.pointerEvents = "none";
  let val1 = document.querySelector("#newClassName").value;
  let val2 = document.querySelector("#newClassDescription").value;
  console.log(JSON.stringify({
          name: val1,
          desc: val2,
          createdBy: currentUser.email
        }));
  firebase
    .auth()
    .currentUser.getIdToken(/* forceRefresh */ true)
    .then(async function(idToken) {
      fetch("/api/createNewClass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken
        },
        body: JSON.stringify({
          name: val1,
          desc: val2,
          createdBy: currentUser.email
        })
      })
        .then(response => response.json())
        .then(returnData => {
        if(returnData.response == "created") window.location = "/c/" + returnData.id;
      });
    });
});
