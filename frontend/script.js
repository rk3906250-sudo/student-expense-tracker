
const API_URL = "http://127.0.0.1:8000";

const expenseForm = document.getElementById("expenseForm");
const incomeForm = document.getElementById("incomeForm");

const expenseList = document.getElementById("expenseList");
const incomeList = document.getElementById("incomeList");
const categoryList = document.getElementById("categoryList");
const expenseSearch = document.getElementById("expenseSearch");

let expenseChart = null;

// Load dashboard summary
async function loadSummary() {
    try {
        const response = await fetch(`${API_URL}/summary`);
        const summary = await response.json();

        document.getElementById("totalIncome").textContent =
            `₹${summary.total_income}`;

        document.getElementById("totalExpenses").textContent =
            `₹${summary.total_expenses}`;

        document.getElementById("balance").textContent =
            `₹${summary.balance}`;
    } catch (error) {
        console.error("Could not load summary:", error);
    }
}

// Load expense history
async function loadExpenses() {
    try {
        const response = await fetch(`${API_URL}/expenses`);
        const expenses = await response.json();

        expenseList.replaceChildren();

    const searchText = expenseSearch.value.toLowerCase();

const filteredExpenses = expenses.filter((expense) => {
    return (
        expense.name.toLowerCase().includes(searchText) ||
        expense.category.toLowerCase().includes(searchText)
    );
});

filteredExpenses.forEach((expense) => {
            const row = document.createElement("tr");

            const nameCell = document.createElement("td");
            nameCell.textContent = expense.name;

            const categoryCell = document.createElement("td");
            categoryCell.textContent = expense.category;

            const amountCell = document.createElement("td");
            amountCell.textContent = `₹${expense.amount}`;

            const dateCell = document.createElement("td");
            dateCell.textContent = expense.date;

            // Create Delete button
            const actionCell = document.createElement("td");

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.type = "button";
            deleteButton.className = "delete-btn";

            deleteButton.addEventListener("click", async () => {
                const confirmDelete = confirm(
                    `Are you sure you want to delete "${expense.name}"?`
                );

                if (!confirmDelete) {
                    return;
                }

                try {
                    const response = await fetch(
                        `${API_URL}/expenses/${expense.id}`,
                        {
                            method: "DELETE"
                        }
                    );

                    if (!response.ok) {
                        alert("Could not delete expense.");
                        return;
                    }

                    await loadExpenses();
                    await loadSummary();
                    await loadCategorySummary();

                    alert("Expense deleted successfully!");

                } catch (error) {
                    alert("Could not connect to the backend.");
                    console.error(error);
                }
            });

            actionCell.appendChild(deleteButton);

            row.append(
                nameCell,
                categoryCell,
                amountCell,
                dateCell,
                actionCell
            );

            expenseList.appendChild(row);
        });

    } catch (error) {
        console.error("Could not load expenses:", error);
    }
}

// Load income history
async function loadIncome() {
    try {
        const response = await fetch(`${API_URL}/income`);
        const incomes = await response.json();

        incomeList.replaceChildren();

        incomes.forEach((income) => {
            const row = document.createElement("tr");

            const sourceCell = document.createElement("td");
            sourceCell.textContent = income.source;

            const amountCell = document.createElement("td");
            amountCell.textContent = `₹${income.amount}`;

            const dateCell = document.createElement("td");
            dateCell.textContent = income.date;

            row.append(
                sourceCell,
                amountCell,
                dateCell
            );

            incomeList.appendChild(row);
        });

    } catch (error) {
        console.error("Could not load income:", error);
    }
}

// Load category summary and draw chart
async function loadCategorySummary() {
    try {
        const response = await fetch(`${API_URL}/category-summary`);
        const categories = await response.json();

        categoryList.replaceChildren();

        categories.forEach((category) => {
            const row = document.createElement("tr");

            const categoryCell = document.createElement("td");
            categoryCell.textContent = category.category;

            const totalCell = document.createElement("td");
            totalCell.textContent = `₹${category.total}`;

            row.append(categoryCell, totalCell);

            categoryList.appendChild(row);
        });

        createExpenseChart(categories);

    } catch (error) {
        console.error("Could not load category summary:", error);
    }
}

// Create pie chart
function createExpenseChart(categories) {
    const chartCanvas = document.getElementById("expenseChart");

    if (expenseChart !== null) {
        expenseChart.destroy();
    }

    if (categories.length === 0) {
        return;
    }

    expenseChart = new Chart(chartCanvas, {
        type: "pie",

        data: {
            labels: categories.map((item) => item.category),

            datasets: [{
                label: "Expenses",
                data: categories.map((item) => item.total)
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    position: "bottom"
                },

                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ₹${context.raw}`;
                        }
                    }
                }
            }
        }
    });
}

// Add expense
expenseForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const expense = {
        name: document.getElementById("name").value,
        amount: Number(document.getElementById("amount").value),
        category: document.getElementById("category").value,
        date: document.getElementById("date").value
    };

    try {
        const response = await fetch(`${API_URL}/expenses`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expense)
        });

        if (!response.ok) {
            alert("Could not add expense.");
            return;
        }

        expenseForm.reset();

        await loadExpenses();
        await loadSummary();
        await loadCategorySummary();

        alert("Expense added successfully!");

    } catch (error) {
        alert("Could not connect to the backend.");
        console.error(error);
    }
});

// Add income
incomeForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const income = {
        source: document.getElementById("incomeSource").value,
        amount: Number(document.getElementById("incomeAmount").value),
        date: document.getElementById("incomeDate").value
    };

    try {
        const response = await fetch(`${API_URL}/income`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(income)
        });

        if (!response.ok) {
            alert("Could not add income.");
            return;
        }

        incomeForm.reset();

        await loadIncome();
        await loadSummary();

        alert("Income added successfully!");

    } catch (error) {
        alert("Could not connect to the backend.");
        console.error(error);
    }
});

// Load all data when the website opens
// Search expenses while typing
expenseSearch.addEventListener("input", loadExpenses);

// Load all data when the website opens
loadExpenses();
loadIncome();
loadSummary();
loadCategorySummary();
