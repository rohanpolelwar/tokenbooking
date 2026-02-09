import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, AlertCircle, Loader2, Send } from 'lucide-react';
import api from '../api';

const LeaveManagement = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        doctor_id: '',
        leave_date: new Date().toISOString().split('T')[0],
        type: 'UNPLANNED',
        reason: ''
    });

    const [doctors, setDoctors] = useState([]);

    useEffect(() => {
        // Fetch doctors from sessions or a dedicated endpoint
        const fetchDoctors = async () => {
            try {
                const response = await api.get('/staff/opd-sessions');
                const uniqueDoctors = [];
                const seen = new Set();
                response.data.forEach(s => {
                    if (s.doctor_id && !seen.has(s.doctor_id)) {
                        seen.add(s.doctor_id);
                        uniqueDoctors.push({ id: s.doctor_id, name: s.doctors?.name || 'Unknown' });
                    }
                });
                setDoctors(uniqueDoctors);
                if (uniqueDoctors.length > 0) setFormData(prev => ({ ...prev, doctor_id: uniqueDoctors[0].id }));
            } catch (err) {
                console.error('Failed to fetch doctors:', err);
            }
        };
        fetchDoctors();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await api.post('/doctor/leave', formData);
            setSuccess(response.data.message);
            setTimeout(() => navigate('/staff'), 2000);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to declare leave.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <button
                onClick={() => navigate('/staff')}
                className="flex-center"
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', gap: '8px', cursor: 'pointer', marginBottom: '24px' }}
            >
                <ChevronLeft size={20} />
                Back to Dashboard
            </button>

            <div className="glass gravity-drop" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px' }}>
                <h1 className="h-font" style={{ fontSize: '2rem', marginBottom: '8px' }}>Declare Leave</h1>
                <p style={{ color: 'var(--text-dim)', marginBottom: '32px' }}>This will affect active sessions and tokens.</p>

                <form onSubmit={handleSubmit} className="card-stack">
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Select Doctor</label>
                        <select
                            className="input-field"
                            value={formData.doctor_id}
                            onChange={e => setFormData({ ...formData, doctor_id: e.target.value })}
                            required
                        >
                            {doctors.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
                            {doctors.length === 0 && <option value="">No active doctors found</option>}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Leave Date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={formData.leave_date}
                                onChange={e => setFormData({ ...formData, leave_date: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Leave Type</label>
                            <select
                                className="input-field"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="PLANNED">Planned (Future)</option>
                                <option value="UNPLANNED">Unplanned (Urgent)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-dim)' }}>Reason (Optional)</label>
                        <textarea
                            className="input-field"
                            style={{ minHeight: '100px', resize: 'none' }}
                            value={formData.reason}
                            onChange={e => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="E.g. Medical Emergency, Family Event..."
                        />
                    </div>

                    {formData.type === 'UNPLANNED' && formData.leave_date === new Date().toISOString().split('T')[0] && (
                        <div className="flex-center" style={{ gap: '12px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <AlertCircle size={24} color="var(--error)" />
                            <p style={{ fontSize: '0.85rem', color: 'var(--error)', margin: 0 }}>
                                <strong>Warning:</strong> Declaring unplanned leave for today will cancel all active sessions and tokens immediately.
                            </p>
                        </div>
                    )}

                    {error && <p style={{ color: 'var(--error)', textAlign: 'center' }}>{error}</p>}
                    {success && <p style={{ color: 'var(--success)', textAlign: 'center' }}>{success}</p>}

                    <button type="submit" className="btn-primary flex-center" style={{ gap: '8px', marginTop: '16px' }} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Confirm Leave
                                <Send size={18} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LeaveManagement;
