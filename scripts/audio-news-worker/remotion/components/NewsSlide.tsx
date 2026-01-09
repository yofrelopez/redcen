import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Img } from 'remotion';

interface Props {
    image: string;
    title?: string;
    durationInFrames: number;
}

export const NewsSlide: React.FC<Props> = ({ image, title, durationInFrames }) => {
    const frame = useCurrentFrame();

    // Ken Burns Effect (Slow Zoom out)
    const scale = interpolate(
        frame,
        [0, durationInFrames],
        [1.1, 1], // Zoom out from 1.1x to 1x
        { extrapolateRight: 'clamp' }
    );

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#000', // Deep base
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* 1. Blurred Background Layer (Fill Screen) */}
            <Img
                src={image}
                style={{
                    position: 'absolute',
                    top: '-10%', // Overscan for blur
                    left: '-10%',
                    width: '120%',
                    height: '120%',
                    objectFit: 'cover',
                    transform: `scale(${scale})`, // Sync movement
                    filter: 'blur(30px) brightness(0.5) saturation(1.2)', // Atmos effect
                    zIndex: 0
                }}
            />

            {/* 2. Foreground Image (Constrained with Margins) */}
            <div style={{
                position: 'relative',
                width: '90%',
                height: '85%',
                marginTop: '150px', // Push down below header
                zIndex: 1,
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)', // Deep shadow
                borderRadius: '20px',
            }}>
                <Img
                    src={image}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transform: `scale(${scale})`,
                        borderRadius: '20px',
                    }}
                />
            </div>

            {/* Dark Gradient Overlay for Text Readability - Constrained to Image */}
            <div style={{
                position: 'absolute',
                bottom: '10%', // Match image constraints roughly
                left: '5%',
                width: '90%',
                height: '40%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0))',
                borderRadius: '0 0 20px 20px',
                pointerEvents: 'none',
                zIndex: 2
            }} />

            {/* Title Text */}
            {title && (
                <div style={{
                    position: 'absolute',
                    bottom: '350px', // Leave space for Visualizer
                    left: '100px',
                    right: '100px',
                    textAlign: 'center',
                    color: 'white',
                    zIndex: 3
                }}>
                    <h1 className="title-text" style={{
                        fontSize: '60px',
                        margin: 0,
                        textShadow: '0 2px 10px rgba(0,0,0,0.8)'
                    }}>
                        {title}
                    </h1>
                </div>
            )}
        </div>
    );
};
