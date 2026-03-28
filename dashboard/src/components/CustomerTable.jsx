import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function CustomerTable() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState(null);

    useEffect(() => {
        api.get('/customers')
            .then(({ data }) => setCustomers(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <span className="loading loading-spinner text-success w-12" />
        </div>
    );

    if (error) return (
        <div className="text-center text-error p-8">
            <p className="font-semibold">Could not load customers</p>
            <p className="text-sm opacity-70 mt-1">{error}</p>
        </div>
    );

    return (
        <div className="overflow-hidden rounded-xl bg-base-100 shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-primary">
                        <tr>
                            {['Customer ID', 'Join Date', 'Customer Name', 'Location', 'Total Spent', 'Last Order', 'Actions'].map(h => (
                                <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-base-content">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((c) => (
                            <tr key={c._id || c.id} className="hover:bg-base-300 transition-colors">
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className="font-semibold text-slate-500">#{c.id}</span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-slate-500">{c.joinDate}</td>
                                <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-500">{c.name}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-slate-500">{c.location}</td>
                                <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-500">{c.totalSpent}</td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <span className="inline-flex items-center rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-success ring-1 ring-inset ring-green-600/20">
                                        {c.lastOrder}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <div className="flex gap-3">
                                        <button className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors">
                                            View Detail
                                        </button>
                                        <button className="rounded-md bg-error px-3 py-1.5 text-xs font-medium text-white hover:bg-orange-700 transition-colors">
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
                <div className="py-16 text-center text-gray-500">No customers found in database</div>
            )}
        </div>
    );
}
