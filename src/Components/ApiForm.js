import React, { useState } from 'react';
import axios from 'axios';
import './ApiForm.css';
import EmailList from './EmailList';

const jobTitles = [
  "Teacher",
  "Professor",
  "School Administrator",
  "Counselor",
  "Curriculum Developer",
  "Educational Consultant",
  "Special Education Teacher",
  "Instructional Coordinator",
  "Librarian",
  "Principal",
  "Academic Advisor",
  "Other" // Add "Other" option for custom input
];

const industries = [
  "Education",
  "Technology",
  "Healthcare",
  "Finance",
  "Retail",
  "Manufacturing",
  "Real Estate",
  "Transportation",
  "Hospitality",
  "Construction",
  "Energy",
  "Telecommunications",
  "Media",
  "Entertainment",
  "Non-Profit",
  "Government",
  "Agriculture",
  "Pharmaceuticals",
  "Automotive",
  "Aerospace",
  "Insurance",
  "Legal Services",
  "Consulting",
  "Information Technology",
  "E-commerce",
  "Fashion",
  "Sports",
  "Art and Design",
  "Other" // Add "Other" option for custom input
];

const ApiForm = () => {
  const [inputData, setInputData] = useState({
    account_name: '',
    industry: '',
    pain_points: '',
    campaign_objective: '',
    number_of_emails: 0,
    language: '',
    contacts: [{ job_title: '', name: '', email: '', organization: '' }],
  });

  const [emails, setEmails] = useState([]);
  const [downloadLink, setDownloadLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  // For Suggestions
  const [painPointSuggestions, setPainPointSuggestions] = useState([]);
  const [objectiveSuggestions, setObjectiveSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null); // Track which field is active

  const loadingMessage = "🚀 Searching for LinkedIn data..."; 

  const handleSuggestionSelect = (suggestion, type) => {
    const updatedValue = inputData[type]
      .split(',')
      .map((word) => word.trim());

    updatedValue[updatedValue.length - 1] = suggestion;

    setInputData({
      ...inputData,
      [type]: updatedValue.join(', '),
    });

    if (type === 'pain_points') {
      setPainPointSuggestions([]);
    } else if (type === 'campaign_objective') {
      setObjectiveSuggestions([]);
    }
  };

  const handleInputChange = async (e, type) => {
    const { name, value } = e.target;

    setActiveField(type);

    setInputData({ ...inputData, [name]: value });

    const words = value.split(',').map((word) => word.trim());
    const lastWord = words[words.length - 1];

    if (lastWord.length > 2) {
      await fetchSuggestions(lastWord, type);
    }

    if (words.length > 1 || (lastWord.length > 2 && activeField === type)) {
      if (type === 'pain_points' && painPointSuggestions.length === 0) {
        await fetchSuggestions(lastWord, 'pain_points');
      } else if (type === 'campaign_objective' && objectiveSuggestions.length === 0) {
        await fetchSuggestions(lastWord, 'campaign_objective');
      }
    }
  };

  const fetchSuggestions = async (input, type) => {
    try {
      const response = await axios.get(`https://api.datamuse.com/sug?s=${input}`);
      
      if (type === 'pain_points') {
        setPainPointSuggestions(response.data);
      } else if (type === 'campaign_objective') {
        setObjectiveSuggestions(response.data);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  // Validation function
  const validateForm = () => {
    let isValid = true;
    const errors = {};

    // Account Name Validation
    if (!inputData.account_name.trim()) {
      isValid = false;
      errors.account_name = 'Account Name is required.';
    } else if (!/^[a-zA-Z\s]+$/.test(inputData.account_name)) {
      isValid = false;
      errors.account_name = ' Account Name must only contain letters and spaces.';
    }

    // Industry Validation
    if (!inputData.industry.trim()) {
      isValid = false;
      errors.industry = 'Industry is required.';
    } else if (!/^[a-zA-Z\s]+$/.test(inputData.industry)) {
      isValid = false;
      errors.industry = 'Industry must only contain letters and spaces.';
    }

    // Pain Points Validation (Comma-separated and word limit of 20)
    if (!inputData.pain_points.trim()) {
      isValid = false;
      errors.pain_points = 'Pain Points are required.';
    } else {
      const painPoints = 
      inputData.pain_points.split(',');
      painPoints.forEach((point, index) => {
        const trimmedPoint = point.trim();
        if (/^[A-Z][a-zA-Z\s]+$/.test(trimmedPoint)) {
          isValid = false;
          errors.pain_points = `Pain Point ${index + 1} must contain only words.`;
        }
      });
      if (painPoints.length > 20) {
        isValid = false;
        errors.pain_points = 'Pain Points should not exceed 20 words.';
      }
    }

    // Campaign Objective Validation (Comma-separated and word limit of 20)
    if (!inputData.campaign_objective.trim()) {
      isValid = false;
      errors.campaign_objective = 'Campaign Objective is required.';
    } else {
      const objectives = inputData.campaign_objective.split(',');
      objectives.forEach((objective, index) => {
        const trimmedObjective = objective.trim();
        if (/[^a-zA-Z\s]/.test(trimmedObjective)) {
          isValid = false;
          errors.campaign_objective = `Objective ${index + 1} must not contain any special characters or numbers.`;
        }
      });
      if (objectives.length > 20) {
        isValid = false;
        errors.campaign_objective = 'Campaign Objectives should not exceed 20 words.';
      }
    }

    // Number of Emails Validation (Max 3)
    if (!inputData.number_of_emails || inputData.number_of_emails <= 0 || inputData.number_of_emails > 3) {
      isValid = false;
      errors.number_of_emails = 'Number of Emails must be between 1 and 3. Due to token limitations, the number of emails is restricted to 3 only.';
    }

    // Language Validation
    if (!inputData.language.trim()) {
      isValid = false;
      errors.language = 'Language is required.';
    }

    // Contacts Validation
    inputData.contacts.forEach((contact, index) => {
      // Job Title Validation
      if (!contact.job_title.trim() && !contact.custom_job_title.trim()) {
        isValid = false;
        errors[`job_title_${index}`] = `Job Title for contact is required.`;
      } else if (contact.job_title === 'Other' && !contact.custom_job_title.trim()) {
        isValid = false;
        errors[`job_title_${index}`] = `Please specify your job title.`;
      } else if (contact.job_title !== 'Other' && !/^[a-zA-Z\s]+$/.test(contact.job_title)) {
        isValid = false;
        errors[`job_title_${index}`] = `Job Title for contact must only contain letters and spaces.`;
      }

      // Name Validation
      if (!contact.name.trim()) {
        isValid = false;
        errors[`name_${index}`] = `Name for contact is required.`;
      } else if (!/^[a-zA-Z\s]+$/.test(contact.name)) {
        isValid = false;
        errors[`name_${index}`] = `Name for contact must only contain letters and spaces.`;
      }

      // Email Validation
      if (!contact.email.trim()) {
        isValid = false;
        errors[`email_${index}`] = `Email for contact ${index + 1} is required.`;
      } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(contact.email)) {
        isValid = false;
        errors[`email_${index}`] = `Email for contact ${index + 1} must be a valid email address.`;
      }

      // Organization Name Validation
      if (!contact.organization.trim()) {
        isValid = false;
        errors[`organization_${index}`] = `Organization of person is required.`;
      } else if (!/^[a-zA-Z\s]+$/.test(contact.organization)) {
        isValid = false;
        errors[`organization_${index}`] = `Name for organization must only contain letters and spaces.`;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleContactChange = (index, e) => {
    const contacts = [...inputData.contacts];
    contacts[index][e.target.name] = e.target.value;
    setInputData({ ...inputData, contacts: contacts });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return; // Don't proceed if validation fails
    }
  
    const payload = {
      ...inputData,
      industry: inputData.industry === 'Other' ? inputData.custom_industry : inputData.industry,
    };
  
    setLoading(true);
    setError('');
    setDownloadLink('');
  
    try {
      const response = await axios.post(
        'https://smtpemailiplemented.onrender.com/generate-emails',
        payload
      );
      setEmails(response.data.emails);
      setDownloadLink(response.data.download_link);
    } catch (err) {
      setError('An error occurred while submitting the form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header Section */}
      <header className="header-section">
      <div className="marquee-container">
        <h5 className="marquee-title">Welcome to Personalized Email Campaign Generator !!!</h5>
      </div>
      </header>

      {/* Main Container */}
      <div className="api-form-container">
        <form onSubmit={handleSubmit}>
          <h1>Email Generator</h1>
          
          {/* Form fields */}
          <div className="form-group">
            <label>Account Name</label>
            <input
              type="text"
              name="account_name"
              value={inputData.account_name}
              onChange={handleInputChange}
              required
            />
            {formErrors.account_name && <p className="error">{formErrors.account_name}</p>}
          </div>

          <div className="form-group">
            <label>Industry (If industry not listed please select other)</label>
            <div style={{ position: 'relative' }}>
              <select
                name="industry"
                value={inputData.industry}
                onChange={(e) => {
                  const value = e.target.value;
                  setInputData({ ...inputData, industry: value });
                }}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  color: '#000',
                  appearance: 'none',
                }}
              >
                <option value="" disabled>Select your industry</option>
                {industries.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              {inputData.industry === 'Other' && (
                <input
                  type="text"
                  name="custom_industry"
                  value={inputData.custom_industry || ''}
                  onChange={(e) => setInputData({ ...inputData, custom_industry: e.target.value })}
                  placeholder="Type your industry name"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '14px',
                    marginTop: '10px',
                  }}
                />
              )}
            </div>
            {formErrors.industry && <p className="error">{formErrors.industry}</p>}
          </div>

          <div className="form-group">
            <label>Pain Points</label>
            <input
              type="text"
              name="pain_points"
              value={inputData.pain_points}
              onChange={(e) => handleInputChange(e, 'pain_points')}
              placeholder="Enter Pain Points (comma-separated)"
            />
            {formErrors.pain_points && <p className="error">{formErrors.pain_points}</p>}
            {activeField === 'pain_points' && painPointSuggestions.length > 0 && (
              <div className="suggestions">
                {painPointSuggestions.map((suggestion) => (
                  <p
                    key={suggestion.word}
                    onClick={() => handleSuggestionSelect(suggestion.word, 'pain_points')}
                  >
                    {suggestion.word}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Campaign Objective</label>
            <input
              type="text"
              name="campaign_objective"
              value={inputData.campaign_objective}
              onChange={(e) => handleInputChange(e, 'campaign_objective')}
              placeholder="Enter Campaign Objective (comma-separated)"
            />
            {formErrors.campaign_objective && <p className="error">{formErrors.campaign_objective}</p>}
            {activeField === 'campaign_objective' && objectiveSuggestions.length > 0 && (
              <div className="suggestions">
                {objectiveSuggestions.map((suggestion) => (
                  <p
                    key={suggestion.word}
                    onClick={() => handleSuggestionSelect(suggestion.word, 'campaign_objective')}
                  >
                    {suggestion.word}
                  </p>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Number of Emails </label>
            <input
              type="number"
              name="number_of_emails"
              value={inputData.number_of_emails}
              onChange={handleInputChange}
              required
            />
            {formErrors.number_of_emails && <p className="error">{formErrors.number_of_emails}</p>}
          </div>

          <div className="form-group">
            <label>Language</label>
            <select
              name="language"
              value={inputData.language}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>Select a Language</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Chinese">Chinese</option>
              <option value="Japanese">Japanese</option>
              <option value="Hindi">Hindi</option>
              <option value="Marathi">Marathi</option>
              <option value="Arabic">Arabic</option>
            </select>
            {formErrors.language && <p className="error">{formErrors.language}</p>}
          </div>

          {inputData.contacts.map((contact, index) => (
            <div key={index} className="contact-group">
              <div className="form-group">
                <label>Job Title (If job title not listed please select other)</label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="job_title"
                    value={contact.job_title}
                    onChange={(e) => {
                      const value = e.target.value;
                      setInputData((prevState) => {
                        const updatedContacts = [...prevState.contacts];
                        updatedContacts[index].job_title = value;
                        return { ...prevState, contacts: updatedContacts };
                      });
                    }}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '14px',
                      backgroundColor: '#fff',
                      color: '#000',
                      appearance: 'none',
                    }}
                  >
                    <option value="" disabled>Select Job Title</option>
                    {jobTitles.map((title) => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                  {contact.job_title === 'Other' && (
                    <input
                      type="text"
                      name="custom_job_title"
                      value={contact.custom_job_title || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        setInputData((prevState) => {
                          const updatedContacts = [...prevState.contacts];
                          updatedContacts[index].custom_job_title = value;
                          return { ...prevState, contacts: updatedContacts };
                        });
                      }}
                      placeholder="Type your job title"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '14px',
                        marginTop: '10px',
                      }}
                    />
                  )}
                </div>
                {formErrors[`job_title_${index}`] && (
                  <p className="error">{formErrors[`job_title_${index}`]}</p>
                )}
              </div>

              <p className="attractive-message">🚀 Let's Get Started! Please provide the details below accurately so we can fetch personalized LinkedIn data for your emails!</p>

              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={contact.name}
                  onChange={(e) => handleContactChange(index, e)}
                  required
                />
                {formErrors[`name_${index}`] && (
                  <p className="error">{formErrors[`name_${index}`]}</p>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={contact.email}
                  onChange={(e) => handleContactChange(index, e)}
                  required
                />
                {formErrors[`email_${index}`] && (
                  <p className="error">{formErrors[`email_${index}`]}</p>
                )}
              </div>

              <div className="form-group">
                <label>Organization</label>
                <input
                  type="text"
                  name="organization"
                  value={contact.organization}
                  onChange={(e) => handleContactChange(index, e)}
                  required
                />
                {formErrors[`organization_${index}`] && (
                  <p className="error">{formErrors
                      [`organization_${index}`]}</p>
                )}
              </div>
            </div>
          ))}

          <div>
            <button type="submit" className="submit-btn">
              {loading ? '✨ Wait, the magic is happening! ✨' : 'Submit'}
            </button>
            {loading && (
              <div>
                <p className="loading-msg">{loadingMessage}</p>
                <p className="loading-detail">We are currently searching for LinkedIn profiles based on the provided contact and organization names.</p>
              </div>
            )}
          </div>

          {error && <p className="error">{error}</p>}
        </form>

        {/* Display emails and download link below the form */}
        {emails.length > 0 && <EmailList emails={emails} downloadLink={downloadLink} contacts={inputData.contacts} />}
      </div>
    </>
  );
};

export default ApiForm;