import { Link, useNavigate } from 'react-router-dom';
import '../../styles/Navbar.css';
import logout from '../utility/logout';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
   const navigate = useNavigate();
   const { loggedIn, updateAuthStatus } = useAuth();

   const handleLogout = () => {
      logout(navigate);
      updateAuthStatus();
   };

   return (
      <nav className="navbar">
         <ul className="nav-links">
            <li>
               <Link to="/">Home</Link>
            </li>

            {loggedIn ? (
               <>
                  <li>
                     <Link to="/profile">Profile</Link>
                  </li>
                  <li>
                     <Link to="/create-post">Create Post</Link>
                  </li>
                  <li>
                     <button onClick={handleLogout} className="logout-button">
                        Logout
                     </button>
                  </li>
               </>
            ) : (
               <li>
                  <Link to="/login">Login/Register</Link>
               </li>
            )}
         </ul>
      </nav>
   );
};

export default Navbar;
