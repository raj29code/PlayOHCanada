import { Redirect, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { homeOutline, calendarOutline, personOutline } from 'ionicons/icons';
import HomeFeed from './pages/HomeFeed';
import Bookings from './pages/Bookings';
import Tab3 from './pages/Tab3';
import Login from './pages/Login';
import Register from './pages/Register';
import VenueManagement from './pages/VenueManagement';
import SportsManagement from './pages/SportsManagement';
import apiService from './services/api';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(apiService.isAuthenticated());

  useEffect(() => {
    // Re-check authentication on location change
    setIsAuthenticated(apiService.isAuthenticated());
  }, [location]);

  return isAuthenticated ? <>{children}</> : <Redirect to="/login" />;
};

const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Public Routes */}
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/register">
            <Register />
          </Route>

          {/* Protected Routes - Tabs */}
          <Route path="/tabs">
            <AuthenticatedRoute>
              <IonTabs>
                <IonRouterOutlet>
                  <Route exact path="/tabs/home">
                    <HomeFeed />
                  </Route>
                  <Route exact path="/tabs/bookings">
                    <Bookings />
                  </Route>
                  <Route path="/tabs/profile">
                    <Tab3 />
                  </Route>
                  <Route exact path="/tabs/venue-management">
                    <VenueManagement />
                  </Route>
                  <Route exact path="/tabs/sports-management">
                    <SportsManagement />
                  </Route>
                  <Route exact path="/tabs">
                    <Redirect to="/tabs/home" />
                  </Route>
                </IonRouterOutlet>
                <IonTabBar slot="bottom">
                  <IonTabButton tab="home" href="/tabs/home">
                    <IonIcon aria-hidden="true" icon={homeOutline} />
                    <IonLabel>Home</IonLabel>
                  </IonTabButton>
                  <IonTabButton tab="bookings" href="/tabs/bookings">
                    <IonIcon aria-hidden="true" icon={calendarOutline} />
                    <IonLabel>My Bookings</IonLabel>
                  </IonTabButton>
                  <IonTabButton tab="profile" href="/tabs/profile">
                    <IonIcon aria-hidden="true" icon={personOutline} />
                    <IonLabel>Profile</IonLabel>
                  </IonTabButton>
                </IonTabBar>
              </IonTabs>
            </AuthenticatedRoute>
          </Route>

          {/* Root Redirect */}
          <Route exact path="/">
            <AuthenticatedRoute>
              <Redirect to="/tabs/home" />
            </AuthenticatedRoute>
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
