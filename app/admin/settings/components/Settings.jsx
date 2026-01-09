'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";


const SettingsForm = () => {
  const [applicationName, setApplicationName] = useState("");
  const [footerAboutSection, setFooterAboutSection] = useState("");
  const [optionalUrl, setOptionalUrl] = useState('')
  const [copyright, setCopyright] = useState("");

  const getApplicationData = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/settings/general-settings`,

      );
      const { application_name, about_footer, copyright, optional_url_button_name } = res.data[0];
      setApplicationName(application_name);
      setOptionalUrl(optional_url_button_name)
      setFooterAboutSection(about_footer);
      setCopyright(copyright);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/settings/general-settings`,
        {
          application_name: applicationName,
          optional_url_button_name: optionalUrl,
          about_footer: footerAboutSection,
          copyright: copyright,
        },

      );
      toast.success("Application data submitted", {
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
    getApplicationData();
  }, []);

  return (
    <>

      <div className="col-12">
        <div className="shadow-sm p-3 mb-5 mt-5 bg-white rounded border-0">
          <div className="row">
            <div className="form-group">
              <label htmlFor="applicationName">Application Name</label>
              <input
                type="text"
                className="form-control"
                id="applicationName"
                name="applicationName"
                value={applicationName}
                onChange={(e) => setApplicationName(e.target.value)}
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="footerAboutSection">Footer About Section</label>
              <textarea
                className="form-control"
                id="footerAboutSection"
                name="footerAboutSection"
                rows="3"
                value={footerAboutSection}
                onChange={(e) => setFooterAboutSection(e.target.value)}
              ></textarea>
            </div>
            <div className="form-group mt-3">
              <label htmlFor="optionalUrl">optionalUrl</label>
              <input
                type="text"
                className="form-control"
                id="optionalUrl"
                name="optionalUrl"
                value={optionalUrl}
                onChange={(e) => setOptionalUrl(e.target.value)}
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="copyright">Copyright</label>
              <input
                type="text"
                className="form-control"
                id="copyright"
                name="copyright"
                value={copyright}
                onChange={(e) => setCopyright(e.target.value)}
              />
            </div>

          </div>
          <button className="btn btn-primary mt-3" onClick={handleSubmit}>
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

export default SettingsForm;
