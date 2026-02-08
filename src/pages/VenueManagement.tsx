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
  IonChip,
  IonText,
  IonAlert,
  useIonToast,
  IonCheckbox,
} from '@ionic/react';
import { create, trash, gitMerge, statsChart, refreshOutline } from 'ionicons/icons';
import apiService from '../services/api';
import { VenueStatisticsDto } from '../types/api';

const VenueManagement: React.FC = () => {
  const [present] = useIonToast();
  const [venues, setVenues] = useState<VenueStatisticsDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  // Form states
  const [selectedVenue, setSelectedVenue] = useState<VenueStatisticsDto | null>(null);
  const [newVenueName, setNewVenueName] = useState('');
  const [selectedVenuesForMerge, setSelectedVenuesForMerge] = useState<string[]>([]);
  const [targetMergeName, setTargetMergeName] = useState('');

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getVenueStatistics();
      setVenues(data);
    } catch (error) {
      console.error('Error loading venues:', error);
      present({
        message: 'Failed to load venues',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async (event: any) => {
    await loadVenues();
    event.detail.complete();
  };

  const handleRenameClick = (venue: VenueStatisticsDto) => {
    setSelectedVenue(venue);
    setNewVenueName(venue.venueName);
    setShowRenameModal(true);
  };

  const handleRenameSubmit = async () => {
    if (!selectedVenue || !newVenueName.trim()) return;

    try {
      const result = await apiService.renameVenue({
        oldName: selectedVenue.venueName,
        newName: newVenueName.trim(),
      });
      
      present({
        message: result.message || `Venue renamed successfully. ${result.schedulesUpdated} schedules updated.`,
        duration: 3000,
        color: 'success',
      });
      
      setShowRenameModal(false);
      setSelectedVenue(null);
      setNewVenueName('');
      loadVenues();
    } catch (error: any) {
      present({
        message: error.response?.data?.message || 'Failed to rename venue',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  const handleMergeClick = () => {
    setSelectedVenuesForMerge([]);
    setTargetMergeName('');
    setShowMergeModal(true);
  };

  const toggleVenueForMerge = (venueName: string) => {
    if (selectedVenuesForMerge.includes(venueName)) {
      setSelectedVenuesForMerge(selectedVenuesForMerge.filter(v => v !== venueName));
    } else {
      setSelectedVenuesForMerge([...selectedVenuesForMerge, venueName]);
    }
  };

  const handleMergeSubmit = async () => {
    if (selectedVenuesForMerge.length < 2 || !targetMergeName.trim()) {
      present({
        message: 'Please select at least 2 venues and provide a target name',
        duration: 3000,
        color: 'warning',
      });
      return;
    }

    try {
      const result = await apiService.mergeVenues({
        targetName: targetMergeName.trim(),
        venuesToMerge: selectedVenuesForMerge,
      });
      
      present({
        message: result.message || `Venues merged successfully. ${result.schedulesUpdated} schedules updated.`,
        duration: 3000,
        color: 'success',
      });
      
      setShowMergeModal(false);
      setSelectedVenuesForMerge([]);
      setTargetMergeName('');
      loadVenues();
    } catch (error: any) {
      present({
        message: error.response?.data?.message || 'Failed to merge venues',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  const handleDeleteClick = (venue: VenueStatisticsDto) => {
    setSelectedVenue(venue);
    setShowDeleteAlert(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVenue) return;

    try {
      const result = await apiService.deleteVenue(selectedVenue.venueName);
      
      present({
        message: result.message || `Venue deleted. ${result.schedulesDeleted} schedules and ${result.bookingsAffected} bookings removed.`,
        duration: 4000,
        color: 'success',
      });
      
      setShowDeleteAlert(false);
      setSelectedVenue(null);
      loadVenues();
    } catch (error: any) {
      present({
        message: error.response?.data?.message || 'Failed to delete venue',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Venue Management</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={loadVenues}>
              <IonIcon icon={refreshOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div style={{ padding: '16px' }}>
          <IonButton expand="block" onClick={handleMergeClick} style={{ marginBottom: '16px' }}>
            <IonIcon icon={gitMerge} slot="start" />
            Merge Venues
          </IonButton>

          {venues.length === 0 && !isLoading && (
            <IonCard>
              <IonCardContent>
                <IonText color="medium">
                  <p style={{ textAlign: 'center' }}>No venues found</p>
                </IonText>
              </IonCardContent>
            </IonCard>
          )}

          {venues.map((venue) => (
            <IonCard key={venue.venueName}>
              <IonCardHeader>
                <IonCardTitle>{venue.venueName}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ marginBottom: '12px' }}>
                  <IonChip color="primary">
                    <IonLabel>Total: {venue.totalSchedules}</IonLabel>
                  </IonChip>
                  <IonChip color="success">
                    <IonLabel>Future: {venue.futureSchedules}</IonLabel>
                  </IonChip>
                  <IonChip color="medium">
                    <IonLabel>Past: {venue.pastSchedules}</IonLabel>
                  </IonChip>
                  <IonChip color="tertiary">
                    <IonLabel>Bookings: {venue.totalBookings}</IonLabel>
                  </IonChip>
                </div>

                {venue.mostPopularSport && (
                  <p>
                    <strong>Most Popular Sport:</strong> {venue.mostPopularSport}
                  </p>
                )}
                
                <p>
                  <strong>Avg Bookings/Schedule:</strong> {venue.averageBookingsPerSchedule.toFixed(1)}
                </p>
                
                {venue.firstScheduleDate && (
                  <p>
                    <strong>First Schedule:</strong> {formatDate(venue.firstScheduleDate)}
                  </p>
                )}
                
                {venue.lastScheduleDate && (
                  <p>
                    <strong>Last Schedule:</strong> {formatDate(venue.lastScheduleDate)}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                  <IonButton
                    size="small"
                    fill="outline"
                    color="primary"
                    onClick={() => handleRenameClick(venue)}
                  >
                    <IonIcon icon={create} slot="start" />
                    Rename
                  </IonButton>
                  <IonButton
                    size="small"
                    fill="outline"
                    color="danger"
                    onClick={() => handleDeleteClick(venue)}
                  >
                    <IonIcon icon={trash} slot="start" />
                    Delete
                  </IonButton>
                </div>
              </IonCardContent>
            </IonCard>
          ))}
        </div>

        {/* Rename Modal */}
        <IonModal isOpen={showRenameModal} onDidDismiss={() => setShowRenameModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Rename Venue</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowRenameModal(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedVenue && (
              <>
                <IonItem>
                  <IonLabel position="stacked">Current Name</IonLabel>
                  <IonInput value={selectedVenue.venueName} disabled />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">New Name *</IonLabel>
                  <IonInput
                    value={newVenueName}
                    onIonInput={(e) => setNewVenueName(e.detail.value!)}
                    placeholder="Enter new venue name"
                  />
                </IonItem>
                <IonButton
                  expand="block"
                  onClick={handleRenameSubmit}
                  disabled={!newVenueName.trim() || newVenueName === selectedVenue.venueName}
                  style={{ marginTop: '20px' }}
                >
                  Rename Venue
                </IonButton>
              </>
            )}
          </IonContent>
        </IonModal>

        {/* Merge Modal */}
        <IonModal isOpen={showMergeModal} onDidDismiss={() => setShowMergeModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Merge Venues</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowMergeModal(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Target Venue Name *</IonLabel>
              <IonInput
                value={targetMergeName}
                onIonInput={(e) => setTargetMergeName(e.detail.value!)}
                placeholder="Enter target venue name"
              />
            </IonItem>

            <IonText color="medium">
              <p style={{ marginTop: '16px', marginBottom: '8px' }}>
                Select venues to merge (minimum 2):
              </p>
            </IonText>

            <IonList>
              {venues.map((venue) => (
                <IonItem key={venue.venueName}>
                  <IonCheckbox
                    slot="start"
                    checked={selectedVenuesForMerge.includes(venue.venueName)}
                    onIonChange={() => toggleVenueForMerge(venue.venueName)}
                  />
                  <IonLabel>
                    <h3>{venue.venueName}</h3>
                    <p>{venue.totalSchedules} schedules</p>
                  </IonLabel>
                </IonItem>
              ))}
            </IonList>

            <IonButton
              expand="block"
              onClick={handleMergeSubmit}
              disabled={selectedVenuesForMerge.length < 2 || !targetMergeName.trim()}
              style={{ marginTop: '20px' }}
            >
              Merge {selectedVenuesForMerge.length} Venues
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Delete Alert */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Venue"
          message={
            selectedVenue
              ? `Are you sure you want to delete "${selectedVenue.venueName}"? This will remove ${selectedVenue.futureSchedules} future schedules and affect ${selectedVenue.totalBookings} bookings.`
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

export default VenueManagement;
