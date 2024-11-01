import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MeetingPreview = ({ meetingData, onClose, isLoading: initialLoading }) => {
  const [editableData, setEditableData] = useState(meetingData);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState(null);

  useEffect(() => {
    setEditableData(meetingData);
  }, [meetingData]);

  const handleChange = (field, value) => {
    setEditableData({
      ...editableData,
      [field]: value
    });
  };

  const handleConfirmMeeting = async () => {
    try {
      setIsConfirming(true);
      setConfirmationStatus(null);

      const [date, time] = editableData.time.split(' ');
      const durationMinutes = parseInt(editableData.duration);
      
      const startTime = new Date(`${date}T${time}`);
      
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

      const meetingRequest = {
        title: editableData.title,
        description: editableData.description,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        attendees: editableData.attendees
      };

      const response = await axios.post('http://localhost:8000/confirm_meeting', meetingRequest);

      if (response.data.status === 'success') {
        setConfirmationStatus({
          type: 'success',
          message: 'Meeting confirmed successfully!'
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      setConfirmationStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to confirm meeting'
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="meeting-card-overlay">
      <div className="meeting-card">
        <div className="meeting-header">
          <h3>Meeting Preview</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="meeting-content">
          <div className="meeting-field">
            <label>Title:</label>
            <input
              type="text"
              value={editableData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="meeting-input"
            />
          </div>
          
          <div className="meeting-field">
            <label>Time:</label>
            <input
              type="text"
              value={editableData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className="meeting-input"
            />
          </div>
          
          <div className="meeting-field">
            <label>Duration:</label>
            <input
              type="text"
              value={editableData.duration}
              onChange={(e) => handleChange('duration', e.target.value)}
              className="meeting-input"
            />
          </div>
          
          <div className="meeting-field">
            <label>Attendees:</label>
            <input
              type="text"
              value={editableData.attendees.join(', ')}
              onChange={(e) => handleChange('attendees', e.target.value.split(', '))}
              className="meeting-input"
            />
          </div>
          
          <div className="meeting-field">
            <label>description:</label>
            <input
              type="text"
              value={editableData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="meeting-input"
            />
          </div>

          {confirmationStatus && (
            <div className={`confirmation-status ${confirmationStatus.type}`}>
              {confirmationStatus.message}
            </div>
          )}

          <div className="meeting-actions">
            <button 
              className="cancel-button" 
              onClick={onClose}
              disabled={isConfirming}
            >
              Cancel
            </button>
            <button 
              className="confirm-button"
              onClick={handleConfirmMeeting}
              disabled={isConfirming}
            >
              {isConfirming ? (
                <span className="loading-spinner"></span>
              ) : (
                'Confirm Meeting'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingPreview;
