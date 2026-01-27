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
  IonBackButton,
  IonButtons,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import apiService from '../services/api';
import APP_CONFIG from '../config/app.config';
import './Register.css';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [present] = useIonToast();
  const history = useHistory();

  const validateName = (name: string): boolean => {
    if (!name.trim()) {
      setNameError('Name is required');
      return false;
    }
    if (name.trim().length < APP_CONFIG.VALIDATION.NAME_MIN_LENGTH) {
      setNameError(`Name must be at least ${APP_CONFIG.VALIDATION.NAME_MIN_LENGTH} characters`);
      return false;
    }
    if (name.trim().length > APP_CONFIG.VALIDATION.NAME_MAX_LENGTH) {
      setNameError(`Name must not exceed ${APP_CONFIG.VALIDATION.NAME_MAX_LENGTH} characters`);
      return false;
    }
    setNameError('');
    return true;
  };

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

  const validatePhone = (phone: string): boolean => {
    if (phone && phone.length > APP_CONFIG.VALIDATION.PHONE_MAX_LENGTH) {
      setPhoneError(`Phone number must not exceed ${APP_CONFIG.VALIDATION.PHONE_MAX_LENGTH} characters`);
      return false;
    }
    // Basic phone validation (optional field)
    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      setPhoneError('Please enter a valid phone number');
      return false;
    }
    setPhoneError('');
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
    if (password.length > APP_CONFIG.VALIDATION.PASSWORD_MAX_LENGTH) {
      setPasswordError(`Password must not exceed ${APP_CONFIG.VALIDATION.PASSWORD_MAX_LENGTH} characters`);
      return false;
    }
    setPasswordError('');
    return true;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): boolean => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }
    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all inputs
    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPhoneValid = validatePhone(phone);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword, password);

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isPasswordValid || !isConfirmPasswordValid) {
      present({
        message: 'Please fix the errors before submitting',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        password,
        confirmPassword,
      });

      present({
        message: `Welcome, ${response.name}! Your account has been created.`,
        duration: 3000,
        color: 'success',
      });

      // Small delay to show the success message, then navigate
      setTimeout(() => {
        history.push('/tabs/home');
      }, 100);
    } catch (error: any) {
      console.error('Registration error:', error);

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.title ||
        error.response?.data?.errors
          ? Object.values(error.response.data.errors).flat().join(', ')
          : 'Registration failed. Please try again.';

      present({
        message: errorMessage,
        duration: 4000,
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
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Create Account</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="register-container">
          <div className="register-header">
            <IonText color="primary">
              <h1>Join {APP_CONFIG.APP_NAME}</h1>
            </IonText>
            <IonText color="medium">
              <p>Start booking your favorite sports activities</p>
            </IonText>
          </div>

          <form onSubmit={handleRegister} className="register-form">
            <IonItem>
              <IonLabel position="floating">Full Name *</IonLabel>
              <IonInput
                type="text"
                value={name}
                onIonInput={(e) => setName(e.detail.value!)}
                onIonBlur={() => validateName(name)}
                required
                disabled={isLoading}
              />
            </IonItem>
            {nameError && (
              <IonText color="danger" className="error-text">
                <small>{nameError}</small>
              </IonText>
            )}

            <IonItem>
              <IonLabel position="floating">Email *</IonLabel>
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
              <IonLabel position="floating">Phone (Optional)</IonLabel>
              <IonInput
                type="tel"
                value={phone}
                onIonInput={(e) => setPhone(e.detail.value!)}
                onIonBlur={() => validatePhone(phone)}
                disabled={isLoading}
              />
            </IonItem>
            {phoneError && (
              <IonText color="danger" className="error-text">
                <small>{phoneError}</small>
              </IonText>
            )}

            <IonItem>
              <IonLabel position="floating">Password *</IonLabel>
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

            <IonItem>
              <IonLabel position="floating">Confirm Password *</IonLabel>
              <IonInput
                type="password"
                value={confirmPassword}
                onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                onIonBlur={() => validateConfirmPassword(confirmPassword, password)}
                required
                disabled={isLoading}
              />
            </IonItem>
            {confirmPasswordError && (
              <IonText color="danger" className="error-text">
                <small>{confirmPasswordError}</small>
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
                  <IonSpinner name="crescent" /> Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </IonButton>

            <div className="register-footer">
              <IonText color="medium">
                <p>
                  Already have an account?{' '}
                  <a href="/login">Sign in here</a>
                </p>
              </IonText>
            </div>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;
