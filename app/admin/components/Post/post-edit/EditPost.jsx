"use client";
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
import { useEffect, useMemo, useRef, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { toast } from "react-toastify";
import { Editor } from "@tinymce/tinymce-react";
import { IoMdClose } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/components/Time";



const ArticleEdit = () => {
  const params = useParams();
  const router = useRouter()
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isBreaking, setIsBreaking] = useState("");
  const [isFeatured, setIsFeatured] = useState("");
  const [isRecommended, setIsRecommended] = useState("");
  const [isSlider, setIsSlider] = useState("");
  const [summary, setSummary] = useState("");
  const [keywords, setKeywords] = useState("");
  const [imageDefault, setImageDefault] = useState([]);
  const [additionalImage, setAdditionalImage] = useState([]);
  const [addtionalPreview, setAdditionalPreview] = useState([]);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [isScheduled, setisScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [categoryMain, setCategoryMain] = useState("");
  const [categorySub, setCategorySub] = useState("");
  const [marketValue, setMarketValue] = useState("");
  const [marketArray, setMarketArray] = useState([]);
  const [imageDescription, setImageDescription] = useState("");
  const [mainCategoryArray, setMainCategoryArray] = useState([]);
  const [subCategoryArray, setSubCategoryArray] = useState([]);
  const editorRef = useRef(null);
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draft, setDraft] = useState(false);
  const [previewDefault, setPreviewDefault] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [created_at, setCreated_at] = useState(0)
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && inputValue) {
      setTags([...tags, inputValue]);
      setInputValue("");
    }
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };
  // Dropzone styles
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
    color: "#696969",
    outline: "none",
    transition: "border .24s ease-in-out",
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

  const onDrop = useCallback((acceptedFiles) => {
    setImageDefault(acceptedFiles[0]);
    setIsFileSelected(true);
    setPreviewDefault(URL.createObjectURL(acceptedFiles[0]));
  }, []);

  const thumbsContainer = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
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

  const maxSize = 5 * 1024 * 1024;

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      accept: {
        "image/*": [],
      },
      onDrop,
      multiple: false,
    });

  const {
    getRootProps: getRootPropsAdditional,
    getInputProps: getInputPropsAdditional,
    isFocused: isFocusedAdditional,
    isDragAccept: isDragAcceptAdditional,
    isDragReject: isDragRejectAdditional,
    fileRejections,
  } = useDropzone({
    maxSize,
    accept: {
      "image/*": [],
    },
    onDrop: (acceptedFiles) => {
      setAdditionalImage((prevFiles) => [
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
    const newFiles = [...additionalImage];
    newFiles.splice(newFiles.indexOf(file), 1);
    setAdditionalImage(newFiles);
  };

  const files =
    additionalImage !== null &&
    additionalImage.map((file) => (
      <li key={file.path}>
        <div style={thumb} key={file.name}>
          <div style={thumbInner}>
            <img
              src={file.preview}
              style={img}
              onLoad={() => {
                URL.revokeObjectURL(file.preview);
              }}
            />
          </div>
          <IoClose onClick={removeFile(file)} size={25} />
        </div>
      </li>
    ));

  const styleAdditional = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocusedAdditional ? focusedStyle : {}),
      ...(isDragAcceptAdditional ? acceptStyle : {}),
      ...(isDragRejectAdditional ? rejectStyle : {}),
    }),
    [isFocusedAdditional, isDragAcceptAdditional, isDragRejectAdditional]
  );

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  const MarketApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/market`
      );
      setMarketArray(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const formDetailApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/post/edit/${params.id}`
      );

      const data = res.data[0];

      const tagsData = data.tag.map((item) => item.tag);

      setTitle(data.title);
      setContent(data.content);
      setSummary(data.summary);
      setIsBreaking(data.is_breaking);
      setIsFeatured(data.is_featured);
      setIsSlider(data.is_slider);
      setIsRecommended(data.is_recommended);
      setKeywords(data.keywords);
      setPreviewDefault(`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${data.imageDefault}`);
      setAdditionalPreview(data.additionalImages);
      setCategoryMain(data.parent_id);
      setCategorySub(data.category_id);
      setMarketValue(data.market);
      setTags(tagsData);
      setCreated_at(data.created_at)
      setDraft(data.status == 0 ? true : false)
      setisScheduled(data.is_scheduled == 1 ? true : false)
      setImageDescription(
        data.image_description == null ? "" : data.image_description
      );
    } catch (err) {
      console.log(err);
    }
  };

  const MainCategoryApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/main-category`
      );
      setMainCategoryArray(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditorChange = (editContent) => {
    setContent(editContent);
  };

  const subCategoryApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/sub-category/parent/${categoryMain}`
      );
      setSubCategoryArray(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    switch (name) {
      case "isSlider":
        setIsSlider(checked ? 1 : 0);
        break;
      case "isFeatured":
        setIsFeatured(checked ? 1 : 0);
        break;
      case "isBreaking":
        setIsBreaking(checked ? 1 : 0);
        break;
      case "isRecommended":
        setIsRecommended(checked ? 1 : 0);
        break;
      default:
        break;
    }
  };

  const handleImageRemove = async (url) => {
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/post/remove-post-image`, {
        image_url: url,
        id: params.id,
      });
      const filterimages = addtionalPreview.filter(
        (image) => image.image_mid !== url
      );
      const removeNull = filterimages.filter(
        (image) => image.image_mid !== null
      );

      setAdditionalPreview(removeNull);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("draft", draft.toString());
    if (isScheduled) formData.append("schedule_time", scheduledAt);
    formData.append("title", title);
    formData.append("content", content);
    formData.append("summary", summary);
    formData.append("category_id", categorySub);
    formData.append("keywords", keywords);
    formData.append("image_default", imageDefault);
    formData.append("tags", tags.join(","));
    formData.append("market", marketValue);
    additionalImage.forEach((file) => {
      formData.append("additional_image", file);
    });
    formData.append("is_slider", isSlider);
    formData.append("is_featured", isFeatured);
    formData.append("is_breaking", isBreaking);
    formData.append("is_recommended", isRecommended);
    formData.append("image_description", imageDescription);

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/post/edit/${params.id}`,
        formData
      );
      toast.success("Article updated", {
        position: "top-right",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (err) {
      toast.error("please try later", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      console.log(err);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    formDetailApi();
  }, []);

  useEffect(() => {
    MainCategoryApi();
    subCategoryApi();
    MarketApi();
  }, [categoryMain]);

  return (
    <div className="col-12">
      <button
        className="btn btn-secondary mt-3 ms-2" onClick={() => {
          router.back()
          router.refresh()
        }}
      >
        Back
      </button>

      <div className="shadow-sm p-3 mb-5 mt-3 bg-white rounded border-0">
        <div className="row">
          <div className="col-md-8">
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
            <Form.Group controlId="formkeywords" className="mb-3">
              <Form.Label>Summary</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter keywords"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
              />
            </Form.Group>
            <div className="my-3">
              <div className="my-3">
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
            </div>
            <Form.Group controlId="formContent" className="mb-3">
              <Form.Label>Content</Form.Label>

              <Editor
                id="raceautoindia"
                apiKey="1yrfk0cv60kmc9zke9nscwofwats8qf2317zimj60jz5l3zf"
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
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group controlId="MainCategory" className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                as="select"
                value={categoryMain}
                onChange={(e) => setCategoryMain(e.target.value)}
              >
                {mainCategoryArray.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="subCategory" className="mb-3">
              <Form.Label>Sub Category</Form.Label>
              <Form.Control
                as="select"
                value={categorySub}
                onChange={(e) => setCategorySub(e.target.value)}
                required
              >
                {subCategoryArray !== undefined &&
                  subCategoryArray.length == 1 && (
                    <option value="none">none</option>
                  )}
                {subCategoryArray !== undefined &&
                  subCategoryArray.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="subCategory" className="mb-3">
              <Form.Label>Market</Form.Label>
              <Form.Control
                as="select"
                value={marketValue}
                onChange={(e) => setMarketValue(e.target.value)}
                required
              >
                {marketArray.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="formKeywords" className="mb-3">
              <Form.Label>Keywords</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Check
              type="checkbox"
              id="sliderCheckbox"
              name="isSlider"
              label="Slider"
              checked={isSlider === 1}
              onChange={handleCheckboxChange}
            />
            <Form.Check
              type="checkbox"
              id="featuredCheckbox"
              name="isFeatured"
              label="Featured"
              checked={isFeatured === 1}
              onChange={handleCheckboxChange}
            />
            <Form.Check
              type="checkbox"
              id="breakingCheckbox"
              name="isBreaking"
              label="Breaking"
              checked={isBreaking === 1}
              onChange={handleCheckboxChange}
            />

            <Form.Check
              type="checkbox"
              id="recommendedCheckbox"
              name="isRecommended"
              label="Exclusive"
              checked={isRecommended === 1}
              onChange={handleCheckboxChange}
            />

            <Form.Group controlId="image_default" className="mb-3">
              <Form.Label>Select Image</Form.Label>
              <div {...getRootProps({ style })}>
                <p style={{ color: "orange" }}>
                  Note: The image size should not exceed 5 MB.
                </p>
                <input
                  {...getInputProps()}
                  name="image_default"
                  style={{ display: "none" }}
                />
                {isFileSelected ? (
                  <p>Image file selected</p>
                ) : (
                  <div className="text-center">
                    <p>
                      Drag 'n' drop image file here, or click to select file to
                      replace existing image
                    </p>
                  </div>
                )}
              </div>
            </Form.Group>
            {previewDefault !== undefined && (
              <img
                src={previewDefault}
                alt="Banner previewDefault"
                className="my-3"
                height={80}
              />
            )}
            <Form.Group className="mb-3" controlId="formAdditionalImages">
              <Form.Label>Additional Images</Form.Label>
              <div {...getRootPropsAdditional({ style: styleAdditional })}>
                <p style={{ color: "orange" }}>
                  Note: The image size should not exceed 5 MB.
                </p>
                <input {...getInputPropsAdditional()} />
                <p>Drag 'n' drop some files here, or click to select files</p>
              </div>
              <aside style={thumbsContainer}>
                {files}
                <ul>{fileRejectionItems}</ul>
              </aside>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formImagePreview">
              <div className="image-preview-container">
                {addtionalPreview.length !== 0 &&
                  addtionalPreview.map((file, index) => (
                    <div key={index}>
                      <img
                        src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${file.image_mid}`}
                        alt={`preview-${index}`}
                        className="image-preview"
                        height={50}
                      />

                      <IoMdClose
                        onClick={() => handleImageRemove(file.image_mid)}
                      />
                    </div>
                  ))}
              </div>
            </Form.Group>
            <Form.Group controlId="formdescription" className="mb-3">
              <Form.Label>Image Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Image Description"
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Check
              type="checkbox"
              id="scheduleCheckbox"
              label="Schedule"
              checked={isScheduled}
              onChange={() => setisScheduled(!isScheduled)}
            />
            {isScheduled && <p>{formatDate(created_at)}</p>}
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
              onClick={handleSubmit}
              className={`${draft ? "btn-danger" : "btn-primary"} btn`}
            >
              {draft ? "Save to Draft" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleEdit;
