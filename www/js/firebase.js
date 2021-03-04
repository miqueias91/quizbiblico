// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyCOEIXQBRTLNlKxtYjpu857DtqgSb8SZrE",
  authDomain: "quiz-biblico-23c08.firebaseapp.com",
  projectId: "quiz-biblico-23c08",
  storageBucket: "quiz-biblico-23c08.appspot.com",
  messagingSenderId: "765359532797",
  appId: "1:765359532797:web:e0177649bd39c60c256c94",
  measurementId: "G-DQY0Q8H1Q7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

firebase.auth().signInAnonymously().catch(function(error) {
  var errorCode = error.code;
  var errorMessage = error.message;
  console.log(errorMessage)
});