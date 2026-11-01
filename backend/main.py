
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.database import get_connection, create_table

app = FastAPI(title="Student Expense Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.on_event("startup")
def startup():
    create_table()



class Expense(BaseModel):
    name: str = Field(min_length=1)
    amount: float = Field(gt=0)
    category: str = Field(min_length=1)
    date: str = Field(min_length=1)


class Income(BaseModel):
    source: str = Field(min_length=1)
    amount: float = Field(gt=0)
    date: str = Field(min_length=1)



@app.get("/")
def home():
    return {"message": "Welcome to Student Expense Tracker"}


# Add expense
@app.post("/expenses")
def add_expense(expense: Expense):
    connection = get_connection()

    cursor = connection.execute(
        """
        INSERT INTO expenses (name, amount, category, date)
        VALUES (?, ?, ?, ?)
        """,
        (expense.name, expense.amount, expense.category, expense.date)
    )

    connection.commit()
    expense_id = cursor.lastrowid
    connection.close()

    return {
        "message": "Expense added successfully",
        "id": expense_id
    }


# Get expenses
@app.get("/expenses")
def get_expenses():
    connection = get_connection()

    cursor = connection.execute(
        "SELECT * FROM expenses ORDER BY id DESC"
    )

    expenses = [dict(row) for row in cursor.fetchall()]

    connection.close()

    return expenses


# Delete expense
@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: int):
    connection = get_connection()

    cursor = connection.execute(
        "DELETE FROM expenses WHERE id = ?",
        (expense_id,)
    )

    connection.commit()
    deleted_count = cursor.rowcount
    connection.close()

    if deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Expense not found"
        )

    return {
        "message": "Expense deleted successfully"
    }


# Add income
@app.post("/income")
def add_income(income: Income):
    connection = get_connection()

    cursor = connection.execute(
        """
        INSERT INTO income (source, amount, date)
        VALUES (?, ?, ?)
        """,
        (income.source, income.amount, income.date)
    )

    connection.commit()
    income_id = cursor.lastrowid
    connection.close()

    return {
        "message": "Income added successfully",
        "id": income_id
    }


# Get income
@app.get("/income")
def get_income():
    connection = get_connection()

    cursor = connection.execute(
        "SELECT * FROM income ORDER BY id DESC"
    )

    incomes = [dict(row) for row in cursor.fetchall()]

    connection.close()

    return incomes


# Dashboard summary
@app.get("/summary")
def get_summary():
    connection = get_connection()

    expense_result = connection.execute(
        "SELECT SUM(amount) FROM expenses"
    ).fetchone()

    total_expenses = expense_result[0] or 0

    income_result = connection.execute(
        "SELECT SUM(amount) FROM income"
    ).fetchone()

    total_income = income_result[0] or 0

    balance = total_income - total_expenses

    connection.close()

    return {
        "total_income": total_income,
        "total_expenses": total_expenses,
        "balance": balance
    }


# Expense category summary
@app.get("/category-summary")
def get_category_summary():
    connection = get_connection()

    cursor = connection.execute(
        """
        SELECT category, SUM(amount) AS total
        FROM expenses
        GROUP BY category
        ORDER BY total DESC
        """
    )

    categories = [dict(row) for row in cursor.fetchall()]

    connection.close()

    return categories
