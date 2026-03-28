# SEDAP — Bug Tracker

> Har bir agent o'z sohasini tahlil qildi. Buglar ketma-ket tartibda tuzatiladi.
> Status: `[ ]` ochiq · `[x]` tuzatilgan

---

## Ustuvorlik darajalari
- 🔴 **Kritik** — ishlamaydi yoki ma'lumot yo'qoladi
- 🟠 **Yuqori** — foydalanuvchi zarar ko'radi
- 🟡 **O'rta** — noto'g'ri ishlaydi lekin critical emas
- 🟢 **Past** — kichik muammo

---

## BACKEND AGENT — `server/`

### [x] B-01 🔴 Server start unhandled rejection
**Fayl:** `server/index.js` — oxirgi qator
**Muammo:** `startServer()` `.catch()` siz chaqirilgan. `connectDB()` muvaffaqiyatsiz bo'lsa, server xatosiz crash bo'ladi.
**Tuzatish:**   
```js
startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
```

---

### [x] B-02 🟠 UUID to'qnashuvi — buyurtma ID
**Fayl:** `server/routes/orderListRoutes.js` ~34-qator
**Muammo:** `uuidv4().slice(0, 4)` — faqat 4 belgi ishlatiladi. 65,536 ta variant bor, ~200 buyurtmadan keyin 50% to'qnashuv ehtimoli. `unique: true` sababli DB xato beradi.
**Tuzatish:** `uuidv4()` — to'liq UUID ishlatish.

---

### [x] B-03 🟠 Race condition — foydalanuvchi yaratishda
**Fayl:** `server/routes/userRoutes.js` ~52-qator
**Muammo:** `findOne({ email })` → `save()` orasida ikki so'rov bir vaqtda kelsa, ikki xil user yaratiladi.
**Tuzatish:** Manual tekshirishni olib tashlash, `e.code === 11000` (MongoDB duplicate) ushlab olish.

---

### [x] B-04 🟡 POST /users — `name` validatsiyasi yo'q
**Fayl:** `server/routes/userRoutes.js` ~49-qator
**Muammo:** `name` required lekin tekshirilmaydi. Mongoose 500 qaytaradi o'rniga 400 bo'lishi kerak.
**Tuzatish:** `if (!name?.trim()) return res.status(400).json({ message: 'Name is required' })`.

---

### [x] B-05 🟡 POST /products — validatsiya yo'q
**Fayl:** `server/routes/productRoutes.js` ~32-qator
**Muammo:** `id, name, description, price, category` tekshirilmaydi. Noto'g'ri ma'lumot DBga kiradi.

---

### [x] B-06 🟡 POST /invoice — validatsiya yo'q
**Fayl:** `server/routes/cartRoutes.js` ~31-qator
**Muammo:** `id, name, price` tekshirilmaydi.

---

### [x] B-07 🟡 POST /orderlist — validatsiya yo'q
**Fayl:** `server/routes/orderListRoutes.js` ~33-qator
**Muammo:** `customerName, address, items, subTotal, total` tekshirilmaydi.

---

## DATABASE AGENT — `server/models/`

### [ ] D-01 🔴 OrderList.createdAt ikki marta aniqlangan
**Fayl:** `server/models/OrderList.js` ~52-qator
**Muammo:** Schemada `createdAt: { default: Date.now }` bor, lekin `{ timestamps: true }` ham bor. Mongoose timestamps ustunlik qiladi — custom default hech qachon ishlamaydi. Kodni chalkashtirib yuboradi.
**Tuzatish:** Custom `createdAt` fieldni olib tashlash, `timestamps: true` ga ishonish.

---

### [x] D-02 🔴 Order.productId type noto'g'ri
**Fayl:** `server/models/Order.js` ~9-qator
**Muammo:** `productId: { type: Number }` — lekin `Product.id` `String`. Type mos emas. `Product.findOne({ id: order.productId })` hech qachon topilmaydi.
**Tuzatish:** `type: String`.

---

### [x] D-03 🟠 User.uid — unique index yo'q
**Fayl:** `server/models/User.js`
**Muammo:** `uid` field bo'yicha tez-tez so'rov yuboriladi (OAuth login), lekin index yo'q. Shuningdek unique constraint yo'q — bir Firebase UID uchun ikki user yaratilishi mumkin.
**Tuzatish:**
```js
userSchema.index({ uid: 1 }, { unique: true, sparse: true });
```

---

### [x] D-04 🟠 Customer.joinDate va lastOrder — String, Date emas
**Fayl:** `server/models/Customer.js` ~9, 25-qatorlar
**Muammo:** Sana maydonlari `String` saqlanadi. Saralash, interval so'rovlari (`$gte`, `$lte`) ishlamaydi.
**Tuzatish:** `type: Date`.

---

### [x] D-05 🟠 Customer.totalSpent — String sifatida, Number emas
**Fayl:** `server/models/Customer.js` ~21-qator
**Muammo:** `"$0"` string saqlangan. Hisob-kitob, saralash ishlamaydi.
**Tuzatish:** `type: Number, default: 0`.

---

### [x] D-06 🟡 Product.id — category indeksi yo'q
**Fayl:** `server/models/Product.js`
**Muammo:** `category` bo'yicha filter qilinadi, lekin index yo'q. Ko'p mahsulotda sekin ishlaydi.
**Tuzatish:** `productSchema.index({ category: 1 })`.

---

### [x] D-07 🟡 Invoice model — items schemasi yo'q
**Fayl:** `server/models/Invoice.js` ~17-qator
**Muammo:** `items: { type: Array }` — validatsiya yo'q. OrderList schemasi bilan nomuvofiq.
**Tuzatish:** `orderItemSchema` sub-schema ishlatish.

---

### [x] D-08 🟢 Customer, Order, Invoice modellari — routelarda ishlatilmaydi
**Fayllar:** `server/models/Customer.js`, `Order.js`, `Invoice.js`
**Muammo:** `seed.js`da import qilingan, lekin `index.js`da route yo'q. Dead code.

---

## AUTH AGENT — `cashier/src/context/` + `server/routes/userRoutes.js`

### [x] A-01 🔴 oauthUpsert — davlat parvoz qiladi (race condition)
**Fayl:** `cashier/src/context/AuthContext.jsx` ~21-qator
**Muammo:** `setUser(null)` va `localStorage.removeItem()` darhol chaqiriladi — backend javobi kutilmaydi. Sekin internet bo'lsa, foydalanuvchi login sahifasiga qaytariladi, ammo aslida autentifikatsiya muvaffaqiyatli.
**Tuzatish:** Faqat xato chiqsa `setUser(null)` chaqirish, muvaffaqiyatli bo'lganda chaqirmaslik.

---

### [x] A-02 🟠 ProtectedRoute — boshlang'ich holat flashi
**Fayl:** `cashier/src/components/ProtectedRoute.jsx`
**Muammo:** App yuklanayotganda `user === null` (localStorage henuz o'qilmagan). ProtectedRoute login sahifasiga yo'naltiradi, keyin user topilganda yana `/menu`ga qaytadi. Foydalanuvchi bu fleshni ko'radi.
**Tuzatish:** AuthContextga `isInitialized` holat qo'shish, ProtectedRoute shu holatni kutib tursin.

---

### [x] A-03 🟡 getRedirectResult — isMounted tekshiruvi yo'q
**Fayl:** `cashier/src/context/AuthContext.jsx` ~66-qator
**Muammo:** Komponent unmount bo'lsa ham async natija qayta ishlanadi. Memory leak ehtimoli.
**Tuzatish:** `isMounted` flag qo'shish, cleanup funksiyasida `false` qilish.

---

### [x] A-04 🟡 Firebase user validatsiyasi yo'q
**Fayl:** `cashier/src/context/AuthContext.jsx` ~66-qator
**Muammo:** `result.user.uid` mavjudligi tekshirilmaydi. Firebase noto'g'ri data qaytarsa, foydalanuvchi `/menu`ga yo'naltiriladi lekin aslida tizimga kirmagan bo'ladi.
**Tuzatish:** `if (!fu?.uid) throw new Error(...)` tekshiruvi.

---

## CASHIER AGENT — `cashier/src/`

### [x] C-01 🟠 addToCart — xato foydalanuvchiga ko'rsatilmaydi
**Fayl:** `cashier/src/components/Holder.jsx` ~65-qator
**Muammo:** API xato bersa, faqat `console.error`. Foydalanuvchi mahsulot savatga qo'shilgan deb o'ylaydi, aslida qo'shilmagan.
**Tuzatish:** `toast.error(...)` yoki alert ko'rsatish.

---

### [x] C-02 🟠 Checkout tugmasi — ikki marta bosish mumkin
**Fayl:** `cashier/src/components/Invoice.jsx` ~63-qator
**Muammo:** Tugmada `disabled` holat yo'q. Foydalanuvchi tez-tez bossa bir nechta buyurtma yuborilishi mumkin.
**Tuzatish:** `isSubmitting` holat qo'shish, submit davomida tugmani `disabled` qilish.

---

### [x] C-03 🟠 fetchProducts — xato holati yo'q
**Fayl:** `cashier/src/components/Holder.jsx` ~23-qator
**Muammo:** API ishlamasa alert chiqadi, lekin keyin sahifa bo'sh qoladi — retry imkoniyati yo'q.
**Tuzatish:** `error` state va retry tugmasi qo'shish.

---

### [x] C-04 🟡 fetchCartItems — xato sust yutib yuboriladi
**Fayl:** `cashier/src/components/Holder.jsx` ~34-qator
**Muammo:** Catch bloki bo'sh — savat yuklanmasa foydalanuvchi bilmaydi.
**Tuzatish:** `toast.error(...)` ko'rsatish.

---

### [x] C-05 🟡 categories — null category filter yo'q
**Fayl:** `cashier/src/components/Holder.jsx` ~41-qator
**Muammo:** `products.map(p => p.category)` — `category === null/undefined` bo'lsa Set buzilishi mumkin.
**Tuzatish:** `.filter(p => p.category)` qo'shish.

---

## DASHBOARD AGENT — `dashboard/src/`

### [x] DA-01 🔴 FoodsDetail — ID hardcode qilingan
**Fayl:** `dashboard/src/pages/FoodsDetail.jsx` ~37-qator
**Muammo:** `fetch(".../products/1")` — har doim 1-mahsulot ko'rsatiladi. Boshqa mahsulotni bosgan foydalanuvchi doim 1-mahsulotni ko'radi.
**Tuzatish:** `useParams()` dan `productId` olish.

---

### [x] DA-02 🔴 Route noto'g'ri — "Calentar" typo
**Fayl:** `dashboard/src/main.jsx` ~73-qator
**Muammo:** `path: "Calentar"` — katta harf va `d` harfi tushib qolgan. `/calendar` sahifasiga o'tish mumkin emas.
**Tuzatish:** `path: "calendar"`.

---

### [x] DA-03 🟠 foods route ikki marta aniqlangan
**Fayl:** `dashboard/src/main.jsx` ~32 va ~56-qatorlar
**Muammo:** `path: "foods"` ikki marta yozilgan. Ikkinchisi hech qachon ishlamaydi.
**Tuzatish:** Takrorlanganini o'chirish.

---

### [x] DA-04 🟠 Analytics chart — har render yangi random qiymat
**Fayl:** `dashboard/src/pages/Analitics.jsx` ~86-qator
**Muammo:** `Math.random()` to'g'ridan-to'g'ri render ichida — har qayta render qilganda chart titraydi va o'zgaradi.
**Tuzatish:** `useMemo(() => ..., [])` ishlatish.

---

### [x] DA-05 🟠 OrderDetail — items.map() null check yo'q
**Fayl:** `dashboard/src/pages/OrderDetail.jsx` ~178-qator
**Muammo:** `safeOrder.items.map(...)` — `items` undefined bo'lsa crash bo'ladi.
**Tuzatish:** `safeOrder.items?.map(...)` yoki `(safeOrder.items || []).map(...)`.

---

### [x] DA-06 🟠 Foods delete — muvaffaqiyat tekshirilmaydi
**Fayl:** `dashboard/src/pages/Foods.jsx` ~38-qator
**Muammo:** `DELETE` so'rov muvaffaqiyatsiz bo'lsa ham `getFoods()` chaqiriladi — foydalanuvchi mahsulot o'chirildi deb o'ylaydi.
**Tuzatish:** `response.ok` tekshiruvi, xato bo'lsa `toast.error(...)`.

---

### [x] DA-07 🟡 Calendar — sana hardcode qilingan (2021)
**Fayl:** `dashboard/src/pages/Calendar.jsx` ~6-qator
**Muammo:** `new Date(2021, 3, 1)` — foydalanuvchi 2021-yil aprelni ko'radi.
**Tuzatish:** `new Date()` — joriy sana.

---

### [x] DA-08 🟡 Analytics — API xato holati yo'q
**Fayl:** `dashboard/src/pages/Analitics.jsx` ~23-qator
**Muammo:** Fetch xato bo'lsa faqat `console.error`. Sahifa bo'sh ko'rsatiladi, foydalanuvchi bilmaydi.
**Tuzatish:** `error` state va xabar ko'rsatish.

---

### [x] DA-09 🟢 CustomerTable — ichma-ich div (h-64 vs h-[60vh])
**Fayl:** `dashboard/src/components/CustomerTable.jsx` ~27-qator
**Muammo:** Loading spinner ikkita nested div ichida, qarama-qarshi balandliklar bilan.
**Tuzatish:** Tashqi divni olib tashlash.

---

---

## DASHBOARD CHUQUR TAHLIL — `dashboard/src/` (Yangi)

### [x] DN-01 🔴 Sidebar — `/calentar` buzilgan havola
**Fayl:** `dashboard/src/components/Sidebar.jsx` — 88-qator
**Muammo:** `<NavLink to="/calentar">` — lekin route `"calendar"` deb tuzatilgan. Foydalanuvchi Calendar tugmasini bossa bo'sh sahifa chiqadi.
**Tuzatish:** `to="/calentar"` → `to="/calendar"`

---

### [x] DN-02 🔴 FoodsDetail — `/api/orders` endpoint mavjud emas
**Fayl:** `dashboard/src/pages/FoodsDetail.jsx` — 38-qator
**Muammo:** `fetch(".../api/orders")` — backend da faqat `/api/orderlist` bor. Bu endpoint hech qachon 200 qaytarmaydi, har doim mock data ko'rsatiladi.
**Tuzatish:** `fetch(".../api/orders")` → `fetch(".../api/orderlist")`

---

### [x] DN-03 🟠 Sidebar — `/foodsDetail` havolasida ID yo'q
**Fayl:** `dashboard/src/components/Sidebar.jsx` — 77-qator
**Muammo:** `<NavLink to="/foodsDetail">` — route endi `/foodsDetail/:id` bo'lgani uchun ID siz borilsa `useParams().id === undefined`, fetch `…/products/undefined` yuboradi, 404 qaytaradi va mock data ko'rsatiladi.
**Tuzatish:** Sidebar havolasini `/foods` ga yo'naltirish, detail esa product kartasidan ochilishi kerak.

---

### [x] DN-04 🟠 FoodsDetail — useEffect `id` dependency yo'q
**Fayl:** `dashboard/src/pages/FoodsDetail.jsx` — 31-33-qatorlar
**Muammo:** `useEffect(() => { fetchData(); }, [])` — `id` dependency arrayda yo'q. Boshqa mahsulotga o'tganda (URL o'zgarganda) yangi ma'lumot yuklanmaydi, eski product ko'rsatiladi.
**Tuzatish:** `}, [])` → `}, [id])`

---

### [x] DN-05 🟠 Foods — `saveFood()` xato tekshiruvi yo'q
**Fayl:** `dashboard/src/pages/Foods.jsx` — 64-90-qatorlar
**Muammo:** POST/PUT so'rovlarda `response.ok` tekshirilmaydi. Server xato qaytarsa ham modal yopiladi va foydalanuvchi ma'lumot saqlandi deb o'ylaydi.
**Tuzatish:**
```js
const res = editing
  ? await fetch(`${API}/${editing.id}`, { method: "PUT", ... })
  : await fetch(API, { method: "POST", ... });
if (!res.ok) { alert("Failed to save product"); return; }
setModal(false);
getFoods();
```

---

### [x] DN-06 🟡 Calendar — `getWeekDays()` hardcoded 2021 sana
**Fayl:** `dashboard/src/pages/Calendar.jsx` — 55-qator
**Muammo:** `const weekStart = new Date(2021, 3, 18)` — Week ko'rinishi har doim 2021-yil aprelini ko'rsatadi. `isToday` ham faqat 18-kunga mos.
**Tuzatish:**
```js
const getWeekDays = () => {
  const weekStart = new Date(currentDate);
  weekStart.setDate(currentDate.getDate() - currentDate.getDay());
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    return { date: date.getDate(), dayName: daysOfWeek[i], isToday: date.toDateString() === today.toDateString() };
  });
};
```

---

### [x] DN-07 🟢 CustomerDetail — `src="customer.jpg"` mavjud emas
**Fayl:** `dashboard/src/pages/CustomerDetail.jsx` — 253-qator
**Muammo:** `src="customer.jpg"` — bu fayl mavjud emas, `onError` fallback ishlatiladi. Keraksiz network request chaqiriladi.
**Tuzatish:** `src` ni to'g'ridan-to'g'ri fallback URL bilan almashtirish:
```jsx
src="https://ui-avatars.com/api/?name=Eren+Yeager&size=200&background=e5e7eb&color=6b7280&bold=true"
```
`onError` va `grayscale` classni olib tashlash.

---

---

## SERVER + SAHIFALAR SINXRONIZATSIYASI — (Yangi Round)

### [x] SRV-01 🔴 Analytics — `/api/orders` endpoint mavjud emas
**Fayl:** `dashboard/src/pages/Analitics.jsx` — 28-qator
**Muammo:** `fetch(\`${API}/orders\`)` — bu endpoint backendda yo'q, faqat `/api/orderlist` bor. Sahifa har doim error ko'rsatadi.
**Tuzatish:** `${API}/orders` → `${API}/orderlist`

---

### [x] SRV-02 🔴 Analytics — OrderList fieldlari noto'g'ri ishlatilmoqda
**Fayl:** `dashboard/src/pages/Analitics.jsx` — 58, 80-81-qatorlar
**Muammo:**
- `o.date` → OrderList da mavjud emas, `o.createdAt` ishlatish kerak
- `o.productId` → mavjud emas, mahsulotlar `o.items[]` massivida
- `o.quantity` → mavjud emas, `item.qty` ishlatish kerak
Natijada `filteredOrders`, `productStats`, `mostSelling` — barchasi bo'sh array qaytaradi.
**Tuzatish:**
```js
// filteredOrders — o.date → o.createdAt
const date = new Date(o.createdAt);

// productStats — o.items[] ni aylanib chiqish
filteredOrders.forEach((o) => {
  (o.items || []).forEach((item) => {
    productStats[item.id] = (productStats[item.id] || 0) + (item.qty || 1);
  });
});
```

---

### [x] SRV-03 🟠 CustomerTable — Date obyektlari xom ko'rsatilmoqda
**Fayl:** `dashboard/src/components/CustomerTable.jsx` — 86, 99-qatorlar
**Muammo:** `{customer.joinDate}` va `{customer.lastOrder}` — DBdan `Date` obyekti keladi, React uni `[object Object]` yoki ISO string ko'rinishida ko'rsatadi.
**Tuzatish:**
```jsx
{customer.joinDate ? new Date(customer.joinDate).toLocaleDateString() : '—'}
{customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : '—'}
```

---

### [x] SRV-04 🟠 FoodsDetail — OrderList da `productId` maydoni yo'q
**Fayl:** `dashboard/src/pages/FoodsDetail.jsx` — 49-56-qatorlar
**Muammo:** `ordersData.filter((o) => o.productId === parseInt(productData.id))` — OrderList da `productId` yo'q. Buyurtmalar `items[]` ichida. `order.date` ham yo'q, `createdAt` bor.
Natijada daromad grafigi har doim bo'sh (mock data).
**Tuzatish:**
```js
const productOrders = ordersData.filter(
  (o) => (o.items || []).some((item) => item.id === productData.id)
);
productOrders.forEach((order) => {
  const date = new Date(order.createdAt); // o.date → o.createdAt
  const month = date.toLocaleString("en", { month: "short" });
  if (!monthlyMap[month]) monthlyMap[month] = { name: month, value: 0 };
  const rev = (order.items || [])
    .filter(item => item.id === productData.id)
    .reduce((s, item) => s + (item.price * (item.qty || 1)), 0);
  monthlyMap[month].value += rev;
});
```

---

### [x] SRV-05 🟠 Foods — POST da `id` va `description` maydoni yo'q
**Fayl:** `dashboard/src/pages/Foods.jsx` — 13-18, 77-81-qatorlar
**Muammo:** Form `title`, `category`, `price`, `image` saqlaydi — lekin Product model `name` (title emas!), `description` (required!), `id` (required!) kutadi. POST har doim 400 qaytaradi.
**Tuzatish:**
- Form fieldlarini `title` → `name` ga o'zgartirish
- `description` field qo'shish
- POST da `id: crypto.randomUUID()` generatsiya qilish

---

### [x] SRV-06 🟡 Foods — Qidiruv va karta `food.title` ishlatmoqda, lekin field `food.name`
**Fayl:** `dashboard/src/pages/Foods.jsx` — 56, 93-qatorlar
**Muammo:** `openEdit` da `food?.title` → undefined (field `food.name`). Search ham `f?.title` ishlatadi — hech narsa topilmaydi.
**Tuzatish:** Barcha `title` → `name` ga o'zgartirish.

---

### [x] SRV-07 🟡 OrderDetail — Faqat birinchi buyurtmani ko'rsatadi
**Fayl:** `dashboard/src/pages/OrderDetail.jsx` — 15-qator
**Muammo:** `setOrder(data[0])` — bazadagi birinchi buyurtmani hardcode qilib oladi. Bo'sh bazada `undefined` qaytadi va sahifa "Order not found" ko'rsatadi.
**Tuzatish:** `useParams` orqali `id` olish va `/api/orderlist/:id` ga so'rov yuborish. Agar parametr yo'q bo'lsa, eng yangi buyurtmani olish.

---

## DASHBOARD — `/analytics` va `/customers` sahifalari

### [x] ANL-01 🔴 Analytics — `useMemo` React Hooks qoidasini buzadi → render crash
**Fayl:** `dashboard/src/pages/Analitics.jsx` — 98-qator
**Muammo:** `useMemo` early return (`if (loading) return ...`, `if (error) return ...`) lardan KEYIN chaqirilgan. React hooks har render'da bir xil tartibda chaqirilishi shart. Birinchi render'da `loading=true` → `useMemo` chaqirilmaydi. Ikkinchi render'da `loading=false` → `useMemo` chaqiriladi. React hook'lar sonining o'zgarishini aniqlaydi va: **"Rendered more hooks than during the previous render"** xatosi chiqaradi → sahifa oq bo'ladi.
**Tuzatish:** `useMemo` va `months` massivini komponent yuqorisiga, barcha early return lardan OLDIN ko'chirish.

---

### [x] ANL-02 🟠 Analytics — Chart data tasodifiy, haqiqiy daromad emas
**Fayl:** `dashboard/src/pages/Analitics.jsx` — 98-101-qatorlar
**Muammo:** `chartData` har oyga `Math.random() * 100000 + 10000` qiymat beradi. Bu haqiqiy buyurtma ma'lumotlari emas — har sahifa yangilanganda grafikdagi qiymatlar o'zgarib turadi. Foydalanuvchi noto'g'ri statistikani ko'radi.
**Tuzatish:** `orders` massividan oylik daromadni hisoblash: har oy uchun `o.total` larni yig'ish.

---

### [x] ANL-03 🟡 Analytics — Daily/Weekly/Monthly filter chart ga ta'sir qilmaydi
**Fayl:** `dashboard/src/pages/Analitics.jsx` — 128-139, 98-101-qatorlar
**Muammo:** `filter` state `filteredOrders` ni o'zgartiradi (Total Sales raqamlari yangilanadi), lekin `chartData` `useMemo([], [])` — bo'sh dependency bilan hech qachon yangilanmaydi. Foydalanuvchi Weekly bosganida grafik o'zgarmaydi.
**Tuzatish:** `chartData` ni `filter` va `orders` ga bog'lash: `useMemo(() => ..., [filter, orders])`.

---

### [x] ANL-04 🟢 Analytics — Header sana diapazoni hardcode qilingan
**Fayl:** `dashboard/src/pages/Analitics.jsx` — 117-119-qatorlar
**Muammo:** `"12 December 2025 - 16 January 2026"` — statik string. Haqiqiy filter diapazoni ko'rsatilmaydi.
**Tuzatish:** `filter` state ga qarab dinamik sana diapazoni hisoblash.

---

### [x] CST-01 🔴 Customers — `CustomerTable` hardcoded production URL ishlatadi, local dev da 404
**Fayl:** `dashboard/src/components/CustomerTable.jsx` — 10-qator
**Muammo:** `fetch('https://sedap-nnap.onrender.com/api/customers')` — production server URLi hardcode qilingan. Agar deployed server yangilangan kodni (`customerRoutes`) hali olmagan bo'lsa, `404 Not Found` qaytaradi → CustomerTable "Failed to fetch customers" xatosini ko'rsatadi. Local development da ham foydalanuvchi production bazasiga murojaat qiladi.
**Tuzatish:** `import.meta.env.VITE_API_URL` environment variable ishlatish. `dashboard/.env` ga `VITE_API_URL=http://localhost:8000/api` qo'shish.

---

### [x] CST-02 🟠 Customers — Server CORS production domenini qo'shib olmagan
**Fayl:** `server/index.js` — 22-28-qatorlar
**Muammo:** CORS faqat `localhost:5173/5174/5175` ruxsat beradi. Dashboard boshqa domendan (masalan, Vercel/Netlify) joylashtirilsa, barcha API so'rovlari CORS xatosi bilan bloklanadi.
**Tuzatish:** Production domenini CORS origin ro'yxatiga qo'shish yoki `CORS_ORIGIN` env variable ishlatish.

---

### [x] CST-03 🟡 Customers — `totalSpent` valyuta formatsiz ko'rsatilmoqda
**Fayl:** `dashboard/src/components/CustomerTable.jsx` — 95-qator
**Muammo:** `{customer.totalSpent}` — faqat raqam, masalan `78.92`. Valyuta belgisi yoki formati yo'q. Foydalanuvchi bu `$` mi, `som` mi yoki boshqa narsa ekanini bilmaydi.
**Tuzatish:** `${customer.totalSpent?.toFixed(2)}` yoki `customer.totalSpent?.toLocaleString()` ishlatish.

---

### [x] CST-04 🟢 Customers — "View Detail" va "Edit" tugmalar ishlamaydi
**Fayl:** `dashboard/src/components/CustomerTable.jsx` — 104-109-qatorlar
**Muammo:** Ikkala tugmada `onClick` handler yo'q — faqat ko'rinish uchun. Foydalanuvchi bosganida hech narsa bo'lmaydi.
**Tuzatish:** "View Detail" → `/customersDetail?id=${customer.id}` ga yo'naltirish; "Edit" → tahrirlash modal ochish.

---

## AUTH-AGENT — Dashboard Login / Register

### [x] AUTH-D-01 🔴 `userRoutes.js` POST `/users` — `uid`/`avatar` null qiymatlari sparse index ni buzadi → register 500 xatosi
**Fayl:** `server/routes/userRoutes.js` — 49-qator, `server/models/User.js`, `cashier/src/context/AuthContext.jsx`, `dashboard/src/context/AuthContext.jsx`
**Muammo:** MongoDB sparse unique index `null` qiymatlarni INDEKSLAYDI — faqat ABSENT (mavjud bo'lmagan) maydonlarni o'tkazib yuboradi. `uid: ""` yoki `uid: null` saqlansa, sparse index uni indekslaydi. Ikkinchi foydalanuvchi register qilganda `uid: null` uchun `11000 duplicate key` → 500 xatosi.

Muammo uch joyda edi:
1. `userRoutes.js`: `uid = ""` (keyin `uid = null`) default → `null` DB ga saqlandi
2. `User.js` model: `uid: { type: String, default: null }` — Mongoose `null` saqlardi
3. `AuthContext.register`: `{ uid: '', avatar: null }` yuborardi

**Tuzatish (to'liq):**
- `User.js`: barcha optional fieldlardan `default: null` olib tashlash — field ABSENT bo'lsa DB ga saqlanmaydi
- `userRoutes.js`: conditional spread — faqat truthy qiymatlar saqlash:
```js
const user = new User({
    name,
    ...(email          ? { email }              : {}),
    ...(hashedPassword ? { password: hashedPassword } : {}),
    ...(avatar         ? { avatar }             : {}),
    ...(uid            ? { uid }                : {}),
});
```
- `cashier/src/context/AuthContext.jsx` register: `{ name, email, password }` yuborish (uid/avatar yo'q)
- `dashboard/src/context/AuthContext.jsx` oauthUpsert: conditional spread email/avatar uchun

---

### [x] AUTH-D-02 🟠 `AuthContext.logout()` — Firebase sessiyasini yopmaydidi
**Fayl:** `dashboard/src/context/AuthContext.jsx` — 113-116-qatorlar
**Muammo:** `logout()` faqat React state va localStorage ni tozalaydi. Firebase `auth.currentUser` esa aktiv qoladi — `signOut(auth)` chaqirilmagan. Agar foydalanuvchi Google/GitHub bilan kirgan bo'lsa, Firebase sessiyasi brauzerda saqlanib qoladi.
**Tuzatish:** `signOut(auth)` qo'shish:
```js
import { signOut } from 'firebase/auth'
const logout = useCallback(() => {
    signOut(auth).catch(() => {})
    setUser(null)
    localStorage.removeItem(LS_KEY)
}, [])
```

---

### [x] AUTH-D-03 🟠 `Login.jsx` — `redirectError` context o'zgarishlari ko'rsatilmaydi
**Fayl:** `dashboard/src/pages/Login.jsx` — 13-qator
**Muammo:** `const [error, setError] = useState(redirectError || '')` — `useState` initial qiymatni faqat birinchi render'da ishlatadi. `redirectError` async `getRedirectResult` dan keyin o'rnatilsa (component mount bo'lgandan keyin), local `error` state yangilanmaydi → foydalanuvchi OAuth redirect xatosini ko'rmaydi.
**Tuzatish:** `useEffect` bilan `redirectError` ni kuzatish:
```js
useEffect(() => {
    if (redirectError) setError(redirectError)
}, [redirectError])
```

---

### [x] AUTH-D-04 🟡 `AuthContext` — `getRedirectResult` useEffect dashboard uchun keraksiz
**Fayl:** `dashboard/src/context/AuthContext.jsx` — 58-82-qatorlar
**Muammo:** Dashboard faqat `signInWithPopup` ishlatadi (redirect emas). `getRedirectResult` har app yuklanishida Firebase ga so'rov yuboradi, lekin har doim `null` qaytaradi — bu ortiqcha network call va kod murakkabligi.
**Tuzatish:** `getRedirectResult` useEffect ni dashboard `AuthContext` dan olib tashlash.

---

### [x] AUTH-D-05 🟢 Login/Register — email format client-side tekshirilmaydi
**Fayl:** `dashboard/src/pages/Login.jsx` — 20-qator, `Register.jsx` — 20-qator
**Muammo:** `!form.email` faqat bo'sh ekanligini tekshiradi. `"notanemail"` yoki `"abc"` kiritilsa client-side xato ko'rsatilmaydi — server ga yuboriladi va "Invalid email or password" qaytaradi. Foydalanuvchi nima xato qilganini tushunmaydi.
**Tuzatish:** `!/\S+@\S+\.\S+/.test(form.email)` tekshiruvi qo'shish.

---

## DEVOPS-AGENT — Deployment (Render.com)

### [x] DEPL-01 🔴 Server o'zgarishlari commit/push qilinmagan — production eski kod bilan ishlayapti
**Fayl:** `server/routes/customerRoutes.js`, `server/index.js` va boshqa server fayllari
**Muammo:** `git status` ko'rsatishicha barcha server o'zgarishlari uncommitted (`M`) yoki untracked (`??`):
- `server/routes/customerRoutes.js` → `??` (yangi fayl, hech qachon git ga qo'shilmagan)
- `server/index.js` → `M` (customerRoutes import va use qo'shilgan, lekin commit yo'q)
- Barcha model va route o'zgarishlari ham commit qilinmagan

Render.com git repository'dan deploy qiladi. Production server hali `/api/customers` endpointini bilmaydi → `404 Not Found`. Analytics ham `/api/orderlist` tuzatmalari, Products validatsiyasi va boshqa fix'larni olmagani uchun noto'g'ri ishlashi mumkin.

**Tuzatish:**
```bash
git add server/
git commit -m "feat: customerRoutes, model fixes, route validations"
git push origin main
```
Render avtomatik yangi deploy boshlaydi.

---

### [x] DEPL-02 🔴 CustomerTable URL da trailing space — `/customers ` → 404
**Fayl:** `dashboard/src/components/CustomerTable.jsx` — 14-qator
**Muammo:** IDE/linter tomonidan kiritilgan: `` fetch(`${API}/customers `) `` — URL oxirida bo'sh joy bor. Brauzer bu bo'sh joyni `%20` ga encode qiladi: `/api/customers%20` → server `404` qaytaradi.
**Tuzatish:** Bo'sh joyni olib tashlash: `` fetch(`${API}/customers`) ``

---

## DATABASE-AGENT — `server/db.json` (Seeding tayyorlash)

### [x] DB-JSON-01 🔴 customers.joinDate — MongoDB parse qila olmaydi
**Fayl:** `server/db.json` — `customers` massivi
**Muammo:** `joinDate` qiymati `"27 March 2020, 12:42 AM"` formatida. `Customer` modeli `joinDate: { type: Date, required: true }`. Mongoose bu formatni `Date`ga cast qila olmaydi → `CastError` → `insertMany` to'liq fail bo'ladi → seedingda `customers` saqlanmaydi.
**Tuzatish:** ISO 8601 formatiga o'tkazish: `"2020-03-27T00:42:00.000Z"`

---

### [x] DB-JSON-02 🔴 customers.totalSpent — dollar belgili string, model Number kutadi
**Fayl:** `server/db.json` — `customers[*].totalSpent`
**Muammo:** Barcha customerlar `totalSpent: "$78.92"` kabi string saqlagan. `Customer` modeli `totalSpent: { type: Number }`. Mongoose `"$78.92"` → `Number` cast qila olmaydi → `CastError` → seeding crash.
**Tuzatish:** Dollar belgisini olib tashlash: `78.92` (sonli qiymat)

---

### [x] DB-JSON-03 🔴 customers.lastOrder — pul miqdori, lekin model Date kutadi
**Fayl:** `server/db.json` — `customers[*].lastOrder`
**Muammo:** `lastOrder: "$35.35"` — bu oxirgi buyurtma summasi. Lekin `Customer` modeli `lastOrder: { type: Date, default: null }` deb belgilangan. `"$35.35"` hech qachon Date emas → `CastError` → seeding crash.
**Tuzatish:** `lastOrder` ni `null` ga o'zgartirish (yoki ISO sana qo'yish). Model ham qayta ko'rib chiqilishi kerak — bu field pul summasini saqlashga mo'ljallanganmi yoki sanani?

---

### [x] DB-JSON-04 🔴 users.password — ochiq matn, bcrypt.compare() ishlayolmaydi
**Fayl:** `server/db.json` — `users[0].password`
**Muammo:** `"password": "cashier123"` — plain text. Login endpointi `bcrypt.compare(enteredPassword, user.password)` ishlatadi. `bcrypt.compare("cashier123", "cashier123")` `false` qaytaradi chunki ikkinchi argument bcrypt hash emas. Demo kassir seeding dan keyin login qila olmaydi.
**Tuzatish:** Parolni bcrypt hash ga almashtirish. Masalan: `bcrypt.hashSync("cashier123", 10)` natijasi: `$2b$10$...`

---

### [x] DB-JSON-05 🟠 users.uid = "" — sparse unique index ni buzadi
**Fayl:** `server/db.json` — `users[0].uid` va `server/models/User.js`
**Muammo:** Demo foydalanuvchi `"uid": ""` (bo'sh string). `User` modeli `uid: { type: String, default: "" }` va `userSchema.index({ uid: 1 }, { unique: true, sparse: true })`. Sparse index faqat `null`/`undefined` qiymatlarni o'tkazib yuboradi — **bo'sh string `""` indekslanadi**. Ikkinchi email/parol ro'yxatdan o'tgan foydalanuvchi ham `uid: ""` oladi → duplicate key xatosi → ro'yxatdan o'tish buziladi.
**Tuzatish:** `"uid": null` ga o'zgartirish. Model default ham `default: null` bo'lishi kerak.

---

### [x] DB-JSON-06 🟠 products — ID 1-4 yo'q, orderlist bu IDlarga murojaat qiladi
**Fayl:** `server/db.json` — `products` va `orderlist`
**Muammo:** `products` massivi `id: "5"` dan boshlanadi (1-4 mavjud emas). Lekin `orderlist[0].items` ichida `id: "3"` (Healthy Lunch Bento Box) va `id: "4"` (Classic Boiled Eggs) mavjud. Bu "ghost" mahsulotlar — orderlarda bor, lekin alohida product sifatida yo'q. FoodsDetail bu IDlar uchun 404 qaytaradi.
**Tuzatish:** `products` ga id 1-4 mahsulotlarini qo'shish YOKI orderlistdagi itemlarning IDlarini mavjud mahsulotlarga o'zgartirish.

---

### [x] DB-JSON-07 🟡 products — barcha 46 mahsulotda discount = 0.5 (test artifact)
**Fayl:** `server/db.json` — `products[*].discount`
**Muammo:** Har bir mahsulotda `"discount": 0.5` — bu 50% chegirma. Haqiqiy restoran ilovasida turli mahsulotlar turli chegirmalarga ega bo'lishi kerak. Bu test paytida tasodifan bir xil qiymat qoldirilgan.
**Tuzatish:** Har bir mahsulot uchun realistik discount qiymatlari qo'yish (0 = chegirmasiz, 0.1 = 10%, va hokazo).

---

### [x] DB-JSON-08 🟡 products — noto'g'ri kategoriyalar
**Fayl:** `server/db.json` — `products` massivi
**Muammo:**
- `id: "20"` White Rice → `category: "Breakfast"` (guruch — nonushta emas)
- `id: "24"` Raw Chicken Meat → `category: "Breakfast"` (xom go'sht — nonushta emas)
Bu mahsulotlar Cashier menusida noto'g'ri kategoriyada ko'rinadi.
**Tuzatish:** White Rice → `"Main Dish"` yoki `"Lunch"`, Raw Chicken Meat → `"Main Dish"`

---

### [x] DB-JSON-09 🟡 orders (legacy) — hech bir route ishlatmaydi
**Fayl:** `server/db.json` — `orders` massivi (40 ta yozuv)
**Muammo:** `orders` massivi `Order` modeliga seed bo'ladi. Lekin `server/routes/` da `Order` modeli uchun hech qanday route yo'q — bu ma'lumotlar hech qachon API orqali so'ralmaydni. Faqat joy egallaydi.
**Tuzatish:** `orders` massivini db.json dan olib tashlash YOKI `orderlist` ga real test buyurtmalari qo'shish.

---

### [x] DB-JSON-10 🟢 orderlist — IDlar 4 belgili (eski bug qoldig'i)
**Fayl:** `server/db.json` — `orderlist[*].id`
**Muammo:** Mavjud 5 ta orderlist yozuvining IDlari `"7063"`, `"8442"`, `"bc35"`, `"73ce"`, `"3ae3"` — to'liq UUID emas. B-02 bug tuzatildi (endi server to'liq UUID ishlatadi), lekin eski ma'lumotlar hali qisqa ID bilan qolgan.
**Tuzatish:** Mavjud IDlarni to'liq UUID formatiga o'zgartirish: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

---

## Tuzatish Tartibi (Ketma-ket)

| # | ID | Agent | Ustuvorlik |
|---|-----|-------|-----------|
| 1 | B-01 | backend | 🔴 Kritik |
| 2 | B-02 | backend | 🟠 Yuqori |
| 3 | D-01 | database | 🔴 Kritik |
| 4 | D-02 | database | 🔴 Kritik |
| 5 | D-03 | database | 🟠 Yuqori |
| 6 | A-01 | auth | 🔴 Kritik |
| 7 | A-02 | auth | 🟠 Yuqori |
| 8 | DA-01 | dashboard | 🔴 Kritik |
| 9 | DA-02 | dashboard | 🔴 Kritik |
| 10 | DA-03 | dashboard | 🟠 Yuqori |
| 11 | C-01 | cashier | 🟠 Yuqori |
| 12 | C-02 | cashier | 🟠 Yuqori |
| 13 | DA-04 | dashboard | 🟠 Yuqori |
| 14 | DA-05 | dashboard | 🟠 Yuqori |
| 15 | B-03 | backend | 🟠 Yuqori |
| 16 | D-04 | database | 🟠 Yuqori |
| 17 | D-05 | database | 🟠 Yuqori |
| 18 | DA-06 | dashboard | 🟠 Yuqori |
| 19 | A-03 | auth | 🟡 O'rta |
| 20 | A-04 | auth | 🟡 O'rta |
| 21 | C-03 | cashier | 🟠 Yuqori |
| 22 | C-04 | cashier | 🟡 O'rta |
| 23 | C-05 | cashier | 🟡 O'rta |
| 24 | B-04 | backend | 🟡 O'rta |
| 25 | B-05 | backend | 🟡 O'rta |
| 26 | B-06 | backend | 🟡 O'rta |
| 27 | B-07 | backend | 🟡 O'rta |
| 28 | DA-07 | dashboard | 🟡 O'rta |
| 29 | DA-08 | dashboard | 🟡 O'rta |
| 30 | D-06 | database | 🟡 O'rta |
| 31 | D-07 | database | 🟡 O'rta |
| 32 | D-08 | database | 🟢 Past |
| 33 | DA-09 | dashboard | 🟢 Past |
| 34 | DN-01 | dashboard | 🔴 Kritik |
| 35 | DN-02 | dashboard | 🔴 Kritik |
| 36 | DN-03 | dashboard | 🟠 Yuqori |
| 37 | DN-04 | dashboard | 🟠 Yuqori |
| 38 | DN-05 | dashboard | 🟠 Yuqori |
| 39 | DN-06 | dashboard | 🟡 O'rta |
| 40 | DN-07 | dashboard | 🟢 Past |
| 41 | SRV-01 | dashboard | 🔴 Kritik |
| 42 | SRV-02 | dashboard | 🔴 Kritik |
| 43 | SRV-03 | dashboard | 🟠 Yuqori |
| 44 | SRV-04 | dashboard | 🟠 Yuqori |
| 45 | SRV-05 | dashboard | 🟠 Yuqori |
| 46 | SRV-06 | dashboard | 🟡 O'rta |
| 47 | SRV-07 | dashboard | 🟡 O'rta |
| 48 | DB-JSON-01 | database | 🔴 Kritik |
| 49 | DB-JSON-02 | database | 🔴 Kritik |
| 50 | DB-JSON-03 | database | 🔴 Kritik |
| 51 | DB-JSON-04 | database | 🔴 Kritik |
| 52 | DB-JSON-05 | database | 🟠 Yuqori |
| 53 | DB-JSON-06 | database | 🟠 Yuqori |
| 54 | DB-JSON-07 | database | 🟡 O'rta |
| 55 | DB-JSON-08 | database | 🟡 O'rta |
| 56 | DB-JSON-09 | database | 🟡 O'rta |
| 57 | DB-JSON-10 | database | 🟢 Past |
| 58 | ANL-01 | dashboard | 🔴 Kritik |
| 59 | ANL-02 | dashboard | 🟠 Yuqori |
| 60 | ANL-03 | dashboard | 🟡 O'rta |
| 61 | ANL-04 | dashboard | 🟢 Past |
| 62 | CST-01 | dashboard | 🔴 Kritik |
| 63 | CST-02 | backend | 🟠 Yuqori |
| 64 | CST-03 | dashboard | 🟡 O'rta |
| 65 | CST-04 | dashboard | 🟢 Past |
| 66 | DEPL-01 | devops | 🔴 Kritik |
| 67 | DEPL-02 | devops | 🔴 Kritik |
| 68 | AUTH-D-01 | backend | 🔴 Kritik |
| 69 | AUTH-D-02 | auth | 🟠 Yuqori |
| 70 | AUTH-D-03 | auth | 🟠 Yuqori |
| 71 | AUTH-D-04 | auth | 🟡 O'rta |
| 72 | AUTH-D-05 | auth | 🟢 Past |
