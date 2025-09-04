require("dotenv").config();
const stringSimilarity = require("string-similarity");
const Groq = require("groq-sdk");
const { getExtractedText } = require("./fileController");



const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

function splitIntoSentences(text) {
    return text
        .replace(/\s+/g, " ") // normalize whitespace
        .match(/[^.!?]+[.!?]+/g) // split on ., !, ?
        ?.map(s => s.trim()) || [];
}

function chunkSentences(sentences, chunkSize = 5) {
    const chunks = [];
    for (let i = 0; i < sentences.length; i += chunkSize) {
        chunks.push(sentences.slice(i, i + chunkSize).join(" "));
    }
    return chunks;
}


const sendMessageToAi = async (req, res) => {
    try {
        const { message } = req.body;

        const extractedText = getExtractedText()

        if (!extractedText) {
            return res.status(400).json({ status: 'fail', message: 'No document uploaded' });
        }

        const sentences = splitIntoSentences(extractedText)

        const chunks = chunkSentences(sentences, 5)


        const bestChunks = stringSimilarity.findBestMatch(message, chunks).ratings
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 3) // take top 3 chunks
            .map(r => r.target);


        // Send both question + extracted text as context
        const chatCompletion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content:
                        "You are an assistant that answers questions ONLY based on the provided document text. " +
                        "If the answer is not in the document, reply with exactly: 'This question is irrelevant to the uploaded document.'",
                },
                {
                    role: "user",
                    content: `Relevant Document Sentences:\n\n${bestChunks.join(
                        "\n\n"
                    )}\n\nQuestion: ${message}`,
                },
            ],
            temperature: 0, // makes it more strict to the text
            max_completion_tokens: 512,
        });

        const answer = chatCompletion.choices[0].message.content;

        if (!answer) {
            return res.status(500).json({ status: 'fail', message: 'No answer generated' });
        }

        console.log("answer: ", answer)
        return res.status(200).json({ status: 'ok', message: 'success', data: answer })
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Server Error' });
    }
}


module.exports = {
    sendMessageToAi,
}