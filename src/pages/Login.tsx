import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonText,
  IonSpinner,
  useIonToast,
  IonImg,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import apiService from '../services/api';
import APP_CONFIG from '../config/app.config';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [present] = useIonToast();
  const history = useHistory();

  // Load remembered email on component mount
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REMEMBERED_EMAIL);
    if (rememberedEmail) {
      setEmail(rememberedEmail);
    }
  }, []);

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < APP_CONFIG.VALIDATION.PASSWORD_MIN_LENGTH) {
      setPasswordError(`Password must be at least ${APP_CONFIG.VALIDATION.PASSWORD_MIN_LENGTH} characters`);
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.login({ email, password });
      
      // Remember email for next time
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REMEMBERED_EMAIL, email.trim());
      
      present({
        message: `Welcome back, ${response.name}!`,
        duration: 2000,
        color: 'success',
      });

      // Small delay to show the success message, then navigate
      setTimeout(() => {
        history.push('/tabs/home');
      }, 100);
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessage = 
        error.response?.data?.detail || 
        error.response?.data?.title ||
        'Invalid email or password. Please try again.';
      
      present({
        message: errorMessage,
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Welcome to {APP_CONFIG.APP_NAME}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="login-container">
          <div className="login-header">
            <IonText color="primary">
              <h1>Sign In</h1>
            </IonText>
            <IonText color="medium">
              <p>Connect with your sports community</p>
            </IonText>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <IonItem>
              <IonLabel position="floating">Email</IonLabel>
              <IonInput
                type="email"
                value={email}
                onIonInput={(e) => setEmail(e.detail.value!)}
                onIonBlur={() => validateEmail(email)}
                required
                disabled={isLoading}
              />
            </IonItem>
            {emailError && (
              <IonText color="danger" className="error-text">
                <small>{emailError}</small>
              </IonText>
            )}

            <IonItem>
              <IonLabel position="floating">Password</IonLabel>
              <IonInput
                type="password"
                value={password}
                onIonInput={(e) => setPassword(e.detail.value!)}
                onIonBlur={() => validatePassword(password)}
                required
                disabled={isLoading}
              />
            </IonItem>
            {passwordError && (
              <IonText color="danger" className="error-text">
                <small>{passwordError}</small>
              </IonText>
            )}

            <IonButton
              expand="block"
              type="submit"
              className="ion-margin-top"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <IonSpinner name="crescent" /> Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </IonButton>

            <div className="login-footer">
              <IonText color="medium">
                <p>
                  Don't have an account?{' '}
                  <a href="/register">Sign up here</a>
                </p>
              </IonText>
            </div>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
