import { useEffect, useState } from "react";
import {
  CircleAlert,
  Mail,
  Pencil,
  Ellipsis,
  Phone,
  LayoutDashboard,
  ClipboardList,
  FileText,
  Users,
  BarChart2,
  Star,
  UtensilsCrossed,
  BookOpen,
  UserCircle,
  Calendar,
  MessageSquare,
  Wallet,
  Search,
  Bell,
  MessageCircle,
  Gift,
  Settings,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { RiMastercardFill } from "react-icons/ri";

/* ─────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────── */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard" },
  { icon: ClipboardList, label: "Order List" },
  { icon: FileText, label: "Order Detail" },
  { icon: Users, label: "Customer" },
  { icon: BarChart2, label: "Analytics" },
  { icon: Star, label: "Reviews" },
  { icon: UtensilsCrossed, label: "Foods" },
  { icon: BookOpen, label: "Food Detail" },
  { icon: UserCircle, label: "Customer Detail", active: true },
  { icon: Calendar, label: "Calendar" },
  { icon: MessageSquare, label: "Chat" },
  { icon: Wallet, label: "Wallet" },
];

const FOOD_ITEMS = [
  { id: 1, img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80&h=80&fit=crop", name: "Meidum Spicy Spagethi Italiano", tag: "SPAGETHI", serves: 4, time: "24mins", price: "$12.56" },
  { id: 2, img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=80&h=80&fit=crop", name: "Meidum Spicy Spagethi Italiano", tag: "SPAGETHI", serves: 4, time: "24mins", price: "$12.56" },
  { id: 3, img: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&h=80&fit=crop", name: "Meidum Spicy Spagethi Italiano", tag: "SPAGETHI", serves: 4, time: "24mins", price: "$12.56" },
  { id: 4, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop", name: "Meidum Spicy Spagethi Italiano", tag: "SPAGETHI", serves: 4, time: "24mins", price: "$12.56" },
  { id: 5, img: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop", name: "Meidum Spicy Spagethi Italiano", tag: "SPAGETHI", serves: 4, time: "24mins", price: "$12.56" },
];

const CHART_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const CHART_DATA = [
  [90, 60, 40, 30],
  [110, 80, 55, 20],
  [70, 95, 45, 50],
  [60, 130, 35, 80],
  [85, 70, 60, 100],
  [50, 40, 90, 60],
  [40, 150, 25, 45],
];

const LEGEND = [
  { color: "#4fc3f7", label: "Spaghetti (22%)", value: "69" },
  { color: "#4caf50", label: "Burger (27%)", value: "763" },
  { color: "#ef5350", label: "Pizza (11%)", value: "321" },
  { color: "#fdd835", label: "Sprite (15%)", value: "154" },
];

const BAR_COLORS = ["#4fc3f7", "#4caf50", "#ef5350", "#fdd835"];

/* ─────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────── */

/** Most Ordered Food Table */
function CustomerDetailTable() {
  const [active, setActive] = useState("Monthly");
  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-bold text-base-content text-base">Most Ordered Food</h3>
          <p className="text-base-content/60 text-xs mt-0.5">Lorem ipsum dolor sit amet, consectetur</p>
        </div>
        <div className="flex gap-1 bg-base-200 rounded-full p-1">
          {["Monthly", "Weekly", "Daily"].map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                active === t ? "bg-base-100 text-base-content shadow-sm" : "text-base-content/60 hover:text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-0 divide-y divide-gray-50">
        {FOOD_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center gap-4 py-3">
            <img
              src={item.img}
              alt={item.name}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-base-content text-sm font-semibold truncate">{item.name}</p>
              <p className="text-success text-[10px] font-bold tracking-wide mt-0.5">{item.tag}</p>
              <p className="text-base-content/60 text-[10px] mt-1">
                Serves for {item.serves} Person &nbsp;|&nbsp; {item.time}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-base-content font-bold text-sm">{item.price}</span>
              <button className="text-base-content/60 hover:text-gray-600">
                <Ellipsis className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Most Liked Food Chart */
function CustomerDetailChart() {
  const [active, setActive] = useState("Monthly");
  const maxH = 150;

  return (
    <div>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="font-bold text-base-content text-base">Most Liked Food</h3>
          <p className="text-base-content/60 text-xs mt-0.5">Lorem ipsum dolor sit amet, consectetur</p>
        </div>
        <div className="flex gap-1 bg-base-200 rounded-full p-1">
          {["Monthly", "Weekly", "Daily"].map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                active === t ? "bg-base-100 text-base-content shadow-sm" : "text-base-content/60 hover:text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end mb-2">
        <div className="bg-base-100 shadow-md rounded-xl px-3 py-1.5 text-right border border-base-200">
          <p className="text-base-content font-bold text-sm">763 Likes</p>
          <p className="text-base-content/60 text-[10px]">Oct 24th, 2025</p>
        </div>
      </div>

      <div className="flex items-end gap-1 px-2" style={{ height: `${maxH + 4}px` }}>
        {CHART_DATA.map((group, gi) => (
          <div key={gi} className="flex-1 flex items-end justify-center gap-0.5">
            {group.map((h, bi) => (
              <div
                key={bi}
                className="w-2.5 rounded-t-sm transition-all"
                style={{ height: `${h}px`, backgroundColor: BAR_COLORS[bi] }}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="flex mt-2 px-2">
        {CHART_DAYS.map((d) => (
          <div key={d} className="flex-1 text-center text-[9px] text-base-content/60 font-medium">{d}</div>
        ))}
      </div>

      <div className="border-t border-base-200 my-4" />

      <div className="grid grid-cols-2 gap-x-8 gap-y-3">
        {LEGEND.map(({ color, label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-gray-500 text-xs">{label}</span>
            </div>
            <span className="text-base-content font-bold text-sm">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
const CustomerDetail = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="">
      {/* Spinner — butun sahifa uchun */}
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

      {/* Content — loading paytida ko'rinmaydi */}
      <div
        className="flex flex-col flex-1 min-w-0"
        style={{ opacity: loading ? 0 : 1, transition: "opacity 0.4s ease" }}
      >
        <main className="flex-1 p-8 overflow-auto">

          <div className="mb-6">
            <h1 className="text-base-content font-bold text-2xl">Customer Detail</h1>
            <p className="text-base-content/60 text-sm mt-0.5">Here your Customer Detail Profile</p>
          </div>

          {/* Top Row */}
          <div className="flex gap-5 items-stretch">

            {/* Customer Profile Card */}
            <div className="flex-1 bg-base-100 rounded-2xl shadow-sm px-8 py-7 flex gap-6 items-center min-w-0">
              <div className="flex-shrink-0 w-28 h-36 rounded-2xl overflow-hidden bg-base-200">
                <img
                  src="customer.jpg"
                  alt="Eren Yeager"
                  className="w-full h-full object-cover grayscale"
                  onError={(e) => {
                    e.currentTarget.src = "https://ui-avatars.com/api/?name=Eren+Yeager&size=200&background=e5e7eb&color=6b7280&bold=true";
                    e.currentTarget.classList.remove("grayscale");
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base-content text-2xl font-bold leading-tight">Eren Yeager</h2>
                    <p className="text-success font-semibold text-sm mt-1">UX Designer</p>
                    <p className="text-base-content/60 text-xs mt-2 leading-relaxed">
                      St. Kings Road 57th, Garden Hills, Chelsea - London
                    </p>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button className="w-9 h-9 flex items-center justify-center rounded-full bg-success/10 hover:bg-green-100 transition-colors">
                      <CircleAlert className="w-4 h-4 text-success" />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center rounded-full bg-base-200 hover:bg-gray-200 transition-colors">
                      <Pencil className="w-4 h-4 text-base-content/60" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-base-200 my-5" />

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-info/10">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span className="text-gray-500 text-xs font-medium">eren.yeager@mail.co.id</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-success/10">
                      <Phone className="w-3.5 h-3.5 text-success" />
                    </div>
                    <span className="text-gray-500 text-xs font-medium">+012 345 6789</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-error/10">
                      <Briefcase className="w-3.5 h-3.5 text-red-400" />
                    </div>
                    <span className="text-gray-500 text-xs font-medium">Highspeed Studios</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment / Balance Card */}
            <div className="w-72 flex-shrink-0 rounded-2xl overflow-hidden shadow-md flex flex-col">
              <div
                className="flex-1 px-6 pt-5 pb-5"
                style={{ background: "linear-gradient(160deg, #2ecc71 0%, #25a85a 100%)" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-white/70 text-[10px] font-semibold tracking-widest uppercase">
                    Your Balance
                  </p>
                  <button className="text-white/60 hover:text-white">
                    <Ellipsis className="w-5 h-5" />
                  </button>
                </div>
                <h1 className="text-white text-4xl font-extrabold tracking-tight mt-1 mb-5">
                  $ 9,425
                </h1>
                <div className="flex items-center justify-between">
                  <p className="text-white/80 font-mono text-xs tracking-widest">
                    2451 •••• •••• ••••
                  </p>
                  <p className="text-white/80 font-semibold text-xs">02/21</p>
                </div>
              </div>

              <div
                className="px-6 py-4 flex items-center justify-between"
                style={{ background: "#1e9e50" }}
              >
                <div>
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
                    Name
                  </p>
                  <p className="text-white font-bold text-sm">Eren Yeager</p>
                </div>
                <RiMastercardFill className="w-10 h-10 text-white opacity-90" />
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="flex gap-5 mt-5">
            <div className="flex-1 bg-base-100 rounded-2xl shadow-sm p-6 min-w-0">
              <CustomerDetailTable />
            </div>
            <div className="flex-1 bg-base-100 rounded-2xl shadow-sm p-6 min-w-0">
              <CustomerDetailChart />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
};

export default CustomerDetail;