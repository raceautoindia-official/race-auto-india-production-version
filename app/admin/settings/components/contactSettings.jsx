'use client'
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Editor } from "@tinymce/tinymce-react";
import { Form } from "react-bootstrap";


const ContactForm = () => {
  const [contactAddress, setContactAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactText, setContactText] = useState("");
  const editorRef = useRef(null);
  const getContactInfo = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/settings/contact`,
      );
      const { contact_address, contact_email, contact_phone, contact_text } = res.data[0];
      setContactAddress(contact_address);
      setContactEmail(contact_email);
      setContactPhone(contact_phone);
      setContactText(contact_text);
    } catch (err) {
      console.log(err);
    }
  };
  const handleEditorChange = (editContent) => {
    setContactText(editContent);
  };

  const handleSubmit = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/settings/contact`,
        {
          contact_address: contactAddress,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          contact_text: contactText,
        },
      );
      toast.success("Contact information submitted", {
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
      toast.warn(
        "An error occurred while submitting the form. Please try again later.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
  };

  useEffect(() => {
    getContactInfo();
  }, []);

  return (
    <>

      <div className="col-12">
        <div className="shadow-sm p-3 mb-5 mt-5 bg-white rounded border-0">
          <div className="row">
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                className="form-control"
                id="address"
                name="address"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                className="form-control"
                id="phone"
                name="phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
            <Form.Group controlId="formContent " className="my-3">
              <Form.Label>Content</Form.Label>

              <Editor
                apiKey={process.env.NEXT_PUBLIC_TINYMCE}
                onInit={(_evt, editor) => editorRef.current = editor}
                value={contactText}
                init={{
                  height: 500,
                  menubar: true,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  file_picker_callback: (callback, value, meta) => {
                    if (meta.filetype === 'image') {
                      const input = document.createElement('input');
                      input.setAttribute('type', 'file');
                      input.setAttribute('accept', 'image/*');
                      input.onchange = function () {
                        const file = this.files[0];
                        const reader = new FileReader();
                        reader.onload = function () {
                          const id = 'blobid' + (new Date()).getTime();
                          const blobCache = editorRef.current.editorUpload.blobCache;
                          const base64 = reader.result.split(',')[1];
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

          </div>
          <button className="btn btn-primary mt-3" onClick={handleSubmit}>
            Save Changes
          </button>
        </div>
      </div>

    </>
  );
};

export default ContactForm;
