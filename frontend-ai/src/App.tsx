import { useEffect, useState } from "react";
import {
  Loader2,
  Send,
  Upload,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { motion} from "framer-motion";
import "./App.css";

interface ChatEntry {
  question: string;
  answer: string;
}

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [messageInput, setMessageInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const [summary, setSummary] = useState<string>("");

  /** ---------------------------
   * File Upload + Summary
   ----------------------------- */
  useEffect(() => {
  if (!file) return;

  // Reset chat history whenever a new file is selected
  setChatHistory([]);
  setSummary(""); // clear previous summary if you want

  const uploadFileAndGetSummary = async () => {
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await axios.post(
        "http://localhost:8090/file/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (uploadRes.status !== 200) throw new Error("Upload failed");

      toast.success("File uploaded successfully!");

      const summaryRes = await axios.post(
        "http://localhost:8090/file/summary",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (summaryRes.status !== 200) throw new Error("Summary failed");

      setSummary(summaryRes.data?.data || "No summary available.");
    } catch (err) {
      console.error(err);
      toast.error("File upload or summary failed.");
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  uploadFileAndGetSummary();
}, [file]);

  /** ---------------------------
   * Send message to AI
   ----------------------------- */
  const sendMessageToAI = async () => {
    if (!messageInput.trim()) {
      toast.info("Please enter a message");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:8090/question/ask",
        { message: messageInput },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status !== 200) throw new Error();

      const answer = response.data?.data || "No answer received.";
      setChatHistory((prev) => [...prev, { question: messageInput, answer }]);
      setMessageInput("");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong while asking the AI.");
    } finally {
      setLoading(false);
    }
  };

  /** ---------------------------
   * UI
   ----------------------------- */
  return (
    <div className="App  min-h-screen bg-gradient-to-r from-indigo-200 via-hazelblue to-blue-300 p-8">
      <div className="mx-17 bg-gradient-to-r from-indigo-300 via-purple-200 to-blue-300 p-3 rounded-3xl shadow-lg text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-800">AI Document Assistant</h2>
        <h3 className="text-xl text-gray-700 max-w-xl mx-auto">
          Upload your document and get instant AI-powered insights
        </h3>
      </div>
      <div className="mt-7 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Upload Card */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Upload a Document
            </h2>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 cursor-pointer hover:border-blue-400 transition">
              <Upload className="w-12 h-12 text-blue-500 mb-3" />
              <span className="text-gray-600 font-medium text-sm">
                {file
                  ? `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`
                  : "Click or drag a file to upload"}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.length) setFile(e.target.files[0]);
                }}
              />
            </label>
          </div>

          {/* Summary Card */}
          <div className="bg-white p-5 rounded-2xl shadow-xl border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Document Summary
            </h2>
            <div className="bg-gray-50 p-5 rounded-lg text-gray-700 text-sm h-48 overflow-y-auto leading-relaxed relative">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-50">
                  <Loader2 className="animate-spin w-8 h-8 text-blue-500" />
                </div>
              ) : (
                <div>{summary || "No summary available."}</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 flex flex-col h-full">
  <h2 className="text-xl font-semibold text-gray-700 mb-6">
    Document Q&A
  </h2>

  {/* Chat Slider */}
  <div className="relative flex-1 border border-gray-200 rounded-lg overflow-y-auto p-4 space-y-4">
    {chatHistory.length === 0 ? (
      <p className="text-gray-400 text-center mt-20">
        Start asking questions about your document...
      </p>
    ) : (
      chatHistory.map((chat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col space-y-2"
        >
          {/* Question */}
          <div className="flex justify-end">
            <div className="bg-blue-500 text-white rounded-lg px-5 py-3 max-w-xs text-right shadow-md">
              {chat.question}
            </div>
          </div>

          {/* Answer */}
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 rounded-lg px-5 py-3 max-w-xs shadow-md">
              {chat.answer}
            </div>
          </div>
        </motion.div>
      ))
    )}
  </div>

  {/* Input */}
  <div className="flex mt-auto">
    <input
      type="text"
      value={messageInput}
      onChange={(e) => setMessageInput(e.target.value)}
      placeholder="Ask a question..."
      className="border border-gray-300 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-blue-400 outline-none"
    />
    <button
      onClick={sendMessageToAI}
      disabled={loading}
      className="ml-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6 py-3 flex items-center gap-2 transition shadow-md"
    >
      {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send />}
      Send
    </button>
  </div>
</div>
      </div>
    </div>
  );
}

export default App;
