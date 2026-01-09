'use client'
import { useState, useRef } from "react";
import { IoPauseCircleOutline, IoPlayCircleOutline } from "react-icons/io5";

const voices = ["alloy", "ash", "coral", "echo", "fable", "onyx", "nova", "sage", "shimmer"];
const voicePreviews: Record<string, string> = {
  alloy: "/tts/openai-fm-alloy-audio.wav",
  ash: "/tts/openai-fm-ash-audio.wav",
  coral: "/tts/openai-fm-coral-audio.wav",
  echo: "/tts/openai-fm-echo-audio.wav",
  fable: "/tts/openai-fm-fable-audio.wav",
  onyx: "/tts/openai-fm-onyx-audio.wav",
  nova: "/tts/openai-fm-nova-audio.wav",
  sage: "/tts/openai-fm-sage-audio.wav",
  shimmer: "/tts/openai-fm-shimmer-audio.wav",
};

const audioFormats = ["MP3", "WAV", "OGG"];

export default function VoiceSelector() {
  const [selectedVoice, setSelectedVoice] = useState(voices[0]);
  const [text, setText] = useState("");
  const [selectedFormat, setSelectedFormat] = useState(audioFormats[0]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = (voice: string) => {
    if (audioRef.current) {
      if (!audioRef.current.paused && audioRef.current.src.includes(voicePreviews[voice])) {
        audioRef.current.pause();
      } else {
        audioRef.current.src = voicePreviews[voice];
        audioRef.current.play();
      }
    }
  };

  const handleGenerateAudio = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/chatbot-gpt/text-to-speech`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voice: selectedVoice, format: selectedFormat.toLowerCase() }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const downloadLink = document.createElement('a');
      downloadLink.href = audioUrl;
      downloadLink.download = `audio-${selectedVoice}.${selectedFormat.toLowerCase()}`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(audioUrl);
    } catch (error) {
      console.error('Error generating audio:', error);
    }
  };

  return (
    <div className="container mt-4">
      {/* Text Input */}
      <div className="mb-3">
        <label className="form-label">Text to Convert</label>
        <textarea
          className="form-control"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* Voice Selector */}
      <div className="mb-3">
        <label className="form-label">Voice</label>
        <div className="input-group">
          <select
            className="form-select"
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
          >
            {voices.map((voice) => (
              <option key={voice} value={voice}>{voice}</option>
            ))}
          </select>
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => handlePlayPause(selectedVoice)}
          >
            {audioRef.current && !audioRef.current.paused && audioRef.current.src.includes(voicePreviews[selectedVoice]) ? (
              <IoPauseCircleOutline size={24} />
            ) : (
              <IoPlayCircleOutline size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Audio Format Selector */}
      <div className="mb-3">
        <label className="form-label">Audio Format</label>
        <select
          className="form-select"
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
        >
          {audioFormats.map((format) => (
            <option key={format} value={format}>{format}</option>
          ))}
        </select>
      </div>

      {/* Generate Button */}
      <button className="btn btn-primary w-100 mb-3" onClick={handleGenerateAudio}>
        Generate and Download Audio
      </button>

      <audio ref={audioRef} />
    </div>
  );
}
