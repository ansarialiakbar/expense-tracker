import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';

const API_BASE = process.env.REACT_APP_API_BASE_URL;
console.log("API BASE:", API_BASE);

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Dashboard = ({ user }) => {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ amount: '', category: '', date: '', notes: '', receipt: null });
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [filter]);

  const fetchExpenses = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/expenses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setExpenses(data);
    } catch (err) {
      alert(err.response.data.message);
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();

  formData.append('amount', form.amount);
  formData.append('category', form.category);
  formData.append('date', form.date);
  formData.append('notes', form.notes);
  if (form.receipt) {
    formData.append('receipt', form.receipt);
  }

  try {
    await axios.post(`${API_BASE}/api/expenses`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    fetchExpenses();
    setForm({ amount: '', category: '', date: '', notes: '', receipt: null });
  } catch (err) {
    alert(err.response?.data?.message || 'Expense creation failed');
  }
};


  const handleStatusChange = async (id, status) => {
    try {
      await axios.put(`${API_BASE}/api/expenses/${id}`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      fetchExpenses();
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/expenses/export`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'expenses.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert(err.response?.data?.message || 'Export failed');
    }
  };

  const categoryData = {
    labels: [...new Set(expenses.map(exp => exp.category))],
    datasets: [{
      label: 'Total Expenses by Category',
      data: [...new Set(expenses.map(exp => exp.category))].map(cat =>
        expenses.filter(exp => exp.category === cat).reduce((sum, exp) => sum + exp.amount, 0)
      ),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }],
  };

  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Expenses Over Time',
      data: Array(12).fill(0).map((_, i) =>
        expenses.filter(exp => new Date(exp.date).getMonth() === i).reduce((sum, exp) => sum + exp.amount, 0)
      ),
      borderColor: 'rgba(75, 192, 192, 1)',
      fill: false,
    }],
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Expense Tracker</h1>
      {user.role === 'employee' && (
        <form onSubmit={handleSubmit} className="mb-8">
          <input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            className="p-2 border rounded mr-2"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="p-2 border rounded mr-2"
            required
          />
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="p-2 border rounded mr-2"
            required
          />
          <input
            type="text"
            placeholder="Notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="p-2 border rounded mr-2"
          />
          <input
            type="file"
            onChange={(e) => setForm({ ...form, receipt: e.target.files[0] })}
            className="p-2 border rounded mr-2"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">Add Expense</button>
        </form>
      )}
      {user.role === 'admin' && (
        <>
          <input
            type="text"
            placeholder="Filter by category"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded mb-4"
          />
          <button onClick={handleExport} className="bg-green-500 text-white p-2 rounded mb-4">
            Export to CSV
          </button>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <h2 className="text-xl mb-2">Expenses by Category</h2>
              <Bar data={categoryData} />
            </div>
            <div>
              <h2 className="text-xl mb-2">Expenses Over Time</h2>
              <Line data={monthlyData} />
            </div>
          </div>
        </>
      )}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Email</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Category</th>
            <th className="p-2">Date</th>
            <th className="p-2">Notes</th>
            <th className="p-2">Status</th>
            {user.role === 'admin' && <th className="p-2">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {expenses
            .filter(exp => !filter || exp.category.toLowerCase().includes(filter.toLowerCase()))
            .map(exp => (
              <tr key={exp._id} className="border-t">
                <td className="p-2">{exp.userId.email}</td>
                <td className="p-2">{exp.amount}</td>
                <td className="p-2">{exp.category}</td>
                <td className="p-2">{new Date(exp.date).toLocaleDateString()}</td>
                <td className="p-2">{exp.notes}</td>
                <td className="p-2">{exp.status}</td>
                {user.role === 'admin' && (
                  <td className="p-2">
                    <select
                      value={exp.status}
                      onChange={(e) => handleStatusChange(exp._id, e.target.value)}
                      className="p-1 border rounded"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                )}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
