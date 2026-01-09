'use client'
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { useEffect, useRef, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import { Editor } from "@tinymce/tinymce-react";
import Image from "next/image";

const EventSettings = () => {
  const [bannerImage, setBannerImage] = useState([]);
  const [event1Image, setEvent1Image] = useState([]);
  const [event2Image, setEvent2Image] = useState([]);
  const [event1Link, setEvent1Link] = useState("");
  const [event2Link, setEvent2Link] = useState("");
  const [event1Visible, setEvent1Visible] = useState(false);
  const [event2Visible, setEvent2Visible] = useState(false);
  const [bannerPreview, setBannerPreview] = useState("");
  const [event1Preview, setEvent1Preview] = useState("");
  const [event2Preview, setEvent2Preview] = useState("");
  const [bannerContent, setBannerContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef(null);
  const handleEditorChange = (editContent) => {
    setBannerContent(editContent);
  };
  const handleFileChange = (e, setFile, setPreview) => {
    const selectedFile = e.target.files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    if (selectedFile && selectedFile.size <= maxSize) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(e.target.files[0]));
    } else {
      alert("Please select a file smaller than 5MB.");
      e.target.value = null;
    }
  };

  const fetchEventSettings = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/event/settings`
      );
      setEvent1Link(res.data[0].event_1_link);
      setEvent2Link(res.data[0].event_2_link);
      setEvent1Visible(res.data[0].event_1_visible);
      setEvent2Visible(res.data[0].event_2_visible);
      setBannerContent(res.data[0].banner_content);
      setBannerPreview(`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${res.data[0].banner_image}`);
      setEvent1Preview(
        `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${res.data[0].upcoming_event_1}`
      );
      setEvent2Preview(
        `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${res.data[0].upcoming_event_2}`
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("event_1_link", event1Link);
    formData.append("event_2_link", event2Link);
    formData.append("event_1_visible", event1Visible);
    formData.append("event_2_visible", event2Visible);
    formData.append("banner_content", bannerContent);
    if (bannerImage) formData.append("banner_image", bannerImage);
    if (event1Image) formData.append("event_1", event1Image);
    if (event2Image) formData.append("event_2", event2Image);

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/event/settings`,
        formData
      );
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
    fetchEventSettings();
  }, []);

  return (
    <div className="col-12">
      <div className="shadow-sm p-3 mb-5 mt-5 bg-white rounded border-0">
        <Form onSubmit={handleSubmit} className="mt-4">
          <Form.Group controlId="formbannerContent" className="mb-3">
            <Form.Label>Banner Content</Form.Label>
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE}
              onInit={(_evt, editor) => (editorRef.current = editor)}
              value={bannerContent}
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
                toolbar:
                  "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
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
          </Form.Group>
          <Form.Group controlId="formEvent1Link" className="mb-3">
            <Form.Label>Event 1 Link</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Event 1 Link"
              value={event1Link}
              onChange={(e) => setEvent1Link(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="formEvent2Link" className="mb-3">
            <Form.Label>Event 2 Link</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter Event 2 Link"
              value={event2Link}
              onChange={(e) => setEvent2Link(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="formEvent1Visible" className="mb-3">
            <Form.Check
              type="checkbox"
              label="Event 1 Visible"
              checked={event1Visible}
              onChange={(e) => setEvent1Visible(e.target.checked)}
            />
          </Form.Group>
          <Form.Group controlId="formEvent2Visible" className="mb-3">
            <Form.Check
              type="checkbox"
              label="Event 2 Visible"
              checked={event2Visible}
              onChange={(e) => setEvent2Visible(e.target.checked)}
            />
          </Form.Group>
          {bannerPreview && (
            <Image
              src={bannerPreview}
              alt="Banner Preview"
              className="my-3"
              height={200}
              width={200}
            />
          )}
          <Form.Group controlId="formBannerImage" className="mb-3">
            <Form.Label>Select Banner Image</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) =>
                handleFileChange(e, setBannerImage, setBannerPreview)
              }
            />
          </Form.Group>
          {event1Preview && (
            <Image
              src={event1Preview}
              alt="Event 1 Preview"
              className="my-3"
              height={200}
              width={370}
            />
          )}
          <Form.Group controlId="formEvent1Image" className="mb-3">
            <Form.Label>Select Upcoming Event 1 Image</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) =>
                handleFileChange(e, setEvent1Image, setEvent1Preview)
              }
            />
          </Form.Group>
          {event2Preview && (
            <Image
              src={event2Preview}
              alt="Event 2 Preview"
              className="my-3"
              height={200}
              width={370}
            />
          )}
          <Form.Group controlId="formEvent2Image" className="mb-3">
            <Form.Label>Select Upcoming Event 2 Image</Form.Label>
            <Form.Control
              type="file"
              onChange={(e) =>
                handleFileChange(e, setEvent2Image, setEvent2Preview)
              }
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updated" : "Submit"}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default EventSettings;
