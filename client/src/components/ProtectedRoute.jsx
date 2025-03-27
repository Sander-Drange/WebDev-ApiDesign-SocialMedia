import { Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

const ProtectedRoute = ({ children }) => {
   const { loggedIn } = useAuth();

   if (loggedIn === null) {
      return <div>Loading...</div>;
   }

   return loggedIn ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
