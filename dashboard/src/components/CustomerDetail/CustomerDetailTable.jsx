import React from 'react'

const CustomerDetailTable = () => {
    return (
        <>
            <div className="bg-white rounded-2xl p-6 mt-3 min-w-[45%]">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-black">Most Ordered Food</h2>
                        <p className="text-sm text-gray-400">
                            Lorem ipsum dolor sit amet, consectetur
                        </p>
                    </div>

                    <div className="join gap-1 bg-gray-200 p-1 rounded-2xl">
                        <button className="btn btn-sm join-item btn-active text-gray-400 bg-white rounded-2xl">Monthly</button>
                        <button className="btn btn-sm join-item text-gray-400 bg-white rounded-2xl">Weekly</button>
                        <button className="btn btn-sm join-item text-gray-400 bg-white rounded-2xl">Daily</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="table">
                        <tbody>
                            <tr>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-14 h-14">
                                                <img src="https://images.unsplash.com/photo-1589302168068-964664d93dc0" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="font-semibold text-black">
                                                Medium Spicy Spaghetti Italiano
                                            </div>
                                            <div className="text-xs text-blue-500 font-medium">
                                                SPAGETHI
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Serves for 4 Person | 24mins
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="text-right font-semibold text-black">$12.56</td>
                                <td className="text-right">
                                    <button className="btn btn-ghost btn-xs text-black text-lg">⋯</button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-14 h-14">
                                                <img src="https://www.simplyrecipes.com/recipes/spaghetti_and_meatballs/" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="font-semibold text-black">
                                                Medium Spicy Spaghetti Italiano
                                            </div>
                                            <div className="text-xs text-blue-500 font-medium">
                                                SPAGETHI
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Serves for 4 Person | 24mins
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="text-right font-semibold text-black">$12.56</td>
                                <td className="text-right">
                                    <button className="btn btn-ghost btn-xs text-black text-lg">⋯</button>
                                </td>
                            </tr> <tr>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-14 h-14">
                                                <img src="https://images.unsplash.com/photo-1589302168068-964664d93dc0" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="font-semibold text-black">
                                                Medium Spicy Spaghetti Italiano
                                            </div>
                                            <div className="text-xs text-blue-500 font-medium">
                                                SPAGETHI
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Serves for 4 Person | 24mins
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="text-right font-semibold text-black">$12.56</td>
                                <td className="text-right">
                                    <button className="btn btn-ghost btn-xs text-black text-lg">⋯</button>
                                </td>
                            </tr> <tr>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-14 h-14">
                                                <img src="" />
                                                <img src="https://pixnio.com/free-images/food-and-drink/pizza/pizza.jpg" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="font-semibold text-black">
                                                Medium Spicy Spaghetti Italiano
                                            </div>
                                            <div className="text-xs text-blue-500 font-medium">
                                                SPAGETHI
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Serves for 4 Person | 24mins
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="text-right font-semibold text-black">$12.56</td>
                                <td className="text-right">
                                    <button className="btn btn-ghost btn-xs text-black text-lg">⋯</button>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-14 h-14">
                                                <img src="https://images.unsplash.com/photo-1603133872878-684f208fb84b" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="font-semibold text-black">
                                                Medium Spicy Spaghetti Italiano
                                            </div>
                                            <div className="text-xs text-blue-500 font-medium">
                                                SPAGETHI
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                Serves for 4 Person | 24mins
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="text-right font-semibold text-black">$12.56</td>
                                <td className="text-right">
                                    <button className="btn btn-ghost btn-xs text-lg text-black">⋯</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>


                <div
                    style={{
                        background: "#fff",
                        borderRadius: "20px",
                        padding: "24px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
                        height: "400px",
                    }}
                >
                    <h3 style={{ marginBottom: "6px" }}>Most Liked Food</h3>
                    <p style={{ color: "#999", marginBottom: "20px" }}>
                        Lorem ipsum dolor sit amet, consectetur
                    </p>


                </div>


            </div>
        </>
    )
}

export default CustomerDetailTable