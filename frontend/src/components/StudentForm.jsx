import React, { useState, useEffect } from 'react';
import { UserPlus, Save, X, AlertCircle } from 'lucide-react';

const INITIAL_FORM_STATE = {
  name: '',
  register_number: '',
  email: '',
  department: '',
  year: '',
  phone: '',
};

const StudentForm = ({
  editingStudent,
  onSubmit,
  onCancel,
  isSubmitting,
  serverErrors = {},
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const isEditMode = Boolean(editingStudent && editingStudent.id);

  // When editing student changes, populate form
  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name || '',
        register_number: editingStudent.register_number || '',
        email: editingStudent.email || '',
        department: editingStudent.department || '',
        year: editingStudent.year !== undefined ? String(editingStudent.year) : '',
        phone: editingStudent.phone || '',
      });
      setErrors({});
      setTouched({});
    } else {
      setFormData(INITIAL_FORM_STATE);
      setErrors({});
      setTouched({});
    }
  }, [editingStudent]);

  // Combine client errors with server-side validation errors
  const allErrors = { ...errors, ...serverErrors };

  const validateField = (name, value) => {
    const val = typeof value === 'string' ? value.trim() : value;
    let error = '';

    switch (name) {
      case 'name':
        if (!val) {
          error = 'Student name is required.';
        } else if (val.length > 100) {
          error = 'Name cannot exceed 100 characters.';
        }
        break;

      case 'register_number':
        if (!val) {
          error = 'Register number is required.';
        } else if (val.length > 20) {
          error = 'Register number cannot exceed 20 characters.';
        }
        break;

      case 'email':
        if (!val) {
          error = 'Email address is required.';
        } else {
          // Standard email regex
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(val)) {
            error = 'Please enter a valid email address (e.g. student@college.edu).';
          }
        }
        break;

      case 'department':
        if (!val) {
          error = 'Department is required.';
        } else if (val.length > 100) {
          error = 'Department cannot exceed 100 characters.';
        }
        break;

      case 'year':
        if (!val) {
          error = 'Year is required.';
        } else {
          const numYear = Number(val);
          if (![1, 2, 3, 4].includes(numYear)) {
            error = 'Year must be 1, 2, 3, or 4.';
          }
        }
        break;

      case 'phone':
        if (!val) {
          error = 'Phone number is required.';
        } else {
          // 10-digit Indian mobile number format: starts with 6-9 followed by 9 digits
          const phoneRegex = /^[6-9]\d{9}$/;
          if (!phoneRegex.test(val)) {
            error = 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
          }
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(INITIAL_FORM_STATE).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Format register number to uppercase automatically for consistency
    const formattedValue = name === 'register_number' ? value.toUpperCase() : value;

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    if (touched[name]) {
      const error = validateField(name, formattedValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = Object.keys(INITIAL_FORM_STATE).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    const payload = {
      name: formData.name.trim(),
      register_number: formData.register_number.trim(),
      email: formData.email.trim().toLowerCase(),
      department: formData.department.trim(),
      year: parseInt(formData.year, 10),
      phone: formData.phone.trim(),
    };

    onSubmit(payload);
  };

  const handleReset = () => {
    setFormData(INITIAL_FORM_STATE);
    setErrors({});
    setTouched({});
    if (onCancel) onCancel();
  };

  return (
    <div className="card form-card" id="student-form-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className={`card-icon-badge ${isEditMode ? 'edit-badge' : 'add-badge'}`}>
            {isEditMode ? <Save size={20} /> : <UserPlus size={20} />}
          </div>
          <div>
            <h2 className="card-title">{isEditMode ? 'Update Student Record' : 'Add New Student'}</h2>
            <p className="card-subtitle">
              {isEditMode
                ? `Modifying details for student #${editingStudent.id}`
                : 'Fill in the information below to enroll a student'}
            </p>
          </div>
        </div>

        {isEditMode && (
          <button
            type="button"
            className="badge badge-warning cursor-pointer"
            onClick={handleReset}
            title="Cancel editing"
          >
            Editing Active <X size={12} style={{ marginLeft: 4 }} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="student-form" id="student-form">
        <div className="form-grid">
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="student-name-input" className="form-label">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              id="student-name-input"
              name="name"
              type="text"
              className={`form-input ${allErrors.name && touched.name ? 'input-error' : ''}`}
              placeholder="e.g. Laksha Mohan"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              autoComplete="name"
            />
            {touched.name && allErrors.name && (
              <div className="field-error-msg" id="name-error-msg">
                <AlertCircle size={14} />
                <span>{allErrors.name}</span>
              </div>
            )}
          </div>

          {/* Register Number */}
          <div className="form-group">
            <label htmlFor="student-reg-input" className="form-label">
              Register Number <span className="required-star">*</span>
            </label>
            <input
              id="student-reg-input"
              name="register_number"
              type="text"
              className={`form-input ${allErrors.register_number && touched.register_number ? 'input-error' : ''}`}
              placeholder="e.g. STU001 or 21CS045"
              value={formData.register_number}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              autoComplete="off"
            />
            {touched.register_number && allErrors.register_number && (
              <div className="field-error-msg" id="register-number-error-msg">
                <AlertCircle size={14} />
                <span>{allErrors.register_number}</span>
              </div>
            )}
          </div>

          {/* Email Address */}
          <div className="form-group">
            <label htmlFor="student-email-input" className="form-label">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              id="student-email-input"
              name="email"
              type="email"
              className={`form-input ${allErrors.email && touched.email ? 'input-error' : ''}`}
              placeholder="e.g. laksha@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              autoComplete="email"
            />
            {touched.email && allErrors.email && (
              <div className="field-error-msg" id="email-error-msg">
                <AlertCircle size={14} />
                <span>{allErrors.email}</span>
              </div>
            )}
          </div>

          {/* Department */}
          <div className="form-group">
            <label htmlFor="student-dept-input" className="form-label">
              Department <span className="required-star">*</span>
            </label>
            <input
              id="student-dept-input"
              name="department"
              type="text"
              className={`form-input ${allErrors.department && touched.department ? 'input-error' : ''}`}
              placeholder="e.g. CSE, ECE, MECH, IT, AIDS"
              value={formData.department}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              autoComplete="organization"
            />
            {touched.department && allErrors.department && (
              <div className="field-error-msg" id="department-error-msg">
                <AlertCircle size={14} />
                <span>{allErrors.department}</span>
              </div>
            )}
          </div>

          {/* Year of Study */}
          <div className="form-group">
            <label htmlFor="student-year-select" className="form-label">
              Year of Study <span className="required-star">*</span>
            </label>
            <select
              id="student-year-select"
              name="year"
              className={`form-select ${allErrors.year && touched.year ? 'input-error' : ''}`}
              value={formData.year}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
            >
              <option value="">-- Select Year --</option>
              <option value="1">1st Year (Freshman)</option>
              <option value="2">2nd Year (Sophomore)</option>
              <option value="3">3rd Year (Junior)</option>
              <option value="4">4th Year (Senior)</option>
            </select>
            {touched.year && allErrors.year && (
              <div className="field-error-msg" id="year-error-msg">
                <AlertCircle size={14} />
                <span>{allErrors.year}</span>
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="student-phone-input" className="form-label">
              Mobile Phone (10 Digits) <span className="required-star">*</span>
            </label>
            <input
              id="student-phone-input"
              name="phone"
              type="tel"
              className={`form-input ${allErrors.phone && touched.phone ? 'input-error' : ''}`}
              placeholder="e.g. 9876543210"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={isSubmitting}
              maxLength={10}
              autoComplete="tel"
            />
            {touched.phone && allErrors.phone && (
              <div className="field-error-msg" id="phone-error-msg">
                <AlertCircle size={14} />
                <span>{allErrors.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          {isEditMode ? (
            <>
              <button
                type="button"
                id="cancel-edit-btn"
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                <X size={16} />
                Cancel
              </button>
              <button
                type="submit"
                id="update-student-btn"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                <Save size={16} />
                {isSubmitting ? 'Updating...' : 'Update Student'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                id="reset-form-btn"
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                id="add-student-btn"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                <UserPlus size={16} />
                {isSubmitting ? 'Adding...' : 'Add Student'}
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default StudentForm;
