import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar'
import Aside from './components/Aside'

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className='flex flex-1 overflow-hidden'>
        <Aside />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default App