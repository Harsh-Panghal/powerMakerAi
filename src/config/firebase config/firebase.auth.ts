import axios from "axios";
import { auth } from "./firebase.config";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

export const secureAxios = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_API}`,
  withCredentials: true,
});

// Google Sign-In
export const handleGoogleSignIn = async (): Promise<any> => {
  const provider = new GoogleAuthProvider();
  try {
    const userCredential = await signInWithPopup(auth, provider); // Await this call
    const user = userCredential.user;

    // Get the Firebase ID token
    const token = await user.getIdToken(); // Use await to resolve the promise
    // //console.log("Token:", token);
    //console.log("User Info:", user.uid);

    // // Send token to the backend
     await fetch(
      `${import.meta.env.VITE_BACKEND_API}/chat/auth`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.uid }),
        credentials: "include", // Ensures cookies are included in cross-origin requests
      }
    );
    //console.log(verifyToken);
    return user;
  } catch (error) {
    console.error("Error during sign in:", error);
  }
};

// Email Sign-Up
export const handleEmailSignUp = async (
  email: string,
  password: string
): Promise<any> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    await sendEmailVerification(userCredential.user);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error during sign-up:", error);
    throw error;
  }
};

// Email Sign-In
export const handleEmailSignIn = async (
  email: string,
  password: string
): Promise<any> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    if (!userCredential.user.emailVerified) {
      throw new Error("Email not verified. Please check your inbox.");
    }

    return userCredential.user;
  } catch (error) {
    console.error("Error during sign-in:", error);
    throw error;
  }
};

// Sign-Out
export const handleSignOut = async (): Promise<boolean> => {
  try {
    await signOut(auth);
    //console.log("User signed out successfully");

    // Clear session cookie on backend
    try {
      await secureAxios.post("/chat/logout");
      //console.log("Backend session cleared");
    } catch (err) {
      console.warn("Failed to clear session cookie:", err);
    }

    return true;
  } catch (error) {
    console.error("Error signing out: ", error);
    return false;
  }
};


