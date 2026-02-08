import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
  IonModal,
  IonInput,
  IonButtons,
  IonRefresher,
  IonRefresherContent,
  IonText,
  IonAlert,
  useIonToast,
  IonAvatar,
  IonImg,
  IonChip,
  IonBadge,
} from '@ionic/react';
import { add, trash, create, refreshOutline, footballOutline } from 'ionicons/icons';
import apiService from '../services/api';
import { Sport, CreateSportDto, UpdateSportDto } from '../types/api';

const SportsManagement: React.FC = () => {
  const [present] = useIonToast();
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Form states
  const [selectedSport, setSelectedSport] = useState<Sport | null>(null);
  const [formData, setFormData] = useState<CreateSportDto>({
    name: '',
    iconUrl: '',
  });

  useEffect(() => {
    loadSports();
  }, []);

  const loadSports = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getSports();
      setSports(data);
    } catch (error) {
      console.error('Error loading sports:', error);
      present({
        message: 'Failed to load sports',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadSports();
    event.detail.complete();
  };

  const handleAddClick = () => {
    setIsEditMode(false);
    setFormData({ name: '', iconUrl: '' });
    setShowModal(true);
  };

  const handleEditClick = (sport: Sport) => {
    setIsEditMode(true);
    setSelectedSport(sport);
    setFormData({
      name: sport.name,
      iconUrl: sport.iconUrl || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      present({
        message: 'Please enter a sport name',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    try {
      if (isEditMode && selectedSport) {
        await apiService.updateSport(selectedSport.id, {
          name: formData.name.trim(),
          iconUrl: formData.iconUrl?.trim() || undefined,
        });
        present({
          message: 'Sport updated successfully',
          duration: 2000,
          color: 'success',
        });
      } else {
        await apiService.createSport({
          name: formData.name.trim(),
          iconUrl: formData.iconUrl?.trim() || undefined,
        });
        present({
          message: 'Sport created successfully',
          duration: 2000,
          color: 'success',
        });
      }
      
      setShowModal(false);
      setFormData({ name: '', iconUrl: '' });
      setSelectedSport(null);
      loadSports();
    } catch (error: any) {
      console.error('Error saving sport:', error);
      present({
        message: error.response?.data?.message || 'Failed to save sport',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  const handleDeleteClick = (sport: Sport) => {
    setSelectedSport(sport);
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSport) return;

    try {
      await apiService.deleteSport(selectedSport.id);
      present({
        message: 'Sport deleted successfully',
        duration: 2000,
        color: 'success',
      });
      
      setShowDeleteAlert(false);
      setSelectedSport(null);
      loadSports();
    } catch (error: any) {
      console.error('Error deleting sport:', error);
      present({
        message: error.response?.data?.message || 'Failed to delete sport. It may be in use by schedules.',
        duration: 4000,
        color: 'danger',
      });
    }
  };

  const getSportIcon = (sport: Sport) => {
    if (sport.iconUrl) {
      return sport.iconUrl;
    }
    return undefined;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sports Management</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={loadSports}>
              <IonIcon icon={refreshOutline} />
            </IonButton>
            <IonButton onClick={handleAddClick} color="primary">
              <IonIcon icon={add} slot="start" />
              Add Sport
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ padding: '16px' }}>
          {sports.length === 0 && !isLoading && (
            <IonCard>
              <IonCardContent>
                <IonText color="medium">
                  <p style={{ textAlign: 'center' }}>No sports found</p>
                  <p style={{ textAlign: 'center' }}>
                    <IonButton onClick={handleAddClick}>
                      <IonIcon icon={add} slot="start" />
                      Add Your First Sport
                    </IonButton>
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>
          )}

          <IonList>
            {sports.map((sport) => (
              <IonCard key={sport.id}>
                <IonItem lines="none">
                  <IonAvatar slot="start">
                    {sport.iconUrl ? (
                      <IonImg src={sport.iconUrl} alt={sport.name} />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f0f0f0',
                        }}
                      >
                        <IonIcon icon={footballOutline} style={{ fontSize: '24px' }} />
                      </div>
                    )}
                  </IonAvatar>
                  <IonLabel>
                    <h2>{sport.name}</h2>
                    <p>Sport ID: {sport.id}</p>
                  </IonLabel>
                  <div slot="end" style={{ display: 'flex', gap: '8px' }}>
                    <IonButton
                      fill="clear"
                      size="small"
                      color="primary"
                      onClick={() => handleEditClick(sport)}
                    >
                      <IonIcon icon={create} />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      size="small"
                      color="danger"
                      onClick={() => handleDeleteClick(sport)}
                    >
                      <IonIcon icon={trash} />
                    </IonButton>
                  </div>
                </IonItem>
              </IonCard>
            ))}
          </IonList>
        </div>

        {/* Add/Edit Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{isEditMode ? 'Edit Sport' : 'Add Sport'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Sport Name *</IonLabel>
              <IonInput
                value={formData.name}
                onIonInput={(e) => setFormData({ ...formData, name: e.detail.value! })}
                placeholder="e.g., Basketball, Soccer, Tennis"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Icon URL (Optional)</IonLabel>
              <IonInput
                value={formData.iconUrl}
                onIonInput={(e) => setFormData({ ...formData, iconUrl: e.detail.value! })}
                placeholder="https://example.com/icon.png"
              />
            </IonItem>

            {formData.iconUrl && (
              <IonCard style={{ marginTop: '16px' }}>
                <IonCardContent>
                  <IonText color="medium">
                    <p style={{ marginBottom: '8px' }}>Icon Preview:</p>
                  </IonText>
                  <div style={{ textAlign: 'center' }}>
                    <IonAvatar style={{ margin: '0 auto', width: '80px', height: '80px' }}>
                      <IonImg src={formData.iconUrl} alt="Preview" />
                    </IonAvatar>
                  </div>
                </IonCardContent>
              </IonCard>
            )}

            <IonCard style={{ marginTop: '16px' }}>
              <IonCardContent>
                <IonText color="medium" style={{ fontSize: '14px' }}>
                  <p>
                    <strong>Note:</strong> The icon URL should be a direct link to an image file
                    (PNG, JPG, SVG, etc.). Free icon resources: Flaticon, Icons8, or upload to
                    your server.
                  </p>
                </IonText>
              </IonCardContent>
            </IonCard>

            <IonButton
              expand="block"
              onClick={handleSubmit}
              disabled={!formData.name.trim()}
              style={{ marginTop: '20px' }}
            >
              {isEditMode ? 'Update Sport' : 'Create Sport'}
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Delete Alert */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Sport"
          message={
            selectedSport
              ? `Are you sure you want to delete "${selectedSport.name}"? This action cannot be undone and may affect existing schedules.`
              : ''
          }
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: handleDeleteConfirm,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default SportsManagement;
