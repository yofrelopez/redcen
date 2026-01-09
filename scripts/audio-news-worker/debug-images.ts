
import { getTopNews } from './lib/news-selector';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

async function diagnoseImages() {
    console.log('🔍 DIAGNOSING NEWS IMAGES...');
    try {
        const news = await getTopNews();
        console.log(`📋 Found ${news.length} news items.`);

        news.forEach((item, index) => {
            console.log(`\n[ITEM ${index + 1}] Title: ${item.title.substring(0, 30)}...`);
            console.log(`   imageUrl: "${item.imageUrl}"`);

            if (!item.imageUrl) {
                console.log('   ❌ Status: MISSING (Null/Undefined)');
                return;
            }

            // Check 1: Is it a URL?
            if (item.imageUrl.startsWith('http')) {
                console.log('   ℹ️ Status: REMOTE URL (Should be handled generally, but check logic)');
                return;
            }

            // Check 2: Local File Existence
            const projectRoot = process.cwd();

            // Check raw path
            const rawPath = path.join(projectRoot, item.imageUrl);
            const rawExists = fs.existsSync(rawPath);

            // Check with 'public' prefix
            const publicPath = path.join(projectRoot, 'public', item.imageUrl);
            const publicExists = fs.existsSync(publicPath);

            console.log(`   📂 Local Check:`);
            console.log(`      - "${rawPath}": ${rawExists ? '✅ FOUND' : '❌ NOT FOUND'}`);
            console.log(`      - "${publicPath}": ${publicExists ? '✅ FOUND' : '❌ NOT FOUND'}`);
        });

    } catch (error) {
        console.error('🔥 Error fetching news:', error);
    }
}

diagnoseImages();
