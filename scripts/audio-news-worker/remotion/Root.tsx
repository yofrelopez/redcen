import React from 'react';
import { Composition } from 'remotion';
import { NewsComposition } from './NewsComposition';
import { newsCompositionSchema } from './types';
import './style.css';

export const RemotionRoot: React.FC = () => {
    return (
        <>
            <Composition
                id="NewsReel"
                component={NewsComposition}
                durationInFrames={30 * 60}
                fps={30}
                width={1080}
                height={1920}
                schema={newsCompositionSchema}
                defaultProps={{
                    audioUrl: '',
                    logoUrl: '', // Placeholder
                    segments: [],
                    presentationDate: 'HOY',
                    durationInSeconds: 60
                }}
                calculateMetadata={async ({ props }) => {
                    return {
                        durationInFrames: Math.ceil((props.durationInSeconds || 60) * 30),
                    };
                }}
            />
        </>
    );
};
