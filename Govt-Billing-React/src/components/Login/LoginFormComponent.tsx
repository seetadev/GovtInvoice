import { IonInput, IonList, IonItem, IonButton } from "@ionic/react";
import React, { useState } from "react";

interface ComponentProps {
  handleLogin: (email: string, password: string) => void;
  handleSignUp: (email: string, password: string) => void;
}

const LoginFormComponent: React.FC<ComponentProps> = ({
  handleLogin,
  handleSignUp,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const validateAndLogin = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail) {
      alert("Please enter an email address");
      return;
    }
    if (!trimmedPassword) {
      alert("Please enter a password");
      return;
    }
    if (trimmedPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    
    handleLogin(trimmedEmail, trimmedPassword);
  };

  const validateAndSignUp = () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail) {
      alert("Please enter an email address");
      return;
    }
    if (!trimmedPassword) {
      alert("Please enter a password");
      return;
    }
    if (trimmedPassword.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }
    
    handleSignUp(trimmedEmail, trimmedPassword);
  };

  return (
    <IonList>
      <IonItem>
        <IonInput
          type="email"
          placeholder="Email"
          value={email}
          onIonInput={(e) => setEmail(e.detail.value || "")}
          clearInput
        />
      </IonItem>
      <IonItem>
        <IonInput
          type="password"
          placeholder="Password"
          value={password}
          onIonInput={(e) => setPassword(e.detail.value || "")}
          clearInput
        />
      </IonItem>
      <IonButton
        expand="full"
        className="ion-text-center"
        onClick={validateAndLogin}
      >
        Login
      </IonButton>
      <IonButton
        expand="full"
        className="ion-text-center"
        color="secondary"
        onClick={validateAndSignUp}
      >
        Sign Up
      </IonButton>
    </IonList>
  );
};

export default LoginFormComponent;
