"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { useEffect, useRef, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { Editor } from "@tinymce/tinymce-react";

const ReportsForm = () => {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [preview, setPreview] = useState("");
  const [imageUrl, setImageUrl] = useState([]);
  const [url, setUrl] = useState("");
  const editorRef = useRef(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const maxSize = 5 * 1024 * 1024;

    if (selectedFile && selectedFile.size <= maxSize) {
      setImageUrl(selectedFile);
      setPreview(URL.createObjectURL(e.target.files[0]));
    } else {
      alert("Please select a file smaller than 5MB.");
      e.target.value = null;
    }
  };

  const handleEditorChange = (editContent) => {
    setSummary(editContent);
  };

  const fetchReportsData = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/reports`
      );
      setTitle(res.data[0].title);
      setSummary(res.data[0].summary);
      setUrl(
        res.data[0].image_url
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !summary || !url) {
      alert("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();

    formData.append("title", title);
    formData.append("summary", summary);
    // formData.append("image_url", imageUrl);
    formData.append("url", url)

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/reports`, formData);
      toast.success("Updated successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setIsSubmitting(false);
    } catch (err) {
      console.log(err);
      toast.warn(
        "An error occurred while submitting the form. Please try again later.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  return (
    <div className="col-12">
      <div className="shadow-sm p-3 mb-5 mt-5 bg-white rounded border-0">
        <Form onSubmit={handleSubmit} className="mt-4">
          <Form.Group controlId="formTitle" className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </Form.Group>
          <Editor
            id="raceautoindia"
            apiKey={process.env.NEXT_PUBLIC_TINYMCE}
            onInit={(_evt, editor) => (editorRef.current = editor)}
            value={summary}
            init={{
              height: 500,
              menubar: true,
              plugins: [
                "advlist",
                "autolink",
                "lists",
                "link",
                "image",
                "charmap",
                "preview",
                "anchor",
                "searchreplace",
                "visualblocks",
                "code",
                "fullscreen",
                "insertdatetime",
                "media",
                "table",
                "code",
                "help",
                "wordcount",
              ],
              image_dimensions: true,
              // image_class_list: [
              //   { title: "Responsive", value: "img-responsive" },
              // ],
              toolbar:
                "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
              // images_upload_handler: handleImageUpload,
              file_picker_callback: (callback, value, meta) => {
                if (meta.filetype === "image") {
                  const input = document.createElement("input");
                  input.setAttribute("type", "file");
                  input.setAttribute("accept", "image/*");
                  input.onchange = function () {
                    const file = this.files[0];
                    const reader = new FileReader();
                    reader.onload = function () {
                      const id = "blobid" + new Date().getTime();
                      const blobCache =
                        editorRef.current.editorUpload.blobCache;
                      const base64 = reader.result.split(",")[1];
                      const blobInfo = blobCache.create(id, file, base64);
                      blobCache.add(blobInfo);
                      callback(blobInfo.blobUri(), { title: file.name });
                    };
                    reader.readAsDataURL(file);
                  };
                  input.click();
                }
              },
            }}
            onEditorChange={handleEditorChange}
          />

          <Form.Control
            type="text"
            placeholder="Enter Youtube"
            className="my-3"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          {/* {imageUrl && (
            <Image
              src={preview}
              alt="Preview image"
              className="my-3"
              height={200}
              width={420}
            />
          )}
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Select image</Form.Label>
            <Form.Control type="file" onChange={handleFileChange} />
          </Form.Group> */}
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Submit"}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default ReportsForm;
