/* eslint-disable @next/next/no-img-element */
'use client'

import axios from "axios";
import { useEffect, useState } from "react";
import { Dropdown, Modal, Table } from "react-bootstrap";
import Link from "next/link";
import { FaCheck } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { toast } from "react-toastify";


const RecommendedArticles = () => {

    const [data, setData] = useState([]);

    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const monthIndex = date.getMonth();
        const month = months[monthIndex];
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month} ${day}, ${year}`;
    };



    const handlePostType = async () => {
        try {
            const res = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL
                }api/admin/post/is_available/is_recommended`,
            );
            setData(res.data);
        } catch (err) {
            console.log(err)
        }
    }

    const handleRemoveAvailable = async (id, type) => {
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
            handlePostType();
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

    const handleAddAvailable = async (id, type) => {
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
            handlePostType();
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

    useEffect(() => {
        handlePostType()
    }, [])
    return (
        <>
                
           
            <div className="container-fluid mt-4">
                <Table className="text-center">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Post</th>
                            <th>Category</th>
                            <th>Author</th>
                            <th>Pageviews</th>
                            <th>Posted Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.id}>

                                <td>{item.id}</td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <Link className="link-style" href={`/post/${item.title_slug}`}>
                                            <img
                                                loading="lazy"
                                                src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_small
                                                    }`}
                                                className="image-fluid"
                                                style={{ width: 80 }}
                                                alt={item.id}
                                            ></img>
                                        </Link>
                                        <p className="ms-3 text-small p-0 m-0">{item.title}</p>

                                    </div>
                                    <div>
                                        {item.is_slider == 1 && <span className='mx-1' style={{
                                            backgroundColor: "brown",
                                            borderRadius: 25,
                                            fontSize: 11,
                                            padding: 5,
                                            fontWeight: 700,
                                            color: "white",
                                        }}>Slider</span>}
                                        {item.is_featured == 1 && <span className='mx-1' style={{
                                            backgroundColor: "grey",
                                            borderRadius: 25,
                                            fontSize: 11,
                                            padding: 5,
                                            fontWeight: 700,
                                            color: "white",
                                        }}>featured</span>}
                                        {item.is_breaking == 1 && <span className='mx-1' style={{
                                            backgroundColor: "red",
                                            borderRadius: 25,
                                            fontSize: 11,
                                            padding: 5,
                                            fontWeight: 700,
                                            color: "white",
                                        }}>Breaking</span>}
                                        {item.is_recommended == 1 && <span className='mx-1' style={{
                                            backgroundColor: "green",
                                            borderRadius: 25,
                                            fontSize: 11,
                                            padding: 5,
                                            fontWeight: 700,
                                            color: "white",
                                        }}>Exclusive</span>}
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex table-badge flex-column">
                                        <p
                                            className="text-small px-2 mb-3"
                                            style={{
                                                backgroundColor: item.color,
                                                borderRadius: 25,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color: "white",
                                            }}
                                        >
                                            {item.main_category}
                                        </p>
                                        <p
                                            className="text-small px-2 "
                                            style={{
                                                backgroundColor: item.color,
                                                borderRadius: 25,
                                                fontSize: 11,
                                                fontWeight: 700,
                                                color: "white",
                                            }}
                                        >
                                            {item.sub_category}
                                        </p>
                                    </div>
                                </td>
                                <td>{item.username}</td>
                                <td>{item.pageviews}</td>

                                <td>{formatDate(item.created_at)}</td>
                                <td>
                                    <Dropdown>
                                        <Dropdown.Toggle variant="info" id="dropdown-basic">
                                            Actions
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            {item.is_breaking == 1 && (
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        handleRemoveAvailable(item.id, "is_breaking")
                                                    }
                                                >
                                                    <FaCheck color="green" /> Breaking
                                                </Dropdown.Item>
                                            )}
                                            {item.is_breaking == 0 && (
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        handleAddAvailable(item.id, "is_breaking")
                                                    }
                                                >
                                                    <MdClose size={20} color="red" /> Breaking
                                                </Dropdown.Item>
                                            )}
                                            {item.is_featured == 1 && (
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        handleRemoveAvailable(item.id, "is_featured")
                                                    }
                                                >
                                                    <FaCheck color="green" /> Featured
                                                </Dropdown.Item>
                                            )}
                                            {item.is_featured == 0 && (
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        handleAddAvailable(item.id, "is_featured")
                                                    }
                                                >
                                                    <MdClose size={20} color="red" /> Featured
                                                </Dropdown.Item>
                                            )}
                                            {item.is_recommended == 1 && (
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        handleRemoveAvailable(item.id, "is_recommended")
                                                    }
                                                >
                                                    <FaCheck color="green" /> Exclusive
                                                </Dropdown.Item>
                                            )}
                                            {item.is_recommended == 0 && (
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        handleAddAvailable(item.id, "is_recommended")
                                                    }
                                                >
                                                    <MdClose size={20} color="red" /> Exclusive
                                                </Dropdown.Item>
                                            )}
                                            {item.is_slider == 1 && (
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        handleRemoveAvailable(item.id, "is_slider")
                                                    }
                                                >
                                                    <FaCheck color="green" /> Slider
                                                </Dropdown.Item>
                                            )}
                                            {item.is_slider == 0 && (
                                                <Dropdown.Item
                                                    onClick={() =>
                                                        handleAddAvailable(item.id, "is_slider")
                                                    }
                                                >
                                                    <MdClose size={20} color="red" /> Slider
                                                </Dropdown.Item>
                                            )}
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

            </div>
        </>
    )
}

export default RecommendedArticles