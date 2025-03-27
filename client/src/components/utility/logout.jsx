import { googleLogout } from '@react-oauth/google';
import APP_URL from '../config';

const logout = async (navigate) => {
   try {
      await fetch(`${APP_URL}/api/users/logout`, {
         method: 'POST',
         credentials: 'include',
      });
      navigate('/');
      alert('You have been logged out.');
   } catch (error) {
      console.error('Logout error:', error);
      alert('Logout failed. Please try again.');
   }
};
/*
function Logout() {
   const onSuccess = () => {
      console.log('Logout successful');
   };

   return (
      <div>
         <googleLogout
            clientId={clientId}
            buttonText="Logout"
            onSuccess={onSuccess}
         />
      </div>
 
 );
}
*/

export default logout;
