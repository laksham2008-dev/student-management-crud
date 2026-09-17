import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

const saveSession = (result) => {
  localStorage.setItem('student_management_token', result.token);
  localStorage.setItem('student_management_college', result.data?.college_name || result.data?.collegeName || '');
};

export const SetupPage = ({ onAuthenticated }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ college_name: '', admin_name: '', email: '', password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault(); setError(''); setSaving(true);
    try { const result = await authApi.setup(form); saveSession(result); onAuthenticated(result.data); navigate('/'); }
    catch (err) { setError(err.data?.detail || err.message); } finally { setSaving(false); }
  };
  return <AuthShell title="Set up your institution" subtitle="Create an administrator account to securely manage your college student records."><form onSubmit={submit} className="auth-form"><AuthField label="College / Institution Name" name="college_name" value={form.college_name} onChange={update} placeholder="Enter your college name" /><AuthField label="Administrator Name" name="admin_name" value={form.admin_name} onChange={update} placeholder="Enter administrator name" /><AuthField label="Authorized Admin Email" name="email" type="email" value={form.email} onChange={update} placeholder="admin@example.com" /><AuthField label="Password" name="password" type="password" value={form.password} onChange={update} placeholder="Create password" /><AuthField label="Confirm Password" name="confirm_password" type="password" value={form.confirm_password} onChange={update} placeholder="Confirm password" />{error && <p className="auth-error">{error}</p>}<button className="btn btn-primary auth-submit" disabled={saving}>{saving ? 'Creating account...' : 'Create Institution Account'}</button><p className="auth-switch">Already registered? <button type="button" onClick={() => navigate('/login')}>Admin Login</button></p></form></AuthShell>;
};

export const LoginPage = ({ onAuthenticated }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' }); const [error, setError] = useState(''); const [saving, setSaving] = useState(false);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async (event) => { event.preventDefault(); setError(''); setSaving(true); try { const result = await authApi.login(form); saveSession(result); onAuthenticated(result.data); navigate('/'); } catch (err) { setError(err.data?.detail || err.message); } finally { setSaving(false); } };
  return <AuthShell title="Admin Login" subtitle="Sign in to manage your institution's student records."><form onSubmit={submit} className="auth-form"><AuthField label="Email" name="email" type="email" value={form.email} onChange={update} placeholder="Enter registered email" /><AuthField label="Password" name="password" type="password" value={form.password} onChange={update} placeholder="Enter password" />{error && <p className="auth-error">{error}</p>}<button className="btn btn-primary auth-submit" disabled={saving}>{saving ? 'Signing in...' : 'Login'}</button></form></AuthShell>;
};

const AuthField = ({ label, ...props }) => <div className="form-group"><label className="form-label" htmlFor={`auth-${props.name}`}>{label}</label><input id={`auth-${props.name}`} className="form-input" required {...props} /></div>;
const AuthShell = ({ title, subtitle, children }) => <main className="auth-page"><section className="auth-card"><div className="brand-logo auth-logo">SM</div><p className="auth-eyebrow">Student Management System</p><h1>{title}</h1><p className="auth-subtitle">{subtitle}</p>{children}</section></main>;