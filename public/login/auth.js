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
    firebase
      .auth()
      .currentUser.getIdToken(/* forceRefresh */ true)
      .then(function(idToken) {
        document.cookie = "auth="+idToken+"; expires=Wed, 28 Oct 2020 12:00:00 UTC; SameSite=None; Secure"; 
        fetch("/verify", {
          method: "GET",
          headers: {
            Authorization: idToken
          }
        })
          .then((response)=>response.json())
          .then((data)=>console.log(data.message));
      })
      .catch(function(error) {
       console.log(error);
      });
  } else {
    console.log("signed out");
  }
});
