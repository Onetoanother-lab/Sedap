# Hardcoded Data Audit — SEDAP Dashboard

> Last updated: 2026-03-28
> Status key: ✅ Fixed | ⚠️ No backend model (by design) | 🔵 Acceptable (UI constant)

---

## 1. Dashboard.jsx

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | Total Orders | `8` | `/api/orderlist` → count |
| ✅ | Total Canceled | `0` | `/api/orderlist` → `status === "canceled"` count |
| ✅ | Total Delivered | `0` | `/api/orderlist` → `status === "delivered"` count |
| ✅ | Income Profit | `0` | `/api/orderlist` → sum of `total` |
| ✅ | `percent={4}` on all cards | hardcoded `4` | `0` (no historical comparison data) |

---

## 2. components/Monthly.jsx

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | Chart labels | `["2025-Dekabr", "2026-Fevral"]` | `/api/orderlist` → group by year-month |
| ✅ | Chart data | `[5, 4]` | `/api/orderlist` → order count per month |

---

## 3. components/Branch.jsx

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | Branch names | `["Yunusobod","Tinchlik","Chilonzor","Sergeli"]` | `/api/orderlist` → group by `order.branch` |
| ✅ | Branch order counts | `[500, 100, 300, 200]` | Same — dynamic count per branch |

---

## 4. pages/OrderList.jsx

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | Data source | `jsonplaceholder.typicode.com/users` | `/api/orderlist` |
| ✅ | Order ID | `#5859 + index` | `order.id` |
| ✅ | Customer name | mock `user.name` | `order.customerName` |
| ✅ | Location | mock address | `order.address` |
| ✅ | Amount | random UZS | `order.total` |
| ✅ | Status | random string | `order.status` |

---

## 5. pages/CustomerDetail.jsx

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | Customer name | `"Eren Yeager"` | `/api/customers/:id` → `customer.name` |
| ✅ | Location | hardcoded London address | `customer.location` |
| ✅ | Balance | `$9,425` | `customer.totalSpent` |
| ✅ | Join date | — | `customer.joinDate` |
| ✅ | Last order | — | `customer.lastOrder` |
| ✅ | Total spent | — | `customer.totalSpent` |
| ✅ | Most Ordered Food table | 5× same spaghetti | `/api/orderlist` → top 5 items by customer |
| ✅ | Most Liked Food chart | static `[90,60,40,30]…` | orders grouped by day-of-week × top 4 items |
| ✅ | Chart legend | hardcoded names/values | calculated from customer's orders |
| ✅ | "763 Likes" / "Oct 24th" | hardcoded | total items ordered + today's date |
| ⚠️ | Email, phone, company, jobTitle | hardcoded placeholders | fields added to Customer schema — populate via seed/UI |

---

## 6. pages/OrderList.jsx — Status column

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | Status | random fake | `order.status` from DB |

---

## 7. pages/OrderDetail.jsx

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | API URL | hardcoded production URL | `VITE_API_URL` env var |
| ✅ | Order status | `"On Delivery"` hardcoded | `order.status` |
| ✅ | Courier name | `"Courier"` | `order.courier.name` |
| ✅ | Courier phone | `"+998 90 000 00 00"` | `order.courier.phone` |
| ✅ | Courier avatar | placeholder URL | `order.courier.avatar` |
| ✅ | Courier ID | `"40495"` | `order.courier.id` |
| ✅ | Delivery time | `"12:52"` | derived from `order.createdAt` |
| ✅ | Timeline events | 4 hardcoded Jul-2020 steps | `order.statusHistory[]` |
| ✅ | Item category | `"Main Course"` hardcoded | `item.category` |
| ✅ | Note card style | `style={{ background:"#2d3748" }}` | `bg-neutral` class |
| 🔵 | "(40+ reviews)" | hardcoded | UI placeholder — no review-per-item model |
| 🔵 | "4-6 mins" ETA | hardcoded | UI placeholder — no delivery ETA system |
| 🔵 | Lorem ipsum note | placeholder text | no `note` field on OrderList schema |

---

## 8. pages/FoodsDetail.jsx

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | API URLs | hardcoded production URLs | `VITE_API_URL` env var |
| ✅ | Ingredients | `"Tuxum, pomidor…"` | `product.ingredients` from DB |
| ✅ | Nutrition (kcal/protein/fat/carbs) | hardcoded `320 kcal, 18g…` | `product.nutrition.*` from DB |
| ✅ | Revenue chart | random `20000–170000` per month | real orders containing this product |
| 🔵 | Mock fallback product | "Vegetable Omelette" on API failure | intentional error fallback |

---

## 9. pages/Rewievs.jsx

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | Featured reviews (×3) | hardcoded | `/api/reviews` → `isFeatured === true` |
| ✅ | Other reviews (×4) | hardcoded | `/api/reviews` → `isFeatured === false` |
| ✅ | Review dates | `"24 June 2020"` | `review.createdAt` |
| 🔵 | Filter period | `"17 April 2020 – 21 May 2020"` | UI state — no date-range API filter yet |

---

## 10. pages/Walet.jsx

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | Transactions list | 4 hardcoded | `/api/transactions` |
| ✅ | Invoices list | 5 hardcoded | first 5 from `/api/transactions` |
| ✅ | Main Balance | `$673,412.66` | sum of `Completed` transaction amounts |
| ✅ | Wallet Balance | `$824,571.93` | sum of all transaction amounts |
| ✅ | Income % | `30%` | Completed count / total |
| ✅ | Expense % | `46%` | Canceled count / total |
| ✅ | Unknown % | `10%` | Pending count / total |
| ✅ | SVG donut hex colors | `#10b981`, `#f87171`… | `oklch(var(--su/er/b2/b3))` |
| ✅ | Inline pixel widths | `style={{ width:'220px' }}` | Tailwind `w-56`, `w-40`, `w-20`, `w-28` |
| ✅ | Non-DaisyUI Tailwind classes | `bg-slate-700`, `text-teal-500`… | DaisyUI tokens |
| ✅ | Card holder name | `"Samantha Anderson"` | fetched transaction data |

---

## 11. pages/Calendar.jsx

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | Events | hardcoded days 2/18/22 | `/api/events?year=&month=` |
| ✅ | Month navigation | static | re-fetches on `currentDate` change |
| ✅ | Date highlight | hardcoded day checks | any day with events gets highlight |
| ✅ | Modal title year | `"2021"` hardcoded | `currentDate.getFullYear()` |

---

## 12. pages/Chat.jsx

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | USERS array hex colors | `#570df8`, `#f9a800`… | `oklch(var(--p/wa/in/er/s/su/a))` |
| ✅ | Avatar opacity hack | `color + "22"` string concat | `color.replace(')', ' / 0.13)')` |
| ✅ | All other inline hex values | scattered `#570df8` etc. | DaisyUI CSS variables |
| 🔵 | Hardcoded user list | 9 fixed users | chat is local/browser-based by design — not DB-driven |

---

## 13. components/Navbar.jsx

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | THEME_CONFIG backgrounds | `#ffffff`, `#0f1923` | `oklch(var(--b1))`, `oklch(var(--n))` |
| ✅ | THEME_CONFIG border/color | `#4db6ac` | `oklch(var(--p))` |
| ✅ | IconButton notification colors | `text-blue-500`, `bg-blue-100`… | `text-info`, `bg-info/10`, `bg-primary/10`… |
| ✅ | `bg-gray-200` divider | hardcoded | `bg-base-300` |
| ✅ | `text-gray-400/700` text | hardcoded | `text-base-content/50`, `text-base-content` |

---

## 14. components/StatCard.jsx

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | `bg-emerald-100`, `text-emerald-600` | hardcoded | `bg-success/10`, `text-success` |
| ✅ | `text-red-500`, `text-gray-*` | hardcoded | `text-error`, `text-base-content/*` |

---

## 15. components/CustomerTable.jsx

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | `text-red-600`, `text-slate-500` | hardcoded | `text-error`, `text-base-content/60` |
| ✅ | `bg-green-50`, `ring-green-600/20` | hardcoded | `bg-success/10`, `ring-success/20` |
| ✅ | Button hover colors | `hover:bg-blue-700` etc. | `hover:bg-primary-focus`, `hover:bg-warning-focus` |

---

## 16. components/Foods.jsx (card component)

| Status | Field | Was | Now |
|--------|-------|-----|-----|
| ✅ | `bg-emerald-500`, `text-emerald-*` | hardcoded | `bg-success`, `text-success` |
| ✅ | `bg-orange-100 text-orange-500` | hardcoded | `bg-warning/10 text-warning` |
| ✅ | `bg-red-100 text-red-500` | hardcoded | `bg-error/10 text-error` |
| ✅ | `bg-gray-100`, `text-gray-7/800` | hardcoded | `bg-base-200`, `text-base-content` |

---

## Schema Gaps — All Resolved

| Model | Fields Added | Used By |
|-------|-------------|---------|
| `OrderList` | `status`, `branch`, `courier`, `statusHistory[]` | Dashboard, OrderList, OrderDetail, Branch chart |
| `Customer` | `email`, `phone`, `company`, `jobTitle`, `avatar` | CustomerDetail profile |
| `Product` | `ingredients`, `nutrition` | FoodsDetail |
| New: `Review` | `productName`, `reviewer`, `rating`, `tags`, `isFeatured` | Rewievs page |
| New: `Transaction` | `name`, `amount`, `status`, `card`, dates | Walet page |
| New: `Event` | `title`, `date`, `time`, `color` | Calendar page |

---

## Seed

Run `cd server && node seed.js` to push all data.

Collections seeded: products (50), customers (7), orderlist (5), users (1), reviews (7), transactions (6), events (8).
