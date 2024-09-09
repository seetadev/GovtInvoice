import { IonInput, IonList, IonItem, IonButton } from "@ionic/react";
import React, { MouseEventHandler, useState } from "react";

interface ComponentProps {
  handleLogin: Function;
  handleSignUp: Function;
}

const LoginFormComponent: React.FC<ComponentProps> = ({
  handleLogin,
  handleSignUp,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const updateValue = (
    e: any,
    setter: React.Dispatch<React.SetStateAction<any>>
  ) => {
    setter(e.target.value);
  };

  return (
    <IonList>
      <IonItem>
        <IonInput
          required
          clearInput
          inputMode="email"
          pattern="email"
          id="email"
          value={email}
          onIonChange={(e) => updateValue(e, setEmail)}
          placeholder="Email.."
        />
      </IonItem>
      <IonItem>
        <IonInput
          required
          clearInput
          pattern="password"
          id="password"
          value={password}
          onIonChange={(e) => updateValue(e, setPassword)}
          placeholder="Password.."
        />
      </IonItem>
      <IonButton
        expand="full"
        className="ion-text-center"
        onClick={() => handleLogin(email, password)}
      >
        Login
      </IonButton>
      <IonButton
        expand="full"
        className="ion-text-center"
        onClick={() => handleSignUp(email, password)}
      >
        SignUp
      </IonButton>
    </IonList>
  );
};

export default LoginFormComponent;
