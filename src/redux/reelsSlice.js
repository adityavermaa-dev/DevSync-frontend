import { createSlice } from '@reduxjs/toolkit';

const reelsSlice = createSlice({
    name: 'reels',
    initialState: null,
    reducers: {
        setReels: (state, action) => {
            return action.payload;
        },
        removeReels: (state) => {
            return null;
        },
        updateReelLikeStatus: (state, action) => {
            const { videoId, isLiked, likesCount } = action.payload;
            if (state) {
                const reelIndex = state.findIndex((r) => r._id === videoId);
                if (reelIndex !== -1) {
                    state[reelIndex].likesCount = likesCount;
                    state[reelIndex].isLiked = isLiked;
                }
            }
        }
    }
});

export const { setReels, removeReels, updateReelLikeStatus } = reelsSlice.actions;
export default reelsSlice.reducer;
