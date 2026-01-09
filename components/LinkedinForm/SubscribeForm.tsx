import { useEffect } from "react";
import { Button } from "react-bootstrap";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const token = Cookies.get("token");

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]*$/, "Phone number must contain only digits")
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number must not exceed 15 characters")
    .required("Phone number is required"),
});

const initialValues = {
  name: "",
  email: "",
  phoneNumber: "",
};

const SubscribeComponent = () => {

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/subscriber/new_subscriber`,
        values,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Client-Side": "true",
          },
        }
      );
      toast.success("Subscribed successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });

      setSubmitting(false);
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        toast.warn("Already subscribed", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      } else {
        toast.error("An error occurred. Please try again later.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }
      setSubmitting(false);
      console.log(err);
    }
  };

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleSubmit(values, { setSubmitting });
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
          <Form onSubmit={handleSubmit}>
            <div className="form-group mb-3">
              <Field
                type="text"
                name="name"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.name}
                placeholder="Enter your Name"
                className={`form-control ${
                  errors.name && touched.name ? "is-invalid" : ""
                }`}
              />
              <ErrorMessage
                name="name"
                component="div"
                className="invalid-feedback"
              />
            </div>
            <div className="form-group mb-3">
              <Field
                type="email"
                name="email"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.email}
                placeholder="Enter your Email"
                className={`form-control ${
                  errors.email && touched.email ? "is-invalid" : ""
                }`}
              />
              <ErrorMessage
                name="email"
                component="div"
                className="invalid-feedback"
              />
            </div>
            <div className="form-group">
              <Field
                type="text"
                name="phoneNumber"
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your Mobile Number"
                value={values.phoneNumber}
                className={`form-control ${
                  errors.phoneNumber && touched.phoneNumber ? "is-invalid" : ""
                }`}
              />
              <ErrorMessage
                name="phoneNumber"
                component="div"
                className="invalid-feedback"
              />
            </div>
            <div className="d-flex justify-content-center">
              <Button variant="success" type="submit" className="mt-3">
                Subscribe
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default SubscribeComponent;
