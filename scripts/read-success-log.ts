
import fs from 'fs'

try {
    const content16 = fs.readFileSync('debug_success.txt', 'utf16le')
    console.log("--- LOG CONTENT (UTF-16LE) ---")
    console.log(content16)
} catch (e) {
    console.log("Error reading utf16le", e)
}
