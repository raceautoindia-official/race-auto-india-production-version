/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Form, Button, Row, Col, Card, Container } from "react-bootstrap";
import "./create.css"; // Custom CSS file for additional styling
import { useDropzone } from "react-dropzone";
import { IoClose } from "react-icons/io5";
import { Editor } from "@tinymce/tinymce-react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";

export default function AdminPost({ token }) {
  const decoded = jwtDecode(token);
  const [title, setTitle] = useState("");
  const router = useRouter()
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [category_main, setCategory_main] = useState("");
  const [category_sub, setCategory_sub] = useState("");
  const [keywords, setKeywords] = useState("");
  const [imageDescription, setImageDescription] = useState("");
  const [marketValue, setMarketValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [isSlider, setIsSlider] = useState(0);
  const [isFeatured, setIsFeatured] = useState(0);
  const [isRecommended, setIsRecommended] = useState(0);
  const [isBreaking, setIsBreaking] = useState(0);
  const [isScheduled, setisScheduled] = useState(false);
  const [image_default, setImage_default] = useState([]);
  const [mainCategory_array, setMainCategory_array] = useState([]);
  const [subCategory_array, setSubCategory_array] = useState([]);
  const [marketArray, setMarketArray] = useState([]);
  const [tags, setTags] = useState([]);
  const editorRef = useRef(null);
  const [draft, setDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Prevent form submission
      if (inputValue) {
        setTags([...tags, inputValue]);
        setInputValue("");
      }
    }
  };


  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const baseStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px",
    borderWidth: 2,
    borderRadius: 2,
    borderColor: "#eeee",
    borderStyle: "dashed",
    backgroundColor: "#fafafa",
    color: "#bdbdbd",
    outline: "none",
    transition: "border .24s ease-in-out",
  };

  const thumb = {
    display: "inline-flex",
    alignItems: "top",
    borderRadius: 2,
    border: "1px solid #eaeaea",
    marginBottom: 8,
    marginRight: 8,
    width: 110,
    height: 100,
    padding: 4,
  };

  const thumbInner = {
    display: "flex",
    minWidth: 0,
    overflow: "hidden",
  };

  const img = {
    display: "block",
    width: "auto",
    height: "100%",
  };

  const focusedStyle = {
    borderColor: "#2196f3",
  };

  const acceptStyle = {
    borderColor: "#00e676",
  };

  const rejectStyle = {
    borderColor: "#ff1744",
  };
  const maxSize = 5 * 1024 * 1024;

  const {
    getRootProps,
    getInputProps,
    isFocused,
    isDragAccept,
    isDragReject,
    fileRejections,
  } = useDropzone({
    maxSize,

    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      setImage_default((prevFiles) => [
        ...prevFiles,
        ...acceptedFiles.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        ),
      ]);
    },
    onDropRejected: (fileRejections) => {
      fileRejections.forEach(({ file, errors }) => {
        errors.forEach((error) => {
          console.error(`Error with file ${file.name}: ${error.message}`);
        });
      });
    },
  });

  const fileRejectionItems = fileRejections.map(({ file }) => (
    <li key={file.path} style={{ color: "red" }}>
      {file.path} has been rejected due to large in size
      <ul></ul>
    </li>
  ));

  const removeFile = (file) => () => {
    const newFiles = [...image_default];
    newFiles.splice(newFiles.indexOf(file), 1);
    setImage_default(newFiles);
  };

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  const files =
    image_default !== null &&
    image_default.map((file) => (
      <li key={file.path}>
        <div style={thumb} key={file.name}>
          <div style={thumbInner}>
            <img
              src={file.preview}
              style={img}
              // Revoke data uri after image is loaded
              onLoad={() => {
                URL.revokeObjectURL(file.preview);
              }}
            />
          </div>
          <IoClose onClick={removeFile(file)} size={25} />
        </div>
      </li>
    ));

  const toggleCheckbox = (setState) => {
    setState((prevState) => (prevState === 1 ? 0 : 1));
  };



  const handleEditorChange = (editContent) => {
    setContent(editContent);
  };
  const handleKeywordsChange = (e) => {
    setKeywords(e.target.value);
  };

  const categoryApi = async () => {
    try {
      const mainCategoryRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/main-category`
      );
      setMainCategory_array(mainCategoryRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  const marketApi = async () => {
    try {
      const marketRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/market`
      );
      setMarketArray(marketRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  const subCategoryApi = async () => {
    if (
      category_main === "none" ||
      category_main === undefined ||
      category_main === ""
    ) {
      setSubCategory_array([]);
      return;
    }

    try {
      const subCategoryRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/sub-category/parent/${category_main}`
      );
      setSubCategory_array(subCategoryRes.data); // Set subcategory data if API call is successful
    } catch (err) {
      console.log(err); // Handle error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent further submissions
    if (isSubmitting) return;

    const missingFields = [];

    // Check each field and add to missingFields array if empty
    if (!title || title === "") missingFields.push("Title");
    if (!content || content === "") missingFields.push("Content");
    if (!summary || summary === "") missingFields.push("Summary");
    if (!category_main || category_main === "none" || category_main === "")
      missingFields.push("Main Category");
    if (!category_sub || category_sub === "none" || category_sub === "")
      missingFields.push("Sub Category");
    if (!keywords || keywords === "") missingFields.push("Keywords");
    if (!image_default) missingFields.push("Default Image");
    if (!marketValue || marketValue === "none")
      missingFields.push("Market Value");
    if (!tags || tags.length === 0) missingFields.push("Tags");

    if (missingFields.length > 0) {
      // Join the missing fields into a comma-separated list
      const missingFieldsList = missingFields.join(", ");

      // Display toast message with missing fields
      toast.info(`Please fill out the following fields: ${missingFieldsList}`, {
        position: "top-right",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      return;
    }

    const formData = new FormData();
    formData.append("draft", draft.toString());
    if (isScheduled) formData.append("schedule_time", scheduledAt);
    formData.append("title", title);
    formData.append("title_slug", slug)
    formData.append("content", content);
    formData.append("summary", summary);
    formData.append("category_id", category_sub);
    formData.append("keywords", keywords);
    image_default.forEach((file) => {
      formData.append("image_default", file);
    });
    formData.append("tags", tags.join(","));
    formData.append("is_slider", isSlider.toString());
    formData.append("is_featured", isFeatured.toString());
    formData.append("is_recommended", isRecommended.toString());
    formData.append("is_breaking", isBreaking.toString());
    formData.append("user_id", decoded.id);
    formData.append("image_description", imageDescription);
    formData.append("market", marketValue);

    // Indicate submission is in progress
    setIsSubmitting(true);
    const toastId = toast.loading("Submitting your post...", {
      position: "top-right",
      hideProgressBar: true,
      closeOnClick: false,
      draggable: false,
      progress: undefined,
    });

    try {
      // Await for the post request
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/post/create`,
        formData
      );

      // Change the toast to success
      toast.update(toastId, {
        render: draft ? 'Post saved to draft successfully' : 'Post submitted successfully!',
        type: "success",
        autoClose: 5000,
        isLoading: false,
        closeOnClick: true,
      });
      setTimeout(() => {
        router.push(`/post/${slug.trim().replace(/\s+/g, " ").toLowerCase().split(" ").join("-")}`)
      }, 2000);

    } catch (err) {
      // Change the toast to error message
      toast.update(toastId, {
        render: "There was an error submitting your post. Please try again.",
        type: "error",
        autoClose: 5000,
        isLoading: false,
        closeOnClick: true,
      });
      console.log(err);
    } finally {
      // Reset submission state
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    categoryApi();
    marketApi();
  }, []);

  useEffect(() => {
    subCategoryApi();
  }, [category_main]);

  return (
    <Container className="my-5">
      <Link href='/admin/article'> <button
        className="btn btn-secondary mb-3"
      >
        Back
      </button></Link>
      <Card className="p-4 shadow-lg form-card">
        <h1 className="text-center mb-4">Create New Post</h1>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={8}>
              <Form.Group className="mb-4" controlId="title">
                <Form.Label className="form-label">Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-input"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Title is required.
                </Form.Control.Feedback>
                {(title.length >= 1 && title.length <= 39) && (
                  <p className="text-warning mt-2">Add more words for a stronger title.</p>
                )}
                {(title.length >= 40 && title.length <= 48) && (
                  <p className="text-success mt-2">Perfect title length!</p>
                )}
                {title.length >= 49 && (
                  <p className="text-danger mt-2">Keep it shorter for better impact.</p>
                )}
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Slug</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9- ]/g, ""); // Remove special characters
                    setSlug(sanitizedValue);
                  }}
                  className="form-input"
                  required
                />
                <Form.Text className="text-muted">
                  Best practice slug to be in length of 60, no special symbols.
                </Form.Text>
                {(slug.length >= 1 && slug.length <= 39) && (
                  <p className="text-warning mt-2">Add more words for a stronger slug.</p>
                )}
                {(slug.length >= 40 && slug.length <= 60) && (
                  <p className="text-success mt-2">Perfect slug length!</p>
                )}
                {slug.length >= 61 && (
                  <p className="text-danger mt-2">Keep it shorter for better impact.</p>
                )}
              </Form.Group>

              <Form.Group className="mb-4" controlId="summary">
                <Form.Label className="form-label">Summary</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter Summary"
                  name="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="form-input"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Summary is required.
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  10–30 characters for better clicks.
                </Form.Text>
              </Form.Group>
              <div className="my-3">
                <Form.Label className="form-label">Tag</Form.Label>
                <div className="mb-3">
                  {tags.map((tag, index) => (
                    <span key={index} className="badge bg-primary me-2">
                      {tag}
                      <button
                        type="button"
                        className="btn-close btn-close-white ms-2"
                        aria-label="Close"
                        onClick={() => handleRemoveTag(index)}
                      ></button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  className="form-control"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a tag and press Enter"
                />
                <Form.Text className="text-muted">
                  Use up to 5 tags for best results
                </Form.Text>
              </div>
              <Form.Group className="mb-4" controlId="content">
                <Form.Label className="form-label">Content</Form.Label>
                <p className="text-muted">Note: Set the image property to 'width: 100%; height: auto;' for proper display within the content.</p>
                <Editor
                  id="raceautoindia"
                  apiKey={process.env.NEXT_PUBLIC_TINYMCE}
                  onInit={(_evt, editor) => (editorRef.current = editor)}
                  value={content}
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
                <Form.Control.Feedback type="invalid">
                  Content is required.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-4" controlId="category">
                <Form.Label className="form-label">Category</Form.Label>
                <Form.Control
                  as="select"
                  value={category_main}
                  onChange={(e) => setCategory_main(e.target.value)}
                  required
                >
                  <option value="none">None</option>
                  {mainCategory_array.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Form.Control>

                <Form.Control.Feedback type="invalid">
                  Category is required.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4" controlId="subCategory">
                <Form.Label className="form-label">Sub Category</Form.Label>
                <Form.Control
                  as="select"
                  value={category_sub}
                  onChange={(e) => setCategory_sub(e.target.value)}
                  required
                >
                  <option value="none">None</option>
                  {subCategory_array !== undefined &&
                    subCategory_array.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </Form.Control>
              </Form.Group>

              <Form.Group className="mb-4" controlId="Market">
                <Form.Label className="form-label">Market</Form.Label>
                <Form.Control
                  as="select"
                  value={marketValue}
                  onChange={(e) => setMarketValue(e.target.value)}
                  required
                >
                  <option value="none">None</option>
                  {marketArray !== undefined &&
                    marketArray.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.title}
                      </option>
                    ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="formKeywords" className="mb-2">
                <Form.Label>Keywords</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter keywords"
                  value={keywords}
                  onChange={handleKeywordsChange}
                  required
                />
                <Form.Text className="text-muted">
                  Use 5–10 keywords.
                </Form.Text>
              </Form.Group>
              <Form.Group controlId="image_default" className="">
                <Form.Label>Select Image</Form.Label>
                <p className="text-muted">
                  Image upload is required; you can select multiple images
                </p>
                <div {...getRootProps({ style })}>
                  <p style={{ color: "orange" }}>
                    Note: The image size should not exceed 5 MB.
                  </p>
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop some files here, or click to select files</p>
                </div>
                <aside
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginTop: 16,
                  }}
                >
                  {files}
                  <ul>{fileRejectionItems}</ul>
                </aside>

              </Form.Group>
              <Form.Group controlId="formimagedescription" className="mb-3">
                <Form.Label>Image Description</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter Image Description"
                  value={imageDescription}
                  onChange={(e) => setImageDescription(e.target.value)}
                />
              </Form.Group>
              <Form.Check
                type="checkbox"
                id="sliderCheckbox"
                label="Slider"
                checked={isSlider === 1}
                onChange={() => toggleCheckbox(setIsSlider)}
              />
              <Form.Check
                type="checkbox"
                id="featuredCheckbox"
                label="Featured"
                checked={isFeatured === 1}
                onChange={() => toggleCheckbox(setIsFeatured)}
              />
              <Form.Check
                type="checkbox"
                id="recommendedCheckbox"
                label="Exclusive"
                checked={isRecommended === 1}
                onChange={() => toggleCheckbox(setIsRecommended)}
              />
              <Form.Check
                type="checkbox"
                id="breakingCheckbox"
                label="Breaking"
                checked={isBreaking === 1}
                onChange={() => toggleCheckbox(setIsBreaking)}
              />

              <Form.Check
                type="checkbox"
                id="scheduleCheckbox"
                label="Schedule"
                checked={isScheduled}
                onChange={() => setisScheduled(!isScheduled)}
              />
              {isScheduled && (
                <Form.Group className="mt-3" controlId="schedule">
                  <Form.Label className="form-label">
                    Schedule Date and Time
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="schedule"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="form-input"
                    required
                  />
                </Form.Group>
              )}
            </Col>
          </Row>
          <Form.Check
            type="checkbox"
            id="draftCheckbox"
            label='Draft Mode'
            checked={draft}
            className="text-danger mb-3"
            onChange={() => setDraft(!draft)}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`${draft ? "btn-danger" : "btn-primary"} btn`}
          >
            {draft ? "Save to Draft" : "Publish"}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}
