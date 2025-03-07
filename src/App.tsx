import * as React from 'react';
import {Outlet, useParams} from 'react-router';
import { ReactRouterAppProvider } from '@toolpad/core/react-router';
import type { Authentication } from '@toolpad/core/AppProvider';
import { firebaseSignOut, onAuthStateChanged } from './firebase/auth';
import SessionContext, { type Session } from './SessionContext';
import {useEffect} from "react";
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
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<User>();
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
    const userSubscription = UsersStore.getCurrentUser().subscribe(user => {
      setUser(user);
      if (user) {
        setLoading(false);
      }
    });
    const authStateUnsubscribe = onAuthStateChanged((user) => {
      if (user) {
        setSession({
          user: {
            name: user.name || '',
            email: user.email || '',
            image: user.image || '',
          },
        });
      } else {
        setSession(null);
      }
    });

    return () => {
      userSubscription.unsubscribe();
      authStateUnsubscribe()
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      navigate("/no-connection");
    }

    if (projectId) {
      return;
    }

    if (user.projects.length === 1) {
      navigate(`/projects/${user.projects[0].projectId}`);
    } else if (user.projects.length > 1) {
      const defaultProject = user.projects.find(p => p.isDefaultProject)  || user.projects[0];
      navigate(`/projects/${defaultProject.projectId}`);
    }
  }, [user]);

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
