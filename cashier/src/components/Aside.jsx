import React from 'react'
import { GiKnifeFork } from 'react-icons/gi'
import { RxAvatar } from 'react-icons/rx'
import { Link, useLocation } from 'react-router-dom'

export default function Aside() {
  const { pathname } = useLocation()

  function NavBtn({ to, Icon, label }) {
    const active = pathname.includes(to)
    return (
      <Link to={to} className="flex justify-center w-full">
        <button className={`flex flex-col w-16 h-16 items-center justify-center rounded-2xl gap-1 text-xs font-bold transition-all
          ${active ? 'bg-accent text-neutral' : 'bg-base-200 text-base-content/50 hover:bg-accent/20 hover:text-base-content'}`}>
          <Icon size={18} />
          <span>{label}</span>
        </button>
      </Link>
    )
  }

  return (
    <aside className="bg-base-300 border-r border-base-200 w-24 shrink-0 flex flex-col items-center pt-6 gap-3">
      <NavBtn to="menu"    Icon={GiKnifeFork} label="Menu"    />
      <NavBtn to="profile" Icon={RxAvatar}    label="Profile" />
    </aside>
  )
}