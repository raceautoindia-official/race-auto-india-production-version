/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Form, Image } from "react-bootstrap";
import { toast } from "react-toastify";

const AdForm = () => {
  const [selectedOption, setSelectedOption] = useState("");
  const [isChecked, setIsChecked] = useState<any>(false);
  const [title, setTitle] = useState([]);

  // Ad image file states
  const [adSize1200, setAdSize1200] = useState(null);
  const [adSize728, setAdSize728] = useState(null);
  const [adSize300, setAdSize300] = useState(null);
  const [adSize234, setAdSize234] = useState(null);

  // Ad preview URLs
  const [preview1200, setPreview1200] = useState("");
  const [preview728, setPreview728] = useState("");
  const [preview300, setPreview300] = useState("");
  const [preview234, setPreview234] = useState("");

  // Responsive code and link field
  const [responsiveCode, setResponsiveCode] = useState("");
  const [link, setLink] = useState("");

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  const handleSelectChange = (event: any) => {
    setSelectedOption(event.target.value);
  };

  const handleFileUpload = (event: any, setFile: any, setPreview: any) => {
    const file = event.target.files[0];
    setFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const titleApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/titles`
      );
      setTitle(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const imageApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/${selectedOption}`
      );

      const data = res.data[0];
      setIsChecked(data.is_responsive === 1);
      setLink(data.link || "");

      setPreview1200(
        `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${data.ad_code_1200}` || ""
      );
      setPreview728(
        `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${data.ad_code_728}` || ""
      );
      setPreview300(
        `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${data.ad_code_300}` || ""
      );
      setPreview234(
        `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${data.ad_code_234}` || ""
      );
      setResponsiveCode(data.responsive_code || "");
    } catch (err) {
      console.log(err);
    }
  };

  const handleTextareaChange = (event: any) => {
    setResponsiveCode(event.target.value);
  };

  const handleSaveChanges = async () => {
    try {
      const formData = new FormData();

      if (adSize1200) formData.append("size_1200", adSize1200);
      if (adSize728) formData.append("size_728", adSize728);
      if (adSize300) formData.append("size_300", adSize300);
      if (adSize234) formData.append("size_234", adSize234);

      formData.append("isChecked", isChecked);
      formData.append("responsiveCode", responsiveCode);
      formData.append("link", link); // ⬅️ New link field

      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/adspace/${selectedOption}`,
        formData
      );

      toast.success("Links updated", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    titleApi();
  }, []);

  useEffect(() => {
    if (selectedOption) {
      imageApi();
    }
  }, [selectedOption]);

  return (
    <div className="col-12">
      <div className="shadow-sm p-3 mb-5 mt-5 rounded border-0">
        <Form>
          <Form.Group controlId="title">
            <Form.Label>Select a category:</Form.Label>
            <Form.Control
              as="select"
              value={selectedOption}
              onChange={handleSelectChange}
            >
              <option value="">None</option>
              {title.map((item: any) => (
                <option key={item.ad_space} value={item.ad_space}>
                  {item.ad_space.split("_").join(" ")}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="linkInput" className="mt-3">
            <Form.Label>Ad Link</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter link for this ad"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </Form.Group>

          <Form.Group
            controlId="responsiveCheckbox"
            className="form-check my-4"
          >
            <Form.Check
              type="checkbox"
              label="Responsive"
              checked={isChecked}
              onChange={handleCheckboxChange}
            />
          </Form.Group>

          <Form.Group controlId="size_1200">
            <Form.Label>Upload Image for Size 1200</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileUpload(e, setAdSize1200, setPreview1200)
              }
            />
            {preview1200 && <Image src={preview1200} alt="Preview" fluid />}
          </Form.Group>

          <Form.Group controlId="size_728">
            <Form.Label>Upload Image for Size 728</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileUpload(e, setAdSize728, setPreview728)
              }
            />
            {preview728 && <Image src={preview728} alt="Preview" fluid />}
          </Form.Group>

          <Form.Group controlId="size_300">
            <Form.Label>Upload Image for Size 300</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileUpload(e, setAdSize300, setPreview300)
              }
            />
            {preview300 && <Image src={preview300} alt="Preview" fluid />}
          </Form.Group>

          <Form.Group controlId="size_234">
            <Form.Label>Upload Image for Size 234</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileUpload(e, setAdSize234, setPreview234)
              }
            />
            {preview234 && <Image src={preview234} alt="Preview" fluid />}
          </Form.Group>

          <Form.Group controlId="formResponsiveCode">
            <Form.Label>Responsive Code</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={responsiveCode}
              onChange={handleTextareaChange}
            />
          </Form.Group>
        </Form>
        <button className="btn btn-primary mt-3" onClick={handleSaveChanges}>
          Save changes
        </button>
      </div>
    </div>
  );
};

export default AdForm;
