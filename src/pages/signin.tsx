'use client';
import LinearProgress from '@mui/material/LinearProgress';
import {SignInPage, SupportedAuthProvider} from '@toolpad/core/SignInPage';
import { Navigate } from 'react-router';
import { useSession } from '../SessionContext';
import {signInWithEmail} from '../firebase/auth';
import {AuthProvider, AuthResponse} from "@toolpad/core";

export default function SignIn() {
  const { session, loading } = useSession();

  const providers: { id: SupportedAuthProvider; name: string }[] = [{ id: 'credentials', name: 'Email and password' },];

  const signIn: (
      provider: AuthProvider,
      formData?: FormData,
  ) => Promise<AuthResponse> | void = async (provider, formData) => {
    const email = formData?.get('email') as string;
    const password = formData?.get('password') as string;
    const remember = formData?.get('remember') == "true";

    const result = await signInWithEmail(email, password, remember);

    if (result.success) {
      return {
        success: "Erfolgreich angemeldet."
      };
    }

    return {
      error: result.error,
      type: "Anmeldung fehlgeschlagen",
    };
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (session) {
    return <Navigate to="/" />;
  }

  return (
    <SignInPage
      providers={providers}
      signIn={signIn}
      slotProps={{ emailField: { autoFocus: true } }}
    />
  );
}
