# Student Expense Tracker

A web-based application designed to help students manage their income and expenses, monitor their balance, and understand their spending habits.

## Features

- Add and manage income.
- Add and delete expenses.
- View income and expense history.
- Automatically calculate total income, expenses, and remaining balance.
- View category-wise expense summaries.
- Visualize expenses using a pie chart.
- Search expenses by name or category.
- Input validation to prevent invalid amounts.

## Technologies Used

**Frontend**
- HTML
- CSS
- JavaScript
- Chart.js

**Backend**
- Python
- FastAPI
- SQLite

## Project Structure

```text
StudentExpenseTracker/
├── backend/
│   ├── main.py
│   └── database.py
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── requirements.txt
├── README.md
└── .gitignore
```

## How to Run

1. Clone the repository.
2. Install the required dependencies:

```bash
pip install -r requirements.txt
```

3. Start the backend:

```bash
uvicorn backend.main:app --reload
```

4. Open `frontend/index.html` using VS Code Live Server.

5. Start managing your income and expenses!

## Future Improvements

- Monthly expense reports.
- User authentication.
- Budget planning.
- Expense editing.

## Author

Student Developer