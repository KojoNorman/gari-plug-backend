import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // 🛠️ Added useLocation
import axios from 'axios';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default to student
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();
  const location = useLocation(); // 🛠️ Grabs the current URL

  // 🧠 THE UX SECRET: Auto-Select Role from URL
  useEffect(() => {
    // Looks for "?role=vendor" or "?role=student" in the URL
    const queryParams = new URLSearchParams(location.search);
    const roleFromUrl = queryParams.get('role');
    
    // If it finds it, it automatically updates the dropdown state!
    if (roleFromUrl === 'vendor' || roleFromUrl === 'student') {
      setRole(roleFromUrl);
    }
  }, [location]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    
    try {
      // Send the new user details to our backend
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        fullName,
        phoneNumber,
        password,
        role
      });

      // Show success message, then teleport to login page after 2 seconds
      setIsError(false);
      setMessage(response.data.message + ' Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000); // 🛠️ Changed to '/login' since '/' is now the Landing Page!

    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-veroBrown mb-2">Create Account</h1>
          <p className="text-gray-500">Join the Aunty Vero Family</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm text-center ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-veroYellow outline-none"
              placeholder="e.g. Kwame Mensah"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-veroYellow outline-none"
              placeholder="e.g. 0541234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select 
              value={role} onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-veroYellow outline-none bg-white"
            >
              <option value="student">UCC Student (Retail)</option>
              <option value="vendor">Wholesale Vendor (B2B)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-veroYellow outline-none"
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="w-full bg-veroBrown hover:bg-yellow-900 text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4">
            Register Now
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {/* 🛠️ Changed the link from '/' to '/login' */}
          <p>Already have an account? <Link to="/login" className="text-veroOrange font-semibold hover:underline">Login Here</Link></p>
        </div>

      </div>
    </div>
  );
}