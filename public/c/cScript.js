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
              document.querySelector("#joinOrCreate").innerText = "Join Class";
              document.querySelector(
                ".join-create-class"
              ).style.display = document.querySelector(
                ".loading-bro1"
              ).style.display = "none";
              document.querySelector("#joinOrCreate").href = "#open-join";
              document.querySelector(".join-create-class").style.display =
                "flex";
              document.querySelector(".avatar").style.opacity = "1";
            } else if (data.role == "teacher") {
              document.querySelector("#user-role").innerText = "Teacher";
              document.querySelector("#joinOrCreate").innerText =
                "Create Class";
              document.querySelector(".loading-bro1").style.display = "none";
              document.querySelector("#joinOrCreate").href = "#open-create";
              document.querySelector(".join-create-class").style.display =
                "flex";
              document.querySelector(".avatar").style.opacity = "1";
            }
            if (data.classes.length == 0) {
              document.querySelector("#empty").style.display = "block";
              document.querySelector(".loading-bro2").style.display = "none";
            } else {
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
                    document.querySelector(".loading-bro2").style.display =
                      "none";
                  });
              }
            }
          });
      })
      .catch(function(error) {
        console.log(error);
      });
  }
});

//create new class (only for teachers)
document.querySelector("#createClassButton").addEventListener("click", e => {
  e.preventDefault();
  let val1 = document.querySelector("#newClassName").value;
  let val2 = document.querySelector("#newClassDescription").value;

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
          if (returnData.response == "created")
            window.location = "/c/" + returnData.id;
        });
    });
});

//join new class (only for students)
document.querySelector("#joinClassButton").addEventListener("click", e => {
  e.preventDefault();
  document.querySelector("#joinClassButton").style.display = "none";
  document.querySelector("#joining").style.display = "block";

  let classCode = document.querySelector("#joinClassCode").value;

  firebase
    .auth()
    .currentUser.getIdToken(/* forceRefresh */ true)
    .then(async function(idToken) {
      fetch("/api/joinClass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken
        },
        body: JSON.stringify({
          classCode
        })
      })
        .then(response => response.json())
        .then(returnData => {
          if (returnData.message == "notExist") {
            document.querySelector("#joinClassButton").style.display = "block";
            document.querySelector("#joinerror").style.display = "block";
            document.querySelector("#joining").style.display = "none";
          }else if(returnData.message=="joined") window.location ="/c"
        });
    });
});
