
// Mock types
type SegmentType = 'intro' | 'outro' | 'news';
interface AudioSegment {
    imageIndex?: number;
    duration: number;
}
interface VideoSegment {
    type: SegmentType;
    duration: number;
    description: string;
}

// MOCK INPUT DATA (Simulating the User's "Chaos" Scenario)
const audioSegments: AudioSegment[] = [
    { imageIndex: 0, duration: 5 },          // 1. Intro Music Start
    { imageIndex: undefined, duration: 10 }, // 2. Welcome Speech (Undefined) -> Should match Intro
    { imageIndex: 1, duration: 10 },         // 3. News 1 Start (Defined)
    { imageIndex: undefined, duration: 10 }, // 4. News 1 Part 2 (Undefined) -> Should match News 1
    { imageIndex: -99, duration: 5 },        // 5. Outro Start
    { imageIndex: undefined, duration: 5 },  // 6. Farewell Speech (Undefined) -> Should match Outro
];

console.log('🧪 STARTING LOGIC TEST...');
console.log('INPUT:', audioSegments);

// --- LOGIC UNDER TEST (COPIED FROM video-generator.ts) ---

let rawSegments: Array<{ type: SegmentType; duration: number }> = [];

// Initial State
let currentState = {
    type: 'intro' as SegmentType,
};

for (const seg of audioSegments) {
    if (seg.imageIndex === 0) {
        currentState = { type: 'intro' };
    } else if (seg.imageIndex === -99) {
        currentState = { type: 'outro' };
    } else if (seg.imageIndex !== undefined) {
        currentState = { type: 'news' };
    }
    // If undefined, currentState REMAINS unchanged (Sticky)

    rawSegments.push({
        type: currentState.type,
        duration: seg.duration
    });
}

// Coalesce
const coalescedSegments: typeof rawSegments = [];
if (rawSegments.length > 0) {
    let current = { ...rawSegments[0] };

    for (let i = 1; i < rawSegments.length; i++) {
        const next = rawSegments[i];
        if (next.type === current.type) { // Simplified check for test
            current.duration += next.duration;
        } else {
            coalescedSegments.push(current);
            current = { ...next };
        }
    }
    coalescedSegments.push(current);
}

// --- RESULTS ---

console.log('------------------------------------------------');
console.log('📊 FINAL VISUAL SEGMENTS:');
coalescedSegments.forEach(s => {
    console.log(`[${s.type.toUpperCase()}] Duration: ${s.duration}s`);
});
console.log('------------------------------------------------');

// Verification assertions
const isIntroCorrect = coalescedSegments[0].type === 'intro' && coalescedSegments[0].duration === 15;
const isNewsCorrect = coalescedSegments[1].type === 'news' && coalescedSegments[1].duration === 20;
const isOutroCorrect = coalescedSegments[2].type === 'outro' && coalescedSegments[2].duration === 10;

if (isIntroCorrect && isNewsCorrect && isOutroCorrect) {
    console.log('✅ TEST PASSED: Logic maps undefined segments correctly!');
} else {
    console.error('❌ TEST FAILED: Segments did not merge as expected.');
}
