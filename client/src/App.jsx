// React imports
import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
// Page imports
import Profile from './pages/Profile';
import Login from './pages/Login';
import Home from './pages/Home';
import PageNotFound from './pages/PageNotFound';
import CreatePost from './pages/CreatePost';
import Register from './pages/Register';
import Post from './pages/Post';
import EditPostPage from './pages/EditPostPage';
// Other imports
import './styles/index.css';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
   return (
      <BrowserRouter>
         <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/posts/:postId" element={<Post />} />

            <Route
               path="/profile"
               element={
                  <ProtectedRoute>
                     <Profile />
                  </ProtectedRoute>
               }
            />
            <Route
               path="/create-post"
               element={
                  <ProtectedRoute>
                     <CreatePost />
                  </ProtectedRoute>
               }
            />
            <Route
               path="/posts/edit/:postId"
               element={
                  <ProtectedRoute>
                     <EditPostPage />
                  </ProtectedRoute>
               }
            />

            <Route path="/*" element={<PageNotFound />} />
         </Routes>
      </BrowserRouter>
   );
}

export default App;
