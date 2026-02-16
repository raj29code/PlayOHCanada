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
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  IonBadge,
  IonAvatar,
  IonRefresher,
  IonRefresherContent,
  useIonToast,
  IonAlert,
  RefresherEventDetail,
  IonToggle,
  IonItem,
  IonLabel,
} from '@ionic/react';
import { useState, useEffect } from 'react';
import { 
  locationOutline, 
  timeOutline, 
  peopleOutline, 
  calendarOutline,
  closeCircle,
  chevronDownCircleOutline,
} from 'ionicons/icons';
import AdminSchedules from './AdminSchedules';
import apiService from '../services/api';
import { BookingResponseDto } from '../types/api';
import './Bookings.css';

const Bookings: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<BookingResponseDto[]>([]);
  const [showPastBookings, setShowPastBookings] = useState(false);
  const [present] = useIonToast();
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<number | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      loadBookings();
    }
  }, [isAdmin, showPastBookings]);

  const checkAdminStatus = () => {
    const userData = apiService.getUserData();
    setIsAdmin(userData?.isAdmin || false);
    setIsLoading(false);
  };

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const timezoneOffset = -new Date().getTimezoneOffset();
      const bookingsData = await apiService.getMyBookings(timezoneOffset, showPastBookings);
      setBookings(bookingsData);
    } catch (error: any) {
      console.error('Error loading bookings:', error);
      present({
        message: 'Failed to load bookings. Please try again.',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadBookings();
    event.detail.complete();
  };

  const handleCancelBooking = (bookingId: number) => {
    setBookingToCancel(bookingId);
    setShowCancelAlert(true);
  };

  const confirmCancel = async () => {
    if (!bookingToCancel) return;

    try {
      await apiService.cancelBooking(bookingToCancel);
      present({
        message: 'Booking cancelled successfully',
        duration: 2000,
        color: 'success',
      });
      loadBookings();
    } catch (error: any) {
      console.error('Error cancelling booking:', error);
      present({
        message: 'Failed to cancel booking. Please try again.',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setShowCancelAlert(false);
      setBookingToCancel(null);
    }
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

  const getSportIcon = (sportIconUrl: string | null): string => {
    return sportIconUrl || 'https://via.placeholder.com/40?text=Sport';
  };

  if (isLoading && isAdmin === null) {
    return null;
  }

  // If user is admin, show admin schedules management
  if (isAdmin) {
    return <AdminSchedules />;
  }

  // Otherwise show user bookings
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Bookings</IonTitle>
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
            <IonTitle size="large">My Bookings</IonTitle>
          </IonToolbar>
        </IonHeader>

        {/* Show Past Bookings Toggle */}
        <div className="ion-padding">
          <IonItem>
            <IonLabel>Show Past Bookings</IonLabel>
            <IonToggle
              checked={showPastBookings}
              onIonChange={(e) => setShowPastBookings(e.detail.checked)}
            />
          </IonItem>
        </div>

        {isLoading ? (
          <div className="loading-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
            <IonSpinner name="crescent" />
            <IonText>
              <p>Loading bookings...</p>
            </IonText>
          </div>
        ) : bookings.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', padding: '40px 20px' }}>
            <IonText color="medium">
              <h2>No bookings found</h2>
              <p>{showPastBookings ? 'You have no bookings yet.' : 'You have no upcoming bookings.'}</p>
            </IonText>
          </div>
        ) : (
          <div className="bookings-list" style={{ padding: '0 16px' }}>
            {bookings.map((booking) => (
              <IonCard key={booking.id} style={{ marginBottom: '16px' }}>
                <IonCardHeader>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      <IonAvatar style={{ width: '40px', height: '40px' }}>
                        <img src={getSportIcon(booking.sportIconUrl)} alt={booking.sportName} />
                      </IonAvatar>
                      <div>
                        <IonCardTitle>{booking.sportName}</IonCardTitle>
                        <IonCardSubtitle>
                          <IonIcon icon={locationOutline} /> {booking.venue}
                        </IonCardSubtitle>
                      </div>
                    </div>
                    {booking.isPast && (
                      <IonBadge color="medium">Past</IonBadge>
                    )}
                  </div>
                </IonCardHeader>

                <IonCardContent>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IonIcon icon={calendarOutline} color="primary" />
                      <IonText>{formatDate(booking.scheduleStartTime)}</IonText>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IonIcon icon={timeOutline} color="primary" />
                      <IonText>
                        {formatTime(booking.scheduleStartTime)} - {formatTime(booking.scheduleEndTime)}
                      </IonText>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IonIcon icon={peopleOutline} color="primary" />
                      <IonText>
                        {booking.currentPlayers} / {booking.maxPlayers} players
                      </IonText>
                    </div>
                  </div>

                  {booking.equipmentDetails && (
                    <div style={{ marginBottom: '12px' }}>
                      <IonText color="medium">
                        <small>
                          <strong>Equipment:</strong> {booking.equipmentDetails}
                        </small>
                      </IonText>
                    </div>
                  )}

                  {booking.canCancel && (
                    <IonButton
                      expand="block"
                      color="danger"
                      fill="outline"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      <IonIcon icon={closeCircle} slot="start" />
                      Cancel Booking
                    </IonButton>
                  )}

                  {!booking.canCancel && !booking.isPast && (
                    <IonText color="medium">
                      <p style={{ fontSize: '0.85rem', textAlign: 'center', margin: '8px 0' }}>
                        This booking cannot be cancelled at this time.
                      </p>
                    </IonText>
                  )}
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        )}

        {/* Cancel Confirmation Alert */}
        <IonAlert
          isOpen={showCancelAlert}
          onDidDismiss={() => setShowCancelAlert(false)}
          header="Cancel Booking"
          message="Are you sure you want to cancel this booking? This action cannot be undone."
          buttons={[
            {
              text: 'Keep Booking',
              role: 'cancel',
            },
            {
              text: 'Cancel Booking',
              role: 'destructive',
              handler: confirmCancel,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Bookings;
