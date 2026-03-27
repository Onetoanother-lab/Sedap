import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";

import './index.css';

import OrderList from "./pages/OrderList";
import Dashboard from "./pages/Dashboard";
import Customer from "./pages/Customer";
import Foods from "./pages/Foods";
import Rewievs from "./pages/Rewievs";
import Analitics from "./pages/Analitics";
import OrderDetail from "./pages/OrderDetail";
import FoodsDetail from "./pages/FoodsDetail";
import Chat from "./pages/Chat";

import Calendar from "./pages/Calendar";
import CustomerDetail from "./pages/CustomerDetail";
import FinancialDashboard from "./pages/Walet";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "foods",
        element: <Foods />,
      },
        {
        path: "orders",
        element: <OrderList />, 
      },
        {
        path: "customers",
        element: <Customer />, 
      },
       {
        path: "ordersDetail",
        element: <OrderDetail />, 
      },
        
         {
        path: "analytics",
        element: <Analitics />, 
      },
         {
        path: "reviews",
        element: <Rewievs />, 
      },
         {
        path: "foods",
        element: <Foods />, 
      },
          {
        path: "foodsDetail",
        element: <FoodsDetail />, 
      },
          {
        path: "chat",
        element: <Chat />, 
      },
          {
        path: "walet",
        element: < FinancialDashboard/>, 
      },
          {
        path: "Calentar",
        element: <Calendar />, 
      },
            {
        path: "customersDetail",
        element: <CustomerDetail />, 
      },
    
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
