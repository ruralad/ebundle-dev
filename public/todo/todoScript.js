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

let currentUser;
let currentUserRole;

function goto(to) {
  if (to == "c") window.location = "/c";
  else window.location = "/" + to;
}

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
            console.log(data);
            if (data.role == "student") {
              currentUserRole = "student";
              document.querySelector("#user-role").innerText = "Student";
              document.querySelector(".loading-bro1").style.display = "none";
              document.querySelector(".avatar").style.opacity = 1;
              document.querySelector(".tab").style.display = "block";
            } else if (data.role == "teacher") {
              currentUserRole = "teacher";
              document.querySelector("#user-role").innerText = "Teacher";
              document.querySelector(".loading-bro1").style.display = "none";
              document.querySelector(".avatar").style.opacity = 1;
              
              document.querySelector("#pending").style.display = "none";
              document.querySelector("#completed").style.display = "none";
              document.querySelector("#all").style.display = "block";
              
            }
            if (data.role == "student") {
              let emptyPending = false,
                emptyCompleted = false;
              if (data.works.length > 0) {
                data.works.forEach((item, index) => {
                  if (item.finished == "false") {
                    emptyPending = true;
                    let newRow = document.createElement("tr");
                    let newCol1 = document.createElement("td");

                    newCol1.innerHTML =
                      '<a href="' +
                      "/c/" +
                      item.classId +
                      "/works/" +
                      item.workId +
                      '" target="_blank">' +
                      item.title +
                      " (" +
                      item.class +
                      ")</a>";
                    newRow.appendChild(newCol1);

                    let newCol2 = document.createElement("td");
                    newCol2.innerHTML = new Date(item.dueDate).toLocaleString();
                    newRow.appendChild(newCol2);

                    document.querySelector("#pendingTable").appendChild(newRow);
                  } else if (item.finished == "true") {
                    emptyCompleted = true;
                    let newRow = document.createElement("tr");
                    let newCol1 = document.createElement("td");

                    newCol1.innerHTML =
                      '<a href="' +
                      "/c/" +
                      item.classId +
                      "/works/" +
                      item.workId +
                      '" target="_blank">' +
                      item.title +
                      " (" +
                      item.class +
                      ")</a>";
                    newRow.appendChild(newCol1);

                    let newCol2 = document.createElement("td");
                    newCol2.innerHTML = new Date(item.dueDate).toLocaleString();
                    newRow.appendChild(newCol2);

                    document
                      .querySelector("#completedTable")
                      .appendChild(newRow);
                  }
                });
                if (!emptyPending)
                  document.querySelector("#pendingh3").innerHTML =
                    "No Pending Works";
                if (!emptyCompleted)
                  document.querySelector("#completedh3").innerHTML =
                    "No Completed Works";
              }
            }
            let emptyAll = false;

            data.works.forEach((item, index) => {
              emptyAll = true;
              let newRow = document.createElement("tr");
              let newCol1 = document.createElement("td");

              newCol1.innerHTML =
                '<a href="' +
                "/c/" +
                item.classId +
                "/works/" +
                item.workId +
                '" target="_blank">' +
                item.title +
                " (" +
                item.class +
                ")</a>";
              newRow.appendChild(newCol1);

              let newCol2 = document.createElement("td");
              newCol2.innerHTML = new Date(item.dueDate).toLocaleString();
              newRow.appendChild(newCol2);

              document.querySelector("#allTable").appendChild(newRow);
            });

            if (!emptyAll)
              document.querySelector("#allh3").innerHTML =
                "You haven't been assigned any work yet :(";
            document.querySelector(".all").classList.toggle("hide");
          });
      })
      .catch(function(error) {
        console.log(error);
      });
  }
});

function openCity(evt, cityName) {
  let i, tabcontent, tablinks;

  // Get all elements with class="tabcontent" and hide them
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Get all elements with class="tablinks" and remove the class "active"
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab, and add an "active" class to the button that opened the tab
  document.getElementById(cityName).style.display = "block";
  evt.currentTarget.className += " active";
}
