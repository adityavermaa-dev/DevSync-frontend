import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../constants/commonData';
import { addRequests, removeRequest } from '../redux/requestSlice';
import UserListItem from '../components/UserListItem';
import './Requests.css';
import toast from 'react-hot-toast';

const Requests = () => {
    const requests = useSelector(store => store.requests);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [removingId, setRemovingId] = useState(null);

    const fetchRequests = async () => {
        if (requests) return;
        setLoading(true);
        try {
            const res = await axios.get(BASE_URL + '/user/request/received', { withCredentials: true });
            dispatch(addRequests(res.data?.connectionRequests || []));
        } catch (error) {
            console.error('Requests fetch error:', error);
            toast.error('Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleReview = async (status, requestId, e) => {
        e.stopPropagation(); // don't trigger row click
        try {
            await axios.post(
                `${BASE_URL}/request/review/${status}/${requestId}`,
                {},
                { withCredentials: true }
            );
            // Animate out then remove
            toast.success(status === 'accepted' ? 'Request accepted! 🎉' : 'Request rejected');
            setRemovingId(requestId);
            setTimeout(() => {
                dispatch(removeRequest(requestId));
                setRemovingId(null);
            }, 350);
        } catch (error) {
            console.error('Review request error:', error);
            toast.error('Failed to process request');
        }
    };

    const handleViewProfile = (user) => {
        navigate(`/user/${user._id}`, { state: { user } });
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="requests-page">
                <div className="requests-loading">
                    <div className="requests-spinner" />
                </div>
            </div>
        );
    }

    /* ── Empty ── */
    if (!requests || requests.length === 0) {
        return (
            <div className="requests-page">
                <div className="requests-empty">
                    <span className="requests-empty-icon">📬</span>
                    <h2 className="requests-empty-title">No pending requests</h2>
                    <p className="requests-empty-text">
                        When someone is interested in connecting with you, their request will appear here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="requests-page">
            <div className="requests-container">
                <div className="requests-header">
                    <h1 className="requests-title">Requests</h1>
                    <span className="requests-count">
                        {requests.length}
                    </span>
                </div>

                <div className="requests-grid">
                    {requests.map((req, idx) => {
                        const user = req.fromUserId || req;
                        return (
                            <div
                                key={req._id || idx}
                                className={`request-card-wrap ${removingId === req._id ? 'removing' : ''}`}
                                style={{ animationDelay: `${idx * 0.04}s` }}
                                onClick={() => handleViewProfile(user)}
                            >
                                <UserListItem
                                    user={user}
                                    actions={
                                        <>
                                            <button
                                                className="feed-action-btn feed-btn-pass"
                                                style={{ width: '40px', height: '40px' }}
                                                title="Reject"
                                                onClick={(e) => handleReview('rejected', req._id, e)}
                                            >
                                                {rejectIcon}
                                            </button>
                                            <button
                                                className="feed-action-btn feed-btn-like"
                                                style={{ width: '40px', height: '40px' }}
                                                title="Accept"
                                                onClick={(e) => handleReview('accepted', req._id, e)}
                                            >
                                                {acceptIcon}
                                            </button>
                                        </>
                                    }
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const rejectIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const acceptIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
);

export default Requests;
