import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonSpinner,
  IonText,
  IonFab,
  IonFabButton,
  useIonToast,
  IonAlert,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonTextarea,
  IonButtons,
  IonToggle,
  IonCheckbox,
  IonList,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSearchbar,
} from '@ionic/react';
import { add, refresh, create, trash, trashBin, people } from 'ionicons/icons';
import { AgGridReact } from 'ag-grid-react';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import apiService from '../services/api';
import { ScheduleResponseDto, Sport, CreateScheduleDto, UpdateScheduleDto, RecurrenceDto, RecurrenceFrequency, DayOfWeek } from '../types/api';
import './AdminSchedules.css';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule]);

const AdminSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleResponseDto[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [present] = useIonToast();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);
  const [showDeleteAllAlert, setShowDeleteAllAlert] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<ScheduleResponseDto | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentScheduleId, setCurrentScheduleId] = useState<number | null>(null);
  
  // Venue autocomplete state
  const [venueSuggestions, setVenueSuggestions] = useState<string[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<string[]>([]);
  const [showVenueSuggestions, setShowVenueSuggestions] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateScheduleDto>({
    sportId: 0,
    venue: '',
    startDate: '',
    startTime: '',
    endTime: '',
    timezoneOffsetMinutes: -new Date().getTimezoneOffset(), // Convert to UTC offset
    maxPlayers: 10,
    equipmentDetails: '',
    recurrence: null,
  });

  // Recurrence state
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<RecurrenceFrequency>(RecurrenceFrequency.Weekly);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>('');
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<DayOfWeek[]>([]);
  const [intervalCount, setIntervalCount] = useState<number>(1);

  useEffect(() => {
    loadData();
    loadVenueSuggestions();
  }, []);

  const loadVenueSuggestions = async () => {
    try {
      const suggestions = await apiService.getVenueSuggestions();
      setVenueSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading venue suggestions:', error);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // By default, only show future schedules (from today onwards)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      const todayISO = today.toISOString();
      
      const [schedulesData, sportsData] = await Promise.all([
        apiService.getSchedules({ 
          includeParticipants: false,
          startDate: todayISO, // Only fetch schedules from today onwards
          timezoneOffsetMinutes: -new Date().getTimezoneOffset(), // Send timezone offset
        }),
        apiService.getSports(),
      ]);

      console.log('Loaded schedules:', schedulesData);
      console.log('Total schedules count:', schedulesData.length);

      // Filter schedules created by current admin
      // Note: API should ideally have an endpoint for this, but we'll filter client-side for now
      setSchedules(schedulesData);
      setSports(sportsData);
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

  const handleAddSchedule = () => {
    setIsEditMode(false);
    setCurrentScheduleId(null);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const nowTime = today.toTimeString().split(' ')[0]; // HH:mm:ss
    const laterTime = new Date(today.getTime() + 3600000).toTimeString().split(' ')[0]; // +1 hour
    
    setFormData({
      sportId: sports[0]?.id || 0,
      venue: '',
      startDate: todayStr,
      startTime: nowTime,
      endTime: laterTime,
      timezoneOffsetMinutes: -new Date().getTimezoneOffset(), // Convert to UTC offset
      maxPlayers: 10,
      equipmentDetails: '',
      recurrence: null,
    });
    // Reset recurrence state
    setIsRecurring(false);
    setRecurrenceFrequency(RecurrenceFrequency.Weekly);
    setRecurrenceEndDate('');
    setSelectedDaysOfWeek([]);
    setIntervalCount(1);
    setShowModal(true);
  };

  const handleEditSchedule = (schedule: ScheduleResponseDto) => {
    setIsEditMode(true);
    setCurrentScheduleId(schedule.id);
    
    // Extract date and time from the datetime strings
    const startDateTime = new Date(schedule.startTime);
    const endDateTime = new Date(schedule.endTime);
    const dateStr = startDateTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const startTimeStr = startDateTime.toTimeString().split(' ')[0]; // HH:mm:ss
    const endTimeStr = endDateTime.toTimeString().split(' ')[0]; // HH:mm:ss
    
    setFormData({
      sportId: schedule.sportId,
      venue: schedule.venue,
      startDate: dateStr,
      startTime: startTimeStr,
      endTime: endTimeStr,
      timezoneOffsetMinutes: -new Date().getTimezoneOffset(), // Use current timezone
      maxPlayers: schedule.maxPlayers,
      equipmentDetails: schedule.equipmentDetails || '',
      recurrence: null, // Note: Editing doesn't support recurrence changes
    });
    // Reset recurrence for edit mode (recurrence can't be edited)
    setIsRecurring(false);
    setShowModal(true);
  };

  const handleDeleteSchedule = (id: number) => {
    setScheduleToDelete(id);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    if (!scheduleToDelete) return;

    try {
      await apiService.deleteSchedule(scheduleToDelete);
      present({
        message: 'Schedule deleted successfully',
        duration: 2000,
        color: 'success',
      });
      loadData();
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('scheduleDeleted'));
    } catch (error: any) {
      console.error('Error deleting schedule:', error);
      present({
        message: 'Failed to delete schedule. Please try again.',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setShowDeleteAlert(false);
      setScheduleToDelete(null);
    }
  };

  const handleDeleteAllSchedules = () => {
    setShowDeleteAllAlert(true);
  };

  const confirmDeleteAll = async () => {
    try {
      await apiService.deleteMySchedules();
      present({
        message: 'All schedules deleted successfully',
        duration: 2000,
        color: 'success',
      });
      loadData();
      // Dispatch event to notify other components
      window.dispatchEvent(new CustomEvent('allSchedulesDeleted'));
    } catch (error: any) {
      console.error('Error deleting all schedules:', error);
      present({
        message: 'Failed to delete all schedules. Please try again.',
        duration: 3000,
        color: 'danger',
      });
    } finally {
      setShowDeleteAllAlert(false);
    }
  };

  const handleViewParticipants = async (schedule: ScheduleResponseDto) => {
    try {
      // Fetch schedule details with participants
      const scheduleDetails = await apiService.getScheduleById(schedule.id, -new Date().getTimezoneOffset());
      setSelectedSchedule(scheduleDetails);
      setShowParticipantsModal(true);
    } catch (error: any) {
      console.error('Error fetching participants:', error);
      present({
        message: 'Failed to load participants. Please try again.',
        duration: 3000,
        color: 'danger',
      });
    }
  };

  const handleVenueInput = (value: string) => {
    setFormData({ ...formData, venue: value });
    
    if (value.length > 0) {
      const filtered = venueSuggestions.filter(v => 
        v.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredVenues(filtered);
      setShowVenueSuggestions(filtered.length > 0);
    } else {
      setFilteredVenues([]);
      setShowVenueSuggestions(false);
    }
  };

  const selectVenue = (venue: string) => {
    setFormData({ ...formData, venue });
    setShowVenueSuggestions(false);
  };

  const handleSaveSchedule = async () => {
    // Validation
    if (!formData.sportId || !formData.venue || !formData.startDate || !formData.startTime || !formData.endTime) {
      present({
        message: 'Please fill in all required fields',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    if (formData.maxPlayers < 1 || formData.maxPlayers > 100) {
      present({
        message: 'Max players must be between 1 and 100',
        duration: 2000,
        color: 'warning',
      });
      return;
    }

    try {
      if (isEditMode && currentScheduleId) {
        // Update existing schedule
        const updateData: UpdateScheduleDto = {
          venue: formData.venue,
          date: formData.startDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          timezoneOffsetMinutes: formData.timezoneOffsetMinutes,
          maxPlayers: formData.maxPlayers,
          equipmentDetails: formData.equipmentDetails,
        };
        await apiService.updateSchedule(currentScheduleId, updateData);
        present({
          message: 'Schedule updated successfully',
          duration: 2000,
          color: 'success',
        });
      } else {
        // Create new schedule with optional recurrence
        const recurrence: RecurrenceDto | null = isRecurring
          ? {
              isRecurring: true,
              frequency: recurrenceFrequency,
              endDate: recurrenceEndDate ? recurrenceEndDate.split('T')[0] : null, // Extract date part only (YYYY-MM-DD)
              daysOfWeek: selectedDaysOfWeek.length > 0 ? selectedDaysOfWeek : null,
              intervalCount: intervalCount || 1,
            }
          : null;

        await apiService.createSchedule({ ...formData, recurrence });
        present({
          message: isRecurring ? 'Recurring schedules created successfully' : 'Schedule created successfully',
          duration: 2000,
          color: 'success',
        });
      }
      setShowModal(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving schedule:', error);
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.title ||
        'Failed to save schedule. Please try again.';
      present({
        message: errorMessage,
        duration: 3000,
        color: 'danger',
      });
    }
  };

  // AG Grid column definitions
  const columnDefs: any = useMemo(
    () => [
      {
        headerName: 'Actions',
        field: 'id',
        flex: window.innerWidth < 768 ? 1 : 1.5,
        minWidth: 100,
        pinned: window.innerWidth < 768 ? 'left' : null,
        cellRenderer: (params: any) => {
          return (
            <div className="action-buttons">
              <IonButton
                size="small"
                fill="clear"
                color="success"
                onClick={() => handleViewParticipants(params.data)}
                title="View Participants"
              >
                <IonIcon icon={people} style={{ fontSize: '20px' }} />
              </IonButton>
              <IonButton
                size="small"
                fill="clear"
                color="primary"
                onClick={() => handleEditSchedule(params.data)}
                title="Edit Schedule"
              >
                <IonIcon icon={create} style={{ fontSize: '20px' }} />
              </IonButton>
              <IonButton
                size="small"
                fill="clear"
                color="danger"
                onClick={() => handleDeleteSchedule(params.data.id)}
                title="Delete Schedule"
              >
                <IonIcon icon={trash} style={{ fontSize: '20px' }} />
              </IonButton>
            </div>
          );
        },
      },
      {
        headerName: 'Sport',
        field: 'sportName',
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 100,
      },
      {
        headerName: 'Venue',
        field: 'venue',
        sortable: true,
        filter: true,
        flex: 1.5,
        minWidth: 120,
      },
      {
        headerName: 'Start Time',
        field: 'startTime',
        sortable: true,
        filter: true,
        flex: 1.5,
        minWidth: 130,
        valueFormatter: (params: any) => {
          return new Date(params.value).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          });
        },
      },
      {
        headerName: 'End Time',
        field: 'endTime',
        sortable: true,
        flex: 1.5,
        minWidth: 130,
        hide: window.innerWidth < 768, // Hide on mobile
        valueFormatter: (params: any) => {
          return new Date(params.value).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          });
        },
      },
      {
        headerName: 'Players',
        field: 'currentPlayers',
        sortable: true,
        flex: 0.8,
        minWidth: 80,
        valueFormatter: (params: any) => {
          return `${params.data.currentPlayers}/${params.data.maxPlayers}`;
        },
      },
      {
        headerName: 'Spots Left',
        field: 'spotsRemaining',
        sortable: true,
        flex: 0.8,
        minWidth: 80,
        hide: window.innerWidth < 768, // Hide on mobile
        cellStyle: (params: any) => {
          if (params.value === 0) {
            return { color: 'red', fontWeight: 'bold' };
          }
          return null;
        },
      },
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      suppressSizeToFit: false,
      wrapText: false,
      autoHeight: false,
    }),
    []
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>My Schedules</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleAddSchedule} color="primary">
              <IonIcon icon={add} slot="start" />
              Add Schedule
            </IonButton>
            <IonButton onClick={loadData}>
              <IonIcon icon={refresh} />
            </IonButton>
            <IonButton onClick={handleDeleteAllSchedules} color="danger">
              <IonIcon icon={trashBin} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">My Schedules</IonTitle>
          </IonToolbar>
        </IonHeader>

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
              <h2>No schedules yet</h2>
              <p>Create your first schedule to get started!</p>
            </IonText>
          </div>
        ) : (
          <div className="ag-theme-alpine grid-container" style={{ width: '100%', overflowX: 'auto' }}>
            <AgGridReact
              rowData={schedules}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              domLayout="autoHeight"
              suppressHorizontalScroll={false}
              enableCellTextSelection={true}
              ensureDomOrder={true}
              pagination={true}
              paginationPageSize={20}
              animateRows={true}
            />
          </div>
        )}

        {/* Delete Confirmation Alert */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Schedule"
          message="Are you sure you want to delete this schedule? This action cannot be undone."
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Delete',
              role: 'destructive',
              handler: confirmDelete,
            },
          ]}
        />

        {/* Delete All Confirmation Alert */}
        <IonAlert
          isOpen={showDeleteAllAlert}
          onDidDismiss={() => setShowDeleteAllAlert(false)}
          header="Delete All Schedules"
          message="Are you sure you want to delete ALL your schedules? This action cannot be undone and will permanently remove all schedules you have created."
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Delete All',
              role: 'destructive',
              handler: confirmDeleteAll,
            },
          ]}
        />

        {/* Add/Edit Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{isEditMode ? 'Edit Schedule' : 'Add Schedule'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Sport *</IonLabel>
              <IonSelect
                value={formData.sportId}
                onIonChange={(e) => setFormData({ ...formData, sportId: e.detail.value })}
                disabled={isEditMode}
              >
                {sports.map((sport) => (
                  <IonSelectOption key={sport.id} value={sport.id}>
                    {sport.name}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Venue *</IonLabel>
              <IonInput
                value={formData.venue}
                onIonInput={(e) => handleVenueInput(e.detail.value!)}
                onIonFocus={() => {
                  if (formData.venue && venueSuggestions.length > 0) {
                    const filtered = venueSuggestions.filter(v => 
                      v.toLowerCase().includes(formData.venue.toLowerCase())
                    );
                    setFilteredVenues(filtered);
                    setShowVenueSuggestions(filtered.length > 0);
                  }
                }}
                placeholder="Enter venue location"
              />
            </IonItem>
            
            {showVenueSuggestions && filteredVenues.length > 0 && (
              <IonCard style={{ margin: '0 16px', marginTop: '-8px' }}>
                <IonList style={{ padding: 0 }}>
                  {filteredVenues.slice(0, 5).map((venue, index) => (
                    <IonItem
                      key={index}
                      button
                      onClick={() => selectVenue(venue)}
                      detail={false}
                    >
                      <IonLabel>{venue}</IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </IonCard>
            )}

            <IonItem>
              <IonLabel position="stacked">Start Date *</IonLabel>
              <IonDatetime
                value={formData.startDate}
                onIonChange={(e) => setFormData({ ...formData, startDate: e.detail.value as string })}
                presentation="date"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Start Time *</IonLabel>
              <IonDatetime
                value={formData.startTime}
                onIonChange={(e) => setFormData({ ...formData, startTime: e.detail.value as string })}
                presentation="time"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">End Time *</IonLabel>
              <IonDatetime
                value={formData.endTime}
                onIonChange={(e) => setFormData({ ...formData, endTime: e.detail.value as string })}
                presentation="time"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Max Players *</IonLabel>
              <IonInput
                type="number"
                value={formData.maxPlayers}
                onIonInput={(e) =>
                  setFormData({ ...formData, maxPlayers: parseInt(e.detail.value!) || 0 })
                }
                min="1"
                max="100"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Equipment Details</IonLabel>
              <IonTextarea
                value={formData.equipmentDetails}
                onIonInput={(e) =>
                  setFormData({ ...formData, equipmentDetails: e.detail.value! })
                }
                placeholder="Optional equipment details"
                rows={3}
              />
            </IonItem>

            {!isEditMode && (
              <>
                <IonItem>
                  <IonLabel>Recurring Schedule</IonLabel>
                  <IonToggle
                    checked={isRecurring}
                    onIonChange={(e) => setIsRecurring(e.detail.checked)}
                  />
                </IonItem>

                {isRecurring && (
                  <>
                    <IonItem>
                      <IonLabel position="stacked">Frequency *</IonLabel>
                      <IonSelect
                        value={recurrenceFrequency}
                        onIonChange={(e) => setRecurrenceFrequency(e.detail.value)}
                      >
                        <IonSelectOption value={RecurrenceFrequency.Daily}>Daily</IonSelectOption>
                        <IonSelectOption value={RecurrenceFrequency.Weekly}>Weekly</IonSelectOption>
                        <IonSelectOption value={RecurrenceFrequency.Monthly}>Monthly</IonSelectOption>
                      </IonSelect>
                    </IonItem>

                    {recurrenceFrequency === RecurrenceFrequency.Weekly && (
                      <IonItem>
                        <IonLabel position="stacked">Days of Week *</IonLabel>
                        <div className="days-of-week-container" style={{ padding: '10px 0' }}>
                          {[
                            { value: DayOfWeek.Sunday, label: 'Sun' },
                            { value: DayOfWeek.Monday, label: 'Mon' },
                            { value: DayOfWeek.Tuesday, label: 'Tue' },
                            { value: DayOfWeek.Wednesday, label: 'Wed' },
                            { value: DayOfWeek.Thursday, label: 'Thu' },
                            { value: DayOfWeek.Friday, label: 'Fri' },
                            { value: DayOfWeek.Saturday, label: 'Sat' },
                          ].map((day) => (
                            <div key={day.value} style={{ display: 'inline-block', marginRight: '15px' }}>
                              <IonCheckbox
                                checked={selectedDaysOfWeek.includes(day.value)}
                                onIonChange={(e) => {
                                  if (e.detail.checked) {
                                    setSelectedDaysOfWeek([...selectedDaysOfWeek, day.value]);
                                  } else {
                                    setSelectedDaysOfWeek(
                                      selectedDaysOfWeek.filter((d) => d !== day.value)
                                    );
                                  }
                                }}
                              />
                              <IonLabel style={{ marginLeft: '5px' }}>{day.label}</IonLabel>
                            </div>
                          ))}
                        </div>
                      </IonItem>
                    )}

                    <IonItem>
                      <IonLabel position="stacked">Interval Count</IonLabel>
                      <IonInput
                        type="number"
                        value={intervalCount}
                        onIonInput={(e) => setIntervalCount(parseInt(e.detail.value!) || 1)}
                        min="1"
                        max="30"
                        placeholder="e.g., 1 for every week, 2 for every 2 weeks"
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">End Date (Optional)</IonLabel>
                      <IonDatetime
                        value={recurrenceEndDate}
                        onIonChange={(e) => setRecurrenceEndDate(e.detail.value as string)}
                        presentation="date"
                        min={formData.startDate}
                      />
                    </IonItem>
                  </>
                )}
              </>
            )}

            <IonButton expand="block" className="ion-margin-top" onClick={handleSaveSchedule}>
              {isEditMode ? 'Update Schedule' : 'Create Schedule'}
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Participants Modal */}
        <IonModal isOpen={showParticipantsModal} onDidDismiss={() => setShowParticipantsModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Participants</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowParticipantsModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedSchedule && (
              <>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>{selectedSchedule.sportName}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p><strong>Venue:</strong> {selectedSchedule.venue}</p>
                    <p><strong>Time:</strong> {new Date(selectedSchedule.startTime).toLocaleString()}</p>
                    <p><strong>Players:</strong> {selectedSchedule.currentPlayers} / {selectedSchedule.maxPlayers}</p>
                  </IonCardContent>
                </IonCard>

                {selectedSchedule.participants && selectedSchedule.participants.length > 0 ? (
                  <IonCard>
                    <IonCardHeader>
                      <IonCardTitle>Participant List ({selectedSchedule.participants.length})</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList>
                        {selectedSchedule.participants.map((participant, index) => (
                          <IonItem key={index}>
                            <IonLabel>
                              <h3>{participant.name}</h3>
                              <p>Joined: {new Date(participant.bookingTime).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })}</p>
                            </IonLabel>
                          </IonItem>
                        ))}
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                ) : (
                  <IonCard>
                    <IonCardContent>
                      <IonText color="medium">
                        <p style={{ textAlign: 'center' }}>No participants yet</p>
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                )}
              </>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default AdminSchedules;
