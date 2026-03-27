import React from 'react';
import './AnimatedEmoji.css';

const AnimatedEmoji = ({ mousePos, isHappy = false }) => {
    // Normalizing mousePos (-20 to 20) to a smaller pupil movement range (-8 to 8)
    const maxOffset = 10;
    const pupilX = (mousePos.x / 20) * maxOffset; 
    const pupilY = (mousePos.y / 20) * maxOffset; 

    // Calculate rotation slightly for the head based on x mouse movement
    const headRot = (mousePos.x / 20) * 4;

    return (
        <div className="custom-emoji-container" style={{ transform: `rotate(${headRot}deg)` }}>
           <div className="emoji-face">
               
               {/* Glasses Frame */}
               <div className="glasses">
                   <div className="glass-lens left">
                       <div className="eye-white">
                           <div className="pupil" style={{ transform: `translate(${pupilX}px, ${pupilY}px)` }}></div>
                       </div>
                   </div>
                   
                   <div className="glass-bridge"></div>
                   
                   <div className="glass-lens right">
                       <div className="eye-white">
                           <div className="pupil" style={{ transform: `translate(${pupilX}px, ${pupilY}px)` }}></div>
                       </div>
                   </div>

                   <div className="glass-arm left-arm"></div>
                   <div className="glass-arm right-arm"></div>
               </div>
               
               {/* Cheeks */}
               <div className="cheek cheek-left"></div>
               <div className="cheek cheek-right"></div>
               
               {/* Mouth */}
               <div className={`emoji-mouth ${isHappy ? 'happy' : ''}`}>
                   <div className="emoji-teeth"></div>
                   <div className="emoji-tongue"></div>
               </div>
               
           </div>
        </div>
    );
};

export default AnimatedEmoji;
