import React, { useEffect, useState } from "react";

function ExpensesPage() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [userId, setUserId] = useState("");
  const [total, setTotal] = useState(0);

  const fetchExpenses = () => {
    fetch("http://localhost:8080/expenses")
      .then(res => res.json())
      .then(data => setExpenses(data));
  };

  const fetchTotal = () => {
    if (!userId) return;
    fetch(`http://localhost:8080/expenses/total/${userId}`)
      .then(res => res.json())
      .then(data => setTotal(data));
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const addExpense = () => {
    fetch("http://localhost:8080/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amount,
        description: description,
        expenseDate: "2026-02-15",
        user: { userId: userId },
        category: { categoryId: 1 }
      })
    })
      .then(res => res.json())
      .then(() => {
        setAmount("");
        setDescription("");
        fetchExpenses();
        fetchTotal();
      });
  };

  const deleteExpense = (id) => {
    fetch(`http://localhost:8080/expenses/${id}`, {
      method: "DELETE"
    }).then(() => fetchExpenses());
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Expenses</h2>

      <div>
        <input
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={addExpense}>Add Expense</button>
      </div>

      <h3>Total: {total}</h3>

      {expenses.map(exp => (
        <div key={exp.expenseId}>
          {exp.description} - ₹{exp.amount}
          <button onClick={() => deleteExpense(exp.expenseId)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default ExpensesPage;
