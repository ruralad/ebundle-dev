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

function goto(to) {
  if (to == "c") window.location = "/c";
  else window.location = "/" + to;
}

let currentClassCode = window.location.pathname.slice(3);
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
              document.querySelector(".avatar").style.opacity = 1;
            } else if (data.role == "teacher") {
              document.querySelector("#user-role").innerText = "Teacher";
              document.querySelector(".avatar").style.opacity = 1;
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
        document.querySelector("#class-name").innerText = data.data.className;
        document.title = data.data.className + " | eBundle";

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
          profileAvatar.classList.add("profile-name");
          profileName.innerText = item.postedBy;
          profile.appendChild(profileName);

          let postDate = document.createElement("div");
          postDate.classList.add("profile-date");
          postDate.innerText = item.date;
          profile.appendChild(postDate);

          postHeader.appendChild(profile);

          let postType = document.createElement("div");
          postHeader.classList.add("post-type");
          postDate.innerText = "Study Material";
          postHeader.appendChild(postType);

          newDiv.appendChild(postHeader);

          let postContent = document.createElement("div");
          postContent.classList.add("post-content");
          let postContentPara = document.createElement("p");
          postContentPara.innerText = item.text;
          postContent.appendChild(postContentPara);

          newDiv.appendChild(postContent);

          document.querySelector(".class-posts").appendChild(newDiv);
        });
      });
  }
});

document.querySelector("#newPostSubmit").addEventListener("click", () => {
  let newtext = document.querySelector("#newPostText").value;
  let fileUrl = "none";

  let d = new Date();
  let date = d.getDate() + "/" + (d.getMonth() + 1);

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
        profileAvatar.classList.add("profile-name");
        profileName.innerText = currentUser.displayName;
        profile.appendChild(profileName);

        let postDate = document.createElement("div");
        postDate.classList.add("profile-date");
        postDate.innerText = date;
        profile.appendChild(postDate);

        postHeader.appendChild(profile);

        let postType = document.createElement("div");
        postHeader.classList.add("post-type");
        postDate.innerText = "Study Material";
        postHeader.appendChild(postType);

        newDiv.appendChild(postHeader);

        let postContent = document.createElement("div");
        postContent.classList.add("post-content");
        let postContentPara = document.createElement("p");
        postContentPara.innerText = newtext;
        postContent.appendChild(postContentPara);

        newDiv.appendChild(postContent);

        document.querySelector(".class-posts").appendChild(newDiv);
      }
    });
});
