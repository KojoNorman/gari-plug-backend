import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* --- TOP NAVIGATION --- */}
      <nav className="bg-white px-6 py-4 flex justify-between items-center shadow-sm relative z-10">
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="Aunty Vero Logo" 
            className="h-10 w-10 md:h-12 md:w-12 rounded-full border-2 border-veroYellow object-cover"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <span className="font-black text-xl text-gray-900 tracking-tight">Aunty Vero's Gari Plug</span>
        </div>
        <button 
          onClick={() => navigate('/login')} 
          className="text-gray-600 font-bold hover:text-veroBrown transition"
        >
          Sign In
        </button>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="bg-veroBrown text-white pt-16 pb-24 px-4 text-center relative overflow-hidden">
        {/* Background Decorative blob */}
        <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-veroOrange rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-[-20%] right-[-10%] w-72 h-72 bg-veroYellow rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="max-w-3xl mx-auto relative z-10">
          <span className="bg-white/10 text-veroYellow text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm border border-white/20">
            Premium Agona Gari
          </span>
          <h1 className="text-4xl md:text-6xl font-black mt-6 mb-6 leading-tight">
            The Best Gari on Campus,<br className="hidden md:block" /> Delivered to Your Door.
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto font-light">
            Whether you need a quick pack for your hostel or 50 sacks for your business, Aunty Vero's got you covered with the crispiest, stone-free gari in UCC.
          </p>
        </div>
      </div>

      {/* --- THE SPLIT PATHWAYS (STUDENT VS VENDOR) --- */}
      <div className="max-w-5xl mx-auto px-4 -mt-16 relative z-20 w-full flex-grow mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* PATH 1: STUDENT (RETAIL) */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-veroYellow hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full">
            <div className="text-5xl mb-4">🎓</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Student Retail</h2>
            <p className="text-gray-500 mb-6 flex-grow">
              Fast, single-pack deliveries straight to Amamoma, Science, or Diaspora. Pay with MoMo or Cash on Delivery.
            </p>
            <ul className="space-y-3 mb-8 text-sm font-bold text-gray-700">
              <li className="flex items-center gap-2">✅ Small Packs (1kg - 5kg)</li>
              <li className="flex items-center gap-2">✅ Hostel Delivery</li>
              <li className="flex items-center gap-2">✅ Promo Codes & Discounts</li>
            </ul>
            <button 
              onClick={() => navigate('/register?role=student')}
              className="w-full bg-veroYellow hover:bg-yellow-500 text-veroBrown font-black py-4 rounded-xl shadow-md transition text-lg"
            >
              Create Student Account
            </button>
          </div>

          {/* PATH 2: VENDOR (WHOLESALE) */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-gray-900 hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full">
            <div className="text-5xl mb-4">🏢</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Vendor Wholesale</h2>
            <p className="text-gray-500 mb-6 flex-grow">
              VIP access to bulk inventory at discounted wholesale rates. Fast reordering for your market stall or shop.
            </p>
            <ul className="space-y-3 mb-8 text-sm font-bold text-gray-700">
              <li className="flex items-center gap-2">📦 Bulk Sacks (25kg - 50kg)</li>
              <li className="flex items-center gap-2">💰 Special B2B Pricing</li>
              <li className="flex items-center gap-2">🚛 VIP Truck Dispatch</li>
            </ul>
            <button 
              onClick={() => navigate('/register?role=vendor')}
              className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-xl shadow-md transition text-lg"
            >
              Apply for Vendor Account
            </button>
          </div>

        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-100 py-8 text-center border-t border-gray-200 mt-auto">
        <p className="text-sm font-bold text-gray-400">© 2026 Aunty Vero's Gari Plug. Built for UCC.</p>
      </footer>
    </div>
  );
}