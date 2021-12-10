import React from "react";
import { View, Text } from "react-native";
import * as Google from "expo-google-app-auth";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut,
  signInWithRedirect,
} from "@firebase/auth";
import { auth } from "../firebase";
import * as Application from "expo-application";
const AuthContext = React.createContext({});

const config = {
  androidClientId: "",
  iosClientId: "",
  scopes: ["profile", "email"],
  permissions: ["public_profile", "email", "gender", "location"],
};

export const AuthProvider = ({ children }) => {
  const [error, setError] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [loadingInitial, setLoadingInitial] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(
    () =>
      onAuthStateChanged(auth, user => {
        if (user) {
          //logged in..
          setUser(user);
        } else {
          setUser(null);
        }
        setLoadingInitial(false);
      }),
    []
  );

  const signInWithGoogle = async () => {
    await Google.logInAsync(config)
      .then(async logInResult => {
        if (logInResult.type === "success") {
          const { idToken, accessToken } = logInResult;
          const credential = GoogleAuthProvider.credential(
            idToken,
            accessToken
          );
          await signInWithCredential(auth, credential);
        }
        return Promise.reject();
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => setLoading(false));
  };

  const logout = async () => {
    setLoading(true);
    signOut(auth)
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  };

  const memoedValue = React.useMemo(
    () => ({
      user,
      loading,
      signInWithGoogle,
      logout,
      error,
    }),
    [user, loading, error]
  );

  return (
    <AuthContext.Provider value={memoedValue}>
      {!loadingInitial && children}
    </AuthContext.Provider>
  );
};

export default function useAuth() {
  return React.useContext(AuthContext);
}
