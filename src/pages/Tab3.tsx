import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonText,
  IonButton,
  IonIcon,
  IonBadge,
  IonAvatar,
  IonSpinner,
  useIonToast,
  IonAlert,
  IonModal,
  IonInput,
  IonToggle,
  IonButtons,
} from '@ionic/react';
import {
  personCircleOutline,
  mailOutline,
  callOutline,
  shieldCheckmarkOutline,
  logOutOutline,
  calendarOutline,
  personAddOutline,
  storefrontOutline,
  basketballOutline,
} from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import apiService from '../services/api';
import { UserResponse, RegisterRequest } from '../types/api';
import APP_CONFIG from '../config/app.config';
import './Tab3.css';

const Tab3: React.FC = () => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [present] = useIonToast();
  const history = useHistory();

  // New user form state
  const [newUserData, setNewUserData] = useState<RegisterRequest>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    isAdmin: false,
  });
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const userData = await apiService.getCurrentUser();
      setUser(userData);
    } catch (error: any) {
      console.error('Error loading user profile:', error);
      present({
        message: 'Failed to load profile. Please try again.',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = async () => {
    try {
      await apiService.logout();
      present({
        message: 'You have been logged out successfully',
        duration: 2000,
        color: 'success',
      });
      history.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, we still redirect to login since local data is cleared
      history.replace('/login');
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleOpenAddUser = () => {
    setNewUserData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      isAdmin: false,
    });
    setShowAddUserModal(true);
  };

  const handleCreateUser = async () => {
    // Validation
    if (!newUserData.name || !newUserData.email || !newUserData.password || !newUserData.confirmPassword) {
      present({
        message: 'Please fill in all required fields',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    if (newUserData.password !== newUserData.confirmPassword) {
      present({
        message: 'Passwords do not match',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    if (newUserData.password.length < 6) {
      present({
        message: 'Password must be at least 6 characters long',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    try {
      setIsCreatingUser(true);
      
      // Send the complete registration data including isAdmin flag
      await apiService.register(newUserData);
      
      present({
        message: `${newUserData.isAdmin ? 'Admin' : 'User'} created successfully!`,
        duration: 2000,
        color: 'success',
      });
      
      setShowAddUserModal(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMessage = 
        error.response?.data?.detail || 
        error.response?.data?.title ||
        error.response?.data?.errors?.[Object.keys(error.response?.data?.errors || {})[0]]?.[0] ||
        'Failed to create user. Please try again.';
      
      present({
        message: errorMessage,
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
          {user?.isAdmin && (
            <IonButtons slot="end">
              <IonButton onClick={handleOpenAddUser} color="primary">
                <IonIcon icon={personAddOutline} slot="start" />
                Add User
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Profile</IonTitle>
          </IonToolbar>
        </IonHeader>

        {isLoading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <IonText>
              <p>Loading profile...</p>
            </IonText>
          </div>
        ) : user ? (
          <div className="profile-container">
            {/* Profile Header */}
            <IonCard className="profile-header-card">
              <IonCardContent>
                <div className="profile-avatar-section">
                  <IonAvatar className="profile-avatar">
                    <IonIcon icon={personCircleOutline} />
                  </IonAvatar>
                  <div className="profile-header-info">
                    <h2>{user.name}</h2>
                    <div className="profile-badges">
                      <IonBadge color="primary">{user.role}</IonBadge>
                      {user.isAdmin && (
                        <IonBadge color="success">
                          <IonIcon icon={shieldCheckmarkOutline} /> Admin
                        </IonBadge>
                      )}
                    </div>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>

            {/* Profile Details */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Account Information</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem lines="none" className="profile-item">
                  <IonIcon icon={mailOutline} slot="start" color="primary" />
                  <IonLabel>
                    <p className="profile-label">Email</p>
                    <h3>{user.email}</h3>
                  </IonLabel>
                </IonItem>

                <IonItem lines="none" className="profile-item">
                  <IonIcon icon={callOutline} slot="start" color="primary" />
                  <IonLabel>
                    <p className="profile-label">Phone</p>
                    <h3>{user.phone || 'Not provided'}</h3>
                  </IonLabel>
                </IonItem>

                <IonItem lines="none" className="profile-item">
                  <IonIcon icon={calendarOutline} slot="start" color="primary" />
                  <IonLabel>
                    <p className="profile-label">Member Since</p>
                    <h3>{formatDate(user.createdAt)}</h3>
                  </IonLabel>
                </IonItem>

                <IonItem lines="none" className="profile-item">
                  <IonIcon icon={calendarOutline} slot="start" color="primary" />
                  <IonLabel>
                    <p className="profile-label">Last Login</p>
                    <h3>{formatDate(user.lastLoginAt)}</h3>
                  </IonLabel>
                </IonItem>
              </IonCardContent>
            </IonCard>

            {/* App Information */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>About</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonText color="medium">
                  <p>
                    <strong>{APP_CONFIG.APP_NAME}</strong> - Your sports community platform
                  </p>
                  <p className="ion-margin-top">
                    Version 1.0.0
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>

            {/* Logout Button */}
            <div className="logout-section">
              {user?.isAdmin && (
                <>
                  <IonButton
                    expand="block"
                    fill="outline"
                    color="tertiary"
                    onClick={() => history.push('/tabs/venue-management')}
                    className="ion-margin-bottom"
                  >
                    <IonIcon icon={storefrontOutline} slot="start" />
                    Manage Venues
                  </IonButton>
                  <IonButton
                    expand="block"
                    fill="outline"
                    color="secondary"
                    onClick={() => history.push('/tabs/sports-management')}
                    className="ion-margin-bottom"
                  >
                    <IonIcon icon={basketballOutline} slot="start" />
                    Manage Sports
                  </IonButton>
                </>
              )}
              <IonButton
                expand="block"
                color="danger"
                onClick={handleLogout}
                className="logout-button"
              >
                <IonIcon icon={logOutOutline} slot="start" />
                Logout
              </IonButton>
            </div>
          </div>
        ) : (
          <div className="error-state">
            <IonText color="danger">
              <h2>Failed to load profile</h2>
              <p>Please try refreshing the page</p>
            </IonText>
            <IonButton onClick={loadUserProfile}>Retry</IonButton>
          </div>
        )}

        {/* Logout Confirmation Alert */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header="Logout"
          message="Are you sure you want to logout?"
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Logout',
              role: 'confirm',
              handler: confirmLogout,
            },
          ]}
        />

        {/* Add User Modal */}
        <IonModal isOpen={showAddUserModal} onDidDismiss={() => setShowAddUserModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Add New User</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowAddUserModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonCard>
              <IonCardContent>
                <IonItem>
                  <IonLabel position="stacked">Full Name *</IonLabel>
                  <IonInput
                    value={newUserData.name}
                    onIonInput={(e) => setNewUserData({ ...newUserData, name: e.detail.value! })}
                    placeholder="Enter full name"
                    type="text"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Email *</IonLabel>
                  <IonInput
                    value={newUserData.email}
                    onIonInput={(e) => setNewUserData({ ...newUserData, email: e.detail.value! })}
                    placeholder="Enter email address"
                    type="email"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Phone (Optional)</IonLabel>
                  <IonInput
                    value={newUserData.phone}
                    onIonInput={(e) => setNewUserData({ ...newUserData, phone: e.detail.value! })}
                    placeholder="Enter phone number"
                    type="tel"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Password *</IonLabel>
                  <IonInput
                    value={newUserData.password}
                    onIonInput={(e) => setNewUserData({ ...newUserData, password: e.detail.value! })}
                    placeholder="Minimum 6 characters"
                    type="password"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Confirm Password *</IonLabel>
                  <IonInput
                    value={newUserData.confirmPassword}
                    onIonInput={(e) => setNewUserData({ ...newUserData, confirmPassword: e.detail.value! })}
                    placeholder="Re-enter password"
                    type="password"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel>Create as Admin</IonLabel>
                  <IonToggle
                    checked={newUserData.isAdmin}
                    onIonChange={(e) => setNewUserData({ ...newUserData, isAdmin: e.detail.checked })}
                  />
                </IonItem>

                <IonText color="medium" className="ion-padding">
                  <p style={{ fontSize: '0.85rem', marginTop: '10px' }}>
                    {newUserData.isAdmin 
                      ? '⚠️ Admin users can create and manage schedules.' 
                      : 'Regular users can view and join schedules.'}
                  </p>
                </IonText>

                <IonButton
                  expand="block"
                  className="ion-margin-top"
                  onClick={handleCreateUser}
                  disabled={isCreatingUser}
                >
                  {isCreatingUser ? (
                    <>
                      <IonSpinner name="crescent" /> Creating...
                    </>
                  ) : (
                    `Create ${newUserData.isAdmin ? 'Admin' : 'User'}`
                  )}
                </IonButton>
              </IonCardContent>
            </IonCard>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
