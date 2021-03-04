// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBTWklNdtCRZ4onk5kGNK528v6VB5VwPHo",
  authDomain: "quiz-da-biblia-d48b9.firebaseapp.com",
  databaseURL: "https://quiz-da-biblia-d48b9.firebaseio.com",
  projectId: "quiz-da-biblia-d48b9",
  storageBucket: "quiz-da-biblia-d48b9.appspot.com",
  messagingSenderId: "832726024267",
  appId: "1:832726024267:web:436a99055fcaaf6b2e8dce",
  measurementId: "G-VK3ZZV1P9W"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

firebase.auth().signInAnonymously().catch(function(error) {
  var errorCode = error.code;
  var errorMessage = error.message;
  console.log(errorMessage)
});