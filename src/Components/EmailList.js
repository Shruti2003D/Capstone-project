import React, { useState } from 'react';
import './EmailList.css';
import axios from 'axios';

const EmailList = ({ emails, downloadLink, contacts }) => {
  const [editingIndex, setEditingIndex] = useState(null); // Track which email is being edited
  const [editedEmail, setEditedEmail] = useState(null); // Store the edited email

  const handleEditClick = (email, index) => {
    setEditingIndex(index); // Set the index of the email being edited
    setEditedEmail({ ...email }); // Clone the email content for editing
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEmail({ ...editedEmail, [name]: value }); // Update the edited email
  };

  const handleSendEmail = async (email, contact) => {
    try {
      const response = await axios.post('https://smtpemailiplemented.onrender.com/send-emails', {
        emails: [email], // Send the specific email
        contacts: [contact], // Send the corresponding contact
      });
      console.log(response.data.message);
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  const handleSaveAndSendEmail = async (contact) => {
    try {
      const response = await axios.post('https://smtpemailiplemented.onrender.com/send-emails', {
        emails: [editedEmail], // Send the edited email
        contacts: [contact], // Send the corresponding contact
      });
      console.log(response.data.message);
      alert('Edited email sent successfully!');
      setEditingIndex(null); // Reset editing state
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  return (
    <div className="email-list-container">
      <h2>Generated Emails</h2>
      {emails.map((email, index) => (
        <div key={index} className="email-item">
          {editingIndex === index ? (
            <div className="edit-email-form">
              <h3>Edit Email</h3>
              <div className="form-group-2">
                <label>Subject:</label>
                <input
                  type="text"
                  name="subject"
                  value={editedEmail.subject}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-1">
                <label>Body:</label>
                <textarea
                  name="body"
                  value={editedEmail.body}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="form-group-2">
                <label>Call to Action:</label>
                <input
                  type="text"
                  name="call_to_action"
                  value={editedEmail.call_to_action}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-2">
                <label>Optimal Send Time:</label>
                <input
                  type="text"
                  name="optimal_send_time"
                  value={editedEmail.optimal_send_time}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-actions">
                <button
                  className="send-email-btn"
                  onClick={() => handleSaveAndSendEmail(contacts[index])}
                >
                  Save & Send Email
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setEditingIndex(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h3>Subject: {email.subject}</h3>
              <div className="email-body">
                <p>Body: {email.body}</p>
              </div>
              {email.image_url && (
                <img src={email.image_url} alt="Email Visual" />
              )}
              <p>
                Call to Action: 
                <span className="call-to-action-btn">{email.call_to_action}</span>
              </p>
              <p>Optimal Send Time: {email.optimal_send_time}</p>

              {/* CSV Download Button */}
              {downloadLink && (
                <div className="download-btn-container">
                  <a href={downloadLink} download>
                    <button className="download-btn">Download CSV</button>
                  </a>
                </div>
              )}

              {/* Separate Buttons */}
              <div className="email-action-buttons">
                <button
                  className="send-email-btn"
                  onClick={() => handleSendEmail(email, contacts[index])}
                >
                  Send Email
                </button>
                <button
                  className="edit-email-btn"
                  onClick={() => handleEditClick(email, index)}
                >
                  Edit & Send
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default EmailList;
