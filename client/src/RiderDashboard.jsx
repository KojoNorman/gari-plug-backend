import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RiderDashboard() {
  const [transitOrders, setTransitOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransitOrders();
  }, []);

  const fetchTransitOrders = async () => {
    try {
      const response = await axios.get('https://gari-plug-api.onrender.com/api/orders/all');
      const activeDeliveries = response.data.filter(o => o.paymentStatus === 'Delivered');
      setTransitOrders(activeDeliveries);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch deliveries:", error);
      setIsLoading(false);
    }
  };

  const markAsCompleted = async (orderId) => {
    const confirm = window.confirm("Have you dropped off the Gari and collected the cash (if unpaid)?");
    if (!confirm) return;

    try {
      // 🛠️ NEW: Read the Rider's ID from their token
      const token = localStorage.getItem('token');
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      const riderId = payload.id || payload._id;

      // Send the update to the database with the Rider's ID attached
      await axios.put(`https://gari-plug-api.onrender.com/api/orders/${orderId}/status`, { 
        paymentStatus: 'Completed',
        paymentMethod: 'Paid (Cash Collected by Rider)',
        rider: riderId // 👈 Stamps the receipt!
      });

      setTransitOrders(transitOrders.filter(order => order._id !== orderId));
      alert("✅ Delivery marked as complete! Great job.");

    } catch (error) {
      console.error("Backend Error:", error.response || error);
      alert(`Error: ${error.response?.data?.message || "Failed to update database."}`);
      fetchTransitOrders(); 
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // 🗓️ NEW: The exact same Date & Time formatter from the Admin panel!
  const formatDateTime = (dateString) => {
    if (!dateString) return "Time Unknown";
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      
      {/* 🛵 Rider Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-black">🛵 Dispatch App</h1>
          <p className="text-xs opacity-90">Live Route Map</p>
        </div>
        <button onClick={handleLogout} className="bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded text-sm font-bold transition">
          End Shift
        </button>
      </div>

      <div className="p-4 max-w-lg mx-auto mt-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Active Deliveries ({transitOrders.length})</h2>

        {isLoading ? (
          <p className="text-center text-gray-500 animate-pulse mt-10">Scanning for deliveries...</p>
        ) : transitOrders.length === 0 ? (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-200 mt-8">
            <span className="text-4xl mb-4 block">☕</span>
            <h3 className="text-lg font-bold text-gray-700">No active deliveries</h3>
            <p className="text-gray-500 text-sm">Take a break! Aunty Vero is packaging more orders.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transitOrders.map(order => (
              <div key={order._id} className="bg-white rounded-xl shadow-md border-l-4 border-blue-500 overflow-hidden">
                
                {/* 🛠️ UPGRADED: Date, Time, and Price Header */}
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center gap-2">
                  <span className="font-black text-lg text-blue-700 whitespace-nowrap">GHS {(order.totalPrice || 0).toFixed(2)}</span>
                  <span className="text-xs font-bold text-gray-600 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm text-right">
                    🕒 {formatDateTime(order.createdAt)}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-gray-900 text-lg">{order.user?.fullName || "Student"}</h3>
                  <div className="flex items-start mt-2">
                    <span className="text-blue-500 mr-2">📍</span>
                    <p className="text-gray-700 font-medium">
                      {order.deliveryZone} <br/> 
                      <span className="text-gray-500 text-sm">{order.exactLocation}</span>
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2">Package Contents:</p>
                    {(order.products || []).map((item, idx) => (
                      <p key={idx} className="text-sm text-gray-700">
                        • <span className="font-bold">{item.quantity || 1}x</span> {item.product?.name}
                      </p>
                    ))}
                  </div>

                  <div className="mt-4">
                    {order.paymentMethod === 'MoMo (Paid)' ? (
                      <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-bold p-3 rounded text-center">
                        ✅ PRE-PAID (Just drop it off)
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-black p-3 rounded text-center animate-pulse shadow-sm">
                        ⚠️ COLLECT GHS {(order.totalPrice || 0).toFixed(2)} CASH!
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => markAsCompleted(order._id)}
                    className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-black py-4 rounded-lg shadow-md transition text-lg flex justify-center items-center gap-2"
                  >
                    ✅ Mark Delivered
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}