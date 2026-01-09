"use client";
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Newsletter_ad_form = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setdescription] = useState("");
  const [edition_name, setEdition_name] = useState("");
  const [preview, setPreview] = useState("");
  const [thumbnail, setThumbnail] = useState<any>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: any) => {
    const selectedFile = e.target.files[0];
    const maxSize = 5 * 1024 * 1024;

    if (selectedFile && selectedFile.size <= maxSize) {
      setThumbnail(selectedFile);
      setPreview(URL.createObjectURL(e.target.files[0]));
    } else {
      alert("Please select a file smaller than 5MB.");
      e.target.value = null;
    }
  };

  const newsletter_ad_data = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine-ad`
      );
      setTitle(res.data[0].title);
      setEdition_name(res.data[0].edition_name);
      setdescription(res.data[0].description);
      setPreview(
        `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${res.data[0].thumbnail}`
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!title || !description || !edition_name) {
      alert("Please fill in all required fields.");
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();

    formData.append("title", title);
    formData.append("description", description);
    formData.append("thumbnail", thumbnail);
    formData.append("edition_name", edition_name);

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine-ad`,
        formData
      );
      toast.success("updated!", {
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
    newsletter_ad_data();
  }, []);

  return (
    <div className="col-12">
      <div className="shadow-sm p-3 mb-5  mt-5 bg-white rounded border-0">
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
          <Form.Group controlId="formdescription" className="mb-3">
            <Form.Label>description</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setdescription(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="formedition_name" className="mb-3">
            <Form.Label>Edition Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter edition_name"
              value={edition_name}
              onChange={(e) => setEdition_name(e.target.value)}
              required
            />
          </Form.Group>
          {thumbnail && (
            <Image
              src={preview}
              alt="preveiw image"
              className="my-3"
              height={200}
              width={420}
            />
          )}
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Select image</Form.Label>
            <Form.Control type="file" onChange={handleFileChange} />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Updated" : "Submit"}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Newsletter_ad_form;
