import { useLocalStorageForRoute } from '@/hooks/useLocalStorage';
import { Navigate, Outlet } from 'react-router-dom';

const VerificationRoute = () => {
  const {getVerificationAccess} = useLocalStorageForRoute();
  return getVerificationAccess() ? <Outlet /> : <Navigate to="/error" />
}

export default VerificationRoute;