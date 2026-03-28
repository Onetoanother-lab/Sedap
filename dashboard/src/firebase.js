import { initializeApp } from 'firebase/app'
import { getAuth, GithubAuthProvider, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyD8i9UbJYk-Ag0YEfOmtYSlu7CZtxmg3hQ",
  authDomain: "auuu-2c154.firebaseapp.com",
  projectId: "auuu-2c154",
  storageBucket: "auuu-2c154.firebasestorage.app",
  messagingSenderId: "117275916035",
  appId: "1:117275916035:web:259b1badab74849f76db36",
  measurementId: "G-6DJJWZ63FB"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const githubProvider = new GithubAuthProvider()
