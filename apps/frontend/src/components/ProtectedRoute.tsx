import { useAppSelector } from '@/hooks/hooks';
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const {isAuthenticated} = useAppSelector(state => state.user);
  return isAuthenticated ? <Outlet/> : <Navigate to={"/login"} replace />;
};

export default ProtectedRoute;
