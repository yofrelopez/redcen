import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, Series, useVideoConfig } from 'remotion';
import { AudioVisualizer } from './components/AudioVisualizer';
import { NewsSlide } from './components/NewsSlide';
import { IntroSlide } from './components/IntroSlide';
import { NewsCompositionProps } from './types';

export const NewsComposition: React.FC<NewsCompositionProps> = ({
    audioUrl,
    logoUrl,
    segments,
    presentationDate,
}) => {
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor: 'black' }}>
            {/* 1. Main Audio Track */}
            <Audio src={audioUrl} />

            {/* 2. Content Slideshow */}
            <Series>
                {segments.map((seg, i) => (
                    <Series.Sequence key={i} durationInFrames={Math.ceil(seg.durationInSeconds * fps)}>
                        {seg.type === 'intro' ? (
                            <IntroSlide
                                logoUrl={logoUrl}
                                title="AL DÍA"
                                subtitle={presentationDate}
                            />
                        ) : seg.type === 'outro' ? (
                            <IntroSlide
                                logoUrl={logoUrl}
                                title="GRACIAS"
                                subtitle="SÍGUENOS EN @REDCEN"
                            />
                        ) : (
                            <NewsSlide
                                image={seg.image}
                                title={seg.type === 'news' ? seg.title : undefined}
                                durationInFrames={Math.ceil(seg.durationInSeconds * fps)}
                                gallery={seg.gallery}
                            />
                        )}
                    </Series.Sequence>
                ))}
            </Series>

            {/* 3. Global Overlays (Header & Visualizer) */}
            <AbsoluteFill style={{ pointerEvents: 'none' }}>

                {/* Header Area */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    width: '100%',
                    height: '320px',
                    backgroundColor: '#002FA4',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderBottom: '15px solid #F44E00',
                    zIndex: 10,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}>
                    <Img src={logoUrl} style={{ height: '180px', marginBottom: '10px' }} />
                    <h2 style={{
                        color: 'white',
                        fontSize: '32px',
                        margin: 0,
                        fontWeight: 900,
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        {presentationDate}
                    </h2>
                </div>

                {/* Visualizer (Under Header) */}
                <div style={{
                    position: 'absolute',
                    top: '335px', // Immediately below the orange border
                    width: '100%',
                    zIndex: 15,
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: '20px' // Breathing room
                }}>
                    <AudioVisualizer audioUrl={audioUrl} />
                </div>

            </AbsoluteFill>
        </AbsoluteFill>
    );
};
