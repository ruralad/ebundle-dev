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
 //document.querySelector("h1").innerHTML = "Hello " + user.displayName ;
    firebase
      .auth()
      .currentUser.getIdToken(/* forceRefresh */ true)
      .then(function(idToken) {
        
        fetch("/getData", {
          method: "GET",
          headers: {
            Authorization: idToken
          }
        })
          .then(response => response.json())
        .then(data=>{
          if(data.role == "teacher"){
        document.querySelector("h1").innerHTML = "Hello " + user.displayName  + " " +data.role;
           

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
             
              fetch("/getClassData", {
                method: "GET",
                headers: {
                  Authorization: currentClassCode
                }
              })
              .then(response => response.json())
        
              .then(data => {
                let button = document.createElement("button");
                button.classList.add("create-button");
                button.innerHTML="CREATE CLASS";
    
                


                //------class-details-------------//
                let div = document.createElement("div");
                div.classList.add("classRectangle")
                div.innerHTML = data.html;
                let a = document.createElement("a");
                a.setAttribute("href","/classes/" + data.classCode)
                a.appendChild(div);
                classes.appendChild(a);
              });
            }
          }
          else{
            document.querySelector("h1").innerHTML = "Hello " + user.displayName  + " " +data.role;
            console.log(data);
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
             
              fetch("/getClassData", {
                method: "GET",
                headers: {
                  Authorization: currentClassCode
                }
              })
              .then(response => response.json())
              .then(data => {
                let div = document.createElement("div");
                div.classList.add("classRectangle")
                div.innerHTML = data.html;
                let a = document.createElement("a");
                a.setAttribute("href","/classes/" + data.classCode)
                a.appendChild(div);
                classes.appendChild(a);
              });
            }
         } });
          
          
      })     
      .catch(function(error) {
        console.log(error);
      });
  } else {
    document.querySelector("h1").innerHTML = "Please Login";
  }
});
