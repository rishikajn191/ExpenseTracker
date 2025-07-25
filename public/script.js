// Expense Tracker script

// Redirect to login.html if UID not present in sessionStorage
const uid = sessionStorage.getItem("uid");
if (!uid) {
  window.location.href = "login.html";
}

// Handle Firebase auth state
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    const nameSpan = document.getElementById("user-name");
    nameSpan.textContent = user.displayName || user.email;
  } else {
    window.location.href = "login.html";
  }
});

console.log("Expense Tracker script loaded!");

let chartInstance = null;
let BUDGET_LIMIT = 0;
let summaryChartInstance = null;

// Generate a random bright color for categories for chart visualization
function generateRandomColor() {
  const brightColors = [
    "#e6194b",
    "#3cb44b",
    "#ffe119",
    "#4363d8",
    "#f58231",
    "#911eb4",
    "#46f0f0",
    "#f032e6",
    "#bcf60c",
    "#fabebe",
    "#008080",
    "#e6beff",
    "#9a6324",
    "#fffac8",
    "#800000",
    "#aaffc3",
    "#808000",
    "#ffd8b1",
    "#000075",
    "#808080",
  ];
  return brightColors[Math.floor(Math.random() * brightColors.length)];
}

const categoryColorMap = {};

function getColor(category) {
  if (!categoryColorMap[category]) {
    categoryColorMap[category] = generateRandomColor();
  }
  return categoryColorMap[category];
}

// Initialize Firebase
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("expense-form");
  const budgetInput = document.getElementById("budget-limit");
  const setBudgetBtn = document.getElementById("set-budget");
  const currentBudgetText = document.getElementById("current-budget");
  const statusText = document.getElementById("budget-status");
  const fill = document.getElementById("budget-bar-fill");
  const chartTypeSelector = document.getElementById("chart-type");
  const viewModeSelector = document.getElementById("view-mode");

  // Load saved budget limit from localStorage
  const savedBudget = localStorage.getItem("userBudget");
  if (savedBudget) {
    BUDGET_LIMIT = parseFloat(savedBudget);
    budgetInput.value = BUDGET_LIMIT;
    currentBudgetText.textContent = `Current Budget: ₹${BUDGET_LIMIT}`;
  }
  // Initialize budget bar
  setBudgetBtn.addEventListener("click", () => {
    const newLimit = parseFloat(budgetInput.value);
    if (isNaN(newLimit) || newLimit <= 0) {
      alert("Please enter a valid budget limit.");
      return;
    }

    BUDGET_LIMIT = newLimit;
    localStorage.setItem("userBudget", BUDGET_LIMIT);
    currentBudgetText.textContent = `Current Budget: ₹${BUDGET_LIMIT}`;

    db.collection("users")
      .doc(uid)
      .collection("expenses")
      .orderBy("timestamp", "desc")
      .get()
      .then((snapshot) => {
        const allExpenses = [];
        snapshot.forEach((doc) => {
          allExpenses.push(doc.data());
        });
        checkBudget(allExpenses);
        const chartCanvas = document.getElementById("expense-chart");
        if (!chartCanvas.offsetParent) return; // skip rendering if canvas is hidden

        updateChart(allExpenses);
      });
  });

  // Initialize budget bar
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const desc = document.getElementById("desc").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;

    try {
      await db.collection("users").doc(uid).collection("expenses").add({
        description: desc,
        amount,
        category,
        timestamp: new Date(),
      });
      form.reset();
      showToast("✅ Expense added!");
    } catch (error) {
      console.error("Error adding expense: ", error);
    }
  });

  // Fetch expenses from Firestore and render them
  db.collection("users")
    .doc(uid)
    .collection("expenses")
    .orderBy("timestamp", "desc")
    .onSnapshot((snapshot) => {
      const list = document.getElementById("expense-list");
      list.innerHTML = "";
      const allExpenses = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const timestamp = data.timestamp.toDate();
        const date = timestamp.toISOString().split("T")[0];
        const month = timestamp.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });

        allExpenses.push({
          ...data,
          id: doc.id,
          date,
          month,
        });

        const li = document.createElement("li");
        li.textContent = `${data.description} - ₹${data.amount} [${data.category}]`;

        const deleteBtn = document.createElement("button");
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.style.marginLeft = "10px";
        deleteBtn.onclick = async () => {
          await db.collection("expenses").doc(doc.id).delete();
        };

        li.appendChild(deleteBtn);
        list.appendChild(li);
      });

      updateChart(allExpenses);
      checkBudget(allExpenses);

      // Render default view mode chart
      const mode = document.getElementById("view-mode").value;
      renderSummaryByMode(mode, allExpenses);
    });

  chartTypeSelector.addEventListener("change", () => {
    db.collection("users")
      .doc(uid)
      .collection("expenses")
      .orderBy("timestamp", "desc")
      .get()
      .then((snapshot) => {
        const allExpenses = [];
        snapshot.forEach((doc) => allExpenses.push(doc.data()));
        updateChart(allExpenses);
      });
  });

  // View mode selector for monthly, daily, and yearly summaries
  viewModeSelector.addEventListener("change", (e) => {
    const mode = e.target.value;
    db.collection("users")
      .doc(uid)
      .collection("expenses")

      .orderBy("timestamp", "desc")
      .get()
      .then((snapshot) => {
        const allExpenses = [];
        snapshot.forEach((doc) => allExpenses.push(doc.data()));

        renderSummaryByMode(mode, allExpenses);
      });
  });

  // Update chart with expenses data
  function updateChart(expenses) {
    const categorySums = {};

    expenses.forEach(({ amount, category }) => {
      categorySums[category] = (categorySums[category] || 0) + amount;
    });

    const labels = Object.keys(categorySums);
    const data = Object.values(categorySums);
    const colors = labels.map(getColor);
    const chartType = chartTypeSelector.value;

    if (chartInstance !== null) {
      chartInstance.destroy();
    }

    const ctx = document.getElementById("expense-chart").getContext("2d");
    chartInstance = new Chart(ctx, {
      type: chartType,
      data: {
        labels,
        datasets: [
          {
            label: "Expenses by Category",
            data,
            backgroundColor: colors,
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: chartType === "pie" ? "bottom" : "top",
          },
        },
        scales:
          chartType === "bar"
            ? {
                y: {
                  beginAtZero: true,
                },
              }
            : {},
      },
    });
  }
});

// Check budget and update the budget bar
function checkBudget(expenses) {
  const total = expenses.reduce((acc, item) => acc + item.amount, 0);

  const fill = document.getElementById("budget-bar-fill");
  const statusText = document.getElementById("budget-status");

  if (BUDGET_LIMIT > 0) {
    const percent = Math.min((total / BUDGET_LIMIT) * 100, 100);
    fill.style.width = `${percent}%`;
    statusText.textContent = `Used: ₹${total} / ₹${BUDGET_LIMIT}`;
  } else {
    fill.style.width = `0%`;
    statusText.textContent = `Used: ₹${total} / ₹${0}`;
  }

  if (BUDGET_LIMIT > 0 && total > BUDGET_LIMIT) {
    showToast("⚠️ Budget Limit Exceeded!");
  }
}

//--------------------------------------- SUMMARY ---------------------------------------

// Get current month label for summary
function getCurrentMonthLabel(monthString) {
  const now = new Date();
  const current = now.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
  return monthString === current ? "This Month" : monthString;
}

// Get today's label for daily summary
function getTodayLabel(dateString) {
  const today = new Date().toISOString().split("T")[0];
  return dateString === today ? "Today" : dateString;
}

// Render summary chart for monthly expenses
function renderSummaryChart(labels, data, labelText) {
  const ctx = document.getElementById("summary-bar-chart")?.getContext("2d");
  if (!ctx) return;

  if (summaryChartInstance !== null) {
    summaryChartInstance.destroy();
  }

  summaryChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: labelText,
          data,
          backgroundColor: labels.map(getColor),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
      },
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

// Update monthly summary with expenses data
function updateMonthlySummary(expenses) {
  const monthlyTotals = {};

  expenses.forEach((exp) => {
    const timestamp = exp.timestamp.toDate();
    const month = timestamp.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
  });

  const summaryList = document.getElementById("summary-list");
  summaryList.innerHTML = "";

  for (const month in monthlyTotals) {
    const label = getCurrentMonthLabel(month);
    const li = document.createElement("li");
    li.textContent = `${label}: ₹${monthlyTotals[month].toFixed(2)}`;
    summaryList.appendChild(li);
  }
  // ✅ Update chart
  const labels = Object.keys(monthlyTotals).map(getCurrentMonthLabel);
  const data = Object.values(monthlyTotals);
  renderSummaryChart(labels, data, "Total Monthly Expenses");
}

// Update daily summary with expenses data
function updateDailySummary(expenses) {
  const dailyTotals = {};

  expenses.forEach((exp) => {
    const date = exp.timestamp.toDate().toISOString().split("T")[0];
    dailyTotals[date] = (dailyTotals[date] || 0) + exp.amount;
  });

  const summaryList = document.getElementById("summary-list");
  summaryList.innerHTML = "";

  for (const date in dailyTotals) {
    const label = getTodayLabel(date); // ✅ Replace date with “Today” if applicable
    const li = document.createElement("li");
    li.textContent = `${label}: ₹${dailyTotals[date].toFixed(2)}`;
    summaryList.appendChild(li);
  }

  // ✅ Update daily bar chart
  const labels = Object.keys(dailyTotals).map(getTodayLabel);
  const data = Object.values(dailyTotals);
  renderSummaryChart(labels, data, "Total Daily Expenses");
}

// Update yearly summary with expenses data
function updateYearlySummary(expenses) {
  const yearlyTotals = {};

  expenses.forEach((exp) => {
    const year = exp.timestamp.toDate().getFullYear();
    yearlyTotals[year] = (yearlyTotals[year] || 0) + exp.amount;
  });

  const summaryList = document.getElementById("summary-list");
  summaryList.innerHTML = "";

  for (const year in yearlyTotals) {
    const li = document.createElement("li");
    li.textContent = `${year}: ₹${yearlyTotals[year].toFixed(2)}`;
    summaryList.appendChild(li);
  }

  // Update yearly bar chart
  const labels = Object.keys(yearlyTotals);
  const data = Object.values(yearlyTotals);
  renderSummaryChart(labels, data, "Total Yearly Expenses");
}

function renderSummaryByMode(mode, expenses) {
  if (mode === "monthly") {
    updateMonthlySummary(expenses);
  } else if (mode === "daily") {
    updateDailySummary(expenses);
  } else if (mode === "yearly") {
    updateYearlySummary(expenses);
  }
}

// 🔔 Toast Notification
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
    toast.classList.add("hidden");
  }, 10000); // Toast duration: 10 seconds
}

document.getElementById("logout-btn")?.addEventListener("click", () => {
  firebase
    .auth()
    .signOut()
    .then(() => {
      sessionStorage.clear();
      window.location.href = "login.html";
    });
});
