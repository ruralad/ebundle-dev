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
    console.log(user.email);
    startButton.addEventListener("click", startExam);
  }
});

//------------questions-----------------//

const questions = [
  {
    question: "What is 2 + 2?",
    question_no: 1,
    Options: [{ text: "4" }, { text: "22" }],
    answer: "4"
  },
  {
    question: "kudumbasree of geci",
    question_no: 2,
    Options: [
      { text: "j k" },
      { text: "annan" },
      { text: "kuttoos" },
      { text: "atta" }
    ],
    answer: "kuttoos"
  },
  {
    question: "1 usd == __ inr",
    question_no: 3,
    Options: [
      { text: "112" },
      { text: "72" },
      { text: "753" },
      { text: "152" }
    ],
    answer: "72"
  },
  {
    question: "What is 4 * 2?",
    question_no: 4,
    Options: [{ text: "6" }, { text: "8" }, { text: "10" }, { text: "42" }],
    answer: "8"
  }
];

let Answers = [];
let Times = [];

const startButton = document.getElementById("start-btn");
const nextButton = document.getElementById("next-btn");
const questionContainerElement = document.getElementById("question-container");
const answerButtonsElement = document.getElementById("answer-buttons");
const submitButton = document.getElementById("submit-btn");
const outputHours = document.getElementById("hours");
const Displaytime = document.getElementById("timer");
const outputMinutes = document.getElementById("minutes");
const container = document.getElementById("container");
const outputSeconds = document.getElementById("seconds");
const message = document.getElementById('message');
let contrllers = document.getElementById("controls");
let questionsDiv, questionElement;

//------globel variables-----------------//

outputHours.innerHTML = "00";
outputMinutes.innerHTML = "00";
outputSeconds.innerHTML = "00";

let shuffledQuestions,
  currentQuestionIndex,
  numButton,space,
    flag=0,
  i,
  j;

nextButton.addEventListener("click", () => {
  currentQuestionIndex++;
  setNextQuestion();
});

submitButton.addEventListener("click", () => {
  flag =1;
});

function startExam() {
  // catch_manipulations();
  const start = new Date().toTimeString();
  let Startobj = { "Exam Started At": start };
  Times.push(Startobj);
  console.log("Started at " + start);
  startButton.classList.add("hide");
  submitButton.classList.remove("hide");
  createquestions();
  setTimer()
  questionContainerElement.classList.remove("hide");
  setNextQuestion();
}
function setNextQuestion() {
  for (i = 0; i < questions.length; i++) {
    numButton = document.createElement("button");
    space =document.createElement("div");
    numButton.classList.add("btn");
    space.innerHTML ="&nbsp;&nbsp;"
    numButton.value = questions[i].question_no;
    numButton.innerText = questions[i].question_no;
    numButton.id = questions[i].question_no;
    numButton.onclick = showQuestion_fornumbers;
    contrllers.appendChild(numButton);
    contrllers.appendChild(space);
  }
  const firstindex = 1;
  showFirstQuestion(firstindex);
}

function showFirstQuestion(firstindex) {
  let showfirst = "#" + firstindex;
  document.getElementById(showfirst).classList.remove("hide");
}

//------------create questio on page ----------------//

function createquestions() {
  try {
    for (i = 0; i < questions.length; i++) {
      questionsDiv = document.createElement("div");
      questionsDiv.className = "questions_division hide";
      questionsDiv.id = "number" + questions[i].question_no;
      questionsDiv.id = "#" + questions[i].question_no;
      questionsDiv.classList = "questions_division hide";
      questionContainerElement.appendChild(questionsDiv);

      questionElement = document.createElement("div");
      questionElement.innerText = questions[i].question;
      questionsDiv.appendChild(questionElement);
      questions[i].Options.forEach(option => {
        var radiobox = document.createElement("input");
        radiobox.type = "radio";
        radiobox.id = "contact";
        radiobox.name = questions[i].question;
        radiobox.value = option.text;
        var label = document.createElement("label");
        label.htmlFor = "contact";

        var description = document.createTextNode(option.text);
        label.appendChild(description);

        var newline = document.createElement("br");

        let answer_buttons = document.createElement("div");
        answer_buttons.id = "answer-buttons";
        answer_buttons.appendChild(radiobox);
        answer_buttons.appendChild(label);
        answer_buttons.appendChild(newline);
        questionsDiv.appendChild(answer_buttons);
        //  nextButton.classList.remove("hide");
      });
    }
  } catch (error) {
    console.log(error);
  }
}

//-----------------questions for controller button ---------------------//

function showQuestion_fornumbers(e) {
  try {
    const selectedButton = e.target;
    const correct = selectedButton.id;
    let show = "#" + correct;
    let hidingpart = [];
    document.getElementById(show).classList.remove("hide");

    //------- hiding other questions ------//

    for (i = 0, j = 0; i < questions.length; i++) {
      if (questions[i].question_no != correct) {
        hidingpart[j] = questions[i].question_no;
        j++;
      }
    }
    let leng = hidingpart.length;
    for (i = 0; i < leng; i++) {
      let hide = "#" + hidingpart[i];
      document.getElementById(hide).classList.add("hide");
    }
  } catch (error) {
    console.log(error);
  }
}

// ----------------- save Answers --------------//

function saveAnswers() {
  Displaytime.classList.add("hide");
  console.log("answers saved");
  for (i = 0; i < questions.length; i++) {
    var ele = document.getElementsByName(questions[i].question);

    for (j = 0; j < ele.length; j++) {
      if (ele[j].checked) {
        let obj = { Question: ele[j].name, Answer_Selected: ele[j].value };
        Answers.push(obj);
      }
    }
  }
  let nthing = JSON.stringify(Answers);
  console.log(nthing);

  container.classList.add("hide");
 message.classList.remove("hide");
}

//--------------time taken ---------------------//

//--------------timer------------------//

function setTimer() {
   Displaytime.classList.remove("hide");
  let ntime = 5 * 60000;
  var countDownDate = new Date().getTime();
  countDownDate = countDownDate + ntime;

  var x = setInterval(function() {
    var now = new Date().getTime();

    var distance = countDownDate - now;

    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    //------------------print timer--------------------//

    outputHours.innerHTML = formatTime(hours);
    outputMinutes.innerHTML = formatTime(minutes);
    outputSeconds.innerHTML = formatTime(seconds);

    if (distance <= 0||(flag!=0)) {
      clearInterval(x);
      const end = new Date().toTimeString();
      let endobj = { "Exam Stopped at": end };
      Times.push(endobj);
      console.log("submitted at " + end);
      //------------- expire message------------------//

      saveAnswers();
    }
  }, 1000);
}

function catch_manipulations() {
  try {
    const videoStream = navigator.mediaDevices.getUserMedia({ video: true });
    videoStream.then(e => {
      let on = e.active;
      if (on) console.log("camera is on");
      else console.log("camera is off");
    });
  } catch (error) {
    console.log(error);
  }
}

function formatTime(num) {
  if (num <= 0) {
    return `00`;
  } else if (num < 10) {
    return `0${num}`;
  } else {
    return `${num}`;
  }
}
