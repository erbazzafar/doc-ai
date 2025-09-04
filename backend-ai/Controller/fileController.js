const fs = require("fs");
const pdfParse = require("pdf-parse");

// 🗂️ Temporary in-memory store (will be replaced by DB in real apps)
let lastExtractedText = "";

const uploadFile = async (req, res) => {
    try {
        const file = req.file;
        if (!file) return res.status(400).json({ message: "No file uploaded" });

        let extractedText = "";

        if (file.mimetype === "application/pdf") {
            const dataBuffer = fs.readFileSync(file.path);
            const pdfData = await pdfParse(dataBuffer);
            extractedText = pdfData.text;
        } else if (file.mimetype === "text/plain") {
            extractedText = fs.readFileSync(file.path, "utf8");
        }

        // cleanup
        fs.unlinkSync(file.path);

        // ✅ Save in memory
        lastExtractedText = extractedText;

        return res.json({
            status: "ok",
            message: "File processed successfully",
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error extracting file text" });
    }
};

// Helper for AI controller
const getExtractedText = () => lastExtractedText;

module.exports = { uploadFile, getExtractedText };