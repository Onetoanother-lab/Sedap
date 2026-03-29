import { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "https://sedap-nnap.onrender.com/api";

const CHAT_COLORS = [
  "oklch(var(--p))", "oklch(var(--wa))", "oklch(var(--in))", "oklch(var(--er))",
  "oklch(var(--s))", "oklch(var(--su))", "oklch(var(--a))",  "oklch(var(--pc))",
  "oklch(var(--sc))",
];

// No hardcoded user list — we always wait for the API.
// If the API fails, the chat shows an error rather than fake names.
const MSGS_KEY   = "gchat_msgs_v5";
const PASSWD_KEY = "gchat_passwords_v5";

function initials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
function timeStr(ts) {
  return new Date(ts).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });
}

// ── Shared storage helpers ──────────────────────────────────────────
async function storageGet(key, shared = true) {
  try { const r = await window.storage.get(key, shared); return r?.value ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function storageSet(key, val, shared = true) {
  try { await window.storage.set(key, JSON.stringify(val), shared); } catch {}
}

// ── Sub-components ──────────────────────────────────────────────────
function Avatar({ user, size = 34 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: user.color.replace(')', ' / 0.13)'), border: `1.5px solid ${user.color.replace(')', ' / 0.33)')}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: user.color, fontWeight: 700, fontSize: size * 0.33, flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif",
    }}>{initials(user.name)}</div>
  );
}

function Input({ label, type = "text", value, onChange, onKeyDown, placeholder, error, autoFocus }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 6 }}>{label}</label>}
      <input
        autoFocus={autoFocus}
        type={type}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        style={{
          width: "100%", boxSizing: "border-box", padding: "11px 14px",
          borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
          background: "var(--color-background-secondary)",
          color: "var(--color-text-primary)", outline: "none",
          border: error ? `1.5px solid oklch(var(--er))` : "0.5px solid var(--color-border-secondary)",
          transition: "border 0.15s",
        }}
      />
      {error && <div style={{ color: "oklch(var(--er))", fontSize: 12, marginTop: 5 }}>! {error}</div>}
    </div>
  );
}

function Btn({ children, onClick, color = "oklch(var(--p))", disabled, variant = "solid", style = {} }) {
  const base = {
    padding: "11px 0", borderRadius: 10, fontSize: 14, fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif", cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.45 : 1, width: "100%", transition: "opacity 0.15s",
    ...style,
  };
  if (variant === "solid") return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, background: color, color: "#fff", border: "none" }}>{children}</button>
  );
  return (
    <button onClick={onClick} disabled={disabled} style={{ ...base, background: "transparent", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-secondary)" }}>{children}</button>
  );
}

function SideItem({ active, color, label, icon, badge, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "7px 8px",
      borderRadius: 8, border: "none", cursor: "pointer",
      background: active ? color.replace(')', ' / 0.08)') : "transparent",
      borderLeft: active ? `2px solid ${color}` : "2px solid transparent",
      color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
      fontFamily: "'DM Sans', sans-serif", fontWeight: active ? 600 : 400,
      fontSize: 13, textAlign: "left", marginBottom: 1, transition: "all 0.12s",
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: "50%",
        background: color.replace(')', ' / 0.12)'), border: `1px solid ${color.replace(')', ' / 0.25)')}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color, fontWeight: 700, fontSize: 10, flexShrink: 0,
      }}>{icon}</div>
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
      {badge > 0 && <span style={{ background: color, color: "#fff", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>{badge}</span>}
    </button>
  );
}

// ── Card wrapper for auth screens ───────────────────────────────────
function AuthCard({ children, users }) {
  return (
    <div style={{
      minHeight: "100vh", background: "var(--color-background-tertiary)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{
        display: "flex", borderRadius: 24, overflow: "hidden",
        border: "0.5px solid var(--color-border-tertiary)",
        width: "min(780px, 96vw)", minHeight: 480,
        boxShadow: "0 8px 48px rgba(0,0,0,0.10)",
      }}>
        {/* Left brand panel */}
        <div style={{
          width: 260, flexShrink: 0, padding: "40px 28px",
          background: "oklch(var(--p))",
          display: "flex", flexDirection: "column", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 2, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", marginBottom: 36 }}>Group Chat</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 12 }}>Salom!</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>
              O'z akkauntingizga kiring yoki parolingizni o'zgartiring.
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 10, letterSpacing: 0.8 }}>{users.length} A'ZO</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {users.map(u => (
                <div key={u.id} title={u.name} style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 10, fontWeight: 700, color: "#fff",
                }}>{initials(u.name)}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Right content */}
        <div style={{
          flex: 1, padding: "40px 36px",
          background: "var(--color-background-primary)",
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
export default function App() {
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError]     = useState(null);

  // auth state
  const [screen, setScreen] = useState("login");
  const [me, setMe]         = useState(null);
  const [passwords, setPasswords] = useState(null);

  // login form
  const [selUser, setSelUser]   = useState("");
  const [passInput, setPassInput] = useState("");
  const [loginError, setLoginError] = useState("");

  // change password form
  const [oldPass, setOldPass]   = useState("");
  const [newPass, setNewPass]   = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [cpError, setCpError]   = useState("");
  const [cpSuccess, setCpSuccess] = useState("");

  // chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [toUser, setToUser]     = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [sending, setSending]   = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // ── Load users from API — no hardcoded fallback ─────────────────
  useEffect(() => {
    fetch(`${API_BASE}/users`)
      .then(r => {
        if (!r.ok) throw new Error(`Server responded ${r.status}`);
        return r.json();
      })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("No users returned from server");
        }
        const mapped = data.map((u, i) => {
          const id = (u.name || u.email || u.id || `user${i}`)
            .toLowerCase().replace(/\s+/g, "");
          return { id, name: u.name || id, color: CHAT_COLORS[i % CHAT_COLORS.length] };
        });
        setUsers(mapped);
        setUsersError(null);
      })
      .catch(err => {
        setUsersError(err.message || "Could not load users");
      })
      .finally(() => setUsersLoading(false));
  }, []);

  // ── Load passwords — default is a random UUID per user, NOT the username ──
  // This means first-time users must set a password via Change Password.
  // The admin should distribute initial passwords out-of-band.
  useEffect(() => {
    if (users.length === 0) return;
    (async () => {
      const stored = await storageGet(PASSWD_KEY);
      if (stored) {
        setPasswords(stored);
      } else {
        // First run: each user gets a random initial password.
        // These are intentionally NOT the username — an admin must
        // share initial credentials separately.
        const initial = Object.fromEntries(
          users.map(u => [u.id, crypto.randomUUID()])
        );
        await storageSet(PASSWD_KEY, initial);
        setPasswords(initial);
      }
    })();
  }, [users]);

  // Poll messages when logged in
  useEffect(() => {
    if (!me) return;
    const load = async () => {
      const data = await storageGet(MSGS_KEY);
      if (data) setMessages(data);
    };
    load();
    const t = setInterval(load, 2500);
    return () => clearInterval(t);
  }, [me]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeTab]);

  // ── Auth handlers ──────────────────────────────────────────────
  const handleLogin = () => {
    if (!selUser)   { setLoginError("Foydalanuvchi tanlang."); return; }
    if (!passInput) { setLoginError("Parol kiriting."); return; }
    const correct = passwords?.[selUser];
    // If no password has been set yet (first run), block and direct to admin
    if (!correct) { setLoginError("Parol belgilanmagan. Administrator bilan bog'laning."); return; }
    if (passInput !== correct) { setLoginError("Parol noto'g'ri."); return; }
    const user = users.find(u => u.id === selUser);
    setMe(user);
    setLoginError("");
    setPassInput("");
  };

  const handleLogout = () => {
    setMe(null);
    setMessages([]);
    setSelUser("");
    setPassInput("");
    setScreen("login");
    setActiveTab("all");
    setToUser("all");
  };

  const handleChangePassword = async () => {
    setCpError(""); setCpSuccess("");
    const correct = passwords?.[me.id];
    if (correct && oldPass !== correct) { setCpError("Joriy parol noto'g'ri."); return; }
    if (newPass.length < 8) { setCpError("Yangi parol kamida 8 ta belgi bo'lsin."); return; }
    if (newPass !== newPass2) { setCpError("Yangi parollar mos emas."); return; }
    const updated = { ...passwords, [me.id]: newPass };
    await storageSet(PASSWD_KEY, updated);
    setPasswords(updated);
    setCpSuccess("Parol muvaffaqiyatli o'zgartirildi!");
    setOldPass(""); setNewPass(""); setNewPass2("");
  };

  // ── Chat handlers ──────────────────────────────────────────────
  const sendMessage = async () => {
    if (!input.trim() || !me || sending) return;
    setSending(true);
    const recipient = activeTab !== "all" ? activeTab : toUser;
    const newMsg = { id: Date.now() + Math.random(), from: me.id, to: recipient, text: input.trim(), ts: Date.now() };
    const current = (await storageGet(MSGS_KEY)) || [];
    const updated = [...current, newMsg];
    await storageSet(MSGS_KEY, updated);
    setMessages(updated);
    setInput("");
    setSending(false);
    inputRef.current?.focus();
  };

  const visibleMessages = messages.filter(m => {
    if (activeTab === "all") return m.to === "all";
    return (m.from === me?.id && m.to === activeTab) || (m.from === activeTab && m.to === me?.id);
  });
  const unreadFrom = uid => messages.filter(m => m.from === uid && m.to === me?.id).length;
  const otherUsers = users.filter(u => u.id !== me?.id);
  const activePerson = activeTab !== "all" ? users.find(u => u.id === activeTab) : null;

  // ── Loading state while users fetch ───────────────────────────
  if (usersLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span className="loading loading-spinner text-success w-12" />
      </div>
    );
  }

  // ── Hard error — do not fall back to fake data ─────────────────
  if (usersError) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ fontSize: 32 }}>⚠️</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)" }}>Foydalanuvchilarni yuklashda xatolik</div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", maxWidth: 320, textAlign: "center" }}>{usersError}</div>
        <button
          onClick={() => { setUsersLoading(true); setUsersError(null); window.location.reload(); }}
          style={{ marginTop: 8, padding: "10px 24px", borderRadius: 10, background: "oklch(var(--p))", color: "#fff", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  // ── LOGIN ────────────────────────────────────────────────────
  if (!me && screen === "login") {
    return (
      <AuthCard users={users}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--color-text-primary)", marginBottom: 4 }}>Kirish</div>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 28 }}>Akkauntingizga kiring</div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", letterSpacing: 0.6, textTransform: "uppercase", marginBottom: 6 }}>Foydalanuvchi</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
            {users.map(u => (
              <button key={u.id} onClick={() => { setSelUser(u.id); setLoginError(""); }} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                padding: "10px 6px", borderRadius: 12,
                border: selUser === u.id ? `2px solid ${u.color}` : "0.5px solid var(--color-border-tertiary)",
                background: selUser === u.id ? u.color.replace(')', ' / 0.07)') : "var(--color-background-secondary)",
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", transition: "all 0.12s",
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: u.color.replace(')', ' / 0.13)'), border: `1.5px solid ${u.color.replace(')', ' / 0.33)')}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: u.color, fontWeight: 700, fontSize: 11,
                }}>{initials(u.name)}</div>
                <span style={{ fontSize: 11, fontWeight: 500, color: selUser === u.id ? u.color : "var(--color-text-secondary)", textAlign: "center", lineHeight: 1.2 }}>{u.name}</span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Parol"
          type="password"
          value={passInput}
          onChange={e => { setPassInput(e.target.value); setLoginError(""); }}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          placeholder="Parolingizni kiriting"
          error={loginError}
        />

        <Btn onClick={handleLogin} color={selUser ? users.find(u => u.id === selUser)?.color || "oklch(var(--p))" : "oklch(var(--p))"}>
          Kirish
        </Btn>

        <div style={{
          marginTop: 16, padding: "14px 16px", borderRadius: 10,
          background: "var(--color-background-secondary)",
          border: "0.5px solid var(--color-border-tertiary)",
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--color-text-secondary)", letterSpacing: 0.5, marginBottom: 7, textTransform: "uppercase" }}>Eslatma</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.75 }}>
            Birinchi marta kirishda parolni administrator beradi.
            Parolni keyinchalik o'zgartirish uchun chatga kirib, yuqori chap burchakdagi{" "}
            <code style={{ background: "var(--color-background-tertiary)", border: "0.5px solid var(--color-border-secondary)", borderRadius: 5, padding: "1px 7px", fontSize: 12, fontFamily: "monospace", color: "var(--color-text-primary)" }}>Parol</code>
            {" "}tugmasini bosing.
          </div>
        </div>
      </AuthCard>
    );
  }

  // ── CHANGE PASSWORD ──────────────────────────────────────────
  if (me && screen === "changePassword") {
    return (
      <AuthCard users={users}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <Avatar user={me} size={40} />
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--color-text-primary)" }}>Parolni o'zgartirish</div>
            <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>{me.name}</div>
          </div>
        </div>

        <Input label="Joriy parol" type="password" value={oldPass} onChange={e => { setOldPass(e.target.value); setCpError(""); setCpSuccess(""); }} placeholder="Hozirgi parolingiz" autoFocus />
        <Input label="Yangi parol" type="password" value={newPass} onChange={e => { setNewPass(e.target.value); setCpError(""); setCpSuccess(""); }} placeholder="Yangi parol (kamida 8 belgi)" />
        <Input label="Yangi parolni tasdiqlang" type="password" value={newPass2} onChange={e => { setNewPass2(e.target.value); setCpError(""); setCpSuccess(""); }} onKeyDown={e => e.key === "Enter" && handleChangePassword()} placeholder="Qayta kiriting" error={cpError} />

        {cpSuccess && <div style={{ color: "oklch(var(--su))", fontSize: 13, fontWeight: 600, marginBottom: 14, padding: "10px 14px", background: "oklch(var(--su) / 0.07)", borderRadius: 10, border: "0.5px solid oklch(var(--su) / 0.27)" }}>{cpSuccess}</div>}

        <Btn onClick={handleChangePassword} color={me.color}>Saqlash</Btn>
        <div style={{ marginTop: 10 }}>
          <Btn variant="ghost" onClick={() => { setScreen("chat"); setCpError(""); setCpSuccess(""); setOldPass(""); setNewPass(""); setNewPass2(""); }}>Chatga qaytish</Btn>
        </div>
      </AuthCard>
    );
  }

  // ── CHAT ─────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: "var(--color-background-tertiary)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <div style={{
        width: "min(920px, 98vw)", height: "min(670px, 96vh)",
        display: "flex", borderRadius: 20, overflow: "hidden",
        border: "0.5px solid var(--color-border-tertiary)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
      }}>

        {/* SIDEBAR */}
        <div style={{ width: 230, flexShrink: 0, background: "var(--color-background-secondary)", borderRight: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "14px 12px", borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar user={me} size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{me.name}</div>
              <div style={{ fontSize: 11, color: "oklch(var(--su))" }}>online</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <button onClick={() => setScreen("changePassword")} style={{
                background: "var(--color-background-tertiary)",
                border: "0.5px solid var(--color-border-secondary)",
                borderRadius: 7, color: "var(--color-text-secondary)",
                cursor: "pointer", fontSize: 11, fontWeight: 600,
                padding: "4px 8px", fontFamily: "'DM Sans', sans-serif",
                whiteSpace: "nowrap",
              }}>Parol</button>
              <button onClick={handleLogout} style={{
                background: "transparent",
                border: "0.5px solid oklch(var(--er) / 0.20)",
                borderRadius: 7, color: "oklch(var(--er))",
                cursor: "pointer", fontSize: 11, fontWeight: 600,
                padding: "4px 8px", fontFamily: "'DM Sans', sans-serif",
                whiteSpace: "nowrap",
              }}>Chiqish</button>
            </div>
          </div>

          <div style={{ padding: "10px 10px 4px" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-tertiary)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4, padding: "0 4px" }}>Guruh</div>
            <SideItem active={activeTab === "all"} color="oklch(var(--p))" label="Umumiy chat" icon="G" onClick={() => { setActiveTab("all"); setToUser("all"); }} />
          </div>

          <div style={{ padding: "10px 10px 4px", flex: 1, overflowY: "auto" }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "var(--color-text-tertiary)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4, padding: "0 4px" }}>Shaxsiy</div>
            {otherUsers.map(u => (
              <SideItem key={u.id} active={activeTab === u.id} color={u.color} label={u.name} icon={initials(u.name)} badge={unreadFrom(u.id)} onClick={() => { setActiveTab(u.id); setToUser(u.id); }} />
            ))}
          </div>
        </div>

        {/* MAIN */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--color-background-primary)" }}>
          <div style={{ height: 54, borderBottom: "0.5px solid var(--color-border-tertiary)", display: "flex", alignItems: "center", padding: "0 18px", gap: 12, background: "var(--color-background-secondary)" }}>
            {activeTab === "all" ? (
              <>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: "oklch(var(--p) / 0.13)", border: "1.5px solid oklch(var(--p) / 0.27)", display: "flex", alignItems: "center", justifyContent: "center", color: "oklch(var(--p))", fontWeight: 700, fontSize: 11 }}>G</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>Umumiy guruh</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{users.length} a'zo</div>
                </div>
              </>
            ) : (
              <>
                <Avatar user={activePerson} size={30} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>{activePerson?.name}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>Shaxsiy</div>
                </div>
              </>
            )}
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
            {visibleMessages.length === 0 && (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-text-tertiary)", fontSize: 13, flexDirection: "column", gap: 8, paddingTop: 60 }}>
                <div style={{ fontSize: 26 }}>{activeTab === "all" ? "💬" : "🔒"}</div>
                <div>{activeTab === "all" ? "Hali xabar yo'q" : `${activePerson?.name} bilan shaxsiy suhbat`}</div>
              </div>
            )}
            {visibleMessages.map(m => {
              const sender = users.find(u => u.id === m.from);
              const isMe = m.from === me.id;
              const toP = m.to !== "all" ? users.find(u => u.id === m.to) : null;
              return (
                <div key={m.id} style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: 7 }}>
                  {!isMe && <Avatar user={sender} size={24} />}
                  <div style={{ maxWidth: "64%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                    {!isMe && <span style={{ fontSize: 11, fontWeight: 600, color: sender?.color, marginBottom: 2, paddingLeft: 2 }}>{sender?.name}</span>}
                    <div style={{
                      background: isMe ? me.color : "var(--color-background-secondary)",
                      borderRadius: isMe ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                      padding: "8px 13px", color: isMe ? "#fff" : "var(--color-text-primary)",
                      fontSize: 14, lineHeight: 1.5,
                      border: isMe ? "none" : "0.5px solid var(--color-border-tertiary)",
                    }}>
                      {toP && <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 3 }}>→ {toP.name}</div>}
                      {m.text}
                    </div>
                    <span style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginTop: 2 }}>{timeStr(m.ts)}</span>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", padding: "10px 14px", background: "var(--color-background-secondary)", display: "flex", alignItems: "center", gap: 8 }}>
            {activeTab === "all" && (
              <div style={{ position: "relative", flexShrink: 0 }}>
                <button onClick={() => setDropOpen(o => !o)} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 12px", borderRadius: 9,
                  border: "0.5px solid var(--color-border-secondary)",
                  background: "var(--color-background-primary)",
                  color: "var(--color-text-primary)",
                  fontSize: 12, fontWeight: 500, fontFamily: "'DM Sans', sans-serif",
                  cursor: "pointer", whiteSpace: "nowrap",
                }}>
                  {toUser === "all" ? (
                    <><div style={{ width: 8, height: 8, borderRadius: "50%", background: "oklch(var(--p))", flexShrink: 0 }} />Hammaga</>
                  ) : (
                    <><div style={{ width: 8, height: 8, borderRadius: "50%", background: users.find(u => u.id === toUser)?.color, flexShrink: 0 }} />{users.find(u => u.id === toUser)?.name}</>
                  )}
                  <span style={{ fontSize: 9, color: "var(--color-text-tertiary)", marginLeft: 2 }}>{dropOpen ? "▲" : "▼"}</span>
                </button>
                {dropOpen && (
                  <div style={{
                    position: "absolute", bottom: "calc(100% + 6px)", left: 0,
                    background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-secondary)",
                    borderRadius: 10, padding: "4px", minWidth: 160,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)", zIndex: 100,
                  }}>
                    {[{ id: "all", name: "Hammaga", color: "oklch(var(--p))" }, ...otherUsers].map(u => (
                      <button key={u.id} onClick={() => { setToUser(u.id); setDropOpen(false); }} style={{
                        display: "flex", alignItems: "center", gap: 9,
                        width: "100%", padding: "8px 10px", borderRadius: 7,
                        border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13, fontWeight: toUser === u.id ? 600 : 400,
                        background: toUser === u.id ? u.color.replace(')', ' / 0.08)') : "transparent",
                        color: toUser === u.id ? u.color : "var(--color-text-primary)",
                        textAlign: "left",
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: u.color, flexShrink: 0 }} />
                        {u.id === "all" ? "Hammaga" : u.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !sending && sendMessage()}
              placeholder={activeTab !== "all" ? `${activePerson?.name}ga yoz...` : toUser === "all" ? "Hammaga xabar yoz..." : `${users.find(u => u.id === toUser)?.name}ga shaxsiy...`}
              style={{
                flex: 1, padding: "9px 13px", borderRadius: 10,
                border: "0.5px solid var(--color-border-secondary)", fontSize: 14,
                fontFamily: "'DM Sans', sans-serif",
                background: "var(--color-background-primary)",
                color: "var(--color-text-primary)", outline: "none",
              }}
            />
            <button onClick={sendMessage} disabled={sending || !input.trim()} style={{
              background: me.color, border: "none", borderRadius: 10,
              color: "#fff", padding: "9px 18px", fontSize: 13, fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: sending || !input.trim() ? "not-allowed" : "pointer",
              opacity: sending || !input.trim() ? 0.4 : 1, flexShrink: 0,
            }}>
              {sending ? "..." : "Yuborish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}