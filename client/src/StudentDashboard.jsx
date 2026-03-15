import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './CartContext';

export default function StudentDashboard() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStoreOpen, setIsStoreOpen] = useState(true); 
  
  const navigate = useNavigate();
  const { addToCart, cartItemCount } = useCart();


  function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

  // --- 🛠️ 1. MOVE FETCH FUNCTIONS OUTSIDE SO THE INTERVAL CAN SEE THEM ---
  const fetchInventory = async () => {
    try {
      const response = await axios.get('https://gari-plug-api.onrender.com/api/products?role=student');
      setProducts(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch products", error);
      setIsLoading(false);
    }
  };

  const fetchStoreStatus = async () => {
    try {
      const res = await axios.get('https://gari-plug-api.onrender.com/api/settings');
      setIsStoreOpen(res.data.isStoreOpen);
    } catch (error) {
      console.error("Failed to check store status");
    }
  };

const subscribeToNotifications = async () => {
    try {
      // 1. Ask the user for permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('You need to allow notifications to get Gari updates!');
        return;
      }

      // 2. Register the invisible worker we just made
      const register = await navigator.serviceWorker.register('/sw.js');

      // 3. PASTE YOUR PUBLIC VAPID KEY HERE!
      const publicVapidKey = 'BK2fDgo9sRQxjuK9dzKoIzw9JtF694LvVQ-R2E6rpYY3A84vOZgAqZGTszQT8hl0YVPxx0vTu-Ce3sKN0jtpYbA';

      // 4. Subscribe the user
      const subscription = await register.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      // 5. Send the subscription to your backend
      // IMPORTANT: If testing locally, use http://localhost:5000/api/subscribe
      // If pushing to Vercel/Render, use your live Render URL!
      await fetch('https://gari-plug-api.onrender.com/api/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json' }
      });

      alert('Successfully subscribed to Gari Plug Alerts! 🚀');
    } catch (error) {
      console.error('Failed to subscribe:', error);
    }
  };

  // --- 🛠️ 2. THE HEARTBEAT EFFECT ---
  useEffect(() => {
    // Initial fetch when page loads
    fetchInventory();
    fetchStoreStatus();

    // 🔄 Auto-refresh every 30 seconds to sync stock & store status
    const interval = setInterval(() => {
      console.log("Syncing with kitchen..."); // You'll see this in the console
      fetchInventory();
      fetchStoreStatus();
    }, 30000); 

    // 🧹 Cleanup: This stops the timer if the student logs out or leaves
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      
      {/* 1. Dashboard Header */}
      <div className="bg-veroBrown text-white p-4 md:p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="Aunty Vero Logo" 
            className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-veroYellow object-cover" 
            onError={(e) => { e.target.style.display = 'none' }} 
          />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-veroYellow">🎓 Student Portal</h1>
            <p className="text-xs md:text-sm opacity-90">Premium Agona Gari - Retail</p>
          </div>
        </div>
        
        <button 
  onClick={subscribeToNotifications} 
  className="bg-orange-500 text-white px-4 py-2 rounded shadow mt-4"
>
  🔔 Turn on Gari Alerts
</button>

        <div className="flex w-full md:w-auto space-x-3">
          <button 
            onClick={() => navigate('/checkout')}
            className="flex-1 md:flex-none flex justify-center items-center bg-veroOrange hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg font-bold text-sm transition shadow-lg whitespace-nowrap"
          >
            🛒 Cart ({cartItemCount})
          </button>
          <button 
            onClick={handleLogout} 
            className="flex-1 md:flex-none flex justify-center items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </div>
    
      {/* 🛑 THE CLOSED BLOCKADE BANNER */}
      {!isStoreOpen && (
        <div className="bg-red-600 text-white text-center py-3 px-4 font-bold shadow-md animate-pulse">
          ⚠️ Orders are currently closed! We are not accepting new orders right now. Catch us tomorrow!
        </div>
      )}

      {/* 2. Main Content Area */}
      <div className="max-w-6xl mx-auto mt-8 px-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Today's Restock Menu</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="h-48 w-full bg-gray-200"></div>
                <div className="p-5">
                  <div className="h-6 w-24 bg-orange-100 rounded-full mb-3"></div>
                  <div className="h-6 w-3/4 bg-gray-200 rounded-md mb-2"></div>
                  <div className="h-10 w-full bg-yellow-100 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition">
                <div className="h-48 w-full bg-gray-100 border-b border-gray-100">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Premium+Gari' }} 
                  />
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="mb-3 flex justify-between items-center">
                    <span className="bg-orange-100 text-veroOrange text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide">
                      {product.category}
                    </span>
                    <span className={`text-xs font-black ${product.stockQuantity <= 5 ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
                      {product.stockQuantity > 0 ? `${product.stockQuantity} Left` : 'Out of Stock'}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                  <p className="text-gray-500 mb-4">Size: {product.weight}</p>

                  <div className="mt-auto">
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-500 text-sm">Standard Price:</span>
                        <span className="font-semibold line-through text-gray-400">GHS {product.standardPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-veroBrown font-bold text-sm">Subscriber Price:</span>
                        <span className="font-bold text-green-600 text-lg">GHS {product.subscriberPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => addToCart(product, product.subscriberPrice)} 
                      disabled={!isStoreOpen || product.stockQuantity <= 0}
                      className={`w-full font-bold py-2 rounded-lg transition shadow-sm
                        ${!isStoreOpen 
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                          : product.stockQuantity <= 0 
                            ? 'bg-red-100 text-red-600 cursor-not-allowed border border-red-300' 
                            : 'bg-veroYellow hover:bg-veroOrange text-veroBrown' 
                        }`}
                    >
                      {!isStoreOpen 
                        ? 'Store Closed' 
                        : product.stockQuantity <= 0 
                          ? '❌ Sold Out' 
                          : '+ Add to Box'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}