import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Register.css';
import useAuth from '../components/hooks/useAuth';
import APP_URL from '../components/config';

function Register() {
   const [username, setUsername] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [confirmPassword, setConfirmPassword] = useState('');
   const [error, setError] = useState('');
   const navigate = useNavigate();
   const { updateAuthStatus } = useAuth();

   const handleRegister = async (e) => {
      e.preventDefault();

      if (!username || !email || !password || !confirmPassword) {
         setError('Please fill in all fields.');
         return;
      }

      if (password !== confirmPassword) {
         setError('Passwords do not match.');
         return;
      }

      try {
         const response = await fetch(`${APP_URL}/api/users/register`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
         });

         const data = await response.json();

         if (response.ok) {
            setError('');
            await updateAuthStatus();
            navigate('/profile');
         } else {
            setError(data.message || 'Registration failed.');
         }
      } catch (err) {
         setError('Network error, please try again later.');
      }
   };

   return (
      <div className="register-container">
         <div className="register-box">
            <h2 className="register-title">Register</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleRegister} className="register-form">
               <div className="input">
                  <label>Username</label>
                  <input
                     type="text"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     required
                  />
               </div>
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
               <div className="input">
                  <label>Confirm Password</label>
                  <input
                     type="password"
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     required
                  />
               </div>
               <button type="submit" className="register-button">
                  Register
               </button>
            </form>
         </div>
      </div>
   );
}

export default Register;
