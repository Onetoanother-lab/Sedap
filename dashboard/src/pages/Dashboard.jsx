import Monthly from "../components/Monthly";
import Branch from "../components/Branch";
import StatCard from "../components/StatCard";


const Dashboard = () => {
  
  return (
    <div className="pt-4">

      
      {/* Header */}
      <h1 className="text-2xl text-primary font-bold">Dashboard</h1>
      <p className="text-md font-semibold text-primary mb-10">
        Your order history will appear here.
      </p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard title="Total Orders" value={8} percent={4} />
        <StatCard title="Total Canceled" value={0} percent={4} />
        <StatCard title="Total Delivered" value={0} percent={4} />
        <StatCard title="Income Profit" value={0} percent={4} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Monthly />
        </div>
        <Branch />
      </div>
    </div>
  );
};

export default Dashboard;
