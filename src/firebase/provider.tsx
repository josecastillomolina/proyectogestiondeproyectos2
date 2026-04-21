'use client';

import React, { createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
}

interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseContextState {
  areServicesAvailable: boolean;
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface FirebaseServicesAndUser {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export interface UserHookResult { 
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true,
    userError: null,
  });

  useEffect(() => {
    // Si no hay instancia de Auth válida, marcamos como listo de inmediato
    if (!auth || !auth.config || (auth.config as any).apiKey === 'none') { 
      setUserAuthState({ user: null, isUserLoading: false, userError: null });
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (firebaseUser) => { 
          setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
        },
        (error) => { 
          console.warn("FirebaseProvider: onAuthStateChanged error:", error);
          setUserAuthState({ user: null, isUserLoading: false, userError: error });
        }
      );
      return () => unsubscribe();
    } catch (e) {
      setUserAuthState({ user: null, isUserLoading: false, userError: null });
    }
  }, [auth]); 

  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(
      firebaseApp && 
      firestore && 
      auth && 
      auth.config && 
      (auth.config as any).apiKey !== 'none'
    );
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp,
      firestore,
      auth,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseServicesAndUser | null => {
  const context = useContext(FirebaseContext);
  if (context === undefined) return null;
  
  if (!context.firebaseApp || !context.firestore || !context.auth || (context.auth.config as any).apiKey === 'none') {
    return null;
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

export const useAuth = (): Auth | null => {
  const context = useContext(FirebaseContext);
  return context?.auth || null;
};

export const useFirestore = (): Firestore | null => {
  const context = useContext(FirebaseContext);
  return context?.firestore || null;
};

export const useFirebaseApp = (): FirebaseApp | null => {
  const context = useContext(FirebaseContext);
  return context?.firebaseApp || null;
};

export function useMemoFirebase<T>(factory: () => T, deps: React.DependencyList): T {
  return useMemo(factory, deps);
}

export const useUser = (): UserHookResult => { 
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    return { user: null, isUserLoading: true, userError: null };
  }
  return { 
    user: context.user, 
    isUserLoading: context.isUserLoading, 
    userError: context.userError 
  };
};
