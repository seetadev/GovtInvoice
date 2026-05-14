import { IonInput, IonList, IonItem, IonButton, IonText } from "@ionic/react";
import React, { useState } from "react";

interface ComponentProps {
  handleLogin: (email: string, password: string) => Promise<string | undefined>;
  handleSignUp: (email: string, password: string) => Promise<string | undefined>;
}

const LoginFormComponent: React.FC<ComponentProps> = ({
  handleLogin,
  handleSignUp,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | undefined>(undefined);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [generalError, setGeneralError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateValue = (
    e: any,
    setter: React.Dispatch<React.SetStateAction<any>>,
    errorSetter: React.Dispatch<React.SetStateAction<string | undefined>>
  ) => {
    setter(e.target.value);
    errorSetter(undefined); // Clear specific error when typing
    setGeneralError(undefined); // Clear general error when typing
  };

  const onLoginClick = async () => {
    if (isSubmitting) return;
    
    setEmailError(undefined);
    setPasswordError(undefined);
    setGeneralError(undefined);
    setIsSubmitting(true);

    try {
      const error = await handleLogin(email, password);
      if (error) {
        // Error handling based on error message content
        if (error.toLowerCase().includes("email")) {
          setEmailError(error);
        } else if (error.toLowerCase().includes("password")) {
          setPasswordError(error);
        } else {
          setGeneralError(error);
        }
      }
    } catch (err) {
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignUpClick = async () => {
    if (isSubmitting) return;
    
    setEmailError(undefined);
    setPasswordError(undefined);
    setGeneralError(undefined);
    setIsSubmitting(true);

    try {
      const error = await handleSignUp(email, password);
      if (error) {
        // Error handling based on error message content
        if (error.toLowerCase().includes("email")) {
          setEmailError(error);
        } else if (error.toLowerCase().includes("password")) {
          setPasswordError(error);
        } else {
          setGeneralError(error);
        }
      }
    } catch (err) {
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonList>
      <IonItem>
        <IonInput
          required
          clearInput
          inputMode="email"
          id="email"
          value={email}
          onIonChange={(e) => updateValue(e, setEmail, setEmailError)}
          placeholder="Email.."
        />
      </IonItem>
      {emailError && (
        <IonText color="danger" className="ion-padding-start">
          <small>{emailError}</small>
        </IonText>
      )}
      
      <IonItem>
        <IonInput
          required
          clearInput
          type="password"
          id="password"
          value={password}
          onIonChange={(e) => updateValue(e, setPassword, setPasswordError)}
          placeholder="Password.."
        />
      </IonItem>
      {passwordError && (
        <IonText color="danger" className="ion-padding-start">
          <small>{passwordError}</small>
        </IonText>
      )}
      
      {generalError && (
        <IonText color="danger" className="ion-padding-start">
          <small>{generalError}</small>
        </IonText>
      )}

      <IonButton
        expand="full"
        className="ion-text-center"
        onClick={onLoginClick}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </IonButton>
      
      <IonButton
        expand="full"
        fill="outline"
        className="ion-text-center"
        onClick={onSignUpClick}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing up..." : "Sign Up"}
      </IonButton>
    </IonList>
  );
};

export default LoginFormComponent;