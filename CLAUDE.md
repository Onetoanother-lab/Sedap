# SEDAP — Claude Code Configuration

## Project Overview

**SEDAP** — restoran POS (Point-of-Sale) va boshqaruv tizimi.

| Qism | Texnologiya | Port |
|------|-------------|------|
| Dashboard (Admin) | React 19 + Vite + Tailwind + DaisyUI | 5173 |
| Cashier (POS) | React 19 + Vite + Tailwind + DaisyUI | 5174 |
| Backend (API) | Node.js + Express 5 + MongoDB | 8000 |
| Database | MongoDB Atlas (Mongoose ODM) | cloud |
| Auth | Firebase (Google/GitHub OAuth) + bcrypt | — |

---

## Multi-Agent Arxitekturasi

Har bir agent o'z yo'nalishida mustaqil ishlaydi va faqat o'z sohasiga tegishli fayllarni o'zgartiradi.

---

### Agent 1 — `cashier-agent` (POS Terminal)

**Falsafa:** Tezlik va soddalik. Kassir vaqtini tejash uchun hamma narsa bir necha bosishda bajarilishi kerak. UI responsiv, xatosiz va mobil-friendly bo'lsin.

**Mas'uliyat:**
- `cashier/src/pages/` — Login, Register, Menu, Profile
- `cashier/src/components/` — Holder, Card, Category, Invoice, Navbar, Aside
- `cashier/src/context/AuthContext.jsx` — auth holati
- `cashier/src/api/axios.js` — API so'rovlar
- `cashier/src/firebase.js` — Firebase konfiguratsiya
- `cashier/vite.config.js`

**Qoidalar:**
- Faqat `cashier/` papkasiga teging
- Har bir UI o'zgarishda mobile responsivlikni tekshiring
- OAuth login oqimini buzmang
- `AuthContext` ni o'zgartirganda barcha auth metodlarini saqlab qoling

---

### Agent 2 — `dashboard-agent` (Admin Panel)

**Falsafa:** Ma'lumot va nazorat. Admin har bir raqamni ko'ra olishi, filtrlay olishi va tezda qaror qabul qila olishi kerak. Har bir sahifa ma'lumotni aniq va toza ko'rsatsin.

**Mas'uliyat:**
- `dashboard/src/pages/` — Dashboard, OrderList, Foods, Customer, Analytics, Chat, Wallet, Calendar, Reviews
- `dashboard/src/components/` — Sidebar, Navbar, StatCard, CustomerTable, Charts, Monthly, Branch
- `dashboard/vite.config.js`

**Qoidalar:**
- Faqat `dashboard/` papkasiga teging
- Chartlarni o'zgartirganda Chart.js va Recharts ikkalasini tekshiring
- Sidebar navigatsiya barcha sahifalar uchun to'g'ri ishlashi shart
- StatCard komponentlari real API ma'lumotlarini ko'rsatishi kerak

---

### Agent 3 — `backend-agent` (API Server)

**Falsafa:** Ishonchlilik va to'g'rilik. API aniq xato xabarlari bersin, validatsiya qat'iy bo'lsin, ma'lumotlar hech qachon buzilmasin.

**Mas'uliyat:**
- `server/routes/` — userRoutes, productRoutes, cartRoutes, orderListRoutes
- `server/index.js` — Express app, middleware, CORS
- `server/config/db.js` — MongoDB ulanish
- `server/seed.js` — test ma'lumotlari

**API Endpointlar:**
```
GET/POST   /api/users
POST       /api/users/login
GET/PATCH  /api/users/:id
GET/POST/PUT/DELETE /api/products
GET/POST/DELETE     /api/invoice
GET/POST/DELETE     /api/orderlist
```

**Qoidalar:**
- Faqat `server/` papkasiga teging
- CORS sozlamalarini o'zgartirganda barcha 3 portni (5173, 5174, 5175) saqlang
- `.env` faylini hech qachon commitga qo'shmang
- Har yangi route uchun xato handling qo'shing

---

### Agent 4 — `database-agent` (Ma'lumotlar Bazasi)

**Falsafa:** Yaxlitlik va ketma-ketlik. Schema o'zgarishlari ehtiyotkorlik bilan, migration strategiyasi bilan amalga oshirilsin. Hech qachon mavjud ma'lumotlarni yo'qotmang.

**Mas'uliyat:**
- `server/models/` — User, Product, Cart, OrderList, Customer, Order, Invoice
- `server/config/db.js`
- `server/seed.js`

**Modellar:**
```
User      → id, name, email, password, avatar, uid, timestamps
Product   → id, name, description, price, discount, category, image
Cart      → Product fieldslar + qty
OrderList → id, customerName, address, items[], subTotal, tax, discount, tips, total
Customer  → alohida profil
Order     → buyurtma tafsilotlari
Invoice   → hisob-faktura
```

**Qoidalar:**
- Faqat `server/models/` va `server/config/` papkalariga teging
- Schema o'zgarishlarida `required` fieldlarni ehtiyotkorlik bilan qo'shing
- `uid` field sparse index bilan (null bo'lishi mumkin)
- `email` field unique + sparse (OAuth userlarda null bo'lishi mumkin)

---

### Agent 5 — `auth-agent` (Autentifikatsiya)

**Falsafa:** Xavfsizlik birinchi. Parollar hech qachon ochiq saqlanmasin. OAuth token validatsiyasi qat'iy bo'lsin. Session ma'lumotlari xavfsiz boshqarilsin.

**Mas'uliyat:**
- `cashier/src/context/AuthContext.jsx`
- `cashier/src/firebase.js`
- `cashier/src/pages/Login.jsx`
- `cashier/src/pages/Register.jsx`
- `cashier/src/components/ProtectedRoute.jsx`
- `server/routes/userRoutes.js` (login/register endpoints)
- `server/models/User.js`

**Auth oqimi:**
```
Email/Password → bcrypt hash → MongoDB
Google OAuth   → Firebase → UID lookup → MongoDB upsert
GitHub OAuth   → Firebase → UID lookup → MongoDB upsert
```

**Qoidalar:**
- Parolni hech qachon plain text ko'rsatmang yoki loglamang
- Firebase token validatsiyasini serverda ham tekshiring (kelajakda)
- OAuth upsert logikasini (UID → email → create) buzib tashlamang
- `ProtectedRoute` barcha himoyalangan sahifalarda ishlashi shart

---

### Agent 6 — `ui-agent` (Dizayn Tizimi)

**Falsafa:** Izchillik va estetika. Butun ilovada bir xil ko'rinish, bir xil spacing, bir xil ranglar. DaisyUI komponentlarini to'g'ri ishlatish, Tailwind utility classlarni keraksiz takrorlamaslik.

**Mas'uliyat:**
- Barcha komponentlardagi styling
- `tailwind.config.js` (agar mavjud bo'lsa)
- DaisyUI tema sozlamalari (light, dark, cupcake, valentine, cyberpunk)
- Ikonlar: React Icons, Heroicons, Lucide React

**Qoidalar:**
- DaisyUI classlarni ustunlik bering Tailwind utility ustidan
- Rasm URLlarini hardcode qilmang — props orqali uzating
- Tema o'zgaruvchilari CSS variables orqali boshqarilsin
- Har yangi komponent uchun responsive bo'lishi shart: mobile → tablet → desktop

---

### Agent 7 — `devops-agent` (Deployment va Konfiguratsiya)

**Falsafa:** Takrorlanuvchanlik va ishonchlilik. Har qanday muhitda (local, staging, production) loyiha bir xil ishlashi kerak. Environment o'zgaruvchilar tartibli boshqarilsin.

**Mas'uliyat:**
- `server/.env` (hech qachon commit qilinmasin)
- `server/package.json`
- `cashier/package.json`
- `dashboard/package.json`
- Vite konfiguratsiyalar
- Render.com deployment sozlamalari

**Muhit:**
```
Development:
  API → http://localhost:8000
  Dashboard → http://localhost:5173
  Cashier → http://localhost:5174

Production:
  API → https://sedap-nnap.onrender.com/api
```

**Qoidalar:**
- `.env` faylini `.gitignore`ga qo'shing
- API URL ni `cashier/src/api/axios.js`da environment variable orqali boshqaring
- Render deploydan oldin `npm run build` muvaffaqiyatli bo'lishini tekshiring

---

## Umumiy Qoidalar (Barcha Agentlar Uchun)

```
1. Faqat o'z sohasidagi fayllarni o'zgartiring
2. Har o'zgarishdan oldin faylni o'qing
3. Mavjud komponentlarni qayta ishlating — yangi yaratmang
4. Console.log ni production koddan olib tashlang
5. TypeScript kelajakda kiritilishi mumkin — JSX fayllarni sof saqlang
6. Axios instance (cashier/src/api/axios.js) orqali barcha API so'rovlarni yuboring
7. MongoDB ObjectId va custom `id` field ni aralashtirib yubormang
```

---

## Loyihani Ishga Tushirish

```bash
# Backend
cd server && npm install && npm run dev

# Dashboard
cd dashboard && npm install && npm run dev

# Cashier (POS)
cd cashier && npm install && npm run dev
```

---

## Muhim Fayllar

| Fayl | Tavsif |
|------|--------|
| `server/index.js` | Express app entry point |
| `server/models/User.js` | Auth user schema |
| `cashier/src/context/AuthContext.jsx` | Global auth state |
| `cashier/src/api/axios.js` | API client |
| `cashier/src/firebase.js` | Firebase config |
| `dashboard/src/pages/Dashboard.jsx` | Admin bosh sahifa |
