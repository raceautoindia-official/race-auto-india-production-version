/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/display-name */
"use client";
import "core-js/full/promise/with-resolvers";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { IoExit, IoVolumeHighSharp, IoVolumeMuteSharp } from "react-icons/io5";
import { IoIosPlay, IoMdDownload, IoMdExit, IoMdPause } from "react-icons/io";
import HTMLFlipBook from "react-pageflip";
import { pdfjs, Document, Page as ReactPdfPage } from "react-pdf";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaCheck, FaLock, FaPrint } from "react-icons/fa";
import { useRouter, useParams } from "next/navigation";
import "./flip_v2.css";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { MagazineSlider } from "./SliderMagazine/Slider";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import MagazineAd from "@/components/GoogleAds/MagazineAd";
import Link from "next/link";
import { Carousel } from "react-bootstrap";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const Page = forwardRef(({ pageNumber }, ref) => {
  return (
    <div ref={ref} className="mt-2">
      <ReactPdfPage pageNumber={pageNumber} width={460} />
    </div>
  );
});

function Test({ token, pdfData }) {

  const book = useRef();
  const router = useRouter(); // Next.js router for navigation
  const params = useParams(); // Use Next.js useParams hook for dynamic route
  const { title_slug } = params;
  const [pdf_url, setPdf_url] = useState("");
  const [file, setFile] = useState(null);
  const [totalPage, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [pdfloading, setPdfloading] = useState(true);
  const [volume, setVolume] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [subcriptionData, setSubcriptionData] = useState([]);
  const [youtubeResults, setYoutubeResults] = useState([]);
  const [articleResults, setArticleResults] = useState([]);
  const decoded = token ? jwtDecode(token) : { email: "", role: "user" };
  const autoplayRef = useRef(null);

  // Helper to check if action buttons should be visible.
  // Buttons will be visible if user is admin OR if the subscription exists and its status is 'Active'.
  const showActionButtons =
    ["admin", "ad team", "moderator"].includes(decoded.role) ||
    (subcriptionData.length !== 0 && new Date(subcriptionData[0].end_date) > new Date());


  // const pdfData = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine/${title_slug}`
  //     );
  //     setPdf_url(res.data[0].pdf_url);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // };

  const subscriptionApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/purchase/${decoded.email}`
      );
      setSubcriptionData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const flipNextPage = () => {
    book.current.pageFlip().flipNext("top");
    setCurrentPage((prev) => prev + 1);
  };

  const handleLoadSuccess = async (pdfObject) => {
    const totalPages = pdfObject.numPages;
    setTotalPage(totalPages);
    setPdfloading(false);
    const data = await pdfObject.getData();
    const blob = new Blob([data], { type: "application/pdf" });
    setFile(URL.createObjectURL(blob));
  };

  const handleLoadProgress = ({ loaded, total }) => {
    setLoadingProgress((loaded / total) * 100); // Calculate loading progress as a percentage
  };

  const startAutoplay = () => {
    if (!isAutoplay) {
      setIsAutoplay(true);
      autoplayRef.current = setInterval(flipNextPage, 2000);
    }
  };

  const stopAutoplay = () => {
    setIsAutoplay(false);
    clearInterval(autoplayRef.current);
    autoplayRef.current = null;
  };

  const toggleAutoplay = () => {
    if (isAutoplay) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  };

  const onFlip = useCallback(async (e) => {
    const isFreeUser = !["admin", "ad team", "moderator"].includes(decoded.role) ||
      (subcriptionData.length === 0 || new Date(subcriptionData[0].end_date) < new Date());

    if (isFreeUser) return;
    const audio = new Audio("/turnpage-99756.mp3");
    if (!volume) audio.play();

    try {
      const pageIndex = e.data || currentPage - 1;
      const pdfUrl = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${pdfData}`;
      const loadingTask = pdfjs.getDocument(pdfUrl);
      const pdfDoc = await loadingTask.promise;
      const pageObj = await pdfDoc.getPage(pageIndex + 1);
      const txtContent = await pageObj.getTextContent();
      const text = txtContent.items.map((item) => item.str).join(" ");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/search-youtube`,
        { text }
      );

      const {
        youtubeVideos = [],
        postResults = [],
      } = response.data;

      setYoutubeResults(youtubeVideos);
      setArticleResults(postResults);
    } catch (err) {
      console.error("Error extracting or sending content:", err);
    }
  }, [volume, pdfData, currentPage]);

  const pagesMap = new Array(totalPage).fill(0);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowRight") {
        book.current.pageFlip().flipNext();
      } else if (e.key === "ArrowLeft") {
        book.current.pageFlip().flipPrev();
      }
    };

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      const startX = touch.clientX;

      const handleTouchMove = (e) => {
        const touch = e.touches[0];
        const currentX = touch.clientX;

        if (currentX - startX > 50) {
          book.current.pageFlip().flipPrev();
          window.removeEventListener("touchmove", handleTouchMove);
        } else if (startX - currentX > 50) {
          book.current.pageFlip().flipNext();
          window.removeEventListener("touchmove", handleTouchMove);
        }
      };

      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener(
        "touchend",
        () => {
          window.removeEventListener("touchmove", handleTouchMove);
        },
        { once: true }
      );
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // pdfData();

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("touchstart", handleTouchStart);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const frameRef = useRef(null);

  useEffect(() => {
    if (currentPage > totalPage) {
      stopAutoplay();
    }
  }, [currentPage]);

  useEffect(() => {
    if (decoded.email !== "") {
      subscriptionApi();
    }
  }, []);

  // useEffect(() => {
  //   const handleKeyDown = (e) => {
  //     // Block F12
  //     if (e.key === "F12") {
  //       e.preventDefault();
  //     }
  //     // Block Ctrl+Shift+I or Ctrl+Shift+J or Ctrl+U
  //     if (
  //       (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J")) ||
  //       (e.ctrlKey && e.key === "U")
  //     ) {
  //       e.preventDefault();
  //     }
  //   };

  //   document.addEventListener("keydown", handleKeyDown);

  //   return () => {
  //     document.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, []);

  return (
    <div onContextMenu={(e) => e.preventDefault()}>
      {file && (
        <iframe
          ref={frameRef}
          src={file}
          style={{ display: "none" }}
        ></iframe>
      )}

      {pdfloading && (
        <div className="d-flex justify-content-center mt-2">
          <Skeleton height={510} width={360} />
        </div>
      )}
      <div className="magazine-slider ms-4">
        <MagazineSlider />
      </div>
      <div style={{ position: "relative" }}>
        <Document
          file={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${pdfData}`}
          onLoadSuccess={handleLoadSuccess}
          onLoadProgress={handleLoadProgress}
          onLoadError={(error) => {
            console.error("Error loading PDF: ", error);
            setPdfloading(false);
          }}
        >
          <HTMLFlipBook
            width={460}
            height={660}
            ref={book}
            showCover={true}
            onFlip={onFlip}
            flippingTime={500}
            disableFlipByClick={!isMobile}
            swipeDistance={20}
            clickEventForward={false}
            showPageCorners={false}
            style={{ overflow: "hidden" }}
          >
            {pagesMap.map((item, i) => (
              <Page key={i} pageNumber={i + 1} scale={2.0} />
            ))}
          </HTMLFlipBook>
        </Document>

        {/* Prev Button */}
        <GrFormPrevious
          title="Previous"
          onClick={() => {
            book.current.pageFlip().flipPrev("top");
            if (currentPage !== 1) {
              setCurrentPage((pre) => pre - 1);
            }
          }}
          className="flipbook-arrow flipbook-prev"
          color="white"
          size={45}
        />

        {/* Next Button */}
        <GrFormNext
          title="Next"
          onClick={() => {
            book.current.pageFlip().flipNext("top");
            if (currentPage !== totalPage / 2) {
              setCurrentPage((pre) => pre + 1);
            }
          }}
          className="flipbook-arrow flipbook-next"
          color="white"
          size={45}
        />
      </div>

      {!pdfloading && (
        <div className="row justify-content-center align-items-center">

          <div
            className="position-relative d-flex justify-content-center pt-1"
            style={{
              zIndex: 99,
              color: "black",
              bottom: 20,
              backgroundColor: "rgba(0, 0, 0, 0.5)", // semi-transparent white
              backdropFilter: "blur(8px)", // blur effect
              WebkitBackdropFilter: "blur(8px)", // for Safari support
              borderRadius: "8px", // optional for rounded corners
              padding: "10px 20px" // optional padding
            }}
          >
            {/* <GrFormPrevious
              title="Previous"
              onClick={() => {
                book.current.pageFlip().flipPrev("top");
                if (currentPage !== 1) {
                  setCurrentPage((pre) => pre - 1);
                }
              }}
              style={{
                cursor: "pointer",
                background: "#32bea6",
                borderRadius: 100,
              }}
              className="mx-2"
              color="white"
              size={28}
            /> */}

            <div>
              <input
                type="number"
                min="0"
                value={pageNumber}
                onChange={(e) => setPageNumber(parseInt(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const pageNumberInt = parseInt(pageNumber);
                    if (pageNumberInt > totalPage) {
                      book.current.pageFlip().flip(totalPage - 1);
                    } else {
                      book.current.pageFlip().flip(pageNumberInt - 1);
                    }
                  }
                }}
                style={{ width: "50px" }}
              />
              <button
                title="Go To"
                className="btn btn-dark p-0 px-1 m-0 mb-1 me-1"
                style={{
                  cursor: "pointer",
                  background: "#32bea6",
                  borderRadius: 0,
                }}
                onClick={() => {
                  const pageNumberInt = parseInt(pageNumber);
                  if (pageNumberInt > totalPage) {
                    book.current.pageFlip().flip(totalPage - 1);
                  } else {
                    book.current.pageFlip().flip(pageNumberInt - 1);
                  }
                }}
              >
                <FaCheck />
              </button>
            </div>
            {book.current && (
              <p
                title="Total Page"
                className="mx-2"
                style={{
                  cursor: "pointer",
                  background: "#32bea6",
                  padding: 2,
                  borderRadius: 100,
                  color: "white",
                }}
              >
                <b>{totalPage}</b>
              </p>
            )}
            {/* <GrFormNext
              title="Next"
              onClick={() => {
                book.current.pageFlip().flipNext("top");
                if (currentPage !== totalPage / 2) {
                  setCurrentPage((pre) => pre + 1);
                }
              }}
              style={{
                cursor: "pointer",
                background: "#32bea6",
                color: "white",
                borderRadius: 100,
              }}
              className="mx-2"
              size={28}
            /> */}
            {showActionButtons && (
              <div onClick={toggleAutoplay}>
                {isAutoplay ? (
                  <IoMdPause
                    title="Pause"
                    className="mx-2 p-1"
                    color="white"
                    size={28}
                    style={{
                      cursor: "pointer",
                      background: "#32bea6",
                      borderRadius: 100,
                    }}
                  />
                ) : (
                  <IoIosPlay
                    title="AutoPlay"
                    className="mx-2 p-1"
                    color="white"
                    size={28}
                    style={{
                      cursor: "pointer",
                      background: "#32bea6",
                      borderRadius: 100,
                    }}
                  />
                )}
              </div>
            )}
            {volume ? (
              <IoVolumeMuteSharp
                title="Volume"
                onClick={() => {
                  setVolume(false);
                }}
                style={{
                  cursor: "pointer",
                  background: "#32bea6",
                  borderRadius: 100,
                }}
                className="mx-2 p-1"
                size={28}
              />
            ) : (
              <IoVolumeHighSharp
                title="Volume"
                onClick={() => {
                  setVolume(true);
                }}
                color="white"
                style={{
                  cursor: "pointer",
                  background: "#32bea6",
                  borderRadius: 100,
                }}
                className="mx-2 p-1"
                size={28}
              />
            )}
            {showActionButtons && (
              <a
                href={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${pdfData}`}
                style={{
                  cursor: "pointer",
                  textDecoration: "none",
                  color: "inherit",
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IoMdDownload
                  size={28}
                  title="Download"
                  color="white"
                  className="mx-2 p-1"
                  style={{
                    cursor: "pointer",
                    background: "#32bea6",
                    borderRadius: 100,
                  }}
                />
              </a>
            )}
            {showActionButtons && (
              <FaPrint
                onClick={() => frameRef?.current?.contentWindow.print()}
                title="Print"
                color="white"
                style={{
                  cursor: "pointer",
                  background: "#32bea6",
                  borderRadius: 100,
                }}
                className="mx-2 p-1"
                size={28}
              />
            )}

            <IoMdExit
              title="Exit"
              color="white"
              onClick={() => {
                router.push("/magazine");
              }}
              style={{
                cursor: "pointer",
                background: "#32bea6",
                borderRadius: 100,
              }}
              className="mx-2 p-1"
              size={28}
            />
            <Link href="/subscription"><button className='subscribeButton_magazine ms-2'>Subscribe</button></Link>
          </div>
          <div className="magazine-ad">
            <div className="text-center pt-3 position-relative"><Image style={{ cursor: 'pointer' }} alt='race logo' src='/images/white logo.png' width={60} height={60} onClick={() => router.back()} /></div>
            {/* 
            <div
              className="mt-1"
              style={{
                position: "absolute",
                aspectRatio: "0.5/1",
                width: "90%",
                overflow: 'hidden'

              }}
            >
              <MagazineAd />
            </div> */}
            {showActionButtons ? (
              <>
                {/* YouTube Section */}
                {youtubeResults.length > 0 && (
                  <div className="mt-4 px-4">
                    <h3 style={{ color: 'white', marginBottom: 8 }} className="text-center">Related Videos</h3>
                    <Swiper
                      modules={[Autoplay]}
                      autoplay={{ delay: 4000, disableOnInteraction: false }}
                      dir="ltr"
                      loop
                      spaceBetween={20}
                      slidesPerView={1}
                    >
                      {youtubeResults.map((video) => (
                        <SwiperSlide key={video.id}>
                          <a
                            href={`https://www.youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'block',
                              position: 'relative',
                              aspectRatio: '16 / 9',
                              overflow: 'hidden',
                              borderRadius: 8,
                            }}
                          >
                            <img
                              src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                              alt={video.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 8,
                              }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 8,
                                left: 8,
                                right: 8,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                padding: '6px 10px',
                                fontSize: '13px',
                                color: 'white',
                                borderRadius: 4,
                                textAlign: 'center',
                              }}
                            >
                              {video.title}
                            </div>
                          </a>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}

                {/* Article Section */}
                {articleResults.length > 0 && (
                  <div className="mt-5 px-4" style={{ marginTop: 10 }}>
                    <h3 style={{ color: 'white', marginBottom: 8 }} className="text-center">Related Articles</h3>
                    <Swiper
                      modules={[Autoplay]}
                      autoplay={{ delay: 4000, disableOnInteraction: false }}
                      dir="rtl"
                      loop
                      spaceBetween={20}
                      slidesPerView={1}
                    >
                      {articleResults.map((article, idx) => (
                        <SwiperSlide key={idx}>
                          <Link href={`/post/${article.title_slug}`}
                            style={{
                              display: 'block',
                              position: 'relative',
                              aspectRatio: '16 / 9',
                              overflow: 'hidden',
                              borderRadius: 8,
                            }}
                          >
                            <img
                              src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${article.image}`}
                              alt={article.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: 8,
                              }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 8,
                                left: 8,
                                right: 8,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                padding: '6px 10px',
                                fontSize: '13px',
                                color: 'white',
                                borderRadius: 4,
                                textAlign: 'center',
                              }}
                            >
                              {article.title}
                            </div>
                          </Link>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-4 px-3 position-relative">
                {/* Blurred Placeholder */}
                <div
                  className="bg-dark rounded overflow-hidden"
                  style={{
                    filter: "blur(5px)",
                    pointerEvents: "none",
                    userSelect: "none",
                    height: 200,
                    position: "relative",
                  }}
                >
                  <Carousel interval={4000} pause={false}>
                    {[1, 2].map((_, idx) => (
                      <Carousel.Item key={idx}>
                        <div
                          style={{
                            height: 250,
                            backgroundColor: "#1c1c1c",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#999",
                            fontSize: "16px",
                          }}
                        >
                          Preview Locked – Subscribe to Unlock
                        </div>
                      </Carousel.Item>
                    ))}
                  </Carousel>
                </div>

                {/* Lock Icon */}
                {/* <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    zIndex: 3,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: "50%",
                    padding: 8,
                  }}
                >
                  <FaLock size={18} color="#fff" />
                </div> */}

                {/* Subscription Overlay Box */}
                <div
                  className="position-absolute top-50 start-50 translate-middle text-center px-3"
                  style={{
                    zIndex: 4,
                    background: "rgba(0,0,0,0.85)",
                    padding: "16px 20px",
                    borderRadius: "10px",
                    border: "1px solid #32bea6",
                    maxWidth: 320,
                    width: "90%",
                  }}
                >
                  <h5 style={{ color: "#32bea6", fontWeight: "bold", fontSize: "18px" }}>
                    Premium Content
                  </h5>
                  <p style={{ color: "#eee", fontSize: "14px", marginBottom: "12px" }}>
                    YouTube previews and related articles are available only to subscribers.
                  </p>
                  <Link href="/subscription">
                    <button
                      className="btn"
                      style={{
                        backgroundColor: "#32bea6",
                        color: "white",
                        fontWeight: 600,
                        padding: "6px 18px",
                        fontSize: "14px",
                      }}
                    >
                      🔓 Unlock Now
                    </button>
                  </Link>
                </div>
              </div>
            )}


          </div>
        </div>
      )}
      <audio ref={autoplayRef}>
        <source src="/turnpage-99756.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

export default Test;
