import * as React from 'react';
import {Outlet, useParams} from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import type { Authentication } from '@toolpad/core/AppProvider';
import { firebaseSignOut, onAuthStateChanged } from './firebase/auth';
import SessionContext, { type Session } from './SessionContext';
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {User} from "./types/UsersTypes";
import {UsersStore} from "./stores/UsersStore";
import {useNavigation} from "./hooks/navigation";
import {LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFnsV3";

const BRANDING = {
  title: "Route Master"
};

const AUTHENTICATION: Authentication = {
  signIn: () => {},
  signOut: firebaseSignOut,
};

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const {projectId} = useParams();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const sessionContextValue = React.useMemo(
      () => ({
        session,
        setSession,
        loading,
      }),
      [session, loading],
  );

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setSession(null);
        setLoading(false);
        navigate("/sign-in");
        return;
      }

      setSession({
        user: {
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          image: firebaseUser.photoURL || '',
        },
      });

      const userSubscription = UsersStore.getCurrentUser().subscribe({
        next: (userData) => {
          setUser(userData);
          setLoading(false);
        },
        error: (error) => {
          console.error("Error loading user data:", error);
          setLoading(false);
          navigate("/sign-in");
        }
      });

      return () => userSubscription.unsubscribe();
    });

    return () => authUnsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (loading || !user) {
      return;
    }

    if (projectId) {
      return;
    }

    if (user.projects.length === 0) {
    } else if (user.projects.length === 1) {
      // Single project - navigate directly
      navigate(`/projects/${user.projects[0].projectId}`);
    } else {
      const defaultProject = user.projects.find(p => p.isDefaultProject) || user.projects[0];
      navigate(`/projects/${defaultProject.projectId}`);
    }
  }, [user, loading, projectId, navigate]);

  return (
      <ReactRouterAppProvider
          navigation={navigation}
          branding={BRANDING}
          session={session}
          authentication={AUTHENTICATION}
      >
        <SessionContext.Provider value={sessionContextValue}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Outlet />
          </LocalizationProvider>
        </SessionContext.Provider>
      </ReactRouterAppProvider>
  );
}