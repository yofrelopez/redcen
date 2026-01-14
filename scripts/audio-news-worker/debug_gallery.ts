
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { getNewsByLinks } from './lib/news-selector';

// Load Env
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

async function debug() {
    console.log('🔍 DEBUG: Checking Gallery Data...');

    // The specific link provided by user
    const links = ['miles-de-personas-disfrutan-de-playas-limpias-en-huacho-gracias-a-la-unidad-de-gesti-n-de-residuos-s-lidos-1768302582441'];

    try {
        const news = await getNewsByLinks(links);

        if (news.length === 0) {
            console.log('❌ No news found for link.');
            return;
        }

        const item = news[0];
        console.log('📰 News Item:', item.title);
        console.log('🖼️ Main Image:', item.imageUrl);
        console.log('📂 Gallery Field (Raw):', item.gallery);

        if (Array.isArray(item.gallery)) {
            console.log(`✅ Gallery is an array with ${item.gallery.length} items.`);
            item.gallery.forEach((img, i) => {
                console.log(`   [${i}] Path: "${img}"`);

                // Check existence if local
                if (img && !img.startsWith('http')) {
                    const projectRoot = path.resolve(__dirname, '../../');
                    const absPath = path.join(projectRoot, img);
                    const exists = fs.existsSync(absPath);
                    console.log(`       -> Local Check: ${exists ? 'OK' : 'MISSING'} (${absPath})`);
                } else {
                    console.log(`       -> Remote URL (assumed accessible)`);
                }
            });
        } else {
            console.log('⚠️ Gallery is NOT an array:', typeof item.gallery);
        }

    } catch (error) {
        console.error('❌ Error fetching news:', error);
    }
}

debug();
