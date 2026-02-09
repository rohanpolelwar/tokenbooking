import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import api from '../api';

const BookingPage = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleBook = async (e) => {
        e.preventDefault();
        if (!name || !phone) return;

        setLoading(true);
        setError('');
        try {
            const response = await api.post('/patient/book-token', { name, phone });
            const { token_number, session_id } = response.data;
            navigate(`/status/${token_number}?session_id=${session_id}`);
        } catch (err) {
            setError(err.response?.data?.detail || 'Booking failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container flex-center" style={{ minHeight: '80vh' }}>
            <div className="glass gravity-drop" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>
                <h1 className="h-font" style={{ marginBottom: '8px', fontSize: '2.5rem' }}>Welcome</h1>
                <p style={{ color: 'var(--text-dim)', marginBottom: '32px' }}>Request your OPD token in seconds.</p>

                <form onSubmit={handleBook} className="card-stack">
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Your Full Name"
                            style={{ paddingLeft: '44px' }}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                        <input
                            type="tel"
                            className="input-field"
                            placeholder="Phone Number"
                            style={{ paddingLeft: '44px' }}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p style={{ color: 'var(--error)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

                    <button
                        type="submit"
                        className="btn-primary flex-center"
                        style={{ width: '100%', marginTop: '8px', gap: '8px' }}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                Request Token
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookingPage;
