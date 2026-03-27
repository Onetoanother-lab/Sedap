import { useState } from 'react'
import { Outlet } from "react-router-dom";
import './App.css'
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Rewievs from './pages/Rewievs';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  
  return (
    <div className="min-h-screen bg-base-300 ">
      <div className="flex  gap-8  w-full">
        <Sidebar />

        <div className="flex flex-col  min-w-[80%]">
          <Navbar />
          <Outlet />
        </div>

     
       <ToastContainer />

      </div>
    </div>
  );
}

export default App;
