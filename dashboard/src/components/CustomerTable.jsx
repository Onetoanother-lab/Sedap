
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'https://sedap-nnap.onrender.com/api';

export default function CustomerTable() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/customers`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch customers');
        return res.json();
      })
      .then((data) => {
        setCustomers(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner text-success w-12"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-error p-8">
        Error: {error}
        <br />
        <small>serverri main branchtan pull qlib yoqin </small>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-base-100 shadow-sm ">
      <div className="overflow-x-auto ">
        
        <table className="min-w-full">
          <thead className="bg-primary">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-base-content">
                Customer ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-base-content">
                Join Date
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-base-content">
                Customer Name
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-base-content">
                Location
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-base-content">
                Total Spent
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-base-content">
                Last Order
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-base-content">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-base-300 transition-colors"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="font-semibold text-base-content/60">
                    #{customer.id}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-base-content/60">
                  {customer.joinDate ? new Date(customer.joinDate).toLocaleDateString() : '—'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-medium text-base-content/60">
                  {customer.name}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-base-content/60">
                  {customer.location}
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-bold text-base-content/60">
                  ${typeof customer.totalSpent === 'number' ? customer.totalSpent.toFixed(2) : customer.totalSpent}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="inline-flex items-center rounded-full bg-success/10 px-3 py-1 text-sm font-medium text-success ring-1 ring-inset ring-success/20">
                    {customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : '—'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/customersDetail?id=${customer.id}`)}
                      className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-focus transition-colors"
                    >
                      View Detail
                    </button>
                    <button className="rounded-md bg-error px-3 py-1.5 text-xs font-medium text-white hover:bg-warning-focus transition-colors">
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {customers.length === 0 && (
        <div className="py-16 text-center text-base-content/60">
          No customers found in database
        </div>
      )}
    </div>
  );
}