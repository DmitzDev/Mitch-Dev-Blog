import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

// Hardcoded for maximum reliability on all platforms (localhost + web.app)
const firebaseConfig = {
  apiKey: "AIzaSyDc6gPGSziFBd1yfLyqhl2TyoovF2rw4-c",
  authDomain: "mitch-dev-blog.firebaseapp.com",
  projectId: "mitch-dev-blog",
  storageBucket: "mitch-dev-blog.firebasestorage.app",
  messagingSenderId: "421149832449",
  appId: "1:421149832449:web:96f2bbe7033e01d7735700",
  databaseURL: "https://mitch-dev-blog-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
export const storage = getStorage(app);
