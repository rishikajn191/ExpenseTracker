# 💸 Expense Tracker with Firebase & Chart.js
A modern web application to track daily, monthly, and yearly expenses with budget visualization and analytics. Built using HTML, CSS, JavaScript, Firebase Firestore, Chart.js, and deployed via GitHub Actions & Firebase Hosting.

## Live Site:
👉 https://expensetracker-5bddb.web.app/

## Repository:
👉 https://github.com/rishikajn191/ExpenseTracker

---

## Features
- Add, delete, and categorize expenses
- Set and track monthly budget
- View dynamic Pie and Bar charts (Chart.js)
- Toggle summary by daily/monthly/yearly
- Real-time updates using Firebase Firestore
- Persistent budget saved in localStorage
- Deployed using GitHub Actions CI/CD
- Firebase config injected securely via GitHub Secrets

---

## Tech Stack
- HTML5, CSS3
- JavaScript (ES6)
- Firebase Firestore (Database)
- Firebase Hosting
- Chart.js for charts
- GitHub Actions for deployment automation

---

## Folder Structure
```text
ExpenseTracker/
├── public/
│   ├── index.html                  # Main HTML structure
│   ├── style.css                   # Styling for the app
│   ├── script.js                   # JS logic for charts, budget, CRUD
│   ├── firebase-config.js          # Generated from GitHub Secrets (not committed)
│   └── firebase-config.template.js # Firebase config template with env placeholders
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions workflow for Firebase deployment
├── .gitignore
├── firebase.json                   # Firebase Hosting configuration
├── README.md
```

---

## Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/rishikajn191/ExpenseTracker.git
   cd ExpenseTracker
   ```
2. Add your Firebase config:
- Copy public/firebase-config.template.js → public/firebase-config.js
- Replace variables with your actual Firebase values
3. Open index.html in your browser, or use Live Server

---

## Deployment (CI/CD)
Deployment is automated using GitHub Actions:
- Secrets are injected securely
- firebase-config.js is generated dynamically from firebase-config.template.js using envsubst
- Changes pushed to main branch trigger deployment to Firebase Hosting
Main URLs:
- Production\
  👉 https://expensetracker-5bddb.web.app/
- Preview/Test\
  👉 https://expensetracker-5bddb.firebaseapp.com/

---

## Author
***Rishika Jain*** <br>
Computer Science Engineer <br>
**Leetcode:** https://leetcode.com/u/rishikajn/ <br>
**Linkeldin:** https://www.linkedin.com/in/rishikajain191/ <br>
**Email:** rishika.jn191@gmail.com

---

