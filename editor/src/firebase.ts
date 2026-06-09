// Initializes the Firebase app and exports the service handles used across the
// editor: Auth (Google + email/password sign-in), Firestore (projects), and
// Storage (uploaded images). These config values are public by design — Firebase
// web keys are shipped to the browser; access is governed by security rules.

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyD50fPToc15MF3ivKGoaSkfSUMq5EyVrro',
  authDomain: 'brave-reason-367609.firebaseapp.com',
  databaseURL:
    'https://brave-reason-367609-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'brave-reason-367609',
  storageBucket: 'brave-reason-367609.firebasestorage.app',
  messagingSenderId: '1018562617771',
  appId: '1:1018562617771:web:cf19da192f567734c172ee',
  measurementId: 'G-VYJWEC1T8Z',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// ignoreUndefinedProperties lets optional config fields (e.g. an unset
// backgroundImage, option image, or points map) be omitted rather than rejected
// as `undefined` when writing to Firestore.
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true });
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
