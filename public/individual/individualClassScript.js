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

function goto(to) {
  if (to == "c") window.location = "/c";
  else window.location = "/" + to;
}
let currentClassCode = window.location.pathname.slice(3).split("/")[0];
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
              Array.from(document.getElementsByClassName("hide")).forEach(el =>
                el.classList.remove("hide")
              );
            }
          });
      })
      .catch(function(error) {
        console.log(error);
      });

    fetch("/api/getCompleteClassData", {
      method: "GET",
      headers: {
        Authorization: currentClassCode
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.data);
        document.querySelector(".right-content").innerText =
          "Class Code : " + data.data.classCode;
        document.querySelector("#class-name").innerText = data.data.className;
        document.title = data.data.className + " | eBundle";

        if (data.data.posts.length == 0) {
          document.querySelector(".loading-bro2").style.display = "none";
          document.querySelector(".no-post").style.display = "block";
        }
        data.data.posts.forEach((item, index) => {
          let newDiv = document.createElement("div");
          newDiv.classList.add("post");

          let postHeader = document.createElement("div");
          postHeader.classList.add("post-header");

          let profile = document.createElement("div");
          profile.classList.add("profile");

          let profileAvatar = document.createElement("img");
          profileAvatar.classList.add("profile-avatar");
          profile.appendChild(profileAvatar);

          let profileName = document.createElement("div");
          profileName.classList.add("profile-name");
          profileName.innerText = item.postedBy;
          profile.appendChild(profileName);

          let postDate = document.createElement("div");
          postDate.classList.add("profile-date");
          postDate.innerText = item.date;
          profile.appendChild(postDate);

          postHeader.appendChild(profile);

          // let postType = document.createElement("div");
          // postHeader.classList.add("post-type");
          // postDate.innerText = "Study Material";
          // postHeader.appendChild(postType);

          newDiv.appendChild(postHeader);

          let postContent = document.createElement("div");
          postContent.classList.add("post-content");
          let postContentPara = document.createElement("p");
          postContentPara.innerText = item.text;
          postContent.appendChild(postContentPara);

          if (item.fileUrl != "none") {
            let link = document.createElement("a");
            link.classList.add("post-file");
            link.classList.add("no-linkstyle");
            link.innerHTML = "File";
            link.href = item.fileUrl;
            postContent.appendChild(link);
          }

          newDiv.appendChild(postContent);
          document.querySelector(".loading-bro2").style.display = "none";

          document.querySelector(".class-posts").appendChild(newDiv);
        });
        //works
        if (data.data.assignments.length > 0) {
          data.data.assignments.forEach((item, index) => {
            let li = document.createElement("li");
            let a = document.createElement("a");
            a.innerHTML = item.title + " (" + item.typeOfWork + ")";
            a.href = "/c/" + currentClassCode + "/works/" + item._id;

            li.appendChild(a);
            document.querySelector("#worksList").appendChild(li);
            document.querySelector("#noWorksPending").style.display = "none";
          });
        }
      });
  }
});

document.querySelector("#upload").addEventListener("change", () => {
  document.querySelector("#currentFile").innerHTML =
    document.querySelector("#upload").files[0].name +
    " (" +
    (document.querySelector("#upload").files[0].size / (1024 * 1024)).toFixed(
      2
    ) +
    "MB)";
});

document.querySelector("#newPostSubmit").addEventListener("click", () => {
  if (document.querySelector("#newPostText").value == "") {
    document.querySelector("#newPostText").placeholder =
      "this place cannot be empty, you need to write something here!";
  } else {
    const file = document.querySelector("#upload").files[0];
    if (file != undefined) {
      const name = +new Date() + "-" + file.name;
      const metadata = {
        contentType: file.type
      };
      const task = storageRef.child(name).put(file, metadata);
      document.querySelector("#progress").style.display = "block";
      document.querySelector("#uploadMetrics").style.display = "block";
      task
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then(url => {
          uploadPost(url);
        })
        .catch(console.error);
      task.on(
        "state_changed",
        function progress(snapshot) {
          var percentage =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          document.querySelector("#progress").value = percentage;
          document.querySelector("#uploadedSize").innerHTML =
            (snapshot.bytesTransferred / (1024 * 1024)).toFixed(2) + "MB";
          document.querySelector("#totalSize").innerHTML =
            (snapshot.totalBytes / (1024 * 1024)).toFixed(2) + "MB";
        },

        function error() {
          alert("error uploading file");
        }
      );
    } else uploadPost("none");
  }
});

function uploadPost(url) {
  let newtext = document.querySelector("#newPostText").value;
  let fileUrl = url;

  let d = new Date();
  let months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];
  let date = months[d.getMonth()] + " " + d.getDate();

  fetch("/api/newClassPost", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: currentClassCode
    },
    body: JSON.stringify({
      newtext,
      fileUrl,
      date,
      postedBy: currentUser.displayName
    })
  })
    .then(response => response.json())
    .then(data => {
      if ((data.message = "newPostAdded")) {
        let newDiv = document.createElement("div");
        newDiv.classList.add("post");

        let postHeader = document.createElement("div");
        postHeader.classList.add("post-header");

        let profile = document.createElement("div");
        profile.classList.add("profile");

        let profileAvatar = document.createElement("img");
        profileAvatar.classList.add("profile-avatar");
        profile.appendChild(profileAvatar);

        let profileName = document.createElement("div");
        profileName.classList.add("profile-name");
        profileName.innerText = currentUser.displayName;
        profile.appendChild(profileName);

        let postDate = document.createElement("div");
        postDate.classList.add("profile-date");
        postDate.innerText = date;
        profile.appendChild(postDate);

        postHeader.appendChild(profile);

        newDiv.appendChild(postHeader);

        let postContent = document.createElement("div");
        postContent.classList.add("post-content");
        let postContentPara = document.createElement("p");
        postContentPara.innerText = newtext;
        postContent.appendChild(postContentPara);
        if (fileUrl != "none") {
          let link = document.createElement("a");
          link.classList.add("post-file");
          link.classList.add("no-linkstyle");
          link.innerHTML = "File";
          link.href = fileUrl;
          postContent.appendChild(link);
        }
        newDiv.appendChild(postContent);
        document.querySelector(".no-post").style.display = "none";

        document
          .querySelector(".post")
          .insertAdjacentElement("beforebegin", newDiv);

        document.querySelector("#progress").style.display = "none";
        document.querySelector("#uploadMetrics").style.display = "none";
        document.querySelector("#newPostText").value = "";
      }
    });
}

//create new work (only for teachers)
document.querySelector("#newWorkButton").addEventListener("click", e => {
  e.preventDefault();
  document.querySelector("#newWorkButton").style.display = "none";
  document.querySelector(".creating").style.display = "block";

  const file = document.querySelector("#uploadWork").files[0];
  if (file != undefined) {
    const name = +new Date() + "-" + file.name;
    const metadata = {
      contentType: file.type
    };
    const task = storageRef.child(name).put(file, metadata);
    document.querySelector("#progressWork").style.display = "block";
    document.querySelector("#uploadMetricsWork").style.display = "block";
    task
      .then(snapshot => snapshot.ref.getDownloadURL())
      .then(url => {
        uploadWork(url);
      })
      .catch(console.error);
    task.on(
      "state_changed",
      function progress(snapshot) {
        var percentage =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        document.querySelector("#progressWork").value = percentage;
        document.querySelector("#uploadedSizeWork").innerHTML =
          (snapshot.bytesTransferred / (1024 * 1024)).toFixed(2) + "MB";
        document.querySelector("#totalSizeWork").innerHTML =
          (snapshot.totalBytes / (1024 * 1024)).toFixed(2) + "MB";
      },

      function error() {
        alert("error uploading file");
      }
    );
  } else uploadWork("none");
});

function uploadWork(fileUrl) {
  let title = document.querySelector("#newWorkTitle").value;
  let description = document.querySelector("#newWorkDescription").value;
  let type = document.querySelector("#typeOfWork").value;
  let dueDate =
    document.querySelector("#newWorkDueDate").value +
    "T" +
    document.querySelector("#newWorkDueDateTime").value;
  let createdDate = new Date().toLocaleDateString("en-CA");
  firebase
    .auth()
    .currentUser.getIdToken(/* forceRefresh */ true)
    .then(async function(idToken) {
      fetch("/api/newClassWork", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken
        },
        body: JSON.stringify({
          currentClassCode,
          title,
          description,
          type,
          dueDate,
          createdDate,
          fileUrl,
          createdBy: currentUser.email
        })
      })
        .then(response => response.json())
        .then(returnData => {
          if ((returnData.message = "newWorkAdded")) {
            window.location =
              "/c/" + currentClassCode + "/works/" + returnData.id;
          }
        });
    });
}

document.querySelector(".attendance").addEventListener("click", () => {
  window.location = "/c/" + currentClassCode + "/attendance";
});
