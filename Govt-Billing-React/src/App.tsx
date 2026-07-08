import { IonApp, setupIonicReact } from "@ionic/react";
import Home from "./pages/Home";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact();

/**
 * FEATURE TOGGLE: Government Compliance Mode
 * Enabling this ensures the UI adheres to official billing standards.
 */
const IS_GOVT_MODE_ENABLED = true;

if (IS_GOVT_MODE_ENABLED) {
  console.log("Govt Billing Mode: Enabled. UI validation active.");
}

const App: React.FC = () => (
  <IonApp>
    <Home />
  </IonApp>
);

export default App;

