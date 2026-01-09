'use client'
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";


const LogoSettings = () => {

    const [logo, setLogo] = useState([]);
    const [logoPreview, setLogoPreview] = useState("");
    const [logoFooter, setLogoFooter] = useState([]);
    const [logoFooterPreview, setLogoFooterPreview] = useState("");
    const [logoEmail, setLogoEmail] = useState([]);
    const [logoEmailPreview, setLogoEmailPreview] = useState("");
    const [favicon, setFevicon] = useState([]);
    const [faviconPreview, setFaviconPreview] = useState("");

    const getCode = async () => {
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/settings/logo`,

            );
            setLogoPreview(`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${res.data[0].logo}`);
            setLogoFooterPreview(`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${res.data[0].logo_footer}`);
            setLogoEmailPreview(`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${res.data[0].logo_email}`);
            setFaviconPreview(`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${res.data[0].favicon}`);
        } catch (err) {
            console.log(err);
        }
    };

    const handleSubmit = async () => {
        try {
            const formData = new FormData()

            formData.append('logo', logo);
            formData.append('logo_footer', logoFooter)
            formData.append("logo_email", logoEmail);
            formData.append('favicon', favicon)

            await axios.put(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/settings/logo`,
                formData,
            );
            toast.success("logo updated", {
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

    const handleFileChange = (e, setImage, setPreview) => {
        const selectedFile = e.target.files[0];
        const maxSize = 5 * 1024 * 1024;

        if (selectedFile && selectedFile.size <= maxSize) {
            setImage(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        } else {
            alert("Please select a file smaller than 5MB.");
            e.target.value = null;
        }
    };

    useEffect(() => {
        getCode();
    }, []);

    return (
        <>

            <div className="col-12">
                <div className="shadow-sm p-3 mb-5 mt-5 bg-white rounded border-0">
                    <div className="row">
                        <div className="form-group">
                            <div className="">
                                <h5>Logo</h5>
                                <img
                                    src={logoPreview}
                                    alt="logo preview"
                                    className="my-3"
                                    height="100px"
                                />
                                <input
                                    type="file"
                                    className="form-control"
                                    id="customFile1"
                                    onChange={(e) => handleFileChange(e, setLogo, setLogoPreview)}
                                />
                            </div>
                            <div className="mt-4">
                                <h5>Logo Footer</h5>
                                <img
                                    src={logoFooterPreview}
                                    alt="logo footer preview"
                                    className="my-3"
                                    height="100px"
                                />
                                <input
                                    type="file"
                                    className="form-control"
                                    id="customFile2"
                                    onChange={(e) =>
                                        handleFileChange(e, setLogoFooter, setLogoFooterPreview)
                                    }
                                />
                            </div>
                            <div className="mt-4">
                                <h5>Logo Email</h5>
                                <img
                                    src={logoEmailPreview}
                                    alt="logo email preview"
                                    className="my-3"
                                    height="100px"
                                />
                                <input
                                    type="file"
                                    className="form-control"
                                    id="customFile3"
                                    onChange={(e) =>
                                        handleFileChange(e, setLogoEmail, setLogoEmailPreview)
                                    }
                                />
                            </div>
                            <div className="mt-4">
                                <h5>Favicon</h5>
                                <img
                                    src={faviconPreview}
                                    alt="fevicon preview"
                                    className="my-3"
                                    height="100px"
                                />
                                <input
                                    type="file"
                                    className="form-control"
                                    id="customFile4"
                                    onChange={(e) =>
                                        handleFileChange(e, setFevicon, setFaviconPreview)
                                    }
                                />
                            </div>
                        </div>

                    </div>
                    <button className="btn btn-primary mt-3" onClick={handleSubmit}>Submit</button>
                </div>
            </div>
        </>
    );
};

export default LogoSettings;
