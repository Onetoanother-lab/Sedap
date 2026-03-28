import React, { useState, useEffect } from 'react';
import { MoreVertical, ChevronRight, Info } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || "https://sedap-nnap.onrender.com/api";

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'bg-success/20 text-success';
    case 'Canceled':  return 'bg-base-300 text-base-content/60';
    case 'Pending':
    default:          return 'bg-warning/20 text-warning';
  }
};

const getBadgeIcon = (status) => {
  switch (status) {
    case 'Completed': return '✓';
    case 'Canceled':  return '✗';
    case 'Pending':
    default:          return '○';
  }
};

const getBadgeColor = (status) => {
  switch (status) {
    case 'Completed': return 'bg-success';
    case 'Canceled':  return 'bg-error';
    case 'Pending':
    default:          return 'bg-warning';
  }
};

const formatAmount = (amount) => {
  if (amount == null) return '$0';
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return amount >= 0 ? `+$${formatted}` : `-$${formatted}`;
};

const formatBalance = (amount) => {
  if (amount == null) return '$0.00';
  return '$' + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffH < 1) return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const FinancialDashboard = () => {
  const [historyView, setHistoryView] = useState('Today');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    let timerDone = false;
    let dataLoaded = false;

    const tryFinish = () => {
      if (timerDone && dataLoaded) setLoading(false);
    };

    const timer = setTimeout(() => {
      timerDone = true;
      tryFinish();
    }, 1000);

    fetch(`${API}/transactions`)
      .then((res) => res.ok ? res.json() : Promise.reject(res.status))
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setTransactions(arr);
      })
      .catch(() => {
        setTransactions([]);
      })
      .finally(() => {
        dataLoaded = true;
        tryFinish();
      });

    return () => clearTimeout(timer);
  }, []);

  // Derived balances
  const mainBalance = transactions
    .filter((t) => t.status === 'Completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const walletBalance = transactions
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Earning category percentages
  const total = transactions.length || 1;
  const completedCount = transactions.filter((t) => t.status === 'Completed').length;
  const canceledCount  = transactions.filter((t) => t.status === 'Canceled').length;
  const pendingCount   = transactions.filter((t) => t.status === 'Pending').length;

  const incomePercent  = Math.round((completedCount / total) * 100);
  const expensePercent = Math.round((canceledCount  / total) * 100);
  const unknownPercent = Math.round((pendingCount   / total) * 100);

  // Donut chart circumference for r=35 → 2π×35 ≈ 220
  const circ = 220;
  const incomeDash  = (incomePercent  / 100) * circ;
  const expenseDash = (expensePercent / 100) * circ;
  const unknownDash = (unknownPercent / 100) * circ;

  // Invoices: same transactions data displayed as invoices
  const invoices = transactions.slice(0, 5);

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
                  <p className="text-base-content/50 text-xs mb-2 font-medium">Main Balance</p>
                  <h2 className="text-4xl font-bold text-base-content">{formatBalance(mainBalance)}</h2>
                </div>
                <button className="text-base-content/30 hover:text-base-content/60">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <p className="text-xs text-base-content/50 mb-1 tracking-wide font-medium">VALID THRU</p>
                  <p className="font-semibold text-base-content text-sm">08/21</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/50 mb-1 tracking-wide font-medium">CARD HOLDER</p>
                  <p className="font-semibold text-base-content text-sm">Samantha Anderson</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sbase-content text-sm">**** **** **** 1234</p>
                </div>
              </div>

              <div className="h-1.5 bg-gradient-to-r from-success via-success/40 to-base-200 rounded-full"></div>
            </div>

            <div className="bg-base-100 rounded-2xl shadow-sm p-7">
              <h3 className="text-lg font-bold text-base-content/50 mb-6">Earning Category</h3>

              <div className="grid grid-cols-2 gap-8">
                <div className="flex items-center gap-6">
                  <div className="space-y-5">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-success"></div>
                      <span className="text-base-content text-sm font-medium w-16">Income</span>
                      <span className="font-bold text-base-content text-sm">{incomePercent}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-error"></div>
                      <span className="text-base-content text-sm font-medium w-16">Expense</span>
                      <span className="font-bold text-base-content text-sm">{expensePercent}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-base-300"></div>
                      <span className="text-base-content text-sm font-medium w-16">Unknown</span>
                      <span className="font-bold text-base-content text-sm">{unknownPercent}%</span>
                    </div>
                  </div>

                  <div className="relative w-44 h-44">
                    <svg viewBox="0 0 100 100" className="transform -rotate-90">
                      <circle cx="50" cy="50" r="35" fill="none" stroke="oklch(var(--b2))" strokeWidth="28" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="oklch(var(--su))" strokeWidth="28"
                        strokeDasharray={`${incomeDash} ${circ - incomeDash}`}
                        strokeDashoffset="0" />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="oklch(var(--er))" strokeWidth="28"
                        strokeDasharray={`${expenseDash} ${circ - expenseDash}`}
                        strokeDashoffset={`-${incomeDash}`} />
                      <circle cx="50" cy="50" r="35" fill="none" stroke="oklch(var(--b3))" strokeWidth="28"
                        strokeDasharray={`${unknownDash} ${circ - unknownDash}`}
                        strokeDashoffset={`-${incomeDash + expenseDash}`} />
                    </svg>
                  </div>
                </div>

                <div className="pl-6 border-l border-base-200">
                  <svg viewBox="0 0 420 130" className="w-full h-36">
                    <line x1="0" y1="110" x2="420" y2="110" stroke="oklch(var(--b2))" strokeWidth="1" />
                    <path d="M 0,75 L 60,65 L 120,30 L 180,50 L 240,35 L 300,25 L 360,20 L 420,15" fill="none" stroke="oklch(var(--su))" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 0,90 L 60,85 L 120,90 L 180,83 L 240,87 L 300,85 L 360,88 L 420,87" fill="none" stroke="oklch(var(--er))" strokeWidth="2.5" strokeLinecap="round" />
                    <path d="M 0,105 L 60,103 L 120,100 L 180,102 L 240,101 L 300,103 L 360,102 L 420,104" fill="none" stroke="oklch(var(--b3))" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="180" cy="50" r="5" fill="oklch(var(--su))" />
                    <line x1="180" y1="0" x2="180" y2="110" stroke="oklch(var(--b2))" strokeWidth="1" strokeDasharray="3 3" />
                  </svg>
                  <div className="flex justify-between mt-2 text-xs text-base-content/40 font-medium">
                    <span>Sun</span>
                    <span>Mon</span>
                    <span className="font-semibold text-base-content/70">Tue</span>
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
                  <p className="text-xs text-base-content/40">Lorem ipsum dolor sit amet, consectetur</p>
                </div>
                <div className="flex gap-5">
                  {['Monthly', 'Weekly', 'Today'].map((view) => (
                    <button
                      key={view}
                      onClick={() => setHistoryView(view)}
                      className={`pb-1.5 text-sm font-medium transition-colors ${historyView === view
                        ? 'text-success border-b-2 border-success'
                        : 'text-base-content/40 hover:text-base-content/70'
                        }`}
                    >
                      {view}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {transactions.length === 0 ? (
                  <p className="text-center text-base-content/40 text-sm py-8">No transactions found.</p>
                ) : (
                  transactions.map((transaction) => (
                    <div key={transaction.id}>
                      <div
                        className={`rounded-xl p-4 transition-all cursor-pointer ${selectedTransaction?.id === transaction.id
                          ? 'bg-primary shadow-lg'
                          : 'bg-base-100 transition-all duration-300 hover:bg-base-300'
                          }`}
                        onClick={() => setSelectedTransaction(selectedTransaction?.id === transaction.id ? null : transaction)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 w-56">
                            <div className="relative">
                              <img src={transaction.avatar} alt={transaction.name} className="w-12 h-12 rounded-full object-cover" />
                              <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 ${getBadgeColor(transaction.status)} rounded-full flex items-center justify-center text-base-content text-xs font-bold`}>
                                {getBadgeIcon(transaction.status)}
                              </div>
                            </div>
                            <div>
                              <h4 className={`font-bold text-sm ${selectedTransaction?.id === transaction.id ? '' : 'text-base-content'}`}>
                                {transaction.name}
                              </h4>
                              <p className={`text-xs ${selectedTransaction?.id === transaction.id ? 'text-primary-content/70' : 'text-base-content/60'}`}>
                                {transaction.type}
                              </p>
                            </div>
                          </div>

                          <p className={`text-xs w-40 ${selectedTransaction?.id === transaction.id ? 'text-primary-content/70' : 'text-base-content/60'}`}>
                            {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </p>

                          <p className={`font-bold text-sm w-20 ${selectedTransaction?.id === transaction.id ? '' : 'text-base'}`}>
                            {formatAmount(transaction.amount)}
                          </p>

                          <p className={`text-sm w-28 ${selectedTransaction?.id === transaction.id ? 'text-white' : 'text-base-content/60'}`}>
                            {transaction.card}
                          </p>

                          <div className="flex items-center gap-2">
                            <span className={`px-5 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                            <ChevronRight className={`w-4 h-4 ${selectedTransaction?.id === transaction.id ? 'text-white rotate-90' : 'text-base-content/30'} transition-transform`} />
                          </div>
                        </div>

                        {selectedTransaction?.id === transaction.id && (
                          <div className="mt-5 pt-5 border-t border-primary/50 grid grid-cols-5 gap-5 text-white">
                            <div>
                              <p className="text-xs text-primary-content/70 mb-1.5">ID Payment</p>
                              <p className="font-bold text-sm">{transaction.paymentId}</p>
                            </div>
                            <div>
                              <p className="text-xs text-primary-content/70 mb-1.5">Payment Method</p>
                              <p className="font-bold text-sm">{transaction.card}</p>
                            </div>
                            <div>
                              <p className="text-xs text-primary-content/70 mb-1.5">Invoice Date</p>
                              <p className="font-bold text-sm">{formatDate(transaction.invoiceDate)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-primary-content/70 mb-1.5">Due Date</p>
                              <p className="font-bold text-sm">{formatDate(transaction.dueDate)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-primary-content/70 mb-1.5">Date Paid</p>
                              <p className="font-bold text-sm">{formatDate(transaction.datePaid)}</p>
                            </div>
                            <div className="col-span-5 flex items-center gap-2 mt-2 bg-primary/30 rounded-lg p-3">
                              <Info className="w-4 h-4 flex-shrink-0" />
                              <p className="text-xs">{transaction.note}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="col-span-5 space-y-5">
            <div className="bg-neutral rounded-2xl shadow-lg p-7 text-white">
              <div className="flex justify-start items-start mb-6 relative">
                <div className="w-12 h-12 bg-base-100/10 rounded-full"></div>
                <div className="w-12 h-12 bg-base-100/15 rounded-full absolute"></div>
              </div>

              <h2 className="text-4xl font-bold mb-2">{formatBalance(walletBalance)}</h2>
              <p className="text-neutral-content/70 text-sm mb-6 font-medium">Wallet Balance</p>

              <div className="flex items-center gap-1.5 mb-6 text-xs">
                <span className="text-success font-bold">+0.8%</span>
                <span className="text-base-content/50">than last week</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="bg-base-100/5 backdrop-blur-sm text-white rounded-xl p-5 hover:bg-base-100/10 transition-all">
                  <div className="w-10 h-10 bg-error/15 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">💳</span>
                  </div>
                  <p className="text-base-content/40 font-bold text-xs">Top Up</p>
                </button>
                <button className="bg-base-100/5 backdrop-blur-sm text-white rounded-xl p-5 hover:bg-base-100/10 transition-all">
                  <div className="w-10 h-10 bg-success/15 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className="text-xs text-base-content/40 font-bold">Withdraw</p>
                </button>
              </div>
            </div>

            <div className="bg-base-100 rounded-2xl shadow-sm p-7">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-base-content mb-1">Invoices Sent</h3>
                <p className="text-xs text-base-content/50">Lorem ipsum dolor sit amet, consectetur</p>
              </div>

              <div className="space-y-3 mb-5">
                {invoices.length === 0 ? (
                  <p className="text-center text-base-content/40 text-sm py-4">No invoices found.</p>
                ) : (
                  invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-2.5 border-b-[0.5px] border-base-300">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <img src={invoice.avatar} alt={invoice.name} className="w-11 h-11 rounded-full object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-base-content text-sm truncate">{invoice.name}</h4>
                          <p className="text-xs text-base-content/40">{timeAgo(invoice.createdAt)}</p>
                        </div>
                      </div>
                      <p className="font-bold text-base-content text-sm flex-shrink-0 ml-2">
                        ${Math.abs(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <button className="w-full py-3 border-2 border-success text-success rounded-xl font-semibold hover:bg-success/10 transition-all text-sm">
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
