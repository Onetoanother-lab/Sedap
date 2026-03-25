import React from 'react';

export default function Invoice({ groupedItems, subTotal, TAX, DISCOUNT, TIPS, total, customerName, setCustomerName, address, setAddress, onCheckout, onSubmitOrder }) {
  return (
    <div className="bg-base-100 shadow-2xl flex flex-col shrink-0 w-96 h-full overflow-y-auto">
      <div className="flex flex-col p-6 h-full">
        <h2 className="font-bold text-2xl text-base-content mb-6">Invoice</h2>

        {/* Items */}
        <div className="bg-accent rounded-2xl p-4 mb-6 flex-1 overflow-y-auto min-h-40">
          {groupedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 gap-3 opacity-60">
              <svg className="w-12 h-12 text-accent-content" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h11M10 19a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm6 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" />
              </svg>
              <p className="text-accent-content text-sm font-semibold">Cart is empty</p>
              <p className="text-accent-content/60 text-xs text-center">Click on a product to add it</p>
            </div>
          ) : (
            groupedItems.map(item => (
              <div key={item.id} className="flex items-start gap-3 mb-4 pb-4 border-b border-accent last:border-0 last:mb-0 last:pb-0">
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-accent-content font-bold text-sm truncate">{item.name}</p>
                  <p className="text-accent-content/60 text-xs mt-0.5">×{item.qty}</p>
                  <span className="badge badge-outline badge-warning text-xs mt-1 font-bold">{item.category}</span>
                </div>
                <span className="font-bold text-warning shrink-0 text-sm">
                  {(item.price * item.qty).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Payment breakdown */}
        <div className="space-y-3 mb-6">
          <h3 className="font-bold text-base-content mb-3">Payment</h3>
          <div className="flex justify-between text-sm text-base-content/70">
            <span>Sub Total:</span>
            <span className="font-semibold text-base-content">{subTotal.toLocaleString()} UZS</span>
          </div>
          <div className="flex justify-between text-sm text-base-content/70">
            <span>Tax:</span>
            <span className="font-semibold text-base-content">{TAX.toLocaleString()} UZS</span>
          </div>
          <div className="flex justify-between text-sm text-base-content/70">
            <span>Discount:</span>
            <span className="font-semibold text-error">-{DISCOUNT.toLocaleString()} UZS</span>
          </div>
          <div className="flex justify-between text-sm text-base-content/70 pb-3 border-b border-base-300">
            <span>Tips:</span>
            <span className="font-semibold text-base-content">{TIPS.toLocaleString()} UZS</span>
          </div>
          <div className="flex justify-between pt-1">
            <h3 className="font-bold text-lg text-base-content">Total</h3>
            <h3 className="font-bold text-lg text-warning">{total.toLocaleString()} UZS</h3>
          </div>
        </div>

        <button className="btn bg-accent border-none text-neutral w-full" onClick={onCheckout}>
          Checkout
        </button>

        <dialog id="my_modal_2" className="modal">
          <div className="modal-box bg-base-100 rounded-2xl p-8 max-w-md w-11/12 mx-auto">
            <h3 className="font-bold text-2xl mb-6 text-center text-base-content">Almost ready</h3>
            <div className="space-y-4">
              <input type="text" className="input input-bordered w-full rounded-xl" placeholder="Enter your name…"
                value={customerName} onChange={e => setCustomerName(e.target.value)} />
              <input type="text" className="input input-bordered w-full rounded-xl" placeholder="Enter delivery address…"
                value={address} onChange={e => setAddress(e.target.value)} />
              <button className="btn bg-accent border-none text-neutral w-full rounded-xl mt-2" onClick={onSubmitOrder}>
                Submit Order
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop bg-black/50"><button>close</button></form>
        </dialog>
      </div>
    </div>
  );
}