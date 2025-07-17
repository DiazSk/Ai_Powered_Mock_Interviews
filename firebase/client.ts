import { getAuth } from 'firebase/auth';
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyB8ZBZdXF3AfJkkRaT4N8QLqJEvVC8z7JI',
  authDomain: 'prepwise-17240.firebaseapp.com',
  projectId: 'prepwise-17240',
  storageBucket: 'prepwise-17240.firebasestorage.app',
  messagingSenderId: '433978208580',
  appId: '1:433978208580:web:62d07cf5e87f78439f2711',
  measurementId: 'G-RRPFSQP9W6',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const db = getFirestore(app);
