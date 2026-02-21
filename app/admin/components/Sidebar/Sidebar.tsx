import Link from "next/link";
import React from "react";
import { PiFileAudioFill, PiNewspaperClippingDuotone } from "react-icons/pi";
import { CgTemplate } from "react-icons/cg";
import {
  FaAd,
  FaAdversal,
  FaAngleDown,
  FaHome,
  FaImage,
  FaMicrochip,
  FaRupeeSign,
  FaSitemap,
  FaThList,
  FaUsers,
} from "react-icons/fa";
import { IoIosMail, IoIosSettings } from "react-icons/io";
import "./Sidebar.css";
import {
  RiAdminFill,
  RiAdvertisementFill,
  RiCalendarScheduleFill,
  RiDraftFill,
  RiPagesFill,
} from "react-icons/ri";
import {
  MdAdminPanelSettings,
  MdEventAvailable,
  MdFeaturedPlayList,
  MdOutlineDisplaySettings,
  MdOutlineEventAvailable,
  MdPriceChange,
  MdRecommend,
} from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { AiOutlineGlobal } from "react-icons/ai";
import { FaUsersGear } from "react-icons/fa6";
import { GrArticle } from "react-icons/gr";
import { TfiLayoutSlider } from "react-icons/tfi";
import {
  TbCategoryMinus,
  TbCategoryPlus,
  TbReportAnalytics,
} from "react-icons/tb";
import Image from "next/image";
import { CiBank, CiText } from "react-icons/ci";

const AdminSidebar = async () => {
  const logoRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/general-settings/logo`,
  );

  const logoData = await logoRes.json();

  return (
    <div
      className="col-2 col-sm-4 col-md-3 col-xl-2 shadow bg-light admin-sidebar"
      style={{ padding: 0 }}
    >
      <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 min-vh-100 mt-2">
        <div style={{ borderBottom: "1px solid black" }} className="mb-2">
          <Link
            href="/"
            className="d-flex align-items-center pb-3 mb-md-0 me-md-auto"
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${logoData[0].favicon}`}
              alt="admin-logo"
              width={30}
              height={30}
            />
            <span className="ms-3 fs-5 d-none d-sm-inline">Admin panel</span>
          </Link>
        </div>
        <ul
          className="nav nav-pills flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start"
          id="menu"
          style={{ width: "100%" }}
        >
          <li className="nav-item ">
            <Link href="/admin" className="nav-link align-middle px-0">
              <FaHome />
              <span className="ms-1 d-none d-sm-inline">Home</span>
            </Link>
          </li>
          <li style={{ width: "100%" }}>
            <Link
              href="#magmenu"
              data-bs-toggle="collapse"
              className="nav-link px-0 align-middle d-flex align-items-center"
            >
              <IoIosMail />{" "}
              <span className="ms-1 d-none d-sm-inline">Magazine</span>{" "}
              <span className="d-none d-sm-inline ms-auto">
                <FaAngleDown />
              </span>
            </Link>
            <ul
              className="collapse nav flex-column ms-1"
              id="magmenu"
              data-bs-parent="#menu"
            >
              <li className="w-100">
                <Link href="/admin/magazine" className="nav-link px-0">
                  <MdEventAvailable className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary text-primary">
                    Magazines
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/admin/magazine/category" className="nav-link px-0">
                  <FaSitemap className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Category
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/admin/magazine/ad" className="nav-link px-0">
                  <FaAdversal className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Magazine Ad
                  </span>
                </Link>
              </li>
            </ul>
          </li>
          <li style={{ width: "100%" }}>
            <Link
              href="#analyticsmenu"
              data-bs-toggle="collapse"
              className="nav-link px-0 align-middle d-flex align-items-center"
            >
              <TbReportAnalytics />{" "}
              <span className="ms-1 d-none d-sm-inline">Analytics</span>
              <span className="d-none d-sm-inline ms-auto">
                <FaAngleDown />
              </span>
            </Link>

            <ul
              className="collapse nav flex-column ms-1"
              id="analyticsmenu"
              data-bs-parent="#menu"
            >
              <li className="w-100">
                <Link href="/admin/post-interactions" className="nav-link px-0">
                  <TbReportAnalytics className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Flash CTA Summary
                  </span>
                </Link>
              </li>

              <li className="w-100">
                <Link
                  href="/admin/post-interactions/logs"
                  className="nav-link px-0"
                >
                  <TbReportAnalytics className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Flash CTA Logs
                  </span>
                </Link>
              </li>

              <li className="w-100">
                <Link
                  href="/admin/post-interactions/user"
                  className="nav-link px-0"
                >
                  <TbReportAnalytics className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    User / Visitor Drilldown
                  </span>
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href="/admin/page" className="nav-link px-0 align-middle">
              <RiPagesFill />{" "}
              <span className="ms-1 d-none d-sm-inline">Pages</span>
            </Link>
          </li>
          <li>
            <Link
              href="/admin/email-template-builder"
              className="nav-link px-0 align-middle"
            >
              <CgTemplate />{" "}
              <span className="ms-1 d-none d-sm-inline">
                Email Template Builder
              </span>
            </Link>
          </li>
          {/* <li>
            <Link
              href="/admin/subscription"
              className="nav-link px-0 align-middle"
            >
              <MdPriceChange />{" "}
              <span className="ms-1 d-none d-sm-inline">Subscription</span>
            </Link>
          </li> */}
          <li style={{ width: "100%" }}>
            <Link
              href="#subscribemenu"
              data-bs-toggle="collapse"
              className="nav-link px-0 align-middle d-flex align-items-center"
            >
              <MdPriceChange />{" "}
              <span className="ms-1 d-none d-sm-inline">Subscription</span>{" "}
              <span className="d-none d-sm-inline ms-auto">
                <FaAngleDown />
              </span>
            </Link>
            <ul
              className="collapse nav flex-column ms-1"
              id="subscribemenu"
              data-bs-parent="#menu"
            >
              <li className="w-100">
                <Link href="/admin/subscription" className="nav-link px-0">
                  <MdEventAvailable className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary text-primary">
                    Plan
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/subscription/subscribers"
                  className="nav-link px-0"
                >
                  <FaSitemap className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Subscribers
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/subscription/trial-leads"
                  className="nav-link px-0"
                >
                  <FaSitemap className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Trial Subscribers
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/subscription/payment/upi-payment"
                  className="nav-link px-0"
                >
                  <FaRupeeSign className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    UPI-payments
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/subscription/payment/bank-payment"
                  className="nav-link px-0"
                >
                  <CiBank className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Bank-payments
                  </span>
                </Link>
              </li>
            </ul>
          </li>
          <li style={{ width: "100%" }}>
            <Link
              href="#aipoweredmenu"
              data-bs-toggle="collapse"
              className="nav-link px-0 align-middle d-flex align-items-center"
            >
              <FaMicrochip />{" "}
              <span className="ms-1 d-none d-sm-inline">AI Powered</span>{" "}
              <span className="d-none d-sm-inline ms-auto">
                <FaAngleDown />
              </span>
            </Link>
            <ul
              className="collapse nav flex-column ms-1"
              id="aipoweredmenu"
              data-bs-parent="#menu"
            >
              <li className="w-100">
                <Link
                  href="/admin/ai-powered/image-generate"
                  className="nav-link px-0"
                >
                  <FaImage className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary text-primary">
                    Image Generator
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/ai-powered/speech-to-text"
                  className="nav-link px-0"
                >
                  <CiText className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Speech to Text
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/ai-powered/text-to-speech"
                  className="nav-link px-0"
                >
                  <PiFileAudioFill className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Text to Speech
                  </span>
                </Link>
              </li>
            </ul>
          </li>
          {/* <li>
            <Link href="/admin/reports" className="nav-link px-0 align-middle">
              <TbReportAnalytics />{" "}
              <span className="ms-1 d-none d-sm-inline">Reports</span>
            </Link>
          </li> */}
          <li>
            <Link href="/admin/insights" className="nav-link px-0 align-middle">
              <TbReportAnalytics />{" "}
              <span className="ms-1 d-none d-sm-inline">Insights</span>
            </Link>
          </li>
          {/* <li>
            <Link href="/admin/insights/comment-group" className="nav-link px-0 align-middle">
              <TbReportAnalytics />{" "}
              <span className="ms-1 d-none d-sm-inline">Insights Comments</span>
            </Link>
          </li> */}
          <li style={{ width: "100%" }}>
            <Link
              href="#eventmenu"
              data-bs-toggle="collapse"
              className="nav-link px-0 align-middle d-flex align-items-center"
            >
              <BiCategory />{" "}
              <span className="ms-1 d-none d-sm-inline">Event</span>
              <span className="d-none d-sm-inline ms-auto">
                <FaAngleDown />
              </span>
            </Link>
            <ul
              className="collapse nav flex-column ms-1"
              id="eventmenu"
              data-bs-parent="#menu"
            >
              <li className="w-100">
                <Link href="/admin/event" className="nav-link px-0">
                  <MdOutlineEventAvailable className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Events
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/admin/event/settings" className="nav-link px-0">
                  <MdOutlineDisplaySettings className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Settings
                  </span>
                </Link>
              </li>
            </ul>
          </li>
          <li style={{ width: "100%" }}>
            <Link
              href="#postmenu"
              data-bs-toggle="collapse"
              className="nav-link px-0 align-middle d-flex align-items-center"
            >
              <IoIosMail />{" "}
              <span className="ms-1 d-none d-sm-inline">Post</span>{" "}
              <span className="d-none d-sm-inline ms-auto">
                <FaAngleDown />
              </span>
            </Link>
            <ul
              className="collapse nav flex-column ms-1"
              id="postmenu"
              data-bs-parent="#menu"
            >
              <li className="w-100">
                <Link href="/admin/article" className="nav-link px-0">
                  <GrArticle className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Articles
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/admin/article/slider" className="nav-link px-0">
                  <TfiLayoutSlider className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Slider
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/admin/article/featured" className="nav-link px-0">
                  <MdFeaturedPlayList className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Featured
                  </span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/article/recommended"
                  className="nav-link px-0"
                >
                  <MdRecommend className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Exclusive
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/admin/article/breaking" className="nav-link px-0">
                  <PiNewspaperClippingDuotone className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Breaking
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/admin/article/draft" className="nav-link px-0">
                  <RiDraftFill className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">Draft</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/article/schedule" className="nav-link px-0">
                  <RiCalendarScheduleFill className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Schedule
                  </span>
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link href="/admin/market" className="nav-link px-0 align-middle">
              <AiOutlineGlobal />{" "}
              <span className="ms-1 d-none d-sm-inline">Market</span>{" "}
            </Link>
          </li>
          <li style={{ width: "100%" }}>
            <Link
              href="#categorymenu"
              data-bs-toggle="collapse"
              className="nav-link px-0 align-middle d-flex align-items-center"
            >
              <FaThList />{" "}
              <span className="ms-1 d-none d-sm-inline">Category</span>
              <span className="d-none d-sm-inline ms-auto">
                <FaAngleDown />
              </span>
            </Link>
            <ul
              className="collapse nav flex-column ms-1"
              id="categorymenu"
              data-bs-parent="#menu"
            >
              <li className="w-100">
                <Link
                  href="/admin/category/main-category"
                  className="nav-link px-0"
                >
                  <TbCategoryMinus className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">Main</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/category/sub-category"
                  className="nav-link px-0"
                >
                  <TbCategoryPlus className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">Sub</span>
                </Link>
              </li>
            </ul>
          </li>
          <li style={{ width: "100%" }}>
            <Link
              href="#usermenu"
              data-bs-toggle="collapse"
              className="nav-link px-0 align-middle d-flex align-items-center"
            >
              <FaUsersGear />{" "}
              <span className="ms-1 d-none d-sm-inline">User</span>
              <span className="d-none d-sm-inline ms-auto">
                <FaAngleDown />
              </span>
            </Link>
            <ul
              className="collapse nav flex-column ms-1"
              id="usermenu"
              data-bs-parent="#menu"
            >
              <li className="w-100">
                <Link href="/admin/user" className="nav-link px-0">
                  <FaUsers className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">Users</span>
                </Link>
              </li>
              <li>
                <Link href="/admin/user/admin" className="nav-link px-0">
                  <MdAdminPanelSettings className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">Admin</span>
                </Link>
              </li>
            </ul>
          </li>
          <li style={{ width: "100%" }}>
            {/* <Link
              href="#admenu"
              data-bs-toggle="collapse"
              className="nav-link px-0 align-middle "
            >
              <RiAdvertisementFill />
              <span className="ms-1 d-none d-sm-inline">Ad</span>
            </Link> */}
            <Link
              href="#admenu"
              data-bs-toggle="collapse"
              className="nav-link px-0 align-middle d-flex align-items-center"
            >
              <RiAdvertisementFill />
              <span className="ms-1 d-none d-sm-inline">Ad</span>
              <span className="d-none d-sm-inline ms-auto">
                <FaAngleDown />
              </span>
            </Link>
            <ul
              className="collapse nav flex-column ms-1"
              id="admenu"
              data-bs-parent="#menu"
            >
              <li className="w-100">
                <Link href="/admin/adspace" className="nav-link px-0">
                  <FaAd className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Ad space
                  </span>
                </Link>
              </li>
              <li className="w-100">
                <Link href="/admin/adspace/header" className="nav-link px-0">
                  <FaAd className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Header Ads
                  </span>
                </Link>
              </li>
              <li className="w-100">
                <Link href="/admin/adspace/sidebar" className="nav-link px-0">
                  <FaAd className="text-primary" />{" "}
                  <span className="d-none d-sm-inline text-primary">
                    Sidebar Ads
                  </span>
                </Link>
              </li>
            </ul>
          </li>
          <li>
            <Link
              href="/admin/admin-access"
              className="nav-link px-0 align-middle"
            >
              <RiAdminFill />{" "}
              <span className="ms-1 d-none d-sm-inline">Admin access</span>
            </Link>
          </li>
          <li>
            <Link href="/admin/settings" className="nav-link px-0 align-middle">
              <IoIosSettings />{" "}
              <span className="ms-1 d-none d-sm-inline">Settings</span>
            </Link>
          </li>
        </ul>

        {/* <hr />
        <div className="dropdown pb-4">
          <a
            href="#"
            className="d-flex align-items-center dropdown-toggle"
            id="dropdownUser1"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span className="d-none d-sm-inline mx-1">User</span>
          </a>
          <ul className="dropdown-menu dropdown-menu-light text-small shadow">
            <li>
              <a className="dropdown-item" href="#">
                Settings
              </a>
            </li>
            <li>
              <a className="dropdown-item" href="#">
                Profile
              </a>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <a className="dropdown-item" href="#">
                Sign out
              </a>
            </li>
          </ul>
        </div> */}
      </div>
    </div>
  );
};

export default AdminSidebar;
