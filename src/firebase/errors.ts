'use client';
import { getAuth } from 'firebase/auth';
import { getApps } from 'firebase/app';

type SecurityRuleContext = {
  path?: string;
  operation?: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

interface SecurityRuleRequest {
  auth: { uid: string; token: any } | null;
  method: string;
  path: string;
  resource?: {
    data: any;
  };
}

function buildRequestObject(context?: SecurityRuleContext): SecurityRuleRequest {
  let authObject = null;
  
  // Verificación extra segura para evitar errores de .get en SSR o durante el build
  if (typeof window !== 'undefined' && getApps().length > 0) {
    try {
      const auth = getAuth();
      if (auth && auth.currentUser) {
        authObject = {
          uid: auth.currentUser.uid,
          token: {
            sub: auth.currentUser.uid,
            email: auth.currentUser.email || null,
          }
        };
      }
    } catch (e) {
      // Ignorar fallos de acceso a auth durante la construcción
    }
  }

  return {
    auth: authObject,
    method: context?.operation || 'unknown',
    path: `/databases/(default)/documents/${context?.path || 'unknown'}`,
    resource: context?.requestResourceData ? { data: context.requestResourceData } : undefined,
  };
}

export class FirestorePermissionError extends Error {
  public readonly request: SecurityRuleRequest;

  constructor(context?: SecurityRuleContext) {
    const requestObject = buildRequestObject(context);
    super(`Insufficient permissions at ${requestObject.path}`);
    this.name = 'FirebaseError';
    this.request = requestObject;
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
