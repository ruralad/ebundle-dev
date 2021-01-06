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
const storage = firebase.storage();
const storageRef = storage.ref();

let currentClassCode = window.location.pathname.slice(3).split("/")[0];
let workCode = window.location.pathname.split("works/")[1];
let currentUser;
let currentUserRole;
let ifWorkDone = false;

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
              currentUserRole = "student";
              document.querySelector("#user-role").innerText = "Student";
              document.querySelector(".loading-bro1").style.display = "none";
              document.querySelector(".avatar").style.opacity = 1;
            } else if (data.role == "teacher") {
              currentUserRole = "teacher";
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
            let dueDate = new Date(data.dueDate);
            let d = dueDate.toUTCString();
            console.log(d);
            let dueTime = dueDate.toLocaleTimeString("en-us", {
              timeZone: "UTC"
            });
            let date =
              d.split(" ")[0] +
              " " +
              d.split(" ")[1] +
              " " +
              d.split(" ")[2] +
              " " +
              d.split(" ")[3] +
              "<span style='color:red'> " +
              dueTime.split(":")[0] +
              ":" +
              dueTime.split(":")[1] +
              dueTime.split(" ")[1] +
              "</span>";

            document.querySelector("#pageTitle").innerHTML = data.title;
            document.querySelector(".work-type").innerHTML = data.typeOfWork;
            document.querySelector(".work-due").innerHTML = date;
            document.querySelector(".work-due").style.display = "block";
            if (data.description != "")
              document.querySelector(".work-desc").innerHTML = data.description;
            if (data.fileUrl != "none")
              document.querySelector(".work-file").style.display = "flex";
            document.querySelector(".work-file").href = data.fileUrl;

            data.submissions.forEach((item, index) => {
              if (item.studentFirebaseId == currentUser.uid) {
                document.querySelector(".submit-file").href = item.fileUrl;
                document.querySelector(".submitted").classList.toggle("hide");
              }
            });

            if (data.submissions.length > 0 && currentUserRole == "teacher") {
              data.submissions.forEach((item, index) => {
                fetch("/api/getDataPassive", {
                  method: "GET",
                  headers: {
                    Authorization: item.studentFirebaseId
                  }
                })
                  .then(response => response.json())
                  .then(data => {
                    let newRow = document.createElement("tr");

                    let newCol1 = document.createElement("td");
                    newCol1.innerHTML = data.name;
                    newRow.appendChild(newCol1);

                    let newCol2 = document.createElement("td");
                    newCol2.innerHTML = data.rollno;
                    newRow.appendChild(newCol2);

                    let newCol3 = document.createElement("td");
                    newCol3.innerHTML =
                      item.submittedOn.split(",")[0] +
                      "<br>" +
                      item.submittedOn.split(",")[1];
                    newRow.appendChild(newCol3);

                    let newCol4 = document.createElement("td");
                    newCol4.innerHTML =
                      '<a href="' +
                      item.fileUrl +
                      '" target="_blank">Submitted File</a>';
                    newRow.appendChild(newCol4);

                    document.querySelector("table").appendChild(newRow);
                  });
                if (index == data.submissions.length - 1)
                  document.querySelector("table").classList.toggle("hide");
                document.querySelector(".all-head").classList.toggle("hide");
              });
            }
          });

        //check if work is already done or not
        fetch("/api/checkWorkDone", {
          method: "GET",
          headers: {
            Authorization: currentClassCode + "/" + workCode + "#" + idToken
          }
        })
          .then(response => response.json())
          .then(data => {
            console.log(data);
            if (data.message == "no") {
              document.querySelector("#submitWorkTab").classList.toggle("hide");
            }
          });
      });
  }
});

function goto(to) {
  if (to == "c") window.location = "/c";
  else window.location = "/" + to;
}

document.querySelector("#newSubmissionButton").addEventListener("click", e => {
  e.preventDefault();
  document.querySelector("#newSubmissionButton").style.display = "none";
  document.querySelector(".creating").style.display = "block";
  document.querySelector(".error").style.display = "none";

  const file = document.querySelector("#uploadSubmission").files[0];
  if (file != undefined) {
    const name = +new Date() + "-" + file.name;
    const metadata = {
      contentType: file.type
    };
    const task = storageRef.child(name).put(file, metadata);
    document.querySelector("#progressSubmission").style.display = "block";
    document.querySelector("#uploadMetricsSubmission").style.display = "block";
    task
      .then(snapshot => snapshot.ref.getDownloadURL())
      .then(url => {
        uploadSubmission(url);
      })
      .catch(console.error);
    task.on(
      "state_changed",
      function progress(snapshot) {
        var percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        document.querySelector("#progressSubmission").value = percentage;
        document.querySelector("#uploadedSizeSubmission").innerHTML =
          (snapshot.bytesTransferred / (1024 * 1024)).toFixed(2) + "MB";
        document.querySelector("#totalSizeSubmission").innerHTML =
          (snapshot.totalBytes / (1024 * 1024)).toFixed(2) + "MB";
      },

      function error() {
        alert("error uploading file");
      }
    );
  } else {
    document.querySelector("#newSubmissionButton").style.display = "block";
    document.querySelector(".error").style.display = "block";
    document.querySelector(".creating").style.display = "none";
  }
});

function uploadSubmission(fileUrl) {
  firebase
    .auth()
    .currentUser.getIdToken(/* forceRefresh */ true)
    .then(async function(idToken) {
      fetch("/api/submitWork", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken
        },
        body: JSON.stringify({
          currentClassCode,
          workCode,
          fileUrl
        })
      })
        .then(response => response.json())
        .then(returnData => {
          console.log(returnData);
          if ((returnData.message = "workSubmitted")) {
            window.location.reload();
          }
        });
    });
}
