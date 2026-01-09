/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/display-name */
"use client";

import "core-js/full/promise/with-resolvers";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { IoExit, IoVolumeHighSharp, IoVolumeMuteSharp } from "react-icons/io5";
import { IoIosPlay, IoMdPause, IoMdExit } from "react-icons/io";
import HTMLFlipBook from "react-pageflip";
import { pdfjs, Document, Page as ReactPdfPage } from "react-pdf";
import axios from "axios";
import { FaPrint } from "react-icons/fa";
import { useRouter, useParams } from "next/navigation";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { Carousel } from "react-bootstrap";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import "./flip_v2.css";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Page = forwardRef(({ pageNumber, zoomLevel }, ref) => (
  <div ref={ref}>
    <ReactPdfPage pageNumber={pageNumber} width={360 * zoomLevel} />
  </div>
));

export default function TestMobile({ token, pdfData }) {
  const book = useRef();
  const router = useRouter();
  const { title_slug } = useParams();

  const [totalPage, setTotalPage] = useState(0);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [volume, setVolume] = useState(false);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [youtubeResults, setYoutubeResults] = useState([]);
  const [articleResults, setArticleResults] = useState([]);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const autoplayRef = useRef(null);

  const decoded = token ? jwtDecode(token) : { email: "", role: "user" };
  const showActionButtons =
    ["admin", "ad team", "moderator"].includes(decoded.role) ||
    (subscriptionData.length > 0 &&
      new Date(subscriptionData[0].end_date) > new Date());

  // Fetch subscription status once
  useEffect(() => {
    if (decoded.email) fetchSubscription();
  }, [decoded.email]);

  const fetchSubscription = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/purchase/${decoded.email}`
      );
      setSubscriptionData(res.data);
    } catch (err) {
      console.error("Subscription fetch error:", err);
    }
  };

  // Autoplay controls
  const startAutoplay = () => {
    if (!isAutoplay) {
      setIsAutoplay(true);
      autoplayRef.current = setInterval(
        () => book.current.pageFlip().flipNext(),
        2000
      );
    }
  };
  const stopAutoplay = () => {
    setIsAutoplay(false);
    clearInterval(autoplayRef.current);
  };
  const toggleAutoplay = () =>
    isAutoplay ? stopAutoplay() : startAutoplay();

  // onFlip: only for entitled users
  const onFlip = useCallback(
    async (e) => {
      if (!showActionButtons) return;

      const audio = new Audio("/turnpage-99756.mp3");
      if (!volume) audio.play();

      try {
        const pageIndex = e.data;
        const pdfUrl = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${pdfData}`;
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdfDoc = await loadingTask.promise;
        const pageObj = await pdfDoc.getPage(pageIndex + 1);
        const txtContent = await pageObj.getTextContent();
        const text = txtContent.items.map((i) => i.str).join(" ");

        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}api/search-youtube`,
          { text }
        );
        setYoutubeResults(data.youtubeVideos || []);
        setArticleResults(data.postResults || []);
      } catch (err) {
        console.error("Error on flip:", err);
      }
    },
    [volume, pdfData, showActionButtons]
  );

  // PDF load handlers
  const handleLoadSuccess = ({ numPages }) => {
    setTotalPage(numPages);
    setPdfLoading(false);
  };
  const handleLoadError = (err) => {
    console.error("PDF load error:", err);
    setPdfLoading(false);
  };

  // Keyboard nav
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") book.current.pageFlip().flipNext();
      if (e.key === "ArrowLeft") book.current.pageFlip().flipPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const pages = Array.from({ length: totalPage }, (_, i) => i + 1);

  return (
    <>
      {pdfLoading && (
        <div className="d-flex justify-content-center mt-2">
          <Skeleton height={510} width={360} />
        </div>
      )}

      <Document
        file={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${pdfData}`}
        onLoadSuccess={handleLoadSuccess}
        onLoadError={handleLoadError}
      >
        <HTMLFlipBook
          width={180}
          height={254.52}
          ref={book}
          showCover
          onFlip={onFlip}
          flippingTime={500}
          disableFlipByClick
          swipeDistance={20}
          clickEventForward={false}
          showPageCorners={false}
          style={{ overflow: "hidden" }}
        >
          {pages.map((pg) => (
            <Page key={pg} pageNumber={pg} zoomLevel={zoomLevel} />
          ))}
        </HTMLFlipBook>
      </Document>

      {!pdfLoading && (
        <div className="row mt-2 justify-content-center align-items-center">
          <div className="d-flex justify-content-center pt-1" style={{ zIndex: 99 }}>
            <GrFormPrevious
              title="Previous"
              onClick={() => book.current.pageFlip().flipPrev()}
              style={{ cursor: "pointer", background: "#32bea6", borderRadius: 100 }}
              className="mx-2 p-1"
              size={23}
            />
            <GrFormNext
              title="Next"
              onClick={() => book.current.pageFlip().flipNext()}
              style={{ cursor: "pointer", background: "#32bea6", borderRadius: 100 }}
              className="mx-2 p-1"
              size={23}
            />

            {showActionButtons && (
              <>
                {volume ? (
                  <IoVolumeMuteSharp
                    title="Mute"
                    onClick={() => setVolume(false)}
                    style={{ cursor: "pointer", background: "#32bea6", borderRadius: 100 }}
                    className="mx-2 p-1"
                    size={23}
                  />
                ) : (
                  <IoVolumeHighSharp
                    title="Volume"
                    onClick={() => setVolume(true)}
                    style={{ cursor: "pointer", background: "#32bea6", borderRadius: 100 }}
                    className="mx-2 p-1"
                    size={23}
                  />
                )}

                <div onClick={toggleAutoplay}>
                  {isAutoplay ? (
                    <IoMdPause
                      title="Pause"
                      className="mx-2 p-1"
                      style={{ cursor: "pointer", background: "#32bea6", borderRadius: 100 }}
                      size={23}
                    />
                  ) : (
                    <IoIosPlay
                      title="AutoPlay"
                      className="mx-2 p-1"
                      style={{ cursor: "pointer", background: "#32bea6", borderRadius: 100 }}
                      size={23}
                    />
                  )}
                </div>

                <FaPrint
                  onClick={() => window.print()}
                  title="Print"
                  className="mx-2 p-1"
                  style={{ cursor: "pointer", background: "#32bea6", borderRadius: 100 }}
                  size={23}
                />
              </>
            )}

            <IoMdExit
              title="Exit"
              onClick={() => router.push("/magazine")}
              className="mx-2 p-1"
              style={{ cursor: "pointer", background: "#32bea6", borderRadius: 100 }}
              size={23}
            />
          </div>
        </div>
      )}

      {showActionButtons ? (
        <>
          {/* Related Videos */}
          {youtubeResults.length > 0 && (
            <div className="mt-4 px-4">
              <h3 className="text-center" style={{ color: "white", marginBottom: 8 }}>
                Related Videos
              </h3>
              <Swiper
                modules={[Autoplay]}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                navigation
                pagination={{ clickable: true }}
                loop
                spaceBetween={20}
                slidesPerView={1}
              >
                {youtubeResults.map((v) => (
                  <SwiperSlide key={v.id}>
                    <a
                      href={`https://www.youtube.com/watch?v=${v.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        position: "relative",
                        aspectRatio: "16/9",
                        overflow: "hidden",
                        borderRadius: 8,
                      }}
                    >
                      <img
                        src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                        alt={v.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          right: 8,
                          backgroundColor: "rgba(0,0,0,0.5)",
                          padding: "6px 10px",
                          fontSize: "13px",
                          color: "white",
                          borderRadius: 4,
                          textAlign: "center",
                        }}
                      >
                        {v.title}
                      </div>
                    </a>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {/* Related Articles */}
          {articleResults.length > 0 && (
            <div className="mt-4 px-4">
              <h3 className="text-center" style={{ color: "white", marginBottom: 8 }}>
                Related Articles
              </h3>
              <Swiper
                modules={[Autoplay]}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                navigation
                pagination={{ clickable: true }}
                loop
                spaceBetween={20}
                slidesPerView={1}
              >
                {articleResults.map((art) => (
                  <SwiperSlide key={art.title_slug}>
                    <Link
                      href={`/post/${art.title_slug}`}
                      style={{
                        display: "block",
                        position: "relative",
                        aspectRatio: "16/9",
                        overflow: "hidden",
                        borderRadius: 8,
                      }}
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${art.image}`}
                        alt={art.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: 8,
                          left: 8,
                          right: 8,
                          backgroundColor: "rgba(0,0,0,0.5)",
                          padding: "6px 10px",
                          fontSize: "13px",
                          color: "white",
                          borderRadius: 4,
                          textAlign: "center",
                        }}
                      >
                        {art.title}
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </>
      ) : (
        /* Locked Preview */
        <div className="mt-4 px-3 position-relative">
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
              {[1, 2].map((_, i) => (
                <Carousel.Item key={i}>
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
    </>
  );
}
