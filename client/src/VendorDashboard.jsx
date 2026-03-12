import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './CartContext';

export default function VendorDashboard() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isStoreOpen, setIsStoreOpen] = useState(true); 
  
  const navigate = useNavigate();
  const { addToCart, cartItemCount } = useCart();

  // --- 🛠️ 1. FUNCTIONS MOVED OUTSIDE FOR GLOBAL ACCESS ---
  const fetchInventory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products?role=vendor');
      setProducts(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to fetch wholesale products", error);
      setIsLoading(false);
    }
  };

  const fetchStoreStatus = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/settings');
      setIsStoreOpen(res.data.isStoreOpen);
    } catch (error) {
      console.error("Failed to check store status");
    }
  };

  // --- 🛠️ 2. THE 30-SECOND HEARTBEAT EFFECT ---
  useEffect(() => {
    // Initial fetch on page load
    fetchInventory();
    fetchStoreStatus(); 

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchInventory();
      fetchStoreStatus();
    }, 30000);

    // Cleanup when the vendor leaves the page
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleFastReorder = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return alert("Authentication error. Please log in again.");
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const userId = JSON.parse(jsonPayload).id || JSON.parse(jsonPayload)._id;

      const response = await axios.get(`http://localhost:5000/api/orders/user/${userId}/last`);
      const lastOrder = response.data;

      lastOrder.products.forEach(item => {
        for(let i = 0; i < item.quantity; i++) {
           if(item.product) addToCart(item.product, item.product.standardPrice);
        }
      });

      alert("🚚 Fast Reorder successfully loaded into your truck!");

    } catch (error) {
      console.error("Fast reorder failed:", error);
      alert("We couldn't find a previous order for your account. Are you sure you've ordered before?");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      
      {/* 1. Dashboard Header */}
      <div className="bg-veroOrange text-white p-4 md:p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        
        <div className="flex items-center space-x-3">
          <img 
            src="/logo.png" 
            alt="Aunty Vero Logo" 
            className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-white object-cover shadow-sm" 
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <div>
            <h1 className="text-xl md:text-2xl font-bold">🏢 Wholesale Hub</h1>
            <p className="text-xs md:text-sm opacity-90">VIP Vendor Access: Bulk Orders Only</p>
          </div>
        </div>
        
        <div className="flex w-full md:w-auto space-x-3">
          <button 
            onClick={() => navigate('/checkout')}
            className="flex-1 md:flex-none flex justify-center items-center bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg font-bold text-sm transition shadow-lg whitespace-nowrap"
          >
            🛒 Truck ({cartItemCount})
          </button>
          <button 
            onClick={handleLogout}
            className="flex-1 md:flex-none flex justify-center items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm transition font-semibold whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 🛑 THE CLOSED BLOCKADE BANNER */}
      {!isStoreOpen && (
        <div className="bg-red-600 text-white text-center py-3 px-4 font-bold shadow-md animate-pulse">
          ⚠️ Wholesale operations are currently paused! We are not accepting new bulk orders right now.
        </div>
      )}

      {/* 2. Main Content Area */}
      <div className="max-w-5xl mx-auto mt-8 px-4">
        
        {/* Quick Action Bar for Vendors */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Fast Reorder</h2>
            <p className="text-sm text-gray-500">Need your usual delivery for the Science Lorry Station?</p>
          </div>
          
          <button 
            onClick={handleFastReorder}
            disabled={!isStoreOpen} 
            className={`w-full md:w-auto text-white font-bold py-3 px-6 rounded-lg transition shadow-md whitespace-nowrap
              ${isStoreOpen ? 'bg-veroBrown hover:bg-yellow-900' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            ↻ Repeat Last Bulk Order
          </button>
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Bulk Inventory</h2>

        {/* 3. The Professional B2B Skeleton Loader */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center animate-pulse gap-4">
                <div className="flex-1 flex items-center space-x-4 w-full">
                  <div className="h-16 w-16 md:h-20 md:w-20 bg-gray-200 rounded-lg flex-shrink-0"></div>
                  <div className="w-full">
                    <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 w-48 md:w-64 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="flex-1 flex justify-end w-full space-x-0 md:space-x-6">
                  <div className="text-right hidden md:block">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2 ml-auto"></div>
                    <div className="h-8 w-32 bg-gray-300 rounded ml-auto"></div>
                  </div>
                  <div className="h-12 w-full md:w-40 bg-gray-300 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 4. The Real B2B Product List */
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center hover:shadow-md transition gap-4">
                
                {/* Product Image and Details */}
                <div className="flex-1 flex items-center space-x-4 w-full">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="h-16 w-16 md:h-20 md:w-20 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Wholesale' }}
                  />
                  <div>
                    {/* 📦 Live Stock Indicator & Category */}
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{product.category}</span>
                      <span className={`text-xs font-black ${product.stockQuantity <= 5 ? 'text-red-600 animate-pulse' : 'text-green-600'}`}>
                        {product.stockQuantity > 0 ? `${product.stockQuantity} Left` : 'Out of Stock'}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold text-gray-800">{product.name}</h3>
                    <p className="text-veroOrange font-semibold mt-1">Weight: {product.weight}</p>
                  </div>
                </div>

                {/* Pricing and Action */}
                <div className="flex-1 flex justify-between md:justify-end items-center w-full md:w-auto mt-4 md:mt-0 space-x-4">
                  <div className="text-left md:text-right">
                    <p className="text-sm text-gray-500">Wholesale Price</p>
                    <p className="text-xl md:text-2xl font-black text-gray-800">GHS {product.standardPrice.toFixed(2)}</p>
                  </div>
                  
                  {/* 🛠️ UPGRADED: "Sold Out" + "Store Closed" Double Blockade */}
                  <button 
                    onClick={() => addToCart(product, product.standardPrice)}
                    disabled={!isStoreOpen || product.stockQuantity <= 0}
                    className={`font-bold py-3 px-6 md:px-8 rounded-lg transition w-auto whitespace-nowrap
                      ${!isStoreOpen 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : product.stockQuantity <= 0 
                          ? 'bg-red-100 text-red-600 cursor-not-allowed border border-red-300' 
                          : 'bg-gray-800 hover:bg-black text-white' 
                      }`}
                  >
                    {!isStoreOpen 
                      ? 'Store Closed' 
                      : product.stockQuantity <= 0 
                        ? '❌ Sold Out' 
                        : '+ Add to Truck'}
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