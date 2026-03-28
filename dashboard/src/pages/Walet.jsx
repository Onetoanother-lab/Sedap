import React, { useState, useEffect } from 'react';
import { MoreVertical, ChevronRight, Info } from 'lucide-react';

const FinancialDashboard = () => {
  const [historyView, setHistoryView] = useState('Today');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const transactions = [
    {
      id: 1,
      name: 'Peterdraw',
      type: 'Online Shop',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      date: 'June 5, 2020, 08:22 AM',
      amount: '+$5,553',
      card: 'MasterCard 404',
      status: 'Pending',
      statusColor: 'bg-pink-100 text-pink-500',
      badgeIcon: '✓',
      badgeColor: 'bg-teal-500',
      paymentId: '#0012352',
      invoiceDate: 'April 29, 2020',
      dueDate: 'June 5, 2020',
      datePaid: 'June 4, 2020',
      note: 'Lorem ipsum dolor sit amet, consectetur'
    },
    {
      id: 2,
      name: 'Olivia Brownlee',
      type: 'Designer',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      date: 'June 4, 2020, 08:22 AM',
      amount: '+$5,553',
      card: 'MasterCard 404',
      status: 'Completed',
      statusColor: 'bg-emerald-500 text-white',
      badgeIcon: '✓',
      badgeColor: 'bg-teal-500',
      paymentId: '#0012352',
      invoiceDate: 'April 29, 2020',
      dueDate: 'June 5, 2020',
      datePaid: 'June 4, 2020',
      note: 'Lorem ipsum dolor sit amet, consectetur'
    },
    {
      id: 3,
      name: 'Angela Moss',
      type: 'Freelancer',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
      date: 'June 3, 2020, 08:22 AM',
      amount: '+$5,553',
      card: 'MasterCard 404',
      status: 'Canceled',
      statusColor: 'bg-gray-200 text-gray-600',
      badgeIcon: '✗',
      badgeColor: 'bg-red-500',
      paymentId: '#0012351',
      invoiceDate: 'April 28, 2020',
      dueDate: 'June 3, 2020',
      datePaid: 'N/A',
      note: 'Payment was canceled by user'
    },
    {
      id: 4,
      name: 'XYZ Store ID',
      type: 'Online Shop',
      avatar: 'https://randomuser.me/api/portraits/men/54.jpg',
      date: 'June 1, 2020, 08:22 AM',
      amount: '+$5,553',
      card: 'MasterCard 404',
      status: 'Completed',
      statusColor: 'bg-teal-100 text-teal-600',
      badgeIcon: '✓',
      badgeColor: 'bg-teal-500',
      paymentId: '#0012350',
      invoiceDate: 'April 27, 2020',
      dueDate: 'June 1, 2020',
      datePaid: 'June 1, 2020',
      note: 'Transaction completed successfully'
    }
  ];

  const invoices = [
    { id: 1, name: 'Stevan Store', avatar: 'https://randomuser.me/api/portraits/men/22.jpg', time: '4h ago', amount: '$562' },
    { id: 2, name: 'David Ignis', avatar: 'https://randomuser.me/api/portraits/men/46.jpg', time: '5h ago', amount: '$672' },
    { id: 3, name: 'Olivia Johan..', avatar: 'https://randomuser.me/api/portraits/women/33.jpg', time: '6h ago', amount: '$769' },
    { id: 4, name: 'Melanie Wong', avatar: 'https://randomuser.me/api/portraits/women/90.jpg', time: '8h ago', amount: '$45' },
    { id: 5, name: 'Roberto', avatar: 'https://randomuser.me/api/portraits/men/71.jpg', time: '10h ago', amount: '$776' }
  ];

  return (
    <div className="p-6">

      {/* Spinner */}
      {loading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className="loading loading-spinner text-success w-12"></span>
        </div>
      )}

      {/* Content */}
      <div
        style={{ opacity: loading ? 0 : 1, transition: "opacity 0.4s ease" }}
        className="max-w-[1800px] mx-auto"
      >
        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-7 space-y-5">
            <div className="bg-base-100 rounded-2xl shadow-sm p-7">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-slate-400 text-xs mb-2 font-medium">Main Balance</p>
                  <h2 className="text-4xl font-bold text-base-content">$673,412.66</h2>
                </div>
                <button className="text-gray-300 hover:text-gray-500">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-xs text-slate-400 mb-1 tracking-wide font-medium">VALID THRU</p>
                  <p className="font-semibold text-base-content text-sm">08/21</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1 tracking-wide font-medium">CARD HOLDER</p>
                  <p className="font-semibold text-base-content text-sm">Samantha Anderson</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sbase-content text-sm">**** **** **** 1234</p>
                </div>
              </div>

              <div className="h-1.5 bg-gradient-to-r from-teal-400 via-teal-200 to-gray-100 rounded-full"></div>
            </div>

            <div className="bg-base-100 rounded-2xl shadow-sm p-7">
              <h3 className="text-lg font-bold text-slate-400 mb-6">Earning Category</h3>

              <div className="grid grid-cols-2 gap-8">
                <div className="flex items-center gap-6">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      <span className="text-base-content text-sm font-medium w-16">Income</span>
                      <span className="font-bold text-base-content text-sm">30%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <span className="text-base-content text-sm font-medium w-16">Expense</span>
                      <span className="font-bold text-base-content text-sm">46%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      <span className="text-base-content text-sm font-medium w-16">Unknown</span>
                      <span className="font-bold text-base-content text-sm">10%</span>
                    </div>
                  </div>

                  <div className="relative w-44 h-44">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#e5e7eb" strokeWidth="28" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#10b981" strokeWidth="28" strokeDasharray="66 154" strokeDashoffset="0" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#f87171" strokeWidth="28" strokeDasharray="101 119" strokeDashoffset="-66" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="#d1d5db" strokeWidth="28" strokeDasharray="22 198" strokeDashoffset="-167" />
                    </svg>
                  </div>
                </div>

                <div className="pl-6 border-l border-gray-100">
                  <svg viewBox="0 0 420 130" className="w-full h-36">
                    <line x1="0" y1="110" x2="420" y2="110" stroke="#e5e7eb" strokeWidth="1" />
                    <path d="M 0,75 L 60,65 L 120,30 L 180,50 L 240,35 L 300,25 L 360,20 L 420,15" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 0,90 L 60,85 L 120,90 L 180,83 L 240,87 L 300,85 L 360,88 L 420,87" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 0,105 L 60,103 L 120,100 L 180,102 L 240,101 L 300,103 L 360,102 L 420,104" fill="none" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="180" cy="50" r="5" fill="#10b981" />
                    <line x1="180" y1="0" x2="180" y2="110" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
                  </svg>
                  <div className="flex justify-between mt-2 text-xs text-gray-400 font-medium">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span className="font-semibold text-gray-600">Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-base-100 rounded-2xl shadow-sm p-7">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-base-content mb-1">Payment History</h3>
                  <p className="text-xs text-gray-400">Lorem ipsum dolor sit amet, consectetur</p>
                </div>
                <div className="flex gap-5">
                  {['Monthly', 'Weekly', 'Today'].map((view) => (
                    <button
                      key={view}
                      onClick={() => setHistoryView(view)}
                      className={`pb-1.5 text-sm font-medium transition-colors ${historyView === view
                        ? 'text-teal-500 border-b-2 border-teal-500'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id}>
                    <div
                      className={`rounded-xl p-4 transition-all cursor-pointer ${selectedTransaction?.id === transaction.id
                        ? 'bg-indigo-600 shadow-lg'
                        : 'bg-base-100 transition-all duration-300 hover:bg-slate-400'
                        }`}
                      onClick={() => setSelectedTransaction(selectedTransaction?.id === transaction.id ? null : transaction)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3" style={{ width: '220px' }}>
                          <div className="relative">
                            <img src={transaction.avatar} alt={transaction.name} className="w-12 h-12 rounded-full object-cover" />
                            <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 ${transaction.badgeColor} rounded-full flex items-center justify-center text-base-content text-xs font-bold`}>
                              {transaction.badgeIcon}
                            </div>
                          </div>
                          <div>
                            <h4 className={`font-bold text-sm ${selectedTransaction?.id === transaction.id ? '' : 'text-base-content'}`}>
                              {transaction.name}
                            </h4>
                            <p className={`text-xs ${selectedTransaction?.id === transaction.id ? 'text-indigo-200' : 'text-gray-500'}`}>
                              {transaction.type}
                            </p>
                          </div>
                        </div>

                        <p className={`text-xs ${selectedTransaction?.id === transaction.id ? 'text-indigo-200' : 'text-gray-500'}`} style={{ width: '160px' }}>
                          {transaction.date}
                        </p>

                        <p className={`font-bold text-sm ${selectedTransaction?.id === transaction.id ? '' : 'text-base'}`} style={{ width: '80px' }}>
                          {transaction.amount}
                        </p>

                        <p className={`text-sm ${selectedTransaction?.id === transaction.id ? 'text-white' : 'text-gray-500'}`} style={{ width: '110px' }}>
                          {transaction.card}
                        </p>

                        <div className="flex items-center gap-2">
                          <span className={`px-5 py-1.5 rounded-lg text-xs font-semibold ${transaction.statusColor}`}>
                            {transaction.status}
                          </span>
                          <ChevronRight className={`w-4 h-4 ${selectedTransaction?.id === transaction.id ? 'text-white rotate-90' : 'text-gray-300'} transition-transform`} />
                        </div>
                      </div>

                      {selectedTransaction?.id === transaction.id && (
                        <div className="mt-5 pt-5 border-t border-indigo-500 grid grid-cols-5 gap-5 text-white">
                          <div>
                            <p className="text-xs text-indigo-200 mb-1.5">ID Payment</p>
                            <p className="font-bold text-sm">{transaction.paymentId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-indigo-200 mb-1.5">Payment Method</p>
                            <p className="font-bold text-sm">{transaction.card}</p>
                          </div>
                          <div>
                            <p className="text-xs text-indigo-200 mb-1.5">Invoice Date</p>
                            <p className="font-bold text-sm">{transaction.invoiceDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-indigo-200 mb-1.5">Due Date</p>
                            <p className="font-bold text-sm">{transaction.dueDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-indigo-200 mb-1.5">Date Paid</p>
                            <p className="font-bold text-sm">{transaction.datePaid}</p>
                          </div>
                          <div className="col-span-5 flex items-center gap-2 mt-2 bg-indigo-500 bg-opacity-30 rounded-lg p-3">
                            <Info className="w-4 h-4 flex-shrink-0" />
                            <p className="text-xs">{transaction.note}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-5 space-y-5">
            <div className="bg-slate-700 rounded-2xl shadow-lg p-7 text-white">
              <div className="flex justify-start items-start mb-6 relative">
                <div className="w-12 h-12 bg-white bg-opacity-10 rounded-full"></div>
                <div className="w-12 h-12 bg-white bg-opacity-15 rounded-full absolute"></div>
              </div>

              <h2 className="text-4xl font-bold mb-2">$824,571.93</h2>
              <p className="text-slate-300 text-sm mb-6 font-medium">Wallet Balance</p>

              <div className="flex items-center gap-1.5 mb-6 text-xs">
                <span className="text-teal-400 font-bold">+0.8%</span>
                <span className="text-slate-400">than last week</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="bg-white bg-opacity-5 backdrop-blur-sm text-white rounded-xl p-5 hover:bg-opacity-10 transition-all">
                  <div className="w-10 h-10 bg-red-400 bg-opacity-15 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">💳</span>
                  </div>
                  <p className="text-slate-500 font-bold text-xs">Top Up</p>
                </button>
                <button className="bg-white bg-opacity-5 backdrop-blur-sm text-white rounded-xl p-5 hover:bg-opacity-10 transition-all">
                  <div className="w-10 h-10 bg-teal-400 bg-opacity-15 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className="text-xs text-slate-500 font-bold">Withdraw</p>
                </button>
              </div>
            </div>

            <div className="bg-base-100 rounded-2xl shadow-sm p-7">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-base-content mb-1">Invoices Sent</h3>
                <p className="text-xs text-slate-400">Lorem ipsum dolor sit amet, consectetur</p>
              </div>

              <div className="space-y-3 mb-5">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-2.5 border-b-[0.5px] border-slate-500">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img src={invoice.avatar} alt={invoice.name} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-base-content text-sm">{invoice.name}</h4>
                        <p className="text-xs text-gray-400">{invoice.time}</p>
                      </div>
                    </div>
                    <p className="font-bold text-base-content text-sm flex-shrink-0 ml-2">{invoice.amount}</p>
                  </div>
                ))}
              </div>

              <button className="w-full py-3 border-2 border-teal-500 text-teal-600 rounded-xl font-semibold hover:bg-teal-50 transition-all text-sm">
                View More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialDashboard;