import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Clock, Users, ChevronLeft, Loader2 } from 'lucide-react';
import api from '../api';

const StatusPage = () => {
    const { tokenNumber } = useParams();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const navigate = useNavigate();

    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchStatus = async () => {
        try {
            const response = await api.get(`/patient/token-status/${tokenNumber}`, {
                params: { session_id: sessionId }
            });
            setStatus(response.data);
            setError('');
        } catch (err) {
            if (err.response?.status === 404) {
                setError('Token not found.');
            }
            console.error('Polling error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(() => {
            if (status?.status === 'SERVED' || status?.status === 'CANCELLED' || status?.status === 'SKIPPED') {
                clearInterval(interval);
                return;
            }
            fetchStatus();
        }, 5000);

        return () => clearInterval(interval);
    }, [tokenNumber, sessionId, status?.status]);

    if (loading && !status) {
        return (
            <div className="container flex-center" style={{ minHeight: '80vh' }}>
                <Loader2 className="animate-spin" size={48} color="var(--accent-primary)" />
            </div>
        );
    }

    const getStatusDisplay = () => {
        switch (status?.status) {
            case 'BOOKED':
                return { icon: <Clock color="var(--accent-secondary)" size={48} />, label: 'Queued', color: 'var(--accent-secondary)' };
            case 'NOW_SERVING':
                return { icon: <CheckCircle2 color="var(--success)" size={48} className="float-effect" />, label: 'Visiting Now', color: 'var(--success)' };
            case 'SERVED':
                return { icon: <CheckCircle2 color="var(--success)" size={48} />, label: 'Completed', color: 'var(--success)' };
            case 'CANCELLED':
                return { icon: <XCircle color="var(--error)" size={48} />, label: 'Cancelled', color: 'var(--error)' };
            case 'SKIPPED':
                return { icon: <XCircle color="var(--warning)" size={48} />, label: 'Skipped', color: 'var(--warning)' };
            default:
                return { icon: <Clock size={48} />, label: status?.status, color: 'var(--text-dim)' };
        }
    };

    const statusView = getStatusDisplay();

    return (
        <div className="container" style={{ padding: '40px 20px' }}>
            <button
                onClick={() => navigate('/')}
                className="flex-center"
                style={{ background: 'none', border: 'none', color: 'var(--text-dim)', gap: '8px', cursor: 'pointer', marginBottom: '24px' }}
            >
                <ChevronLeft size={20} />
                Back to Home
            </button>

            {error ? (
                <div className="glass flex-center" style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--error)' }}>{error}</p>
                </div>
            ) : (
                <div className="card-stack" style={{ alignItems: 'center' }}>
                    <div className="glass gravity-drop" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '40px' }}>
                        <div style={{ marginBottom: '24px' }} className="flex-center">
                            {statusView.icon}
                        </div>

                        <h2 className="h-font" style={{ color: statusView.color, marginBottom: '8px' }}>{statusView.label}</h2>
                        <div style={{ fontSize: '4rem', fontWeight: '700', margin: '20px 0' }} className="h-font">
                            #{status?.token_number}
                        </div>

                        <p style={{ color: 'var(--text-dim)' }}>Your Token Number</p>
                    </div>

                    <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '8px' }} className="flex-center gap-4">
                                <Users size={14} style={{ marginRight: '4px' }} />
                                Ahead of you
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>{status?.queue_position}</div>
                        </div>
                        <div style={{ textAlign: 'center', borderLeft: '1px solid var(--glass-border)' }}>
                            <div style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '8px' }} className="flex-center gap-4">
                                <Clock size={14} style={{ marginRight: '4px' }} />
                                Currently Serving
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '600' }}>#{status?.current_serving_token || 'N/A'}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatusPage;
