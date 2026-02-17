import React, { useEffect, useState } from "react";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  // Fetch users
  const fetchUsers = () => {
    fetch("http://localhost:8080/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Add user
  const addUser = () => {
    fetch("http://localhost:8080/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fullName: fullName,
        email: email,
        passwordHash: "123456"
      })
    })
      .then(res => res.json())
      .then(() => {
        setFullName("");
        setEmail("");
        fetchUsers();
      });
  };

  // Delete user
  const deleteUser = (id) => {
    fetch(`http://localhost:8080/users/${id}`, {
      method: "DELETE"
    }).then(() => fetchUsers());
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Users</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={addUser}>Add User</button>
      </div>

      {users.map(user => (
        <div key={user.userId} style={{ marginBottom: "10px" }}>
          <strong>{user.fullName}</strong> - {user.email}
          <button
            style={{ marginLeft: "10px" }}
            onClick={() => deleteUser(user.userId)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default UsersPage;
