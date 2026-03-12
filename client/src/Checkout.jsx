import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from './CartContext';
import { usePaystackPayment } from 'react-paystack';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  // Form states
  const [deliveryZone, setDeliveryZone] = useState('Amamoma');
  const [exactLocation, setExactLocation] = useState('');
  const [email, setEmail] = useState(''); 
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [isProcessing, setIsProcessing] = useState(false); // 🛠️ Prevents double-clicking!

  // 🎟️ PROMO CODE STATES
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // e.g., 10 for 10%
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });
  const [isPromoApplying, setIsPromoApplying] = useState(false);

  // Financials & Math
  const deliveryFee = 5.00; 
  const discountAmount = (cartTotal * appliedDiscount) / 100; // Calculate discount off the subtotal
  const grandTotal = cartTotal - discountAmount + (cartTotal > 0 ? deliveryFee : 0);

  // 💰 PAYSTACK CONFIGURATION
  const config = {
    reference: (new Date()).getTime().toString(),
    email: email || "student@ucc.edu.gh",
    amount: grandTotal * 100, // Paystack reads in pesewas, so this perfectly reads the discounted total!
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY, 
    currency: 'GHS',
  };

  const initializePayment = usePaystackPayment(config);

  const handleGoBack = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      if (payload.role === 'vendor') return navigate('/vendor');
    }
    navigate('/student');
  };

  // --- 🎟️ APPLY PROMO FUNCTION ---
  const handleApplyPromo = async () => {
    if (!promoCodeInput) return;
    setIsPromoApplying(true);
    setPromoMessage({ text: '', type: '' });

    try {
      const res = await axios.post('http://localhost:5000/api/promo/validate', { code: promoCodeInput });
      setAppliedDiscount(res.data.discountPercentage);
      setPromoMessage({ text: res.data.message, type: 'success' });
    } catch (error) {
      setAppliedDiscount(0);
      setPromoMessage({ 
        text: error.response?.data?.message || "Invalid code or connection error.", 
        type: 'error' 
      });
    }
    setIsPromoApplying(false);
  };

  // --- 1. THE MOMO SUCCESS FUNCTION ---
  const onPaystackSuccess = async (reference) => {
    await processOrder('MoMo (Paid)', reference.reference);
  };

  // --- 2. THE CASH ON DELIVERY FUNCTION ---
  const handleCashCheckout = async () => {
    if(!email || !exactLocation) return alert("Please fill in your Email and Room Number!");
    await processOrder('Cash on Delivery', null);
  };

  // --- 3. THE MASTER ORDER PROCESSOR ---
  const processOrder = async (methodString, receiptRef) => {
    setIsProcessing(true); 
    
    try {
      const token = localStorage.getItem('token');
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      const userId = payload.id || payload._id;

      const formattedProducts = cart.map(item => ({ product: item._id, quantity: item.quantity }));
      
      const orderData = {
        user: userId,
        products: formattedProducts,
        totalPrice: grandTotal, // Passes the discounted final total to Aunty Vero's ledger!
        deliveryZone,
        exactLocation,
        paymentStatus: 'Pending', 
        paymentMethod: methodString 
      };

      // Save to database
      await axios.post('http://localhost:5000/api/orders/new', orderData);

      // Tell the user it worked!
      if (methodString === 'MoMo (Paid)') {
        alert(`🎉 Payment Successful! Receipt: ${receiptRef}\nRouting you back to your dashboard...`);
      } else {
        alert(`🚚 Order Placed! Please have GHS ${grandTotal.toFixed(2)} ready for the rider.\nRouting you back...`);
      }

      // 🚀 FORCE THE ROUTING BEFORE CLEARING THE CART
      if (payload.role === 'vendor') {
        navigate('/vendor');
      } else {
        navigate('/student');
      }

      setTimeout(() => {
        clearCart();
        setIsProcessing(false);
      }, 500);

    } catch (error) {
      console.error("Order save failed:", error);
      alert("Something went wrong saving your order.");
      setIsProcessing(false);
    }
  };

  const onPaystackClose = () => {
    alert("Payment cancelled. Your truck is still waiting!");
  };

  if (cart.length === 0 && !isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-veroBrown mb-4">Your cart is empty!</h2>
        <button onClick={handleGoBack} className="bg-veroYellow hover:bg-veroOrange text-veroBrown font-bold py-2 px-6 rounded-lg">Go Back</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        
        <div className="bg-veroBrown p-6 text-white flex justify-between items-center">
          <h1 className="text-2xl font-bold text-veroYellow">Secure Checkout</h1>
          <button onClick={handleGoBack} className="text-sm hover:underline">← Back</button>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border">
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-veroBrown">GHS {(item.activePrice * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* 🎟️ NEW: PROMO CODE SECTION */}
            <div className="border-t border-gray-200 pt-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Have a Promo Code?</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="e.g. EXAMWEEK"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                  disabled={isProcessing || appliedDiscount > 0} // Locks the input if code is valid!
                  className="flex-1 px-4 py-2 border rounded-lg outline-none uppercase font-bold"
                />
                <button
                  onClick={handleApplyPromo}
                  disabled={isPromoApplying || isProcessing || !promoCodeInput || appliedDiscount > 0}
                  className={`px-4 py-2 font-bold rounded-lg transition 
                    ${appliedDiscount > 0 ? 'bg-green-500 text-white cursor-not-allowed' : 'bg-gray-800 hover:bg-black text-white'}`}
                >
                  {isPromoApplying ? '...' : appliedDiscount > 0 ? 'Applied!' : 'Apply'}
                </button>
              </div>
              {/* Dynamic Success/Error Message */}
              {promoMessage.text && (
                <p className={`text-xs font-bold mt-2 ${promoMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {promoMessage.type === 'success' ? '✅ ' : '❌ '}{promoMessage.text}
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>GHS {cartTotal.toFixed(2)}</span></div>
              
              {/* 🎟️ NEW: Discount Line Item (Only shows if a code is applied) */}
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Discount ({appliedDiscount}%)</span>
                  <span>- GHS {discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600"><span>Delivery</span><span>GHS {deliveryFee.toFixed(2)}</span></div>
              <div className="flex justify-between text-xl font-black text-gray-900 pt-2 border-t"><span>Total</span><span>GHS {grandTotal.toFixed(2)}</span></div>
            </div>
          </div>

          {/* Delivery & Payment Form */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Dispatch & Payment</h2>
            <div className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (For Receipt)</label>
                <input 
                  type="email" required placeholder="student@ucc.edu.gh"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-veroYellow outline-none"
                  disabled={isProcessing}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campus Zone</label>
                  <select value={deliveryZone} onChange={(e) => setDeliveryZone(e.target.value)} disabled={isProcessing} className="w-full px-4 py-2 border rounded-lg bg-white">
                    <option value="Amamoma">Amamoma</option>
                    <option value="Science">Science</option>
                    <option value="Diaspora">Diaspora</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Room No.</label>
                  <input 
                    type="text" required placeholder="Room 42"
                    value={exactLocation} onChange={(e) => setExactLocation(e.target.value)}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 border rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">How would you like to pay?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('momo')}
                    disabled={isProcessing}
                    className={`py-3 rounded-lg font-bold text-sm transition border-2 ${paymentMethod === 'momo' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    📱 Instant MoMo
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    disabled={isProcessing}
                    className={`py-3 rounded-lg font-bold text-sm transition border-2 ${paymentMethod === 'cash' ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    💵 Cash on Delivery
                  </button>
                </div>
              </div>

              {/* DYNAMIC CHECKOUT BUTTON */}
              {paymentMethod === 'momo' ? (
                <button 
                  onClick={() => {
                    if(!email || !exactLocation) return alert("Please fill in your Email and Room Number!");
                    initializePayment(onPaystackSuccess, onPaystackClose);
                  }}
                  disabled={isProcessing}
                  className={`w-full font-bold py-4 rounded-lg transition shadow-md mt-2 flex justify-center items-center gap-2 ${isProcessing ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                >
                  {isProcessing ? 'Processing Payment...' : `🔒 Pay GHS ${grandTotal.toFixed(2)} Now`}
                </button>
              ) : (
                <button 
                  onClick={handleCashCheckout}
                  disabled={isProcessing}
                  className={`w-full font-bold py-4 rounded-lg transition shadow-md mt-2 flex justify-center items-center gap-2 ${isProcessing ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : 'bg-veroOrange hover:bg-orange-600 text-white'}`}
                >
                  {isProcessing ? 'Saving Order...' : `🚚 Place Order (Pay Rider Later)`}
                </button>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}