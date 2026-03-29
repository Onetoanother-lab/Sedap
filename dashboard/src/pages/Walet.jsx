import React, { useState, useEffect, useMemo } from 'react';
import { MoreVertical, ChevronRight, Info } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || "https://sedap-nnap.onrender.com/api";

// ─── Formatters ───────────────────────────────────────────────────────────────

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed': return 'bg-success/20 text-success';
    case 'Canceled':  return 'bg-base-300 text-base-content/60';
    default:          return 'bg-warning/20 text-warning';
  }
};

const getBadgeIcon = (status) => {
  switch (status) {
    case 'Completed': return '✓';
    case 'Canceled':  return '✗';
    default:          return '○';
  }
};

const getBadgeColor = (status) => {
  switch (status) {
    case 'Completed': return 'bg-success';
    case 'Canceled':  return 'bg-error';
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
  const diffH = Math.floor((Date.now() - new Date(dateStr)) / (1000 * 60 * 60));
  if (diffH < 1)  return 'Just now';
  if (diffH < 24) return `${diffH}h ago`;
  return `${Math.floor(diffH / 24)}d ago`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// ─── Chart helpers ────────────────────────────────────────────────────────────

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// SVG chart dimensions — must match the viewBox="0 0 420 130"
const CHART_W      = 420;
const CHART_BOTTOM = 110; // axis line Y
const CHART_TOP    = 10;  // top padding
const CHART_H      = CHART_BOTTOM - CHART_TOP; // 100px usable height

const xPos = (i) => Math.round((i / 6) * CHART_W); // 7 points across full width
const toY  = (val, maxVal) =>
  maxVal === 0 ? CHART_BOTTOM : CHART_BOTTOM - (val / maxVal) * CHART_H;

/**
 * Build the three SVG path strings and the peak-income dot position
 * from the raw transactions array, grouped by day of week.
 */
function buildChartData(transactions) {
  const byDay = Array.from({ length: 7 }, () => ({ income: 0, expense: 0, unknown: 0 }));

  for (const t of transactions) {
    if (!t.createdAt) continue;
    const day    = new Date(t.createdAt).getDay();
    const amount = Math.abs(t.amount || 0);
    if      (t.status === 'Completed') byDay[day].income  += amount;
    else if (t.status === 'Canceled')  byDay[day].expense += amount;
    else                               byDay[day].unknown += amount;
  }

  const maxVal = Math.max(
    ...byDay.map((d) => Math.max(d.income, d.expense, d.unknown)),
    1 // avoid ÷0 when no data
  );

  const buildPath = (key) =>
    byDay.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)},${toY(d[key], maxVal)}`).join(' ');

  // Place the highlight dot on the day with the highest income
  const peakIdx = byDay.reduce((best, d, i) => (d.income > byDay[best].income ? i : best), 0);

  return {
    incomePath:  buildPath('income'),
    expensePath: buildPath('expense'),
    unknownPath: buildPath('unknown'),
    peakX: xPos(peakIdx),
    peakY: toY(byDay[peakIdx].income, maxVal),
    hasData: maxVal > 1,
  };
}

/**
 * Compare last-7-days completed total vs the 7 days before that.
 * Returns a label string and a boolean (positive / negative / null for no data).
 */
function buildWeekChange(transactions) {
  const now            = Date.now();
  const sevenDaysMs    = 7 * 24 * 60 * 60 * 1000;
  const cutoffThisWeek = now - sevenDaysMs;
  const cutoffLastWeek = now - 2 * sevenDaysMs;

  const thisWeek = transactions
    .filter((t) => t.status === 'Completed' && t.createdAt && new Date(t.createdAt).getTime() >= cutoffThisWeek)
    .reduce((s, t) => s + (t.amount || 0), 0);

  const lastWeek = transactions
    .filter((t) => t.status === 'Completed' && t.createdAt && new Date(t.createdAt).getTime() >= cutoffLastWeek && new Date(t.createdAt).getTime() < cutoffThisWeek)
    .reduce((s, t) => s + (t.amount || 0), 0);

  if (lastWeek === 0 && thisWeek === 0) return { label: 'No recent activity', positive: null };
  if (lastWeek === 0)                   return { label: 'New activity this week', positive: true };

  const pct = ((thisWeek - lastWeek) / lastWeek) * 100;
  return {
    label:    `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% than last week`,
    positive: pct >= 0,
  };
}

/**
 * Extract the last-4 card digits from the first completed transaction's
 * card field, e.g. "MasterCard 4041" → "4041".
 */
function extractCardLast4(transactions) {
  const completed = transactions.find((t) => t.status === 'Completed' && t.card);
  if (!completed?.card) return '••••';
  const match = completed.card.match(/\d+/);
  return match ? match[0] : '••••';
}

/**
 * Compute a card expiry date as current month + 2 years → "MM/YY".
 */
function computeValidThru() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${yy}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

const FinancialDashboard = () => {
  const [historyView, setHistoryView]       = useState('Today');
  const [selectedTransaction, setSelected] = useState(null);
  const [loading, setLoading]               = useState(true);
  const [transactions, setTransactions]     = useState([]);
  const [txModal, setTxModal]               = useState(null);
  const [txForm, setTxForm]                 = useState({ name: '', amount: '', note: '' });
  const [txSaving, setTxSaving]             = useState(false);

  useEffect(() => {
    let timerDone = false;
    let dataLoaded = false;
    const tryFinish = () => { if (timerDone && dataLoaded) setLoading(false); };
    const timer = setTimeout(() => { timerDone = true; tryFinish(); }, 1000);

    fetch(`${API}/transactions`)
      .then((res) => res.ok ? res.json() : Promise.reject(res.status))
      .then((data) => { setTransactions(Array.isArray(data) ? data : []); })
      .catch(() => { setTransactions([]); })
      .finally(() => { dataLoaded = true; tryFinish(); });

    return () => clearTimeout(timer);
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────

  const mainBalance = useMemo(
    () => transactions.filter((t) => t.status === 'Completed').reduce((s, t) => s + (t.amount || 0), 0),
    [transactions]
  );

  const walletBalance = useMemo(
    () => transactions.reduce((s, t) => s + (t.amount || 0), 0),
    [transactions]
  );

  // Donut chart percentages
  const { incomePercent, expensePercent, unknownPercent } = useMemo(() => {
    const total         = transactions.length || 1;
    const completedCount = transactions.filter((t) => t.status === 'Completed').length;
    const canceledCount  = transactions.filter((t) => t.status === 'Canceled').length;
    const pendingCount   = transactions.filter((t) => t.status === 'Pending').length;
    return {
      incomePercent:  Math.round((completedCount / total) * 100),
      expensePercent: Math.round((canceledCount  / total) * 100),
      unknownPercent: Math.round((pendingCount   / total) * 100),
    };
  }, [transactions]);

  // Donut SVG (circumference for r=35 ≈ 220)
  const circ = 220;
  const incomeDash  = (incomePercent  / 100) * circ;
  const expenseDash = (expensePercent / 100) * circ;
  const unknownDash = (unknownPercent / 100) * circ;

  // Real card holder name
  const cardHolder = transactions.find((t) => t.status === 'Completed')?.name || 'Card Holder';

  // ── New: real computed values replacing all hardcoded strings ──────────────

  /** "±X.X% than last week"  or  "No recent activity" */
  const weekChange = useMemo(() => buildWeekChange(transactions), [transactions]);

  /** Last-4 digits of first completed transaction's card, e.g. "4041" */
  const cardLast4  = useMemo(() => extractCardLast4(transactions), [transactions]);

  /** Card expiry: current date + 2 years, "MM/YY" */
  const validThru  = useMemo(() => computeValidThru(), []);

  /** SVG chart data derived from real transactions grouped by day of week */
  const chartData  = useMemo(() => buildChartData(transactions), [transactions]);

  /** Highlight today's label in the day-of-week row */
  const todayIndex = useMemo(() => new Date().getDay(), []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const saveTx = async () => {
    if (!txForm.name || !txForm.amount) return;
    setTxSaving(true);
    try {
      const amount = txModal === 'withdraw'
        ? -Math.abs(Number(txForm.amount))
        :  Math.abs(Number(txForm.amount));
      const res = await fetch(`${API}/transactions`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          id:       crypto.randomUUID(),
          name:     txForm.name,
          type:     txModal === 'withdraw' ? 'expense' : 'income',
          amount,
          status:   'Completed',
          note:     txForm.note,
          datePaid: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error();
      const newTx = await res.json();
      setTransactions((prev) => [newTx, ...prev]);
      setTxModal(null);
      setTxForm({ name: '', amount: '', note: '' });
    } catch {
      alert('Failed to save transaction');
    } finally {
      setTxSaving(false);
    }
  };

  const invoices = transactions.slice(0, 5);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6">

      {/* Spinner */}
      {loading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span className="loading loading-spinner text-success w-12" />
        </div>
      )}

      <div style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.4s ease' }} className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-12 gap-5">

          {/* ── LEFT COLUMN ── */}
          <div className="col-span-7 space-y-5">

            {/* Main Balance Card */}
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
                  {/* Derived: current date + 2 years */}
                  <p className="font-semibold text-base-content text-sm">{validThru}</p>
                </div>
                <div>
                  <p className="text-xs text-base-content/50 mb-1 tracking-wide font-medium">CARD HOLDER</p>
                  <p className="font-semibold text-base-content text-sm">{cardHolder}</p>
                </div>
                <div className="text-right">
                  {/* Last 4 digits from first completed transaction */}
                  <p className="font-semibold text-base-content text-sm">**** **** **** {cardLast4}</p>
                </div>
              </div>

              <div className="h-1.5 bg-gradient-to-r from-success via-success/40 to-base-200 rounded-full" />
            </div>

            {/* Earning Category */}
            <div className="bg-base-100 rounded-2xl shadow-sm p-7">
              <h3 className="text-lg font-bold text-base-content/50 mb-6">Earning Category</h3>

              <div className="grid grid-cols-2 gap-8">
                {/* Donut + legend */}
                <div className="flex items-center gap-6">
                  <div className="space-y-5">
                    {[
                      { color: 'bg-success', label: 'Income',  pct: incomePercent,  cssVar: 'var(--su)' },
                      { color: 'bg-error',   label: 'Expense', pct: expensePercent, cssVar: 'var(--er)' },
                      { color: 'bg-base-300',label: 'Unknown', pct: unknownPercent, cssVar: 'var(--b3)' },
                    ].map(({ color, label, pct }) => (
                      <div key={label} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        <span className="text-base-content text-sm font-medium w-16">{label}</span>
                        <span className="font-bold text-base-content text-sm">{pct}%</span>
                      </div>
                    ))}
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

                {/* Real SVG line chart — paths built from transactions by day of week */}
                <div className="pl-6 border-l border-base-200">
                  <svg viewBox="0 0 420 130" className="w-full h-36">
                    {/* Baseline */}
                    <line x1="0" y1={CHART_BOTTOM} x2={CHART_W} y2={CHART_BOTTOM}
                      stroke="oklch(var(--b2))" strokeWidth="1" />

                    {/* Income line (green) */}
                    <path
                      d={chartData.incomePath}
                      fill="none"
                      stroke="oklch(var(--su))"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Expense line (red) */}
                    <path
                      d={chartData.expensePath}
                      fill="none"
                      stroke="oklch(var(--er))"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Unknown / pending line (grey) */}
                    <path
                      d={chartData.unknownPath}
                      fill="none"
                      stroke="oklch(var(--b3))"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Peak income dot + dashed vertical line */}
                    {chartData.hasData && (
                      <>
                        <circle
                          cx={chartData.peakX}
                          cy={chartData.peakY}
                          r="5"
                          fill="oklch(var(--su))"
                        />
                        <line
                          x1={chartData.peakX} y1="0"
                          x2={chartData.peakX} y2={CHART_BOTTOM}
                          stroke="oklch(var(--b2))"
                          strokeWidth="1"
                          strokeDasharray="3 3"
                        />
                      </>
                    )}
                  </svg>

                  {/* Day labels — today highlighted */}
                  <div className="flex justify-between mt-2 text-xs text-base-content/40 font-medium">
                    {DAYS_SHORT.map((d, i) => (
                      <span
                        key={d}
                        className={
                          i === todayIndex
                            ? 'font-semibold text-base-content/70'
                            : ''
                        }
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-base-100 rounded-2xl shadow-sm p-7">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-base-content mb-1">Payment History</h3>
                  <p className="text-xs text-base-content/40">Recent transaction history</p>
                </div>
                <div className="flex gap-5">
                  {['Monthly', 'Weekly', 'Today'].map((view) => (
                    <button
                      key={view}
                      onClick={() => setHistoryView(view)}
                      className={`pb-1.5 text-sm font-medium transition-colors ${
                        historyView === view
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
                        className={`rounded-xl p-4 transition-all cursor-pointer ${
                          selectedTransaction?.id === transaction.id
                            ? 'bg-primary shadow-lg'
                            : 'bg-base-100 transition-all duration-300 hover:bg-base-300'
                        }`}
                        onClick={() => setSelected(selectedTransaction?.id === transaction.id ? null : transaction)}
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
                            {transaction.createdAt
                              ? new Date(transaction.createdAt).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : 'N/A'}
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

          {/* ── RIGHT COLUMN ── */}
          <div className="col-span-5 space-y-5">

            {/* Wallet Balance Card */}
            <div className="bg-neutral rounded-2xl shadow-lg p-7 text-white">
              <div className="flex justify-start items-start mb-6 relative">
                <div className="w-12 h-12 bg-base-100/10 rounded-full" />
                <div className="w-12 h-12 bg-base-100/15 rounded-full absolute" />
              </div>

              <h2 className="text-4xl font-bold mb-2">{formatBalance(walletBalance)}</h2>
              <p className="text-neutral-content/70 text-sm mb-6 font-medium">Wallet Balance</p>

              {/* Real week-over-week comparison */}
              <div className="flex items-center gap-1.5 mb-6 text-xs">
                {weekChange.positive === null ? (
                  <span className="text-base-content/50">{weekChange.label}</span>
                ) : (
                  <>
                    <span className={`font-bold ${weekChange.positive ? 'text-success' : 'text-error'}`}>
                      {weekChange.label.split(' ')[0]}
                    </span>
                    <span className="text-base-content/50">
                      {weekChange.label.split(' ').slice(1).join(' ')}
                    </span>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setTxForm({ name: '', amount: '', note: '' }); setTxModal('topup'); }}
                  className="bg-base-100/5 backdrop-blur-sm text-white rounded-xl p-5 hover:bg-base-100/10 transition-all"
                >
                  <div className="w-10 h-10 bg-error/15 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">💳</span>
                  </div>
                  <p className="text-base-content/40 font-bold text-xs">Top Up</p>
                </button>
                <button
                  onClick={() => { setTxForm({ name: '', amount: '', note: '' }); setTxModal('withdraw'); }}
                  className="bg-base-100/5 backdrop-blur-sm text-white rounded-xl p-5 hover:bg-base-100/10 transition-all"
                >
                  <div className="w-10 h-10 bg-success/15 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                  <p className="text-xs text-base-content/40 font-bold">Withdraw</p>
                </button>
              </div>
            </div>

            {/* Invoices Sent */}
            <div className="bg-base-100 rounded-2xl shadow-sm p-7">
              <div className="mb-5">
                <h3 className="text-lg font-bold text-base-content mb-1">Invoices Sent</h3>
                <p className="text-xs text-base-content/50">Billing records sent to customers</p>
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

      {/* Top Up / Withdraw Modal */}
      {txModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="font-bold text-lg mb-4 capitalize">{txModal === 'topup' ? 'Top Up' : 'Withdraw'}</h2>
            <input
              placeholder="Name / Description *"
              value={txForm.name}
              onChange={(e) => setTxForm({ ...txForm, name: e.target.value })}
              className="input input-bordered w-full mb-3"
            />
            <input
              type="number"
              placeholder="Amount *"
              value={txForm.amount}
              onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
              className="input input-bordered w-full mb-3"
            />
            <input
              placeholder="Note (optional)"
              value={txForm.note}
              onChange={(e) => setTxForm({ ...txForm, note: e.target.value })}
              className="input input-bordered w-full mb-4"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setTxModal(null)} className="btn btn-ghost">Cancel</button>
              <button
                onClick={saveTx}
                disabled={txSaving || !txForm.name || !txForm.amount}
                className="btn btn-primary"
              >
                {txSaving ? <span className="loading loading-spinner loading-sm" /> : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialDashboard;