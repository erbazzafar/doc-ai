require("dotenv").config();
const fs = require("fs");
const pdfParse = require("pdf-parse");
const Groq = require("groq-sdk");
const { fileModel } = require("../Models/fileModel");


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});


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


const fileSummary = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ status: "fail", message: "No file uploaded" });
        }

        let textContent = "";

        // Read content based on file type
        if (file.mimetype === "text/plain") {
            textContent = fs.readFileSync(file.path, "utf-8");
        } else if (file.mimetype === "application/pdf") {
            const dataBuffer = fs.readFileSync(file.path);
            const pdfData = await pdfParse(dataBuffer);
            textContent = pdfData.text;
        } else {
            return res.status(400).json({ status: "fail", message: "Unsupported file type" });
        }

        // Call Groq LLM
        const chatCompletion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content:
                        "You are an assistant that summarizes the content of the provided document in a concise manner.",
                },
                {
                    role: "user",
                    content: `Relevant Document Sentences: ${textContent.slice(0, 4000)}`, // limit tokens
                },
            ],
            temperature: 0,
            max_completion_tokens: 512,
        });

        const summary = chatCompletion.choices[0].message.content;

        if (!summary) {
            return res.status(500).json({ status: "fail", message: "No summary generated" });
        }

        await fileModel.create({
            file: file.path,
            summary: summary
        })

        return res.status(200).json({
            status: "ok",
            message: "success",
            data: summary,
        });
    } catch (error) {
        console.error("Summary API Error:", error);
        return res.status(500).json({
            status: "fail",
            message: "Internal server error",
            error: error.message,
        });
    }
};


module.exports = {
    uploadFile,
    getExtractedText,
    fileSummary
};