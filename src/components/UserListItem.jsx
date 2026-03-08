import React from 'react';
import defaultUserImage from '../assests/images/default-user-image.png';
import './UserListItem.css';

const UserListItem = ({ user, actions, onClick }) => {
    if (!user) return null;

    const { firstName, lastName, photoUrl, about, skills } = user;

    // Construct a brief bio from about or skills
    let bioText = about;
    if (!bioText && skills && skills.length > 0) {
        bioText = skills.join(' • ');
    } else if (!bioText) {
        bioText = "Developer on DevSync";
    }

    return (
        <div className="user-list-item" onClick={onClick}>
            <div className="user-list-info">
                <img
                    src={photoUrl || defaultUserImage}
                    alt={`${firstName} ${lastName}`}
                    className="user-list-avatar"
                    onError={(e) => { e.target.src = defaultUserImage; }}
                />
                <div className="user-list-details">
                    <h3 className="user-list-name">{firstName} {lastName}</h3>
                    <p className="user-list-bio">{bioText}</p>
                </div>
            </div>

            {actions && (
                <div className="user-list-actions">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default UserListItem;
