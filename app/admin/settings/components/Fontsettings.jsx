'use client'
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";


const FontSetting = () => {
  const [Font, setFont] = useState([]);


  const [defaultFont, setDefaultFont] = useState(0);

  const [primaryFont, setPrimaryFont] = useState(0)

  const [secondaryFont, setSecondaryFont] = useState(0)

  const [tertiaryFont, setTertiaryFont] = useState(0)


  const fontapi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/settings/fonts`
      );
      setFont(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const defaultFontapi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/settings/default`

      );
      setDefaultFont(res.data[0].id);
    } catch (err) {
      console.log(err);
    }
  };

  const threeFonts = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/settings/fonts/three-fonts`
      );
      setPrimaryFont(res.data[0].primary_font);
      setSecondaryFont(res.data[0].secondary_font)
      setTertiaryFont(res.data[0].tertiary_font)
    } catch (err) {
      console.log(err);
    }
  };

  const applyChanges = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL
        }api/admin/settings/fonts/default/${defaultFont}`
      );

      const fontdata = { primary_font: primaryFont, secondary_font: secondaryFont, tertiary_font: tertiaryFont }

      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL
        }api/admin/settings/fonts/three-fonts`, fontdata
      );

      toast.success("fonts updated", {
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
    defaultFontapi()
    fontapi();
    threeFonts()
  }, []);

  return (
    <>

      <div className="col-12">

        <div className="shadow-sm p-3 mb-5 mt-5 bg-white rounded border-0">
          <h5 style={{ color: "red" }}>Note: Please refresh the page after changing the fonts</h5>
          <div className="row">

            <Form>
              <Form.Group controlId="fontSelect">
                <Form.Label>Default Font</Form.Label>
                <Form.Control
                  as="select"
                  value={defaultFont}
                  onChange={(e) => setDefaultFont(e.target.value)}
                >
                  {Font && Font.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.font_name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="fontSelect" className="mt-3">
                <Form.Label>Primary Font(Main)</Form.Label>
                <Form.Control
                  as="select"
                  value={primaryFont}
                  onChange={(e) => setPrimaryFont(e.target.value)}
                >
                  {Font && Font.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.font_name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="fontSelect" className="mt-3">
                <Form.Label>Secondary Font(Titles)</Form.Label>
                <Form.Control
                  as="select"
                  value={secondaryFont}
                  onChange={(e) => setSecondaryFont(e.target.value)}
                >
                  {Font && Font.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.font_name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="fontSelect" className="my-3">
                <Form.Label>Tertiary Font(Post & Pages)</Form.Label>
                <Form.Control
                  as="select"
                  value={tertiaryFont}
                  onChange={(e) => setTertiaryFont(e.target.value)}
                >
                  {Font && Font.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.font_name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>

              <Button variant="primary" onClick={applyChanges}>
                Apply Changes
              </Button>
            </Form>

          </div>
        </div>
      </div>
    </>
  );
};

export default FontSetting;
