
import 'dotenv/config'
console.log("URL:", process.env.INGEST_URL)
console.log("SECRET:", process.env.INGEST_API_SECRET ? "EXISTS" : "MISSING")
