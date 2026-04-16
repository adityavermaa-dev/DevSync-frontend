import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import { addConnections } from '../redux/connectionSlice';
import UserListItem from '../components/UserListItem';
import './Connections.css';

const Connections = () => {
    const connections = useSelector(store => store.connections);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const fetchConnections = useCallback(async () => {
        if (connections) return;
        setLoading(true);
        try {
            const res = await axios.get(BASE_URL + '/user/connections', { withCredentials: true });
            dispatch(addConnections(res.data?.data || []));
        } catch (error) {
            console.error('Connections fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [connections, dispatch]);

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    const handleViewProfile = (user) => {
        if (!user?._id) return;
        navigate(`/user/${user._id}`, { state: { user } });
    };

    const validConnections = Array.isArray(connections)
        ? connections.filter((user) => Boolean(user?._id))
        : [];

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="connections-page">
                <div className="connections-loading">
                    <div className="connections-spinner" />
                </div>
            </div>
        );
    }

    /* ── Empty ── */
    if (!validConnections || validConnections.length === 0) {
        return (
            <div className="connections-page">
                <div className="connections-empty">
                    <span className="connections-empty-icon">🤝</span>
                    <h2 className="connections-empty-title">No connections yet</h2>
                    <p className="connections-empty-text">
                        Start swiping on the feed to find and connect with other developers!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="connections-page">
            <div className="connections-container">
                <div className="connections-header">
                    <h1 className="connections-title">Connections</h1>
                    <span className="connections-count">
                        {validConnections.length}
                    </span>
                </div>

                <div className="connections-grid">
                    {validConnections.map((user, idx) => (
                        <div
                            key={user._id}
                            className="connection-card-wrap"
                            style={{ animationDelay: `${idx * 0.04}s` }}
                            onClick={() => handleViewProfile(user)}
                        >
                            <UserListItem
                                user={user}
                                actions={(
                                    <Link
                                        to={`/chat/${user._id}`}
                                        className="user-list-btn"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        Chat
                                    </Link>
                                )}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Connections;
