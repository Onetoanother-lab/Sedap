import React, { useState, useEffect } from 'react';

// ─── Theme Cycle Hook ─────────────────────────────────────────────────────────
const THEMES = ['light', 'dark', 'system'];

function useThemeCycle() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'system'
  );

  useEffect(() => {
    localStorage.setItem('theme', theme);

    const apply = (resolved) =>
      document.documentElement.setAttribute('data-theme', resolved);

    if (theme !== 'system') {
      apply(theme);
      return;
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    apply(mq.matches ? 'dark' : 'light');

    const handler = (e) => apply(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const cycleTheme = () => {
    const next = THEMES[(THEMES.indexOf(theme) + 1) % THEMES.length];
    setTheme(next);
  };

  return { theme, cycleTheme };
}

// ─── Theme Button ─────────────────────────────────────────────────────────────
const THEME_CONFIG = {
  light: {
    label: 'Light',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 20, height: 20 }}>
        <circle cx="12" cy="12" r="4" />
        <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    ),
    style: {
      background: '#ffffff',
      border: '2px solid #4db6ac',
      color: '#4db6ac',
      borderRadius: '14px',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    },
  },
  dark: {
    label: 'Dark',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 20, height: 20 }}>
        <path strokeLinecap="round" d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z" />
      </svg>
    ),
    style: {
      background: '#0f1923',
      border: '2px solid #4db6ac',
      color: '#4db6ac',
      borderRadius: '14px',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    },
  },
  system: {
    label: 'System',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 20, height: 20 }}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path strokeLinecap="round" d="M8 21h8M12 17v4" />
      </svg>
    ),
    style: {
      
      border: '2px solid #4db6ac',
      color: '#4db6ac',
      borderRadius: '14px',
      padding: '8px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'opacity 0.2s',
    },
  },
};

function ThemeButton() {
  const { theme, cycleTheme } = useThemeCycle();
  const config = THEME_CONFIG[theme];

  return (
    <button
      onClick={cycleTheme}
      title={`Theme: ${config.label} — click to cycle`}
      style={config.style}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
    >
      {config.icon}
      <span>{config.label}</span>
    </button>
  );
}

// ─── Original Navbar (zero changes below this line) ───────────────────────────
const Navbar = () => {
  return (
    <div className="flex items-center  justify-between  max-h-[10%] p-4 w-full font-sans">

      {/* 1. Поисковая строка */}
      <div className="relative flex-grow max-w-2xl">
        <input
          type="search"
          placeholder="Search here"
          className="w-full bg-base-100 py-3 px-6 rounded-xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)] focus:outline-none  "
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
      </div>

      {/* 2. Правая часть (Иконки и Профиль) */}
      <div className="flex items-center space-x-4 ml-8">

        {/* Блок иконок */}
        <div className="flex space-x-3">
          {/* Уведомления */}
          <IconButton count="21" color="text-blue-500" bgColor="bg-blue-100" badgeColor="bg-blue-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
          </IconButton>

          {/* Сообщения */}
          <IconButton count="53" color="text-blue-400" bgColor="bg-blue-100" badgeColor="bg-blue-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </IconButton>

          {/* Подарки */}
          <IconButton count="15" color="text-indigo-500" bgColor="bg-indigo-100" badgeColor="bg-indigo-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H4.5a1.5 1.5 0 0 1-1.5-1.5v-8.25m18 0a3 3 0 0 0-3-3H12m9 3a3 3 0 0 1-3 3H12m-9-3a3 3 0 0 1 3-3H12m-9 3a3 3 0 0 0 3 3H12M9 3.75h6" />
          </IconButton>

          {/* Настройки */}
          <IconButton count="19" color="text-red-400" bgColor="bg-red-100" badgeColor="bg-red-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" />
          </IconButton>
        </div>

        {/* ↓ ADDED: single cycling theme button */}
        <ThemeButton />

        {/* Вертикальная черта */}
        <div className="h-10 w-[1.5px] bg-gray-200 mx-2"></div>

        {/* Профиль */}
        <div className="flex items-center space-x-3 cursor-pointer">
          <div className="text-right">
            <p className="text-gray-400 text-[13px] leading-tight">LoveStore,</p>
            <p className="text-gray-700 font-bold text-[15px] leading-tight">Karom + Mirjoja = Love</p>
          </div>
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент иконки с индикатором (unchanged)
const IconButton = ({ children, count, color, bgColor, badgeColor }) => (
  <div className={`relative p-3 ${bgColor} ${color} rounded-2xl cursor-pointer hover:scale-105 transition-transform`}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
      {children}
    </svg>
    <span className={`absolute -top-1.5 -right-1.5 ${badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm`}>
      {count}
    </span>
  </div>
);

export default Navbar;