"use client";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { AiFillFileExcel } from "react-icons/ai";
import axios from "axios";
import { toast } from "react-toastify";

const ExcelUpload = () => {
  const [file, setFile] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const onDrop = useCallback((acceptedFiles: any) => {
    const selectedFile = acceptedFiles[0];
    setFile(selectedFile); // Store the file in state for API actions
    setMessage(""); // Clear any previous messages
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please upload an Excel file first.");
      return;
    }
    setLoading(true);
    const toastId = toast.loading("Submitting your Excel Data...", {
      position: "top-right",
      hideProgressBar: true,
      closeOnClick: false,
      draggable: false,
      progress: undefined,
    });

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("/api/admin/subscriber/upload-csv", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.update(toastId, {
        render: "Submitted successfully!",
        type: "success",
        autoClose: 5000,
        isLoading: false,
        closeOnClick: true,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("An error occurred during upload.");
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // accept: {
    //   'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    //   'application/vnd.ms-excel': ['.xls'],
    // },
    accept: {},
  });

  return (
    <>
      <h5>Bulk Emails Upload</h5>
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #007BFF",
          padding: "20px",
          textAlign: "center",
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%",
          margin: "auto",
        }}
      >
        <input {...getInputProps()} />
        <AiFillFileExcel size={50} color="#107C10" />
        <p>
          {isDragActive
            ? "Drop the Excel file here..."
            : "Drag and drop an Excel file here, or click to select"}
        </p>
      </div>

      {file && (
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <p>Selected File: {file.name}</p>
          <button
            onClick={handleUpload}
            style={{
              padding: '10px 20px',
              borderRadius: '5px',
              backgroundColor: '#007BFF',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
            disabled={loading} // Disable the button while loading
          >
            {loading ? 'Uploading...' : 'Upload File'}
          </button>
        </div>
      )}

      {message && (
        <p
          style={{
            marginTop: "10px",
            color: message.includes("success") ? "green" : "red",
            textAlign: "center",
          }}
        >
          {message}
        </p>
      )}
    </>
  );
};

export default ExcelUpload;
