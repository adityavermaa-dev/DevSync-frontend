import React from 'react';
import './AnimatedEmoji.css';

const AnimatedEmoji = ({ mousePos, isHappy = false }) => {
    
    const maxOffset = 10;
    const pupilX = (mousePos.x / 20) * maxOffset; 
    const pupilY = (mousePos.y / 20) * maxOffset; 

    
    const headRot = (mousePos.x / 20) * 4;

    return (
        <div className="custom-emoji-container" style={{ transform: `rotate(${headRot}deg)` }}>
           <div className="emoji-face">
               
               {}
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
               
               {}
               <div className="cheek cheek-left"></div>
               <div className="cheek cheek-right"></div>
               
               {}
               <div className={`emoji-mouth ${isHappy ? 'happy' : ''}`}>
                   <div className="emoji-teeth"></div>
                   <div className="emoji-tongue"></div>
               </div>
               
           </div>
        </div>
    );
};

export default AnimatedEmoji;
