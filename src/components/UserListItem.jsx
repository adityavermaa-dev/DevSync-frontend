import React from 'react';
import defaultUserImage from '../assests/images/default-user-image.png';
import './UserListItem.css';

const UserListItem = ({ user, actions, onClick }) => {
    if (!user) return null;

    const { firstName, lastName, photoUrl, about, skills } = user;

    let bioText = about;
    if (!bioText && skills && skills.length > 0) {
        bioText = skills.join(' • ');
    } else if (!bioText) {
        bioText = "Developer on DevSync";
    }

    return (
        <div 
            className="flex items-center justify-between p-4 bg-base-100/50 backdrop-blur-md border border-base-200 rounded-2xl transition-all duration-300 cursor-pointer hover:bg-base-200 hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden group"
            onClick={onClick}
        >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-primary/50 to-secondary/50 opacity-0 transition-opacity duration-300 rounded-l-2xl group-hover:opacity-100"></div>
            
            <div className="flex items-center gap-4 flex-1 min-w-0 z-10 pl-2">
                <img
                    src={photoUrl || defaultUserImage}
                    alt={`${firstName} ${lastName}`}
                    className="w-14 h-14 rounded-full object-cover border-2 border-base-100 shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3"
                    onError={(e) => { e.target.src = defaultUserImage; }}
                />
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-extrabold text-base-content m-0 leading-tight truncate tracking-tight">{firstName} {lastName}</h3>
                    <p className="text-sm font-medium text-base-content/60 m-0 truncate mt-0.5">{bioText}</p>
                </div>
            </div>

            {actions && (
                <div className="flex items-center gap-3 ml-4 z-10">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default UserListItem;

