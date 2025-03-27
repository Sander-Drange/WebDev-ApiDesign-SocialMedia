import { useState, useEffect } from 'react';
import APP_URL from '../config.js';

export const isAuthenticated = async () => {
   try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${APP_URL}/api/users/profile`, {
         method: 'GET',
         headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
         },
         credentials: 'include',
      });

      if (response.status === 401) {
         console.log('User is NOT authenticated');
         return false;
      }

      if (!response.ok) {
         throw new Error('Failed to check authentication');
      }

      console.log('User is authenticated');
      return true;
   } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
   }
};

const useAuth = () => {
   const [loggedIn, setLoggedIn] = useState(null);

   useEffect(() => {
      let isMounted = true;

      const checkAuth = async () => {
         const authStatus = await isAuthenticated();
         if (isMounted) setLoggedIn(authStatus);
      };

      checkAuth();

      return () => {
         isMounted = false;
      };
   }, []);

   const updateAuthStatus = async () => {
      const authStatus = await isAuthenticated();
      setLoggedIn(authStatus);
   };

   return { loggedIn, updateAuthStatus };
};

export default useAuth;
