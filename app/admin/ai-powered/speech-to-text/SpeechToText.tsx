'use client';

import { useState } from "react";
import axios from "axios";
import { FaClipboard, FaCheck } from "react-icons/fa";

const SpeechToText = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle File Upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAudioFile(event.target.files[0]);
    }
  };

  // Send Audio to the backend API for transcription
  const transcribeAudio = async () => {
    if (!audioFile) return alert("Please select an audio file!");

    const formData = new FormData();
    formData.append("file", audioFile);

    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/chatbot-gpt/speech-to-text`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setTranscription(response.data.text);
    } catch (error) {
      console.error("Error transcribing:", error);
      alert("Failed to transcribe. Try again!");
    } finally {
      setLoading(false);
    }
  };

  // Download transcription as a TXT file
  const downloadTranscription = () => {
    const element = document.createElement("a");
    const file = new Blob([transcription], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "transcription.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Copy transcription text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      (err) => {
        console.error("Failed to copy: ", err);
      }
    );
  };

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="card-title mb-4">Upload Audio & Convert to Text</h2>
          <div className="mb-3">
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleFileChange} 
              className="form-control"
            />
          </div>
          <button 
            onClick={transcribeAudio} 
            disabled={!audioFile || loading}
            className="btn btn-primary me-2"
          >
            {loading ? "Transcribing..." : "Transcribe Audio"}
          </button>
          {transcription && (
            <>
              <div className="mt-4 d-flex align-items-center">
                <h4 className="me-2">Transcription:</h4>
                <button 
                  onClick={copyToClipboard} 
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                  title="Copy to clipboard"
                >
                  {copied ? <FaCheck /> : <FaClipboard />}
                </button>
              </div>
              <p className="border rounded p-3 bg-light">{transcription}</p>
              <button 
                onClick={downloadTranscription}
                className="btn btn-success mt-3"
              >
                Download as TXT
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpeechToText;
