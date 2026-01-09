'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const HeaderCode = () => {
  const [headerCode, setHeaderCode] = useState("");

  const getCode = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/settings/headercode`,

      );
      setHeaderCode(res.data[0].custom_header_codes)
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/settings/headercode`,
        { headerCode },

      );
      toast.success("Header submitted", {
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
    getCode()
  }, [])

  return (
    <>

      <div className="col-12">
        <div className="shadow-sm p-3 mb-5 mt-5 bg-white rounded border-0">
          <div className="row">
            <div className="form-group">
              <label htmlFor="FormControlTextarea1">Enter your code</label>
              <textarea
                className="form-control"
                id="FormControlTextarea1"
                rows="3"
                value={headerCode}
                onChange={(e) => setHeaderCode(e.target.value)}
              ></textarea>
              <button className="btn btn-primary mt-3" onClick={handleSubmit}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderCode;
