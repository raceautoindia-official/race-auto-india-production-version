"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { Badge } from "react-bootstrap";
import Link from "next/link";

const AdminAccess = () => {
  const [data, setData] = useState([]);

  const allPermissions = [
    "admin_panel",
    "add_post",
    "manage_all_posts",
    "navigation",
    "pages",
    "rss_feeds",
    "categories",
    "widgets",
    "polls",
    "gallery",
    "comments_contact",
    "newsletter",
    "ad_spaces",
    "users",
    "seo_tools",
    "settings",
    "reward_system",
    "market",
    "event",
    "subscription",
  ];

  const roleApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/role`
      );
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    roleApi();
  }, []);
  return (
    <div className="col-12">
      <div className="shadow-sm p-3 mb-5  mt-3 bg-white rounded border-0">
        <table className="table text-center">
          <thead className="bg-light">
            <tr>
              <th>Role</th>
              <th>Permissions</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data) &&
              data.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.role_name}</td>
                  <td style={{ backgroundColor: item.color, color: "white" }}>
                    <div className="d-flex">
                      {allPermissions.every(
                        (permission) => item[permission] == 1
                      ) ? (
                        <Badge bg="secondary">All Permissions</Badge>
                      ) : (
                        <>
                          {item.admin_panel === 1 && (
                            <Badge bg="secondary me-1">Admin Panel</Badge>
                          )}
                          {item.add_post === 1 && (
                            <Badge bg="secondary me-1">Add Post</Badge>
                          )}
                          {item.manage_all_posts === 1 && (
                            <Badge bg="secondary me-1">Manage All Posts</Badge>
                          )}
                          {item.navigation === 1 && (
                            <Badge bg="secondary me-1">Navigation</Badge>
                          )}
                          {item.pages === 1 && (
                            <Badge bg="secondary me-1">Pages</Badge>
                          )}
                          {item.rss_feeds === 1 && (
                            <Badge bg="secondary me-1">RSS Feeds</Badge>
                          )}
                          {item.categories === 1 && (
                            <Badge bg="secondary me-1">Categories</Badge>
                          )}
                          {item.widgets === 1 && (
                            <Badge bg="secondary me-1">Widgets</Badge>
                          )}
                          {item.polls === 1 && (
                            <Badge bg="secondary me-1">Polls</Badge>
                          )}
                          {item.gallery === 1 && (
                            <Badge bg="secondary me-1">Gallery</Badge>
                          )}
                          {item.comments_contact === 1 && (
                            <Badge bg="secondary me-1">
                              Comments & Contact
                            </Badge>
                          )}
                          {item.newsletter === 1 && (
                            <Badge bg="secondary me-1">Newsletter</Badge>
                          )}
                          {item.ad_spaces === 1 && (
                            <Badge bg="secondary me-1">Ad Spaces</Badge>
                          )}
                          {item.users === 1 && (
                            <Badge bg="secondary me-1">Users</Badge>
                          )}
                          {item.seo_tools === 1 && (
                            <Badge bg="secondary me-1">SEO Tools</Badge>
                          )}
                          {item.settings === 1 && (
                            <Badge bg="secondary me-1">Settings</Badge>
                          )}
                          {item.reward_system === 1 && (
                            <Badge bg="secondary me-1">Reward System</Badge>
                          )}
                          {item.market === 1 && (
                            <Badge bg="secondary me-1">Market</Badge>
                          )}
                          {item.event === 1 && (
                            <Badge bg="secondary me-1">Event</Badge>
                          )}
                          {item.subscription === 1 && (
                            <Badge bg="secondary me-1">Subscription</Badge>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td>
                    <Link href={`/admin/admin-access/${item.id}`}>
                      <button className="btn btn-primary me-3">
                        <MdModeEdit size={20} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAccess;
