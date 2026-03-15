import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './CartContext'; // <-- Import the backpack provider
import LandingPage from './LandingPage'; // (or './pages/LandingPage' depending on where you saved it)
import Login from './Login';
import Register from './Register';
import StudentDashboard from './StudentDashboard';
import VendorDashboard from './VendorDashboard';
import Checkout from './Checkout'; // <-- Added this!
import AdminDashboard from './AdminDashboard'; // <-- Import it here!
import RiderDashboard from './RiderDashboard';

function App() {
  return (
    // Wrap the entire Router inside the CartProvider!
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/vendor" element={<VendorDashboard />} />
          <Route path="/checkout" element={<Checkout />} /> {/* <-- Added this! */}
          <Route path="/admin" element={<AdminDashboard />} /> {/* <-- Add the route! */}
          <Route path="/rider" element={<RiderDashboard />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;