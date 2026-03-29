import React from "react";
import { NavLink } from "react-router-dom";
import {
    House,
    Menu,
    UserRoundPlus,
    LayoutGrid,
    Pencil,
    Coffee,
    ChartColumn,
    FileChartPie,
    User,
    Calendar,
    MessageCircleMore,
    WalletMinimal,



} from "lucide-react";

const linkClass = ({ isActive }) =>
    `px-3 py-3 w-[90%] rounded-xl font-semibold flex items-center gap-3 ml-3
   ${isActive ? " bg-primary/10 text-primary " : " text-base-content/60 "}`;

const Sidebar = () => {
    return (
        <div className="  drawer-open">
            <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />

            <div className="drawer-side">
                <label htmlFor="my-drawer-3" className="drawer-overlay"></label>

                <ul className=" bg-base-100 min-h-full w-70 p-4 ">
                    <div className="mb-6 text-base-content flex flex-col ml-3">
                        <h1 className="text-3xl font-bold pb-3 ">Sedap<span className="text-primary">.</span></h1>
                        <p className="text-sm opacity-80 font-semibold">Modern Admin Dashboard</p>
                    </div>

                    <ul className="flex flex-col gap-2">
                        <NavLink to="/" end className={linkClass} >
                            <House className="w-5 h-5" />
                            <span className="text-md font-bold">Dashboard</span>
                        </NavLink>
                        <NavLink to="/orders" className={linkClass}>
                            <Menu className="w-5 h-5" />
                            <span className="text-md font-bold">Order List</span>
                        </NavLink>
                        <NavLink to="/ordersDetail" className={linkClass}>
                            <FileChartPie className="w-5 h-5" />

                            <span className="text-md font-bold">Order Detail</span>
                        </NavLink>

                        <NavLink to="/customers" className={linkClass}>
                            <UserRoundPlus className="w-5 h-5" />
                            <span className="text-md font-bold">Customer</span>
                        </NavLink>



                        <NavLink to="/analytics" className={linkClass}>
                            <ChartColumn className="w-5 h-5" />
                            <span className="text-md font-bold">Analytics</span>
                        </NavLink>

                        <NavLink to="/reviews" className={linkClass}>
                            <Pencil className="w-5 h-5" />
                            <span className="text-md font-bold">Reviews</span>
                        </NavLink>

                        <NavLink to="/foods" className={linkClass}>
                            <Coffee className="w-5 h-5" />
                            <span className="text-md font-bold">Foods</span>
                        </NavLink>

                        <NavLink to="/customersDetail" className={linkClass}>
                            <User className="w-5 h-5" />


                            <span className="text-md font-bold">Customer Detail</span>
                        </NavLink>
                        <NavLink to="/calendar" className={linkClass}>
                            <Calendar className="w-5 h-5" />


                            <span className="text-md font-bold">Calendar</span>
                        </NavLink>
                        <NavLink to="/chat" className={linkClass}>
                            <MessageCircleMore className="w-5 h-5" />


                            <span className="text-md font-bold">Chat</span>
                        </NavLink>
                        <NavLink to="/wallet" className={linkClass}>
                            <WalletMinimal className="w-5 h-5" />


                            <span className="text-md font-bold">Wallet</span>
                        </NavLink>
                    </ul>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
