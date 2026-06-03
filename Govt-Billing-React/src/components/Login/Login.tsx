import React, { useState } from "react";
import { IonIcon, IonButton, IonModal } from "@ionic/react";
import { person } from "ionicons/icons";
import LoginFormComponent from "./LoginFormComponent";
import {
  logOut,
  signUpWithEmailAndPassword,
  loginWithEmailPassword,
} from "../../firebase/auth";
import useUser from "../../hooks/useUser";

const Login: React.FC = () => {
  const { user, isLoading } = useUser();
  const [openLoginModal, setOpenLoginModal] = useState(false);

  const doSignIn = async (email: string, password: string): Promise<string | undefined> => {
    const result = await loginWithEmailPassword(email, password);
    if (result.error) {
      return result.error; // Return error to display in form, don't close modal
    }
    if (result.user) {
      setOpenLoginModal(false); // Only close on success
      return undefined;
    }
    return "Authentication failed. Please try again.";
  };

  const doSignUp = async (email: string, password: string): Promise<string | undefined> => {
    const result = await signUpWithEmailAndPassword(email, password);
    if (result.error) {
      return result.error; // Return error to display in form, don't close modal
    }
    if (result.user) {
      setOpenLoginModal(false); // Only close on success
      return undefined;
    }
    return "Sign up failed. Please try again.";
  };

  const closeLoginModal = () => setOpenLoginModal(false);

  if (isLoading) {
    return (
      <IonButton slot="start" className="ion-padding-start">
        <IonIcon icon={person} size="large" />
        Loading...
      </IonButton>
    );
  }

  return (
    <>
      <IonButton
        slot="start"
        className="ion-padding-start"
        onClick={async () => {
          if (!user) {
            setOpenLoginModal(true);
          } else {
            await logOut();
          }
        }}
      >
        <IonIcon icon={person} size="large" />
        {user ? "Logout" : "Login"}
      </IonButton>

      <IonModal isOpen={openLoginModal} animated onDidDismiss={closeLoginModal}>
        <div style={{ padding: "20px" }}>
          <h3 style={{ textAlign: "center", marginBottom: "20px" }}>
            Login / Sign Up
          </h3>
          <LoginFormComponent 
            handleLogin={doSignIn} 
            handleSignUp={doSignUp} 
          />
          <IonButton
            expand="full"
            color="medium"
            onClick={closeLoginModal}
            style={{ marginTop: "10px" }}
          >
            Cancel
          </IonButton>
        </div>
      </IonModal>
    </>
  );
};

export default Login;