
import fs from 'fs'

const content = fs.readFileSync('debug_retry_2.txt', 'utf8') // or 'utf16le' if it was piped by powershell nicely
// PowerShell > file defaults to UTF-16LE usually.
// Let's try reading as buffer and detecting or just utf16le
try {
    const content16 = fs.readFileSync('debug_final_3.txt', 'utf16le')
    console.log("--- LOG CONTENT (UTF-16LE) ---")
    console.log(content16)
} catch (e) {
    console.log("Error reading utf16le", e)
}
