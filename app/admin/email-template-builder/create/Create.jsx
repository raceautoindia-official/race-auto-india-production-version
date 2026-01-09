'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import axios from 'axios';

// dynamically import with SSR turned off
const ReactEmailEditor = dynamic(
  () => import('react-email-editor'),
  { ssr: false }
);

export default function EmailCreatePage() {
  const editorRef = useRef(null);
  const [designName, setDesignName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  const loadCustomFonts = () => {
    const editor = editorRef.current?.editor;
    if (!editor) return;

    editor.loadFonts([
      {
        label: 'Roboto',
        value: 'Roboto, sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap',
      },
      {
        label: 'Open Sans',
        value: 'Open Sans, sans-serif',
        url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;600&display=swap',
      },
      {
        label: 'Lora',
        value: 'Lora, serif',
        url: 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&display=swap',
      },
    ]);
  };

  const handleEditorLoad = () => {
    loadCustomFonts();
    setIsLoaded(true);
  };

  const saveDesign = () => {
    editorRef.current?.editor.exportHtml(async (data) => {
      const { design, html } = data;
      const body = {
        name: designName || 'Untitled Design',
        design_json: JSON.stringify(design),
        html,
      };

      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/email-template-builder`,
          body,
          { headers: { 'Content-Type': 'application/json' } }
        );

        // Trigger HTML download
        const blob = new Blob([html], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${designName || 'email-design'}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('Design saved and HTML downloaded!', { autoClose: 4000 });
        router.push('/admin/email-template-builder');
      } catch (error) {
        console.error('Save error:', error);
        toast.error('Failed to save file. Please try again.', { autoClose: 4000 });
      }
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Create New Email Design</h2>

      <input
        type="text"
        value={designName}
        onChange={(e) => setDesignName(e.target.value)}
        placeholder="Design Name"
        className="form-control my-2"
      />

      {/* This will only render on the client */}
      <ReactEmailEditor
        ref={editorRef}
        onLoad={handleEditorLoad}
        options={{
          fonts: [
            'Arial, sans-serif',
            'Roboto, sans-serif',
            'Open Sans, sans-serif',
            'Lora, serif',
          ],
        }}
      />

      <button
        className="btn btn-primary mt-3"
        onClick={saveDesign}
        disabled={!isLoaded}
      >
        Save Design
      </button>
    </div>
  );
}
