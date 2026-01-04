import ffmpeg from 'fluent-ffmpeg';
import pathToFfmpeg from 'ffmpeg-static';
import path from 'path';

if (pathToFfmpeg) {
    ffmpeg.setFfmpegPath(pathToFfmpeg);
}

const assets = ['intro.mp3', 'outro.mp3', 'background.mp3'];
const outDir = path.join(__dirname, 'assets');

assets.forEach(file => {
    ffmpeg()
        .input('anullsrc=r=44100:cl=stereo')
        .inputFormat('lavfi')
        .duration(5)
        .save(path.join(outDir, file))
        .on('end', () => console.log(`Generated ${file}`))
        .on('error', (e) => console.error(e));
});
