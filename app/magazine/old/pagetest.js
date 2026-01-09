"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useCallback } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { useParams } from "next/navigation";
import { getDocument, GlobalWorkerOptions, version } from "pdfjs-dist/webpack";
import "./flip_v2.css";
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import Link from "next/link";

const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

export default function FlipBookMagazine() {
  const bookRef = useRef(null);

  const [file, setFile] = useState(null);
  const [pageImages, setPageImages] = useState([]);
  const [pageTexts, setPageTexts] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [volumeMuted, setVolumeMuted] = useState(true);
  const [pageDim, setPageDim] = useState({ width: 300, height: 424 });
  const [containerWidth, setContainerWidth] = useState(400);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const [showVideoButton, setShowVideoButton] = useState(false);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [youtubeResults, setYoutubeResults] = useState([]);
  const [videoSidebarVisible, setVideoSidebarVisible] = useState(false);
  const [postResults, setPostResults] = useState([]);
  const [autoPlayActive, setAutoPlayActive] = useState(false);

  const { title_slug } = useParams();

  useEffect(() => {
    GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.js`;
  }, []);

  useEffect(() => {
    async function fetchPDFUrl() {
      try {
        const res = await fetch(`/api/magazine/${title_slug}`);
        const data = await res.json();
        if (data[0]?.pdf_url) setFile(data[0].pdf_url);
        else console.error("No URL found for title_slug");
      } catch (err) {
        console.error("Error fetching PDF URL", err);
      }
    }
    if (title_slug) fetchPDFUrl();
  }, [title_slug]);

  useEffect(() => {
    function updateSize() {
      const w = window.innerWidth;
      const margin = 40;
      const maxTotal = 1000;
      let totalW = Math.min(w - margin, maxTotal);
      if (totalW < 300) totalW = 300;
      let pageW = totalW / 2;
      const minPageW = 150;
      if (pageW < minPageW) {
        pageW = minPageW;
        totalW = pageW * 2;
      }
      const scaleFactor = 0.9;
      const a4Ratio = 1.414;
      const pageH = pageW * a4Ratio;
      setContainerWidth(totalW * scaleFactor);
      setPageDim({ width: pageW * scaleFactor, height: pageH * scaleFactor });
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // ✅ FIXED AUTOPLAY
  useEffect(() => {
    if (!autoPlayActive || !bookRef.current) return;

    const intervalId = setInterval(() => {
      const api = bookRef.current?.pageFlip();
      if (api?.hasNextPage()) {
        api.flipNext();
      } else {
        setAutoPlayActive(false);
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [autoPlayActive]);

  useEffect(() => {
    let cancelled = false;
    if (!file) return;

    async function loadAndRender() {
      setLoadingPages(true);
      try {
        const pdf = await getDocument(`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${file}`).promise;
        const newImages = [];
        const newTexts = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) break;
          const page = await pdf.getPage(i);

          const scale = pageDim.width / page.getViewport({ scale: 1 }).width;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          await page.render({ canvasContext: context, viewport }).promise;
          newImages.push(canvas.toDataURL());

          const textContent = await page.getTextContent();
          const items = textContent.items;
          const ys = items.map((item) => item.transform[5]);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);
          const yRange = maxY - minY;

          const bodyItems = items.filter((item) => {
            const y = item.transform[5];
            const relativeY = (y - minY) / yRange;
            return relativeY > 0.15 && relativeY < 0.85;
          });

          let bodyText = bodyItems.map((item) => item.str).join(" ").replace(/\s+/g, " ").trim();
          bodyText = bodyText.replace(/\b(Page|Pg)\s*\d+\b/gi, "");
          bodyText = bodyText.replace(/\b\d{4}\b/g, "");
          bodyText = bodyText.replace(/\b\d+\b/g, "");
          bodyText = bodyText.replace(/\s+/g, " ").trim();

          let titleMatch = bodyText.match(/['"“”‘’](.{5,100}?)['"“”‘’]/);
          let pageTitle = "";
          if (titleMatch) {
            pageTitle = titleMatch[1].trim();
          } else {
            let candidates = bodyText
              .split(/\.|\?|!/g)
              .map((s) => s.trim())
              .filter((s) => s.length > 10);
            pageTitle = candidates.sort((a, b) => b.length - a.length)[0] || bodyText;
          }

          pageTitle = pageTitle.replace(/\b(Page|Pg)\s*\d+\b/gi, "");
          pageTitle = pageTitle.replace(/\b\d{4}\b/g, "");
          pageTitle = pageTitle.replace(/\b\d+\b/g, "");
          pageTitle = pageTitle.replace(/\s+/g, " ").trim();

          newTexts.push(pageTitle);
        }

        if (!cancelled) {
          setPageImages(newImages);
          setPageTexts(newTexts);
        }
      } catch (err) {
        console.error("Error loading PDF", err);
      } finally {
        if (!cancelled) setLoadingPages(false);
      }
    }

    loadAndRender();
    return () => {
      cancelled = true;
    };
  }, [file, pageDim.width]);

  useEffect(() => {
    const disableContextMenu = (e) => e.preventDefault();
    window.addEventListener("contextmenu", disableContextMenu);
    return () => window.removeEventListener("contextmenu", disableContextMenu);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const onFlipHandler = useCallback(
    (e) => {
      if (!volumeMuted) {
        new Audio("/turnpage-99756.mp3").play().catch(() => {});
      }
      const page = e?.data;
      if (page !== undefined) {
        setCurrentPage(page);
        setShowVideoButton(page >= 10);
      }
    },
    [volumeMuted]
  );

  const toggleZoom = () => setZoomLevel((prev) => (prev === 1 ? 1.5 : 1));

  // ✅ FIXED PRINT
  const handlePrint = () => {
    if (!file) return;
    window.open(`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${file}`, "_blank");
  };

  const handleVideoSearch = async () => {
  setVideoSidebarVisible(true);
  setLoadingVideos(true);
  setYoutubeResults([]);
  setPostResults([]);

  // Extract text from current page or fallback
  let queryText = (pageTexts[currentPage] && pageTexts[currentPage].trim()) || "";
  if (queryText.length < 5) {
    queryText = `${title_slug} Magazine`;
  } else {
    queryText = queryText.split(" ").slice(0, 6).join(" ");
  }

  // Clean and format the query text
  const cleanQueryText = (str) => {
    return str
      .replace(/\b(Page|Pg|Magazine|India)\b/gi, "") // Remove common junk terms
      .replace(/\b\d{4}\b/g, "")                     // Remove 4-digit years
      .replace(/\b\d+\b/g, "")                       // Remove all numbers
      .replace(/[^\w\s]/gi, "")                      // Remove punctuation
      .replace(/\s+/g, " ")                          // Collapse multiple spaces
      .trim();
  };

  const toTitleCase = (str) => {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
  };

  queryText = toTitleCase(cleanQueryText(queryText));

  try {
    const res = await fetch("/api/search-youtube", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: queryText }),
    });
    const data = await res.json();
    setYoutubeResults(data?.youtubeVideos || []);
    setPostResults(data?.postResults || []);
  } catch (err) {
    console.error("Error searching videos", err);
  } finally {
    setLoadingVideos(false);
  }
};


  return (
    <>
      <div className="container-fluid mt-4 pdf-container">
        <div className="d-flex flex-column flex-md-row" style={{ gap: "20px", alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <div className="flipbook-wrapper" style={{ width: containerWidth }}>
              {!loadingPages && (
                <>
                  <button
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "10px",
                      pointerEvents: "none",
                      transform: "translateY(-50%)",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      border: "none",
                      borderRadius: "50%",
                      width: "48px",
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                    }}
                  >
                    <GrFormPrevious size={32} color="white" />
                  </button>
                  <button
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "10px",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      backgroundColor: "rgba(0,0,0,0.5)",
                      border: "none",
                      borderRadius: "50%",
                      width: "48px",
                      height: "48px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                    }}
                  >
                    <GrFormNext size={32} color="white" />
                  </button>
                </>
              )}

              <div
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: "top center",
                  transition: "transform 0.3s ease",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {loadingPages ? (
                  <Skeleton width={pageDim.width * 2} height={pageDim.height} />
                ) : (
                  <HTMLFlipBook
                    width={isFullscreen ? pageDim.width * 2 : pageDim.width}
                    height={pageDim.height}
                    showPageCorners={false}
                    ref={bookRef}
                    onFlip={onFlipHandler}
                    flippingTime={500}
                    disableFlipByClick={false}
                    swipeDistance={20}
                    style={{ overflow: "hidden" }}
                    mobileScrollSupport={true}
                  >
                    {pageImages.map((src, idx) => (
                      <div className="flip-page" key={`page_${idx + 1}`}>
                        <img
                          src={src}
                          alt={`Page ${idx + 1}`}
                          width={pageDim.width}
                          height={pageDim.height}
                          style={{
                            display: "block",
                            width: pageDim.width,
                            height: pageDim.height,
                          }}
                        />
                      </div>
                    ))}
                  </HTMLFlipBook>
                )}
              </div>
            </div>

            {!loadingPages && (
              <div className="bottom-controls mt-3">
                <div title={zoomLevel === 1 ? "Zoom In" : "Zoom Out"} className="circle-button" onClick={toggleZoom}>
                  {zoomLevel === 1 ? "➕" : "➖"}
                </div>
                <div title="Volume" className="circle-button" onClick={() => setVolumeMuted(!volumeMuted)}>
                  {volumeMuted ? "🔇" : "🔊"}
                </div>
                <div title="Fullscreen" className="circle-button" onClick={() => {
                    const el = document.documentElement;
                    if (document.fullscreenElement) {
                      document.exitFullscreen();
                    } else {
                      el.requestFullscreen().catch(() => {});
                    }
                  }}>
                  ⛶
                </div>
                <a title="Download PDF" className="circle-button" href={file} download style={{ textDecoration: "none", color: "white" }}>
                  ⬇️
                </a>
                
                {/* <div
                  title={autoPlayActive ? "Stop Autoplay" : "Start Autoplay"}
                  className="circle-button"
                  onClick={() => setAutoPlayActive(!autoPlayActive)}
                >
                  {autoPlayActive ? "⏸️" : "▶️"}
                </div> */}
                {/* <div title="Print" className="circle-button" onClick={handlePrint}>
                  🖨️
                </div> */}
                {showVideoButton && (
                  <button className="circle-button" onClick={handleVideoSearch} disabled={loadingVideos} title="Get Related Videos">
                    🎥
                  </button>

                )}
                <Link
                  title="Exit"
                  className="circle-button exit-button"
                  href="/magazine"
                  style={{ textDecoration: "none", color: "white" }}
                >
                   Exit
                </Link>
              </div>
            )}
          </div>

          {videoSidebarVisible && (
            <div style={{ width: "360px" }}>
              <h4 className="text-white">Related Videos</h4>
              {loadingVideos && <p>Loading...</p>}
              {!loadingVideos && youtubeResults.length === 0 && <p className="text-white">No videos found.</p>}
              {!loadingVideos && youtubeResults.length > 0 && (
                <Swiper spaceBetween={10} slidesPerView={1}   autoplay={{ delay: 2000, disableOnInteraction: false }} style={{ width: "100%", height: "auto" }}>
                  {youtubeResults.map((video, idx) => (
                    <SwiperSlide key={idx}>
                      <div className="video-item mb-3">
                        <a href={video.url} target="_blank" rel="noopener noreferrer">
                          <img src={video.thumbnail} alt={video.title} className="img-fluid" />
                        </a>
                        <div>
                          <a href={video.url} target="_blank" rel="noopener noreferrer">
                            {video.title.slice(0, 30)}
                            {video.title.length > 30 ? "..." : ""}
                          </a>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}

              <h4 className="mt-4 text-white">Related Posts</h4>
              {loadingVideos && <p>Loading...</p>}
              {!loadingVideos && postResults.length === 0 && <p className="text-white">No posts found.</p>}
              {!loadingVideos && postResults.length > 0 && (
                <Swiper
                  spaceBetween={10}
                  slidesPerView={1}
                  style={{ width: "100%", height: "auto" }}
                  modules={[Autoplay]}
                  autoplay={{ delay: 2000, disableOnInteraction: false }}
                >
                  {postResults.map((post, idx) => (
                    <SwiperSlide key={`post_${idx}`}>
                      <div className="video-item mb-3">
                        <img
                          src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${post.image}`}
                          alt={post.title}
                          className="img-fluid text-white"
                        />
                        <div className="text-white">{post.title}</div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
