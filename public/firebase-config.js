// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDDQUuQNmi5EBlJhJUEdrGU5GoPH1lf-18",
  authDomain: "expensetracker-5bddb.firebaseapp.com",
  projectId: "expensetracker-5bddb",
  storageBucket: "expensetracker-5bddb.firebasestorage.app",
  messagingSenderId: "74899660860",
  appId: "1:74899660860:web:dcb373fd389796d227e339",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
