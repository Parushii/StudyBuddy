function cleanText(text) {
    return text
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2') // fix merged words
        .trim();
}
function chunkText(text) {

    if (!text || typeof text !== "string") return [];

    // Split by major headings (1.2, 1.2.1 etc)
    const sections = text.split(/(?=\n?\d+\.\d+(\.\d+)?\s)/);

    const chunks = [];

    for (let sec of sections) {

        if (!sec || typeof sec !== "string") continue;

        sec = sec.trim();

        if (sec.length < 200) continue;

        // 🔥 KEEP BIG CHUNKS INTACT
        if (sec.length <= 2000) {
            chunks.push(sec);
        } else {
            // split ONLY if TOO big
            for (let i = 0; i < sec.length; i += 1500) {
                chunks.push(sec.slice(i, i + 1500));
            }
        }
    }

    return chunks;
}

module.exports = { cleanText, chunkText };