import { IonInput, IonList, IonItem, IonButton, IonText } from "@ionic/react";
import React, { useState } from "react";
import { useRateLimit } from "../../hooks/useRateLimit";

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
  const [isLoading, setIsLoading] = useState(false);
  
  // Rate limit hook
  const { remainingAttempts, isLocked, countdown } = useRateLimit(email);

  const updateValue = (
    e: any,
    setter: React.Dispatch<React.SetStateAction<string>>,
    errorSetter: React.Dispatch<React.SetStateAction<string | undefined>>
  ) => {
    setter(e.target.value);
    errorSetter(undefined);
    setGeneralError(undefined);
  };

const onLoginClick = async () => {
  if (isLocked) {
    setGeneralError(`Account is temporarily locked. Please try again in ${countdown}`);
    return;
  }
  
  setIsLoading(true);
  setEmailError(undefined);
  setPasswordError(undefined);
  setGeneralError(undefined);

  const error = await handleLogin(email, password);
  if (error) {
    // Check for rate limiting error
    if (error.includes("too many") || error.includes("locked") || error.includes("attempts")) {
      setGeneralError(error);
    } else if (error.toLowerCase().includes("email")) {
      setEmailError(error);
    } else if (error.toLowerCase().includes("password")) {
      setPasswordError(error);
    } else {
      setGeneralError(error);
    }
  }
  setIsLoading(false);
};
  const onSignUpClick = async () => {
    setIsLoading(true);
    setEmailError(undefined);
    setPasswordError(undefined);
    setGeneralError(undefined);

    const error = await handleSignUp(email, password);
    if (error) {
      if (error.toLowerCase().includes("email")) {
        setEmailError(error);
      } else if (error.toLowerCase().includes("password")) {
        setPasswordError(error);
      } else {
        setGeneralError(error);
      }
    }
    setIsLoading(false);
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
          {emailError}
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
          {passwordError}
        </IonText>
      )}
      
      {/* Rate limit warning display */}
      {remainingAttempts !== null && remainingAttempts <= 2 && remainingAttempts > 0 && !isLocked && (
        <IonText color="warning" className="ion-padding-start" style={{ fontSize: "12px" }}>
          Warning: {remainingAttempts} login attempt{remainingAttempts !== 1 ? 's' : ''} remaining
        </IonText>
      )}
      
      {isLocked && (
        <IonText color="danger" className="ion-padding-start">
          Account temporarily locked. Try again in {countdown}
        </IonText>
      )}
      
      {generalError && (
        <IonText color="danger" className="ion-padding-start">
          {generalError}
        </IonText>
      )}

      <IonButton
        expand="full"
        className="ion-text-center"
        onClick={onLoginClick}
        disabled={isLoading || isLocked}
      >
        {isLoading ? "Logging in..." : "Login"}
      </IonButton>
      
      <IonButton
        expand="full"
        fill="outline"
        className="ion-text-center"
        onClick={onSignUpClick}
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Sign Up"}
      </IonButton>
    </IonList>
  );
};

export default LoginFormComponent;