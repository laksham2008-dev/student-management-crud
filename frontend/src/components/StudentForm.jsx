import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Save, X, AlertCircle } from 'lucide-react';

const INITIAL_FORM_STATE = { name: '', register_number: '', email: '', gender: '', department: '', year: '', phone: '', cutoff_mark: '', previous_semester_percentage: '', cgpa: '' };
const ACADEMIC_FIELDS = ['cutoff_mark', 'previous_semester_percentage', 'cgpa'];

const StudentForm = ({ isOpen, editingStudent, departments = [], onSubmit, onClose, isSubmitting, serverErrors = {} }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const isEditMode = Boolean(editingStudent?.id);

  useEffect(() => {
    if (!isOpen) return;
    setFormData(editingStudent ? {
      name: editingStudent.name || '', register_number: editingStudent.register_number || '', email: editingStudent.email || '', gender: editingStudent.gender || '',
      department: editingStudent.department ? String(editingStudent.department) : '', year: editingStudent.year != null ? String(editingStudent.year) : '', phone: editingStudent.phone || '',
      cutoff_mark: editingStudent.cutoff_mark ?? '', previous_semester_percentage: editingStudent.previous_semester_percentage ?? '', cgpa: editingStudent.cgpa ?? '',
    } : INITIAL_FORM_STATE);
    setErrors({}); setTouched({});
  }, [isOpen, editingStudent]);

  useEffect(() => {
    const closeOnEscape = (event) => { if (event.key === 'Escape' && isOpen && !isSubmitting) onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;
  const allErrors = { ...errors, ...serverErrors };
  const validateField = (name, value) => {
    const text = String(value ?? '').trim();
    if (['name', 'register_number', 'email', 'gender', 'department', 'year', 'phone'].includes(name) && !text) return `${name === 'name' ? 'Full name' : name.replaceAll('_', ' ')} is required.`;
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return 'Enter a valid email address.';
    if (name === 'phone' && !/^[6-9]\d{9}$/.test(text)) return 'Enter a valid 10-digit Indian mobile number.';
    if (name === 'cutoff_mark' && text && Number(value) < 0) return 'Cutoff mark cannot be negative.';
    if (name === 'previous_semester_percentage' && text && (Number(value) < 0 || Number(value) > 100)) return 'Percentage must be between 0 and 100.';
    if (name === 'cgpa' && text && (Number(value) < 0 || Number(value) > 10)) return 'CGPA must be between 0 and 10.';
    return '';
  };
  const validateForm = () => {
    const nextErrors = Object.fromEntries(Object.keys(INITIAL_FORM_STATE).map((field) => [field, validateField(field, formData[field])]).filter(([, error]) => error));
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  const handleChange = ({ target: { name, value } }) => {
    const nextValue = name === 'register_number' ? value.toUpperCase() : value;
    setFormData((current) => ({ ...current, [name]: nextValue }));
    if (touched[name]) setErrors((current) => ({ ...current, [name]: validateField(name, nextValue) }));
  };
  const handleBlur = ({ target: { name, value } }) => {
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({ ...current, [name]: validateField(name, value) }));
  };
  const input = (name, type = 'text', placeholder = '') => <input id={`student-${name}`} name={name} type={type} className={`form-input ${allErrors[name] && touched[name] ? 'input-error' : ''}`} value={formData[name]} onChange={handleChange} onBlur={handleBlur} disabled={isSubmitting} placeholder={placeholder} />;
  const select = (name, options, emptyLabel) => <select id={`student-${name}`} name={name} className={`form-select ${allErrors[name] && touched[name] ? 'input-error' : ''}`} value={formData[name]} onChange={handleChange} onBlur={handleBlur} disabled={isSubmitting}><option value="">{emptyLabel}</option>{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>;
  const field = (name, label, control) => <div className="form-group" key={name}><label htmlFor={`student-${name}`} className="form-label">{label}{!ACADEMIC_FIELDS.includes(name) && <span className="required-star"> *</span>}</label>{control}{allErrors[name] && (touched[name] || serverErrors[name]) && <div className="field-error-msg"><AlertCircle size={14} /><span>{Array.isArray(allErrors[name]) ? allErrors[name][0] : allErrors[name]}</span></div>}</div>;
  const handleSubmit = (event) => {
    event.preventDefault();
    setTouched(Object.fromEntries(Object.keys(INITIAL_FORM_STATE).map((key) => [key, true])));
    if (!validateForm()) return;
    const payload = { ...formData, name: formData.name.trim(), register_number: formData.register_number.trim(), email: formData.email.trim().toLowerCase(), department: Number(formData.department), year: Number(formData.year), phone: formData.phone.trim() };
    ACADEMIC_FIELDS.forEach((key) => { payload[key] = formData[key] === '' ? null : Number(formData[key]); });
    onSubmit(payload);
  };

  return <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true"><div className="modal-card form-modal-card" onClick={(event) => event.stopPropagation()}>
    <div className="modal-header"><div className="card-title-group"><div className={`card-icon-badge ${isEditMode ? 'edit-badge' : 'add-badge'}`}>{isEditMode ? <Save size={20} /> : <UserPlus size={20} />}</div><div><h2 className="modal-title">{isEditMode ? 'Update Student Record' : 'Add New Student'}</h2><p className="card-subtitle">{isEditMode ? `Editing information for student #${editingStudent.id}` : 'Enter student information to enroll into the system'}</p></div></div><button type="button" className="modal-close-btn" onClick={onClose} disabled={isSubmitting}><X size={20} /></button></div>
    <form onSubmit={handleSubmit} noValidate className="student-form"><h3 className="form-section-title">Student Information</h3><div className="form-grid modal-form-grid">
      {field('name', 'Full Name', input('name', 'text', 'e.g. Laksha Mohan'))}{field('register_number', 'Register Number', input('register_number', 'text', 'e.g. 21CS045'))}{field('email', 'Email Address', input('email', 'email', 'e.g. student@college.edu'))}{field('gender', 'Gender', select('gender', [['male', 'Male'], ['female', 'Female']], '-- Select Gender --'))}{field('department', 'Department', departments.length ? select('department', departments.map((department) => [department.id, department.name]), '-- Select Department --') : <div><select id="student-department" name="department" className="form-select" value="" disabled><option>No departments available. Please add a department first.</option></select><Link to="/departments" className="form-helper-link" onClick={onClose}>Add a department</Link></div>)}{field('year', 'Year of Study', select('year', [['1', '1st Year'], ['2', '2nd Year'], ['3', '3rd Year'], ['4', '4th Year']], '-- Select Year of Study --'))}{field('phone', 'Mobile Phone (10 Digits)', input('phone', 'tel', 'e.g. 9876543210'))}
    </div><h3 className="form-section-title">Academic Information</h3><div className="form-grid modal-form-grid">{field('cutoff_mark', 'Cutoff Mark', input('cutoff_mark', 'number', 'e.g. 185.50'))}{field('previous_semester_percentage', 'Previous Semester Percentage', input('previous_semester_percentage', 'number', 'e.g. 82.50'))}{field('cgpa', 'CGPA', input('cgpa', 'number', 'e.g. 8.45'))}</div><div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>Cancel</button><button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : <><Save size={16} /> <span>{isEditMode ? 'Update Student' : 'Add Student'}</span></>}</button></div></form>
  </div></div>;
};

export default StudentForm;
