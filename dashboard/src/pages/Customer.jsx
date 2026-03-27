import CustomerTable from '../components/CustomerTable';

function Customer() {
  return (
    <div className="">
      <div className="">
        <h1 className="mb-8 text-3xl font-bold text-base-content">
          Customers
        </h1>
        <CustomerTable />
      </div>
    </div>
  );
}

export default Customer;
