import { IonApp, IonRouterOutlet, IonContent, IonPage, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Route, Redirect } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import InvoicePage from "./pages/InvoicePage";
import SettingsPage from "./pages/SettingsPage";
import InventoryPage from "./pages/InventoryPage";
import BusinessInfoPage from "./pages/BusinessInfoPage";
import OnboardingPage from "./pages/OnboardingPage";


import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";

import { InvoiceProvider } from "./contexts/InvoiceContext";
/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Theme variables */
import "./theme/variables.css";
import "./App.css";

setupIonicReact();

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>Something went wrong</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>{error.message}</p>
          <button
            onClick={resetErrorBoundary}
            style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--ion-color-primary, #3880ff)', color: '#fff', cursor: 'pointer', fontSize: '16px' }}
          >
            Try Again
          </button>
        </div>
      </IonContent>
    </IonPage>
  );
}

const AppContent: React.FC = () => {


  // Check if onboarding is completed
  const isOnboardingCompleted = localStorage.getItem("onboarding_completed") === "true";

  return (
    <IonApp className="light-theme">
      <InvoiceProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            {/* Onboarding / Welcome Page */}
            <Route exact path="/" render={() =>
              isOnboardingCompleted ? <Redirect to="/app/dashboard/home" /> : <OnboardingPage />
            } />

            {/* Dashboard Routes */}
            <Route path="/app/dashboard" render={() => (
              <>
                <DashboardLayout>
                  <IonRouterOutlet>
                    <Route exact path="/app/dashboard/home" component={DashboardHome} />
                    <Route exact path="/app/dashboard/inventory" component={InventoryPage} />
                    <Route exact path="/app/dashboard/business-info" component={BusinessInfoPage} />
                    <Route exact path="/app/dashboard/settings" component={SettingsPage} />

                    <Route exact path="/app/dashboard">
                      <Redirect to="/app/dashboard/home" />
                    </Route>
                  </IonRouterOutlet>
                </DashboardLayout>
              </>
            )} />

            {/* Editor Routes */}
            <Route exact path="/app/editor/:fileName" component={InvoicePage} />
            <Route exact path="/app/editor" component={InvoicePage} />

            {/* Legacy Redirects */}
            <Route exact path="/app/files">
              <Redirect to="/app/dashboard/home" />
            </Route>
            <Route exact path="/app/settings">
              <Redirect to="/app/dashboard/settings" />
            </Route>
            <Route exact path="/app/invoice-ai/:templateId">
              <Redirect to="/app/dashboard/home" />
            </Route>
            <Route exact path="/app/invoice-ai">
              <Redirect to="/app/dashboard/home" />
            </Route>
            <Route exact path="/app/invoice-store">
              <Redirect to="/app/dashboard/home" />
            </Route>
            <Route exact path="/app">
              <Redirect to="/app/dashboard/home" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </InvoiceProvider>
    </IonApp>
  );
};

const App: React.FC = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
    <AppContent />
  </ErrorBoundary>
);

export default App;
