import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Send, Upload } from "lucide-react"; 

import axios from "axios";
import "./App.css";
import { toast } from "sonner";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<{ question: string; answer: string }[]>([]);
  const [sliderIndex, setSliderIndex] = useState<number>(0);

  if (
    file &&
    (file.size > 2 * 1024 * 1024 ||
      (file.type !== "application/pdf" && file.type !== "text/plain"))
  ) {
    toast.error("File not supported. Upload a PDF or TXT file under 2MB.");
    setFile(null);
    return null;
  }

  useEffect(() => {
    const uploadFile = async () => {
    if (!file) {
      toast.error("Please select a file to upload")
      return
    } 

    const formData = new FormData()
    formData.append("file", file)

    try {
      const sendFile = await axios.post(
        'http://localhost:8090/file/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        } 
      )
      if (sendFile.status !==200) {
        toast.error("File upload failed")
        return
      }

      toast.success("File Uploaded Successfully")

    } catch (error) {
      toast.error("File upload failed")
    }
  }
  uploadFile()
  }, [file])

  const sendMessageToAI = async (message: string) => {
    setLoading(true);
    try {
      if (!message.trim()) {
        toast.info("Please enter a message");
        return;
      }

      const response = await axios.post(
        "http://localhost:8090/question/ask",
        {
          message,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status !== 200) throw new Error("Error sending message");
      console.log ("----response---- ", response)
      const data = response.data;
      const answer = data.data
      setChatHistory((prev) => [...prev, { question: message, answer }]);
      setMessages("");
    } catch (error) {
      console.error(error);
      alert("Something went wrong!");

    } finally {
      setLoading(false);
    }
  };

  const handlePrev = () => {
    setSliderIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setSliderIndex((prev) => Math.min(chatHistory.length - 2, prev + 1));
  };


  return (
    <div className="App flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-100 via-white to-blue-100 p-6">
      {/* File Upload Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg text-center border border-gray-200">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-blue-400 transition">
          <Upload className="w-10 h-10 text-blue-500 mb-2" />
          <span className="text-gray-600 font-medium">
            {file ? file.name : "Click or drag a file to upload"}
          </span>
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                setFile(e.target.files[0]);
              }
            }}
          />
        </label>
      </div>

      {/* Chat Section */}
      <div className="bg-white p-6 rounded-2xl shadow-lg mt-6 w-full max-w-lg flex flex-col">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">
          Document Q&A
        </h2>
        <div className="flex-1 h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-3">
          {!chatHistory && (
            <p className="text-gray-400 text-center">
              Start asking questions about your document...
            </p>
          )}
         {chatHistory.map((chat, idx) => (
            <div key={idx} className="mb-4">
              {/* User question bubble */}
              <div className="flex justify-end">
                <div className="bg-blue-500 text-white rounded-lg px-4 py-2 max-w-xs text-right inline-block">
                  {chat.question}
                </div>
              </div>
              {/* AI answer bubble */}
              <div className="flex justify-start mt-1">
                <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 max-w-xs inline-block">
                  {chat.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
        {chatHistory.length > 2 && (
          <div className="flex justify-center items-center gap-4 mt-2">
            <button
              onClick={handlePrev}
              disabled={sliderIndex === 0}
              className={`p-2 rounded-full ${sliderIndex === 0 ? "bg-gray-200 text-gray-400" : "bg-blue-500 text-white"}`}
            >
              <ChevronLeft />
            </button>
            <span className="text-gray-600 text-sm">
              {sliderIndex + 1} - {Math.min(sliderIndex + 2, chatHistory.length)} / {chatHistory.length}
            </span>
            <button
              onClick={handleNext}
              disabled={sliderIndex >= chatHistory.length - 2}
              className={`p-2 rounded-full ${sliderIndex >= chatHistory.length - 2 ? "bg-gray-200 text-gray-400" : "bg-blue-500 text-white"}`}
            >
              <ChevronRight />
            </button>
          </div>
        )}

        {/* Input Box */}
        <div className="flex mt-4">
          <input
            type="text"
            value={messages}
            onChange={(e) => setMessages(e.target.value)}
            placeholder="Ask a question..."
            className="border border-gray-300 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-blue-400 outline-none"
          />
          <button
            onClick={() => sendMessageToAI(messages)}
            disabled={loading}
            className="ml-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-4 py-2 flex items-center gap-1 transition"
          >
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;