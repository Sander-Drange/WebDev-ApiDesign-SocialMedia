import APP_URL from '../config';

export const isAuthenticated = async () => {
   try {
      const response = await fetch(`${APP_URL}/api/users/profile`, {
         method: 'GET',
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
