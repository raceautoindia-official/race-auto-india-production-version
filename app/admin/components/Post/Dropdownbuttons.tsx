"use client";
import Dropdown from "react-bootstrap/Dropdown";
import React, { useState } from "react";
import { adminPostList } from "./ArticleList";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaCheck } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import Link from "next/link";
const Dropdownbuttons = ({ item }: { item: adminPostList }) => {
  const router = useRouter();

  const handleRemoveAvailable = async (id: number, type: string) => {
    const toastId = toast.loading("Processing...");
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/available/${type}`,
        {
          id: id,
        }
      );
      toast.update(toastId, {
        render: "Successfully removed!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      toast.update(toastId, {
        render: "Failed to remove!",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.log(err);
    }
  };

  const handleAddAvailable = async (id: number, type: string) => {
    const toastId = toast.loading("Processing...");
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/add-available/${type}`,
        {
          id: id,
        }
      );
      toast.update(toastId, {
        render: "Successfully Added!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      router.refresh();
    } catch (err) {
      toast.update(toastId, {
        render: "Failed to Add!",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.log(err);
    }
  };

  return (
    <Dropdown>
      <Dropdown.Toggle variant="info" id="dropdown-basic">
        Actions
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Link href={`/admin/article/${item.id}`}>
          <p className="dropdown-item m-0 p-0 ms-3">Edit</p>
        </Link>
        {item.is_breaking == 1 && (
          <Dropdown.Item
            onClick={() => handleRemoveAvailable(item.id, "is_breaking")}
          >
            <FaCheck color="green" /> Breaking
          </Dropdown.Item>
        )}
        {item.is_breaking == 0 && (
          <Dropdown.Item
            onClick={() => handleAddAvailable(item.id, "is_breaking")}
          >
            <MdClose size={20} color="red" /> Breaking
          </Dropdown.Item>
        )}
        {item.is_featured == 1 && (
          <Dropdown.Item
            onClick={() => handleRemoveAvailable(item.id, "is_featured")}
          >
            <FaCheck color="green" /> Featured
          </Dropdown.Item>
        )}
        {item.is_featured == 0 && (
          <Dropdown.Item
            onClick={() => handleAddAvailable(item.id, "is_featured")}
          >
            <MdClose size={20} color="red" /> Featured
          </Dropdown.Item>
        )}
        {item.is_recommended == 1 && (
          <Dropdown.Item
            onClick={() => handleRemoveAvailable(item.id, "is_recommended")}
          >
            <FaCheck color="green" /> Recommended
          </Dropdown.Item>
        )}
        {item.is_recommended == 0 && (
          <Dropdown.Item
            onClick={() => handleAddAvailable(item.id, "is_recommended")}
          >
            <MdClose size={20} color="red" /> Recommended
          </Dropdown.Item>
        )}
        {item.is_slider == 1 && (
          <Dropdown.Item
            onClick={() => handleRemoveAvailable(item.id, "is_slider")}
          >
            <FaCheck color="green" /> Slider
          </Dropdown.Item>
        )}
        {item.is_slider == 0 && (
          <Dropdown.Item
            onClick={() => handleAddAvailable(item.id, "is_slider")}
          >
            <MdClose size={20} color="red" /> Slider
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default Dropdownbuttons;
