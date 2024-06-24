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

  const doSignIn = async (email: string, password: string) => {
    try {
      await loginWithEmailPassword(email, password);
      closeLoginModal();
    } catch {
      console.error("Something Went Wrong");
    }
  };
  const doSignUp = async (email: string, password: string) => {
    try {
      await signUpWithEmailAndPassword(email, password);
      closeLoginModal();
    } catch {
      console.error("Something Went Wrong");
    }
  };
  const closeLoginModal = () => setOpenLoginModal(false);

  if (isLoading) {
    return (
      <React.Fragment>
        <IonButton slot="start" className="ion-padding-start" onClick={null}>
          <IonIcon icon={person} size="large" />
          Loading
        </IonButton>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <IonButton
        slot="start"
        className="ion-padding-start"
        onClick={async () => {
          if (!user) setOpenLoginModal(true);
          else {
            try {
              await logOut();
            } catch {
              console.error("Something Went Wrong");
            }
          }
        }}
      >
        <IonIcon icon={person} size="large" />
        {user ? "Logout" : "Login"}
      </IonButton>

      <IonModal isOpen={openLoginModal} animated onDidDismiss={closeLoginModal}>
        <LoginFormComponent handleSignUp={doSignUp} handleLogin={doSignIn} />
      </IonModal>
    </React.Fragment>
  );
};

export default Login;
