import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Img } from 'remotion';

interface Props {
    image: string;
    title?: string;
    durationInFrames: number;
    gallery?: string[];
}

export const NewsSlide: React.FC<Props> = ({ image, title, durationInFrames, gallery }) => {
    const frame = useCurrentFrame();

    // --- GALLERY LOGIC START ---
    // 1. Prepare Slide List (Main Image + Gallery, max 5 total)
    // Filter out potential nulls/duplicates just in case
    const allImages = [image, ...(gallery || [])].filter(Boolean);
    const uniqueImages = Array.from(new Set(allImages)).slice(0, 5);

    // 2. Determine Duration Logic
    const fps = 30;
    const MIN_DURATION_PER_SLIDE_SEC = 2.5;
    const MIN_FRAMES_PER_SLIDE = MIN_DURATION_PER_SLIDE_SEC * fps;

    let slidesToShow = uniqueImages;
    const maxPossibleSlides = Math.floor(durationInFrames / MIN_FRAMES_PER_SLIDE);

    if (maxPossibleSlides < uniqueImages.length && maxPossibleSlides > 0) {
        // Not enough time for all images -> Truncate list
        slidesToShow = uniqueImages.slice(0, maxPossibleSlides);
    } else if (maxPossibleSlides <= 0) {
        // Extremely short -> Show only main image
        slidesToShow = [image];
    }

    // 3. Calculate Active Slide
    // Avoid division by zero
    const slideDuration = slidesToShow.length > 0
        ? durationInFrames / slidesToShow.length
        : durationInFrames;

    const currentSlideIndex = Math.floor(frame / slideDuration);
    const safeIndex = Math.min(Math.max(currentSlideIndex, 0), slidesToShow.length - 1);

    const currentImage = slidesToShow[safeIndex] || image; // Fallback
    // --- GALLERY LOGIC END ---

    // 1. Dynamic Background Zoom (Flow effect)
    const scaleBg = interpolate(
        frame,
        [0, durationInFrames],
        [1.35, 1],
        { extrapolateRight: 'clamp' }
    );

    // 2. Static Foreground
    const scaleFg = 1;

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            {/* 1. Blurred Background Layer (Fill Screen) */}
            <Img
                src={currentImage} // DYNAMIC
                style={{
                    position: 'absolute',
                    top: '-10%',
                    left: '-10%',
                    width: '120%',
                    height: '120%',
                    objectFit: 'cover',
                    transform: `scale(${scaleBg})`,
                    filter: 'blur(20px) brightness(0.6) saturate(1.2)',
                    zIndex: 0
                }}
            />

            {/* 2. Foreground Image (Constrained with Margins) */}
            <div style={{
                position: 'relative',
                width: '85%',
                height: '50%',
                // User requested 190px explicitly
                marginTop: '190px',
                zIndex: 1,
                boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                borderRadius: '20px',
                backgroundColor: 'rgba(0,0,0,0.2)',
            }}>
                <Img
                    src={currentImage} // DYNAMIC
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'top',
                        transform: `scale(${scaleFg})`,
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
