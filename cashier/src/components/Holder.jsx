import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from './Card';
import CategoryFilter, { getIcon, getProductCount } from './Category';
import Invoice from './Invoice';
import { Toaster } from 'react-hot-toast';
import api from '../api/axios';

const TAX      = 2000;
const DISCOUNT = 5000;
const TIPS     = 1000;

export default function CardCat() {
  const [products, setProducts]           = useState([]);
  const [category, setCategory]           = useState('All');
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [items, setItems]                 = useState([]);
  const [customerName, setCustomerName]   = useState('');
  const [address, setAddress]             = useState('');

  useEffect(() => { fetchProducts(); fetchCartItems(); }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
    } catch (err) {
      alert(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCartItems = async () => {
    try {
      const { data } = await api.get('/invoice');
      setItems(Array.isArray(data) ? data : []);
    } catch { setItems([]); }
  };

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = useMemo(() => products.filter(p => {
    const matchCat    = category === 'All' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                        p.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [products, category, search]);

  const groupedItems = useMemo(() => {
    const map = {};
    items.forEach(item => {
      const key = item.productId;
      map[key] = map[key] ? { ...map[key], qty: map[key].qty + 1 } : { ...item, qty: 1 };
    });
    return Object.values(map);
  }, [items]);

  const subTotal = useMemo(() => groupedItems.reduce((s, i) => s + i.price * i.qty, 0), [groupedItems]);
  // Fix: no negative total when cart is empty
  const total = subTotal > 0 ? Math.max(0, subTotal + TAX + TIPS - DISCOUNT) : 0;

  const addToCart = async (product) => {
    try { await api.post('/invoice', product); fetchCartItems(); }
    catch (err) { console.error('Failed to add to cart:', err); }
  };

  const handleOrderSubmit = async () => {
    if (!customerName || !address) { alert('Please enter name and address'); return; }
    const orderData = { customerName, address, items: groupedItems, subTotal, tax: TAX, discount: DISCOUNT, tips: TIPS, total, createdAt: new Date().toISOString() };
    try {
      await api.post('/orderlist', orderData);
      await api.delete('/invoice');
      setItems([]); setCustomerName(''); setAddress('');
      document.getElementById('my_modal_2').close();
      alert('Purchase completed');
    } catch (err) { alert(err.message || 'Error during purchase'); }
  };

  if (loading) return (
    <div className="fixed inset-0 bg-base-300 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="loading loading-spinner loading-lg text-accent" />
        <p className="text-primary text-xl font-semibold">Loading products…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-300 flex">
      <Toaster position="top-right" />

      {/* Products — flex-1 so invoice sits beside it naturally */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto">
          <CategoryFilter
            categories={categories} selectedCategory={category}
            onCategoryChange={setCategory} search={search} onSearchChange={setSearch}
            getProductCount={(cat) => getProductCount(cat, products)} getIcon={getIcon}
          />
          <h2 className="text-xl font-semibold text-base-content mb-4">All Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="alert bg-neutral text-neutral-content shadow-lg mt-4">
              <div>
                <p className="font-semibold">No products found</p>
                <p className="text-sm opacity-70">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice — sibling in the flex row, no fixed/overlap */}
      <Invoice
        groupedItems={groupedItems} subTotal={subTotal}
        TAX={TAX} DISCOUNT={DISCOUNT} TIPS={TIPS} total={total}
        customerName={customerName} setCustomerName={setCustomerName}
        address={address} setAddress={setAddress}
        onCheckout={() => document.getElementById('my_modal_2').showModal()}
        onSubmitOrder={handleOrderSubmit}
      />
    </div>
  );
}