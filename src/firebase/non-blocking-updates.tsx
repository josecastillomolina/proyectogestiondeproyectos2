'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function setDocumentNonBlocking(docRef: DocumentReference | null | undefined, data: any, options: SetOptions) {
  if (!docRef || !data) return;

  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef?.path || 'unknown',
        operation: 'write',
        requestResourceData: data,
      })
    );
  });
}

export function addDocumentNonBlocking(colRef: CollectionReference | null | undefined, data: any) {
  if (!colRef || !data) return;

  addDoc(colRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef?.path || 'unknown',
          operation: 'create',
          requestResourceData: data,
        })
      );
    });
}

export function updateDocumentNonBlocking(docRef: DocumentReference | null | undefined, data: any) {
  if (!docRef || !data) return;

  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef?.path || 'unknown',
          operation: 'update',
          requestResourceData: data,
        })
      );
    });
}

export function deleteDocumentNonBlocking(docRef: DocumentReference | null | undefined) {
  if (!docRef) return;

  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef?.path || 'unknown',
          operation: 'delete',
        })
      );
    });
}
