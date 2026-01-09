import { useAudioData, visualizeAudio } from '@remotion/media-utils';
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

interface Props {
    audioUrl: string;
}

export const AudioVisualizer: React.FC<Props> = ({ audioUrl }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const audioData = useAudioData(audioUrl);

    if (!audioData) {
        return null;
    }

    // Visualize: 32 bars to keep it clean and thick
    const frequencyData = visualizeAudio({
        fps,
        frame,
        audioData,
        numberOfSamples: 64, // Base
        smoothing: true,
    });

    // Mirror Effect: Take first 16 bars, reverse them, then add normal 16 bars
    // Or simpler: Take 32 bars, split 16/16?
    // Let's use 20 bars range 0-20.
    // Left side: reverse(0-20). Right side: (0-20).
    // Total 40 bars. Center is low freq (bass).
    const sourceBars = frequencyData.slice(0, 20);
    const leftSide = [...sourceBars].reverse();
    const rightSide = sourceBars;
    const finalBars = [...leftSide, ...rightSide];

    return (
        <div style={{
            display: 'flex',
            gap: '8px', // Tighter gap
            alignItems: 'flex-end',
            height: '220px', // slightly shorter to fit layout
            justifyContent: 'center',
            width: '80%', // 80% Constraint
            filter: 'drop-shadow(0 0 15px rgba(244, 78, 0, 0.8))'
        }}>
            {finalBars.map((v, i) => {
                // Amplify visualization (User wanted more movement)
                // Boost factor: 800 -> 1200
                const height = Math.min(100, v * 1200);

                return (
                    <div
                        key={i}
                        style={{
                            height: `${height}%`,
                            width: '16px', // Thinner bars for elegance
                            background: 'linear-gradient(to top, #F44E00, #FFD700)', // Orange to Gold
                            borderRadius: '8px 8px 0 0',
                            transition: 'height 0.05s ease', // Faster response
                            opacity: 0.9
                        }}
                    />
                );
            })}
        </div>
    );
};
