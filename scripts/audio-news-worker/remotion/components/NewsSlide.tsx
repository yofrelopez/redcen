import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Img } from 'remotion';

interface Props {
    image: string;
    title?: string;
    durationInFrames: number;
}

export const NewsSlide: React.FC<Props> = ({ image, title, durationInFrames }) => {
    const frame = useCurrentFrame();

    // 1. Dynamic Background Zoom (Flow effect)
    const scaleBg = interpolate(
        frame,
        [0, durationInFrames],
        [1.35, 1], // Strong movement (35%)
        { extrapolateRight: 'clamp' }
    );

    // 2. Static Foreground (Solid)
    const scaleFg = 1;

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
                    transform: `scale(${scaleBg})`, // Dynamic
                    filter: 'blur(20px) brightness(0.6) saturate(1.2)', // CORRECTED SYNTAX + VISIBLE TEXTURE
                    zIndex: 0
                }}
            />

            {/* 2. Foreground Image (Constrained with Margins) */}
            <div style={{
                position: 'relative',
                width: '85%', // More "air" on sides (was 90%)
                height: '50%', // Reduce height to favor horizontal aspect ratios in vertical frame? 
                // No, keep it flexible but "contained". 
                // If I constrain height too much, vertical images suffer.
                // Better to keep height generous (e.g. 70%) and let objectFit: contain handle it.
                aspectRatio: 'auto', // Allow natural shape within constraints
                maxHeight: '70%',
                marginTop: '150px', // Push down below header
                zIndex: 1,
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)', // Deep shadow
                borderRadius: '20px',
                // Optional: distinctive background for the "card" if transparent areas appear
                backgroundColor: 'rgba(0,0,0,0.2)',
            }}>
                <Img
                    src={image}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain', // SHOW FULL IMAGE (No cropping)
                        transform: `scale(${scaleFg})`, // Static
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
