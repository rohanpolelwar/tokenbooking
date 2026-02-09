import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users, ArrowRight, Loader2, Plus } from 'lucide-react';
import api from '../api';

const StaffPortal = () => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await api.get('/staff/opd-sessions');
                setSessions(response.data);
            } catch (err) {
                console.error('Failed to fetch sessions:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSessions();
    }, []);

    if (loading) {
        return (
            <div className="container flex-center" style={{ minHeight: '60vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <div>
                    <h1 className="h-font" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Staff Dashboard</h1>
                    <p style={{ color: 'var(--text-dim)' }}>Manage live OPD sessions and doctor availability.</p>
                </div>
                <button className="btn-primary flex-center" style={{ gap: '8px' }} onClick={() => navigate('/staff/leave')}>
                    <Plus size={20} />
                    Declare Leave
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {sessions.map((session) => (
                    <div key={session.id} className="glass float-effect" style={{ padding: '24px', cursor: 'pointer' }} onClick={() => navigate(`/staff/queue/${session.id}`)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div className="h-font" style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                                Dr. {session.doctors?.name || 'Unknown'}
                            </div>
                            <div style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: session.status === 'OPEN' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: session.status === 'OPEN' ? 'var(--success)' : 'var(--error)' }}>
                                {session.status}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                <Calendar size={16} />
                                {new Date(session.date).toLocaleDateString()} • {session.start_time.slice(0, 5)} - {session.end_time.slice(0, 5)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                                <Users size={16} />
                                {session.tokens_booked || 0} / {session.max_tokens} Tokens Booked
                            </div>
                        </div>

                        <button className="flex-center" style={{ width: '100%', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: 'white', fontWeight: '600', gap: '8px' }}>
                            Open Queue
                            <ArrowRight size={16} />
                        </button>
                    </div>
                ))}

                {sessions.length === 0 && (
                    <div className="glass flex-center" style={{ gridColumn: '1 / -1', padding: '60px', color: 'var(--text-dim)' }}>
                        No active sessions found for today.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffPortal;
