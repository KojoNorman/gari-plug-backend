import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// 🛠️ Helpers
const formatDateTime = (dateString) => {
  if (!dateString) return "Time Unknown";
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// 🛠️ OrderCard
const OrderCard = ({ order, nextStatus, buttonText, buttonColor, onUpdateStatus, onCancelOrder }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition">
    <div className="flex justify-between items-start mb-3">
      <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded border border-gray-200 shadow-sm">
        🕒 {formatDateTime(order.createdAt)}
      </span>
      <div className="flex items-center gap-3">
        <span className="font-black text-lg text-veroBrown">GHS {(order.totalPrice || 0).toFixed(2)}</span>
        {(order.paymentStatus === 'Pending' || order.paymentStatus === 'Processing') && (
          <button onClick={() => onCancelOrder(order._id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition font-bold" title="Cancel & Refund Stock">✖</button>
        )}
      </div>
    </div>
    <h3 className="font-bold text-gray-800 text-lg">{order.user?.fullName || "Unknown Customer"}</h3>
    <p className="text-sm text-gray-500 mb-3">📍 {order.deliveryZone || "N/A"} - {order.exactLocation || "N/A"}</p>
    <div className="bg-gray-50 rounded p-2 mb-3 space-y-1">
      {(order.products || []).map((item, idx) => (
        <p key={idx} className="text-sm text-gray-700">• <span className="font-bold">{item.quantity || 1}x</span> {item.product?.name || "Deleted Item"}</p>
      ))}
    </div>
    <div className="mb-4">
      {order.paymentMethod === 'MoMo (Paid)' ? (
        <div className="bg-green-100 border border-green-300 text-green-800 text-xs font-black px-3 py-2 rounded text-center uppercase tracking-wider">✅ PAID VIA MOMO - DO NOT COLLECT CASH</div>
      ) : (
        <div className="bg-red-100 border border-red-300 text-red-800 text-xs font-black px-3 py-2 rounded text-center uppercase tracking-wider animate-pulse">⚠️ UNPAID - COLLECT GHS {(order.totalPrice || 0).toFixed(2)}</div>
      )}
    </div>
    {nextStatus && (
      <button onClick={() => onUpdateStatus(order._id, nextStatus)} className={`w-full text-white font-bold py-2 rounded transition shadow-sm ${buttonColor}`}>{buttonText}</button>
    )}
  </div>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dispatch'); 
  const navigate = useNavigate();

  // --- STATES ---
  const [orders, setOrders] = useState([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); 
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [users, setUsers] = useState([]); 
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(true);

  // 🎟️ Marketing States
  const [promos, setPromos] = useState([]);
  const [newPromo, setNewPromo] = useState({ code: '', discountPercentage: '' });

  // --- API CALLS ---
  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders/all');
      setOrders(response.data);
      setIsOrdersLoading(false);
    } catch (error) { setIsOrdersLoading(false); }
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/settings');
      setIsStoreOpen(res.data.isStoreOpen);
    } catch (error) { console.error("Failed to load settings"); }
  };

  const fetchProducts = async () => {
    setIsProductsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products/all');
      setProducts(response.data);
      setIsProductsLoading(false);
    } catch (error) { setIsProductsLoading(false); }
  };

  const fetchUsers = async () => {
    setIsUsersLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/auth/users');
      setUsers(response.data);
      setIsUsersLoading(false);
    } catch (error) { setIsUsersLoading(false); }
  };

  const fetchPromos = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/promo/all');
      setPromos(res.data);
    } catch (error) { console.error("Failed to load promos"); }
  };

  useEffect(() => {
    fetchOrders();
    fetchSettings(); 
  }, []);

  useEffect(() => {
    if (activeTab === 'inventory' && products.length === 0) fetchProducts();
    if ((activeTab === 'users' || activeTab === 'finance' || activeTab === 'marketing') && users.length === 0) fetchUsers(); 
    if (activeTab === 'marketing') fetchPromos(); 
  }, [activeTab]); 

  // --- UPDATE LOGIC ---
  const toggleStoreStatus = async () => {
    try {
      setIsStoreOpen(prev => !prev); 
      await axios.put('http://localhost:5000/api/settings/toggle');
    } catch (error) { fetchSettings(); }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setOrders(orders.map(order => order._id === orderId ? { ...order, paymentStatus: newStatus } : order));
      await axios.put(`http://localhost:5000/api/orders/${orderId}/status`, { paymentStatus: newStatus });
    } catch (error) { fetchOrders(); }
  };

  const cancelOrder = async (orderId) => {
    const confirm = window.confirm("🚨 Are you sure you want to cancel this order? The Gari will be automatically returned to your Inventory.");
    if (!confirm) return;
    try {
      setOrders(orders.map(order => order._id === orderId ? { ...order, paymentStatus: 'Cancelled' } : order));
      await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`);
      fetchProducts();
    } catch (error) { fetchOrders(); }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setUsers(users.map(user => user._id === userId ? { ...user, role: newRole } : user));
      await axios.put(`http://localhost:5000/api/auth/users/${userId}/role`, { role: newRole });
      alert(`✅ User role updated to ${newRole.toUpperCase()}!`);
    } catch (error) { fetchUsers(); }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/promo/new', newPromo);
      setNewPromo({ code: '', discountPercentage: '' });
      fetchPromos();
      alert("🎟️ Promo Code Created!");
    } catch (error) { alert("Failed to create code. Check if it already exists."); }
  };

  const togglePromoStatus = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/promo/${id}/toggle`);
      fetchPromos();
    } catch (error) { alert("Failed to toggle promo."); }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingProduct({ ...editingProduct, [name]: type === 'checkbox' ? checked : value });
  };

  const saveProductChanges = async (e) => {
    e.preventDefault();
    try {
      if (isCreatingNew) await axios.post(`http://localhost:5000/api/products/new`, editingProduct);
      else await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, editingProduct);
      setEditingProduct(null); 
      setIsCreatingNew(false);
      fetchProducts(); 
    } catch (error) { alert("Failed to save changes."); }
  };

  const reconcileCash = async (ordersToClear) => {
    const confirm = window.confirm(`Are you sure you have physically received this cash?`);
    if (!confirm) return;
    try {
      setOrders(orders.map(o => ordersToClear.find(clear => clear._id === o._id) ? { ...o, isCashReconciled: true } : o));
      await Promise.all(ordersToClear.map(order => axios.put(`http://localhost:5000/api/orders/${order._id}/status`, { isCashReconciled: true })));
    } catch (error) { fetchOrders(); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // --- DERIVED DATA & MATH ---
  const pendingOrders = orders.filter(o => o.paymentStatus === 'Pending');
  const processingOrders = orders.filter(o => o.paymentStatus === 'Processing');
  const deliveredOrders = orders.filter(o => o.paymentStatus === 'Delivered');

  const unReconciledOrders = orders.filter(o => o.paymentStatus === 'Completed' && o.paymentMethod === 'Paid (Cash Collected by Rider)' && !o.isCashReconciled);

  const riderDebts = unReconciledOrders.reduce((acc, order) => {
    const riderId = order.rider;
    const riderUser = users.find(u => u._id === riderId);
    const riderName = riderUser ? riderUser.fullName : 'Unknown Rider (Legacy)';
    if (!acc[riderName]) acc[riderName] = { total: 0, orders: [] };
    acc[riderName].total += order.totalPrice;
    acc[riderName].orders.push(order);
    return acc;
  }, {});

  // 🏆 VIP LEADERBOARD MATH
  const getVipCustomers = () => {
    const customerMap = {};
    orders.forEach(order => {
      if (order.paymentStatus === 'Delivered' || order.paymentStatus === 'Completed') {
        const name = order.user?.fullName || "Unknown";
        const spent = order.totalPrice || 0;
        if (!customerMap[name]) customerMap[name] = { name, totalSpent: 0, orderCount: 0 };
        customerMap[name].totalSpent += spent;
        customerMap[name].orderCount += 1;
      }
    });
    return Object.values(customerMap).sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5);
  };
  const vips = getVipCustomers();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <div className="bg-gray-900 text-white p-4 md:p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-veroYellow object-cover" onError={(e) => { e.target.style.display = 'none' }} />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-veroYellow">👑 Mission Control</h1>
            <p className="text-xs md:text-sm opacity-80">Admin Operations Center</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleStoreStatus} className={`px-4 py-2 rounded font-black text-sm transition shadow-inner flex items-center gap-2 ${isStoreOpen ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
            {isStoreOpen ? '🟢 STORE OPEN' : '🔴 STORE CLOSED'}
          </button>
          <button onClick={handleLogout} className="bg-gray-700 hover:bg-red-700 px-4 py-2 rounded text-sm font-bold transition">Logout</button>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="bg-white border-b border-gray-200 shadow-sm flex overflow-x-auto">
        <button onClick={() => setActiveTab('dispatch')} className={`px-6 py-4 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'dispatch' ? 'text-veroBrown border-b-4 border-veroBrown' : 'text-gray-500 hover:text-gray-800'}`}>🚚 Dispatch</button>
        <button onClick={() => setActiveTab('inventory')} className={`px-6 py-4 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'inventory' ? 'text-veroBrown border-b-4 border-veroBrown' : 'text-gray-500 hover:text-gray-800'}`}>📦 Inventory</button>
        <button onClick={() => setActiveTab('users')} className={`px-6 py-4 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'users' ? 'text-blue-600 border-b-4 border-blue-600' : 'text-gray-500 hover:text-gray-800'}`}>👥 Staff & Users</button>
        <button onClick={() => setActiveTab('finance')} className={`px-6 py-4 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'finance' ? 'text-green-600 border-b-4 border-green-600' : 'text-gray-500 hover:text-gray-800'}`}>💰 Finance</button>
        <button onClick={() => setActiveTab('marketing')} className={`px-6 py-4 font-bold text-sm transition-colors whitespace-nowrap ${activeTab === 'marketing' ? 'text-pink-600 border-b-4 border-pink-600' : 'text-gray-500 hover:text-gray-800'}`}>🎟️ Marketing</button>
      </div>

      {/* --- TAB 1: DISPATCH --- */}
      {activeTab === 'dispatch' && ( 
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-200/50 rounded-xl p-4 border border-gray-200 h-fit">
              <div className="flex justify-between items-center mb-4"><h2 className="font-black text-gray-700 text-lg">🚨 PENDING</h2><span className="bg-gray-300 text-gray-800 font-bold px-3 py-1 rounded-full text-sm">{pendingOrders.length}</span></div>
              {pendingOrders.map(order => <OrderCard key={order._id} order={order} nextStatus="Processing" buttonText="Start Packaging ➔" buttonColor="bg-veroOrange hover:bg-orange-600" onUpdateStatus={updateOrderStatus} onCancelOrder={cancelOrder} />)}
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100 h-fit">
              <div className="flex justify-between items-center mb-4"><h2 className="font-black text-orange-800 text-lg">📦 PACKAGING</h2><span className="bg-orange-200 text-orange-900 font-bold px-3 py-1 rounded-full text-sm">{processingOrders.length}</span></div>
              {processingOrders.map(order => <OrderCard key={order._id} order={order} nextStatus="Delivered" buttonText="Dispatch Rider ➔" buttonColor="bg-blue-500 hover:bg-blue-600" onUpdateStatus={updateOrderStatus} onCancelOrder={cancelOrder} />)}
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-100 h-fit">
              <div className="flex justify-between items-center mb-4"><h2 className="font-black text-green-800 text-lg">🛵 IN TRANSIT</h2><span className="bg-green-200 text-green-900 font-bold px-3 py-1 rounded-full text-sm">{deliveredOrders.length}</span></div>
              {deliveredOrders.map(order => <OrderCard key={order._id} order={order} nextStatus={null} onUpdateStatus={updateOrderStatus} onCancelOrder={cancelOrder} />)}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: INVENTORY --- */}
      {activeTab === 'inventory' && ( 
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Product Database</h2>
            <button onClick={() => { setEditingProduct({ name: '', weight: '', category: 'Oils & Extras', standardPrice: 0, subscriberPrice: 0, stockQuantity: 0, imageUrl: '', isB2BOnly: false }); setIsCreatingNew(true); }} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow transition">+ Add New</button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                <tr><th className="px-6 py-4">Image</th><th className="px-6 py-4">Product</th><th className="px-6 py-4">Stock</th><th className="px-6 py-4">Std Price</th><th className="px-6 py-4">Sub Price</th><th className="px-6 py-4 text-center">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4"><img src={product.imageUrl} alt="Gari" className="h-12 w-12 rounded object-cover border" onError={(e) => e.target.src='https://via.placeholder.com/150'} /></td>
                    <td className="px-6 py-4"><p className="font-bold text-gray-800">{product.name} {product.isB2BOnly ? <span className="bg-blue-100 text-blue-800 text-[10px] px-2 rounded uppercase">B2B</span> : ''}</p><p className="text-sm text-gray-500">{product.weight}</p></td>
                    <td className="px-6 py-4"><span className={`font-black text-lg ${product.stockQuantity <= 5 ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>{product.stockQuantity}</span></td>
                    <td className="px-6 py-4 font-bold text-gray-800">GHS {product.standardPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold text-green-600">GHS {product.subscriberPrice?.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center"><button onClick={() => { setEditingProduct(product); setIsCreatingNew(false); }} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-1 px-4 rounded">Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 3: USERS --- */}
      {activeTab === 'users' && (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">User Directory</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
                <tr><th className="px-6 py-4">Name</th><th className="px-6 py-4">Phone</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Change Role</th></tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-800">{user.fullName}</td>
                    <td className="px-6 py-4 text-gray-600">{user.phoneNumber}</td>
                    <td className="px-6 py-4"><span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-gray-100">{user.role}</span></td>
                    <td className="px-6 py-4">
                      <select value={user.role} onChange={(e) => updateUserRole(user._id, e.target.value)} className="border border-gray-300 rounded p-1">
                        <option value="student">Student</option><option value="vendor">Vendor</option><option value="rider">Rider</option><option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 4: FINANCE --- */}
      {activeTab === 'finance' && (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Cash Reconciliation</h2>
          {Object.keys(riderDebts).length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-gray-200 text-center shadow-sm">
              <h3 className="text-xl font-bold text-gray-700">All Cash Reconciled!</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(riderDebts).map(([riderName, data]) => (
                <div key={riderName} className="bg-white rounded-xl shadow-md border-t-4 border-green-500 p-6">
                  <h3 className="text-xl font-black text-gray-800 mb-4">🛵 {riderName}</h3>
                  <p className="text-4xl font-black text-green-600 text-center mb-6">GHS {data.total.toFixed(2)}</p>
                  <button onClick={() => reconcileCash(data.orders)} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow transition">
                    ✅ Mark Received
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- 🎟️ TAB 5: MARKETING & VIP LEADERBOARD --- */}
      {activeTab === 'marketing' && (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          
          {/* 🏆 VIP LEADERBOARD WIDGET */}
          <div className="bg-gradient-to-br from-veroBrown to-black p-6 rounded-2xl shadow-xl mb-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">🏆</span>
              <div>
                <h2 className="text-xl font-bold text-veroYellow">VIP Loyalty Leaderboard</h2>
                <p className="text-xs opacity-70">Top 5 customers based on successful orders</p>
              </div>
            </div>

            <div className="space-y-4">
              {vips.length === 0 ? (
                <p className="text-sm opacity-50 italic">Waiting for completed orders to rank VIPS...</p>
              ) : (
                vips.map((vip, index) => (
                  <div key={index} className="flex justify-between items-center bg-white/10 p-3 rounded-lg border border-white/5">
                    <div className="flex items-center gap-4">
                      <span className="font-black text-veroYellow w-4">{index + 1}.</span>
                      <span className="font-bold">{vip.name}</span>
                      <span className="bg-veroOrange/20 text-veroOrange text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                        {vip.orderCount} Orders
                      </span>
                    </div>
                    <span className="font-black text-veroYellow">GHS {vip.totalSpent.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6">Promo Codes Manager</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
              <h3 className="font-bold text-lg mb-4">✨ Create New Promo</h3>
              <form onSubmit={handleCreatePromo} className="space-y-4">
                <input type="text" placeholder="CODE" value={newPromo.code} onChange={(e) => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} className="w-full px-3 py-2 border rounded-lg uppercase" required />
                <input type="number" placeholder="Discount %" value={newPromo.discountPercentage} onChange={(e) => setNewPromo({...newPromo, discountPercentage: e.target.value})} className="w-full px-3 py-2 border rounded-lg" required />
                <button type="submit" className="w-full bg-pink-600 text-white font-bold py-2 rounded-lg">Generate Code</button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                  <tr><th className="px-6 py-4">Code</th><th className="px-6 py-4">Discount</th><th className="px-6 py-4">Uses</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {promos.map(promo => (
                    <tr key={promo._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-black text-pink-600">{promo.code}</td>
                      <td className="px-6 py-4">{promo.discountPercentage}% OFF</td>
                      <td className="px-6 py-4 font-bold text-gray-500">{promo.usageCount}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${promo.isActive ? 'bg-green-100' : 'bg-red-100'}`}>{promo.isActive ? 'Active' : 'Expired'}</span></td>
                      <td className="px-6 py-4"><button onClick={() => togglePromoStatus(promo._id)} className="text-xs underline">{promo.isActive ? 'Disable' : 'Enable'}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="font-bold text-lg mb-4">{isCreatingNew ? 'Create Product' : 'Edit Product'}</h3>
            <form onSubmit={saveProductChanges} className="space-y-3">
              <input type="text" placeholder="Name" name="name" value={editingProduct.name || ''} onChange={handleEditChange} className="w-full border p-2 rounded" required />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Weight" name="weight" value={editingProduct.weight || ''} onChange={handleEditChange} className="border p-2 rounded" required />
                <input type="text" placeholder="Category" name="category" value={editingProduct.category || ''} onChange={handleEditChange} className="border p-2 rounded" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Std Price" name="standardPrice" value={editingProduct.standardPrice || ''} onChange={handleEditChange} className="border p-2 rounded" required />
                <input type="number" placeholder="Sub Price" name="subscriberPrice" value={editingProduct.subscriberPrice || ''} onChange={handleEditChange} className="border p-2 rounded" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Stock Qty" name="stockQuantity" value={editingProduct.stockQuantity || 0} onChange={handleEditChange} className="border p-2 rounded" required />
                <input type="text" placeholder="Image URL" name="imageUrl" value={editingProduct.imageUrl || ''} onChange={handleEditChange} className="border p-2 rounded" />
              </div>
              <label className="flex items-center gap-2"><input type="checkbox" name="isB2BOnly" checked={editingProduct.isB2BOnly || false} onChange={handleEditChange} /> Wholesale Only?</label>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setEditingProduct(null)} className="bg-gray-200 px-4 py-2 rounded">Cancel</button>
                <button type="submit" className="bg-veroBrown text-white px-4 py-2 rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}