import React, { Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import './App.css';
import InitialStepperRoute from './components/InitialStepperRoute';
import ProtectedRoute from './components/ProtectedRoute';
import SideNavigation from './components/SideNavigation';
import TopLoader from './components/TopLoader';
import VerificationRoute from './components/VerificationRoute';
import { useAppSelector } from './hooks/hooks';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuthActions } from './hooks/userHooks';
import { onMessage } from 'firebase/messaging';
import { messaging } from './notifications/firebase';
import { useGlobalSocketListeners } from './hooks/useGlobalSocketListeners';

const Profile = React.lazy(() => import('./pages/Profile'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const Friends = React.lazy(() => import('./pages/Friends'));
const OperationInfo = React.lazy(() => import('./pages/OperationInfo'));
const Verification = React.lazy(() => import('./pages/Verification'));
const InitialStepper = React.lazy(() => import('./pages/InitialStepper'));
const ErrorPage = React.lazy(() => import('./pages/ErrorPage'));
const ForgetPassword = React.lazy(() => import('./pages/ForgetPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const SearchUser = React.lazy(() => import('./pages/SearchUser'));
const UserProfile = React.lazy(() => import('./pages/UserProfile'));

function App() {
  const { isAuthenticated, user } = useAppSelector(state => state.user);
  const { isDetailsOn, selectedChat } = useAppSelector((state) => state.selectedChat);
  const { chatMap, orderedChatIds, participants } = useAppSelector((state) => state.chats);
  const { messages } = useAppSelector((state) => state.messages);
  const { loadUser, loading } = useAuthActions();

  useGlobalSocketListeners(selectedChat, user, chatMap, participants);

  useEffect(() => {
    onMessage(messaging, (payload) => {
      console.log("Message received. ", payload);
    })
  }, [])

  useEffect(() => {
    (async () => {
      if (location.pathname.includes("/verify") || location.pathname.includes("/password/reset")) return;
      if (isAuthenticated) return;
      await loadUser();
    })()
  }, []);

  return (
    <>
      {isAuthenticated && <SideNavigation />}
      <Routes>
        <Route path="/login" element={<Login auhtLoading={loading} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path='/forget-password' element={<Suspense fallback={<TopLoader />}><ForgetPassword /></Suspense>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home
            user={user} 
            orderedChatIds={orderedChatIds}
            chatMap={chatMap}
            isDetailsOn={isDetailsOn}
            messages={messages}
            participants={participants}
            selectedChat={selectedChat}
          />} />
          <Route path="/profile" element={<Suspense fallback={<TopLoader />}><Profile /></Suspense>} />
          <Route path="/notifications" element={<Suspense fallback={<TopLoader />}><Notifications /></Suspense>} />
          <Route path="/friends" element={<Suspense fallback={<TopLoader />}><Friends /></Suspense>} />
          <Route path="/search" element={<Suspense fallback={<TopLoader />}><SearchUser /></Suspense>} />
          <Route path="/user/:userId" element={<Suspense fallback={<TopLoader />}><UserProfile /></Suspense>} />
        </Route>
        <Route element={<VerificationRoute />}>
          <Route path='/operation-info/:type' element={<Suspense fallback={<TopLoader />}><OperationInfo /></Suspense>} />
          <Route path='/verify/:veriticationToken' element={<Suspense fallback={<TopLoader />}><Verification /></Suspense>} />
          <Route path='/password/reset/:resetToken' element={<Suspense fallback={<TopLoader />}><ResetPassword /></Suspense>} />
        </Route>
        <Route element={<InitialStepperRoute />}>
          <Route path='/initial-stepper' element={<Suspense fallback={<TopLoader />}><InitialStepper /></Suspense>} />
        </Route>
        <Route path="*" element={<Suspense fallback={<TopLoader />}><ErrorPage /></Suspense>} />
      </Routes>
    </>
  )
}

export default App
