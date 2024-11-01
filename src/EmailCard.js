import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from './config';

const backendUrl = config.backendUrl;

const EmailCard = ({ emailData, onClose, isLoading: initialLoading }) => {
  const [editableData, setEditableData] = useState(emailData);
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null);
  const [step, setStep] = useState('email'); // 'email' or 'preview'
  const [userEmail, setUserEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    setEditableData(emailData);
  }, [emailData]);

  const handleChange = (field, value) => {
    setEditableData({
      ...editableData,
      [field]: value
    });
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleEmailSubmit = async () => {
    if (!validateEmail(userEmail)) {
      setEmailError(`Please enter my creator's email address. Hint: osanzas1997`);
      return;
    }

    try {
      setIsSending(true);
      await axios.post(`${backendUrl}/set_sender_email`, { email: userEmail });
      setEditableData(prev => ({
        ...prev,
        sender: `${prev.sender.split('<')[0]}<${userEmail}>`
      }));
      setStep('preview');
    } catch (error) {
      setEmailError(error.response?.data?.message || 'Failed to set email');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setIsSending(true);
      setSendStatus(null);

      const response = await axios.post(`${backendUrl}/send_email`, editableData);
      
      if (response.data.status === 'success') {
        setSendStatus({
          type: 'success',
          message: 'Email sent successfully!'
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (error) {
      setSendStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to send email'
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickFill = () => {
    setUserEmail('osanzas1997@gmail.com');
    setEmailError('');
  };

  return (
    <div className="email-card-overlay">
      <div className="email-card">
        <div className="email-header">
          <h3>{step === 'email' ? 'Enter Your Email' : 'Email Preview'}</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="email-content">
          {step === 'email' ? (
            <div className="email-field">
              <label>AI Assistant: Can you give me your email address?</label>
              <div className="quick-fill-container">
                <button 
                  onClick={handleQuickFill}
                  className="quick-fill-button"
                  type="button"
                >
                  Quick fill with creator's email
                </button>
              </div>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => {
                  setUserEmail(e.target.value);
                  setEmailError('');
                }}
                placeholder="Enter your email address"
                className={`email-input ${emailError ? 'error' : ''}`}
              />
              {emailError && <div className="error-message">{emailError}</div>}
              
              <div className="email-actions">
                <button 
                  className="cancel-button" 
                  onClick={onClose}
                  disabled={isSending}
                >
                  Cancel
                </button>
                <button 
                  className="send-button"
                  onClick={handleEmailSubmit}
                  disabled={isSending}
                >
                  {isSending ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="email-field">
                <label>From:</label>
                <input
                  type="text"
                  value={editableData.sender}
                  onChange={(e) => handleChange('sender', e.target.value)}
                  className="email-input"
                />
              </div>
              
              <div className="email-field">
                <label>To:</label>
                <input
                  type="text"
                  value={editableData.recipient}
                  onChange={(e) => handleChange('recipient', e.target.value)}
                  className="email-input"
                />
              </div>
              
              <div className="email-field">
                <label>Subject:</label>
                <input
                  type="text"
                  value={editableData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  className="email-input"
                />
              </div>
              
              <div className="email-field content">
                <label>Content:</label>
                <textarea
                  value={editableData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  className="email-textarea"
                  rows="10"
                />
              </div>

              {sendStatus && (
                <div className={`send-status ${sendStatus.type}`}>
                  {sendStatus.message}
                </div>
              )}

              <div className="email-actions">
                <button 
                  className="cancel-button" 
                  onClick={onClose}
                  disabled={isSending}
                >
                  Cancel
                </button>
                <button 
                  className="send-button"
                  onClick={handleSendEmail}
                  disabled={isSending}
                >
                  {isSending ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    'Send Email'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailCard;