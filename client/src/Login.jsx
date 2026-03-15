import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    setIsLoading(true);

    try {
      // 1. Send credentials to the engine
      const response = await axios.post('https://gari-plug-api.onrender.com/api/auth/login', {
        phoneNumber,
        password
      });

      // 2. Save the ID Badge (Token)
      const { token, user } = response.data;
      localStorage.setItem('token', token);

      // 3. 🛵 THE SMART ROUTER (Teleports users based on their role)
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'rider') {
        navigate('/rider'); // Sends Kwame to the Dispatch App!
      } else if (user.role === 'vendor') {
        navigate('/vendor');
      } else {
        navigate('/student');
      }

    } catch (error) {
      setIsError(true);
      setIsLoading(false);
      
      // 🕵️ THE SMART ERROR X-RAY
      console.error("🚨 LOGIN REJECTED:", error.response || error);
      
      // This will now show the REAL error (like "Invalid password") instead of a fake connection error!
      setMessage(
        error.response?.data?.message || 
        error.response?.data?.error || 
        "Invalid phone number or password." 
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-veroBrown mb-2">Aunty Vero's Gari</h1>
          <p className="text-gray-500">Premium Roasts & Wholesale Hub</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm text-center font-bold ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-veroYellow outline-none"
              placeholder="e.g. 0541234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-veroYellow outline-none"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-colors mt-4 shadow-md ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-veroYellow hover:bg-veroOrange text-veroBrown'}`}
          >
            {isLoading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Don't have an account? <Link to="/register" className="text-veroOrange font-semibold hover:underline">Register Here</Link></p>
        </div>

      </div>
    </div>
  );
}