"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import Link from "next/link";

const RoleForm = () => {
  const { id } = useParams();

  const [title, setTitle] = useState("");

  const [permissions, setPermissions] = useState<any>({});

  const handleChange = (event: any) => {
    const { name, checked } = event.target;
    setPermissions((prevPermissions: any) => ({
      ...prevPermissions,
      [name]: checked ? 1 : 0,
    }));
  };

  const roleApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/role/${id}`
      );
      setTitle(res.data[0].role_name);

      setPermissions({
        admin_panel: res.data[0].admin_panel,
        add_post: res.data[0].add_post,
        manage_all_posts: res.data[0].manage_all_posts,
        navigation: res.data[0].navigation,
        pages: res.data[0].pages,
        rss_feeds: res.data[0].rss_feeds,
        categories: res.data[0].categories,
        widgets: res.data[0].widgets,
        polls: res.data[0].polls,
        gallery: res.data[0].gallery,
        comments_contact: res.data[0].comments_contact,
        newsletter: res.data[0].newsletter,
        ad_spaces: res.data[0].ad_spaces,
        users: res.data[0].users,
        seo_tools: res.data[0].seo_tools,
        settings: res.data[0].settings,
        reward_system: res.data[0].reward_system,
        market: res.data[0].market,
        event: res.data[0].event,
        subscription: res.data[0].subscription,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = { ...permissions, role_name: title };
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/role/${id}`,
        formData
      );
      toast.success("permission updated!", {
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
    roleApi();
  }, []);

  return (
    <div className="col-12">
      <Link href="/admin/admin-access">
        <Button variant="secondary" className="mt-3 ms-2">
          Back
        </Button>
      </Link>
      <div className="shadow-sm p-3 mb-5  mt-3 bg-white rounded border-0">
        <input
          type="text"
          name="title"
          value={title}
          className="form-control"
          // onChange={(e) => setTitle(e.target.value)}
          disabled
        />
        <Form>
          {Object.keys(permissions).map((permission: any) => (
            <Form.Check
              key={permission}
              type="checkbox"
              label={permission
                .replace(/_/g, " ")
                .replace(/\b\w/g, (l: string) => l.toUpperCase())}
              name={permission}
              className="mt-2"
              checked={permissions[permission] == 1}
              onChange={handleChange}
            />
          ))}
        </Form>
        <Button variant="primary" className="mt-3" onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </div>
  );
};

export default RoleForm;
