import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig, Img } from 'remotion';

interface Props {
    logoUrl: string;
    title: string;
    subtitle: string;
}

export const IntroSlide: React.FC<Props> = ({ logoUrl, title, subtitle }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // 1. Background Animation (Subtle Pulse)
    const bgScale = interpolate(frame, [0, 200], [1, 1.2]);
    const bgOpacity = interpolate(frame, [0, 30], [0, 1]);

    // 2. Logo Spring (Pop in)
    const logoProgress = spring({
        frame: frame - 15, // Delay slightly
        fps,
        config: { damping: 10, stiffness: 80 }
    });
    const logoScale = interpolate(logoProgress, [0, 1], [0, 1]);

    // 3. Text Slide Up
    const textSlide = spring({
        frame: frame - 40,
        fps,
        config: { damping: 15 }
    });
    const textY = interpolate(textSlide, [0, 1], [100, 0]);
    const textOpacity = interpolate(textSlide, [0, 1], [0, 1]);

    return (
        <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: '#002FA4', // Deep Blue Brand Color
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
        }}>
            {/* Animated Background Gradient */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                left: '-50%',
                width: '200%',
                height: '200%',
                background: 'radial-gradient(circle, rgba(244,78,0,0.3) 0%, rgba(0,47,164,0) 70%)',
                transform: `scale(${bgScale})`,
                opacity: bgOpacity,
            }} />

            {/* Logo */}
            <div style={{
                transform: `scale(${logoScale})`,
                marginBottom: '40px',
                zIndex: 10,
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'
            }}>
                <Img src={logoUrl} style={{ height: '250px' }} />
            </div>

            {/* Main Title */}
            <h1 style={{
                fontSize: '90px',
                fontWeight: 900,
                marginBottom: '10px',
                fontFamily: 'Roboto, sans-serif',
                letterSpacing: '5px',
                transform: `translateY(${textY}px)`,
                opacity: textOpacity,
                zIndex: 10,
                textShadow: '0 4px 10px rgba(0,0,0,0.5)'
            }}>
                {title}
            </h1>

            {/* Subtitle / Date */}
            <h2 style={{
                fontSize: '40px',
                fontWeight: 300,
                color: '#FFD700', // Gold/Yellow
                transform: `translateY(${textY}px)`,
                opacity: textOpacity,
                zIndex: 10
            }}>
                {subtitle}
            </h2>

            {/* Decorative Stripe */}
            <div style={{
                position: 'absolute',
                bottom: '100px',
                height: '5px',
                backgroundColor: '#F44E00',
                borderRadius: '5px',
                width: interpolate(frame, [50, 90], [0, 800], { extrapolateRight: 'clamp' }) + 'px'
            }} />
        </div>
    );
};

