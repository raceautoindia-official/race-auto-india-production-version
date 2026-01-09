'use client';
import { useState } from "react";
import axios from "axios";
import { Container, Form, Button, Spinner, Image, Row, Col } from "react-bootstrap";

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("1024x1024");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const sizeOptions = [
    { label: "1024x1024 ($0.04) Square", value: "1024x1024" },
    { label: "1024x1792 ($0.08) Potrait", value: "1024x1792" },
    { label: "1792x1024 ($0.08) Landscape", value: "1792x1024" },
  ];




  const generateImage = async (e:any) => {
    e.preventDefault();
    if (!prompt) return alert("Please enter a prompt!");
    setLoading(true);
    setImageUrl("");

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/chatbot-gpt/image-generate`, { prompt, size });
      setImageUrl(response.data.imageUrl);
    } catch (error) {
      console.error("Error generating image:", error);
      alert("Failed to generate image. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5 text-center">
      <h2 className="mb-4">AI Image Generator</h2>
      <Form>
        <Form.Group className="mb-3">
          <Form.Control
            type="text"
            placeholder="Enter a prompt..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Select value={size} onChange={(e) => setSize(e.target.value)}>
            {sizeOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button onClick={generateImage} disabled={loading} variant="primary">
          {loading ? <Spinner as="span" animation="border" size="sm" /> : "Generate Image"}
        </Button>
      </Form>

    </Container>
  );
};

export default ImageGenerator;
