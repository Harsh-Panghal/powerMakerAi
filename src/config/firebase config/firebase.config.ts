import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, Auth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { AppDispatch } from "../../store/store";
import { clearUser, setAuthLoading, setisAuthenticated, User } from "../../redux/AuthSlice";
import { getStorage } from "firebase/storage";

// Define the firebase config structure
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore services
const auth: Auth = getAuth(app);
const firestore: Firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage };

// Monitor auth state and dispatch actions
export const monitorAuthState = (dispatch: AppDispatch) => {
  const auth = getAuth(app);
  onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        providerData: user.providerData,
      };
      // //console.log(userData)
      // //console.log(user)
      dispatch(setisAuthenticated(userData));
    } else {
      dispatch(clearUser());
    }
    dispatch(setAuthLoading(false))
  });
};
