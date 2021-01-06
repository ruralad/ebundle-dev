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
  if (!user) {
    window.location = "/account";
  } else {
    firebase
      .auth()
      .currentUser.getIdToken(/* forceRefresh */ true)
      .then(function(idToken) {
        fetch("/api/events", {
          method: "GET",
          headers: {
            Authorization: idToken
          }
        })
          .then(response => response.json())
          .then(data => {
            Eventcalendar(data);
          });
      })
      .catch(function(error) {
        console.log(error);
      });
  }
});

function Eventcalendar(data) {
  var calendarEl = document.getElementById("calendar");

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "dayGridMonth",
    headerToolbar: {
      left: "dayGridMonth,timeGridWeek,timeGridDay",
      center: "addEventButton"
    },
    customButtons: {
      addEventButton: {
        text: "Show Works",
        click: function() {
          try {
            for (let i = 0; i < data.length; i++) {
              var dateStr = data[i].createdDate;
              console.log(dateStr);
              var ti = data[i].title;
              var date = new Date(dateStr); // will be in local time
              var endStr = data[i].end;
              console.log(endStr);
              var edate = new Date(endStr); // will be in local time
              var urls = data[i].fileUrl;
              if (!isNaN(date.valueOf())) {
                // valid?
                calendar.addEvent({
                  title: ti,
                  start: edate,
                  //------- to show time period  add "end" and make start:edate ==> strat:date --------//
                  //  end: edate,
                  url: urls,
                  allDay: true,
                  color: "red"
                });
              } else {
                alert("Invalid date.");
              }
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
    },

    eventClick: function(info) {
      //info.jsEvent.preventDefault(); // don't let the browser navigate

      if (info.event.url) {
        window.location(info.event.url);
      }

      let ev = calendar.getEvents();
      console.log(ev);
    }
  });

  calendar.render();
}
