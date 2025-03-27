import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import useAuth from '../components/hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';
import APP_URL from '../components/config';

function Login() {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const navigate = useNavigate();
   const { updateAuthStatus } = useAuth();

   const handleLogin = async (e) => {
      e.preventDefault();
      setError('');

      if (!email || !password) {
         setError('Please provide both email and password.');
         return;
      }

      try {
         const response = await fetch(`${APP_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
         });

         const data = await response.json();

         if (!response.ok) {
            throw new Error(data.message || 'Login failed.');
         }

         console.log('Login successful:', data);
         await updateAuthStatus();
         navigate('/profile');
      } catch (err) {
         console.error('Login error:', err.message);
         setError(err.message || 'Login failed.');
      }
   };

   const handleGoogleLoginSuccess = async (response) => {
      try {
         const res = await fetch(`${APP_URL}/api/auth/google/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ token: response.credential }),
         });

         const data = await res.json();
         console.log('Google login response:', data);

         if (!res.ok) {
            throw new Error(data.message || 'Google login failed.');
         }

         console.log('Google login successful:', data);
         await updateAuthStatus();
         navigate('/profile');
      } catch (err) {
         console.error('Google login error:', err.message);
         setError('Google login failed.');
      }
   };

   return (
      <div className="login-container">
         <div className="login-box">
            <h2 className="login-title">Login</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleLogin} className="login-form">
               <div className="input">
                  <label>Email</label>
                  <input
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                  />
               </div>
               <div className="input">
                  <label>Password</label>
                  <input
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                  />
               </div>
               <button type="submit" className="login-button">
                  Login
               </button>
               <button
                  type="button"
                  className="register-button"
                  onClick={() => navigate('/register')}
               >
                  Register
               </button>
            </form>
            <GoogleLogin
               onSuccess={handleGoogleLoginSuccess}
               onError={(error) => console.error('Google login failed', error)}
            />
         </div>
      </div>
   );
}

export default Login;
