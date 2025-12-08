
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

dotenv.config();

async function listModels() {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("❌ ERROR: GEMINI_API_KEY is missing or empty.");
            return;
        }
        // Log last 4 chars to verify against user screenshot (should be ...cU0s)
        console.log(`Checking model availability with Key ending in ...${apiKey.slice(-4)} (Length: ${apiKey.length})`);

        const genAI = new GoogleGenerativeAI(apiKey);

        // Try standard and specific versions. 001/002 often work when aliases fail.
        const potentialModels = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash-001",
            "gemini-1.5-flash-002",
            "gemini-pro",
            "gemini-1.5-pro"
        ];

        for (const modelName of potentialModels) {
            process.stdout.write(`Testing ${modelName}... `);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Test");
                if (result && result.response) {
                    console.log("✅ OK");
                }
            } catch (error: any) {
                if (error.message.includes("404") || error.message.includes("not found")) {
                    console.log("❌ 404 Not Found");
                    // Log extra details if available
                    if (error.response) console.log("Response:", JSON.stringify(error.response, null, 2));
                } else {
                    console.log(`⚠️ Error: ${error.message}`);
                    if (error.response) console.log(JSON.stringify(error.response, null, 2));
                    else console.log(JSON.stringify(error, null, 2));
                }
            }
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
