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
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  IonButton,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  IonText,
  IonChip,
  IonAvatar,
  useIonToast,
  RefresherEventDetail,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonAlert,
} from '@ionic/react';
import {
  locationOutline,
  timeOutline,
  peopleOutline,
  calendarOutline,
  chevronDownCircleOutline,
} from 'ionicons/icons';
import apiService from '../services/api';
import { ScheduleResponseDto, Sport, VenueDto } from '../types/api';
import './HomeFeed.css';

const HomeFeed: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleResponseDto[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [venues, setVenues] = useState<VenueDto[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showJoinAlert, setShowJoinAlert] = useState(false);
  const [scheduleToJoin, setScheduleToJoin] = useState<ScheduleResponseDto | null>(null);
  const [present] = useIonToast();

  useEffect(() => {
    loadData();

    // Listen for schedule deletion events
    const handleScheduleDeleted = () => {
      loadData();
    };

    window.addEventListener('scheduleDeleted', handleScheduleDeleted);
    window.addEventListener('allSchedulesDeleted', handleScheduleDeleted);

    return () => {
      window.removeEventListener('scheduleDeleted', handleScheduleDeleted);
      window.removeEventListener('allSchedulesDeleted', handleScheduleDeleted);
    };
  }, [selectedVenue]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // Fetch user data first to check if admin
      const userData = await apiService.getCurrentUser();
      setUser(userData);

      // Prepare schedule query parameters
      const scheduleParams: any = { 
        includeParticipants: true,
        timezoneOffsetMinutes: -new Date().getTimezoneOffset(),
        availableOnly: true,      // Only show schedules with available spots
        excludeJoined: true,       // Exclude schedules user has already joined
      };

      // Add venue filter if a venue is selected
      if (selectedVenue) {
        scheduleParams.venue = selectedVenue;
      }

      // Fetch schedules, sports, and venues in parallel
      const [schedulesData, sportsData, venuesData] = await Promise.all([
        apiService.getSchedules(scheduleParams),
        apiService.getSports(),
        !userData.isAdmin ? apiService.getVenues(-new Date().getTimezoneOffset()) : Promise.resolve([]),
      ]);

      setSchedules(schedulesData);
      setSports(sportsData);
      if (!userData.isAdmin) {
        setVenues(venuesData);
        console.log('Venues loaded:', venuesData);
        console.log('User is admin:', userData.isAdmin);
      } else {
        console.log('User is admin, not loading venues');
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      present({
        message: 'Failed to load schedules. Please try again.',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadData();
    event.detail.complete();
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleJoinSchedule = async (schedule: ScheduleResponseDto) => {
    setScheduleToJoin(schedule);
    setShowJoinAlert(true);
  };

  const confirmJoinSchedule = async () => {
    if (!scheduleToJoin) return;

    try {
      await apiService.joinSchedule({ scheduleId: scheduleToJoin.id });
      
      present({
        message: 'Successfully joined the schedule!',
        duration: 2000,
        color: 'success',
      });

      // Reload data to reflect the new booking
      loadData();
    } catch (error: any) {
      console.error('Error joining schedule:', error);
      
      const errorMessage = 
        error.response?.data?.detail || 
        error.response?.data?.title ||
        'Failed to join schedule. Please try again.';
      
      present({
        message: errorMessage,
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setShowJoinAlert(false);
      setScheduleToJoin(null);
    }
  };

  const getSportIcon = (sportIconUrl: string | null): string => {
    return sportIconUrl || 'https://via.placeholder.com/40?text=Sport';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Available Schedules</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent
            pullingIcon={chevronDownCircleOutline}
            pullingText="Pull to refresh"
            refreshingSpinner="crescent"
            refreshingText="Refreshing..."
          />
        </IonRefresher>

        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Available Schedules</IonTitle>
          </IonToolbar>
        </IonHeader>

        {/* Venue Filter for Non-Admin Users */}
        {user && !user.isAdmin && (
          <div className="ion-padding">
            <IonItem>
              <IonLabel>Select Venue</IonLabel>
              <IonSelect
                value={selectedVenue}
                placeholder="All Venues"
                onIonChange={(e) => setSelectedVenue(e.detail.value)}
                disabled={venues.length === 0}
              >
                <IonSelectOption value="">All Venues</IonSelectOption>
                {venues.map((venue, index) => (
                  <IonSelectOption key={index} value={venue.name}>
                    {venue.name} ({venue.availableSchedules} available)
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            {venues.length === 0 && (
              <IonText color="medium" className="ion-padding-start">
                <p style={{ fontSize: '0.85rem' }}>No venues available at this time.</p>
              </IonText>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <IonText>
              <p>Loading schedules...</p>
            </IonText>
          </div>
        ) : schedules.length === 0 ? (
          <div className="empty-state">
            <IonText color="medium">
              <h2>No schedules available</h2>
              <p>Check back later for upcoming sports events!</p>
            </IonText>
          </div>
        ) : (
          <div className="schedule-list">
            {schedules.map((schedule) => (
              <IonCard key={schedule.id} className="schedule-card">
                <IonCardHeader>
                  <div className="card-header-content">
                    <IonAvatar className="sport-avatar">
                      <img
                        src={getSportIcon(schedule.sportIconUrl)}
                        alt={schedule.sportName}
                      />
                    </IonAvatar>
                    <div className="card-header-text">
                      <IonCardTitle>{schedule.sportName}</IonCardTitle>
                      <IonCardSubtitle>
                        <IonIcon icon={locationOutline} /> {schedule.venue}
                      </IonCardSubtitle>
                    </div>
                    <IonBadge
                      color={schedule.spotsRemaining > 0 ? 'success' : 'danger'}
                      className="spots-badge"
                    >
                      {schedule.spotsRemaining > 0
                        ? `${schedule.spotsRemaining} spot${schedule.spotsRemaining !== 1 ? 's' : ''}`
                        : 'Full'}
                    </IonBadge>
                  </div>
                </IonCardHeader>

                <IonCardContent>
                  <div className="schedule-details">
                    <div className="detail-item">
                      <IonIcon icon={calendarOutline} color="primary" />
                      <IonText>{formatDate(schedule.startTime)}</IonText>
                    </div>
                    <div className="detail-item">
                      <IonIcon icon={timeOutline} color="primary" />
                      <IonText>
                        {formatTime(schedule.startTime)} -{' '}
                        {formatTime(schedule.endTime)}
                      </IonText>
                    </div>
                    <div className="detail-item">
                      <IonIcon icon={peopleOutline} color="primary" />
                      <IonText>
                        {schedule.currentPlayers} / {schedule.maxPlayers} players
                      </IonText>
                    </div>
                  </div>

                  {schedule.equipmentDetails && (
                    <div className="equipment-details">
                      <IonText color="medium">
                        <small>
                          <strong>Equipment:</strong> {schedule.equipmentDetails}
                        </small>
                      </IonText>
                    </div>
                  )}

                  <IonButton
                    expand="block"
                    className="join-button"
                    disabled={schedule.spotsRemaining === 0}
                    onClick={() => handleJoinSchedule(schedule)}
                  >
                    {schedule.spotsRemaining > 0 ? 'Join Schedule' : 'Schedule Full'}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}

        {/* Join Confirmation Alert */}
        <IonAlert
          isOpen={showJoinAlert}
          onDidDismiss={() => setShowJoinAlert(false)}
          header="Join Schedule"
          message={scheduleToJoin ? `Are you sure you want to join ${scheduleToJoin.sportName} at ${scheduleToJoin.venue}?` : 'Confirm joining this schedule?'}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Join',
              role: 'confirm',
              handler: confirmJoinSchedule,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default HomeFeed;
