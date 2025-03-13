import { useLocalStorageForRoute } from '@/hooks/useLocalStorage';
import { Navigate, Outlet } from 'react-router-dom';

const InitialStepperRoute = () => {
  const {getInitialStepperAccess} = useLocalStorageForRoute();
  return getInitialStepperAccess() ? <Outlet /> : <Navigate to="/error" />
}

export default InitialStepperRoute;