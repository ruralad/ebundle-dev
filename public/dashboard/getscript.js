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

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    
    document.querySelector("h1").innerHTML = "Hello " + user.displayName;
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
          .then(data => {
                console.log(data); 
          });
      })
      .catch(function(error) {
        console.log(error);
      });
  } else {
    document.querySelector("h1").innerHTML = "Please Login";
  }
});
