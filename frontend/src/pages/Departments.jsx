import React, { useEffect, useState } from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { departmentApi } from '../services/api';

const Departments = ({ showToast }) => {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadDepartments = async () => {
    setLoading(true);
    try {
      setDepartments(await departmentApi.getAll());
    } catch (error) {
      showToast(error.message || 'Unable to load departments.', 'error', 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDepartments(); }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await departmentApi.create(name.trim(), code.trim());
      setName('');
      setCode('');
      showToast('Department added successfully.', 'success');
      await loadDepartments();
    } catch (error) {
      showToast(error.data?.details?.name?.[0] || error.message || 'Unable to add department.', 'error', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (department) => {
    if (!window.confirm(`Delete ${department.name}?`)) return;
    try {
      await departmentApi.delete(department.id);
      showToast('Department deleted successfully.', 'success');
      await loadDepartments();
    } catch (error) {
      showToast(error.data?.message || error.message || 'Cannot delete this department.', 'error', 'Delete failed');
    }
  };

  return <div className="departments-page">
    <div className="page-header"><div><h1 className="page-title">Department Management</h1><p className="page-subtitle">Manage departments in your college.</p></div><button type="button" className="btn-icon" onClick={loadDepartments} title="Refresh departments"><RefreshCw size={17} /></button></div>
    <section className="card department-management-card">
      <form className="department-add-form" onSubmit={handleSubmit}><label htmlFor="department-name" className="form-label">Department Name</label><div className="department-form-row"><input id="department-name" className="form-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Computer Science" maxLength={100} /><input id="department-code" className="form-input" value={code} onChange={(event) => setCode(event.target.value)} placeholder="Code e.g. CSE" maxLength={20} /><button type="submit" className="btn btn-primary" disabled={saving || !name.trim()}><Plus size={16} /> Add Department</button></div></form>
      {loading ? <div className="state-container loading-state"><div className="spinner" /><p className="state-text">Loading departments...</p></div> : departments.length === 0 ? <div className="state-container empty-state"><p className="state-title">No departments available.</p><p className="state-text">Add a department to make it available in the student form.</p></div> : <div className="department-list">{departments.map((department) => <div className="department-list-row" key={department.id}><div><strong>{department.name}</strong><span>Total Students: {department.student_count || 0}</span><span>Male: {department.male_count || 0}</span><span>Female: {department.female_count || 0}</span></div><button type="button" className="btn-action btn-delete" onClick={() => handleDelete(department)} title={`Delete ${department.name}`}><Trash2 size={15} /><span className="action-label">Delete</span></button></div>)}</div>}
    </section>
  </div>;
};

export default Departments;
