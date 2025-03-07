'use client';
import {SignInPage, SupportedAuthProvider} from '@toolpad/core/SignInPage';
import {signInWithEmail} from '../firebase/auth';
import {AuthProvider, AuthResponse} from "@toolpad/core";
import {useNavigate} from "react-router-dom";
import {useState} from 'react';

export default function SignIn() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const providers: { id: SupportedAuthProvider; name: string }[] = [
    { id: 'credentials', name: 'Email and password' }
  ];
  const navigate = useNavigate();

  const signIn: (
      provider: AuthProvider,
      formData?: FormData,
  ) => Promise<AuthResponse> | void = async (provider, formData) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const email = formData?.get('email') as string;
      const password = formData?.get('password') as string;
      const remember = formData?.get('remember') === "true";

      const result = await signInWithEmail(email, password, remember);

      if (result.success) {
        // Redirect to home page after successful login
        navigate("/");
        return {
          success: "Erfolgreich angemeldet."
        };
      }

      return {
        error: result.error,
        type: "Anmeldung fehlgeschlagen",
      };
    } catch (error) {
      return {
        error: "Ein unerwarteter Fehler ist aufgetreten.",
        type: "Anmeldung fehlgeschlagen",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <SignInPage
          providers={providers}
          signIn={signIn}
          slotProps={{ emailField: { autoFocus: true } }}
          callbackUrl={"/"}
      />
  );
}