"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import axios from "axios";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import "./flip_v2.css";

const HTMLFlipBook = dynamic(
  () => import("react-pageflip").then((mod) => mod.default || mod.HTMLFlipBook),
  { ssr: false }
);

export default function FlipBookMagazine({ pdfData }) {
  const book = useRef(null);

  const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BUCKET_URL || "";
  const fullPdfUrl = useMemo(() => {
    return `${s3BaseUrl.replace(/\/$/, "")}/${pdfData.replace(/^\/+/, "")}`;
  }, [s3BaseUrl, pdfData]);

  const [pageImages, setPageImages] = useState([]);
  const [loadingPages, setLoadingPages] = useState(true);
  const [volumeMuted, setVolumeMuted] = useState(true);
  const [pageDim, setPageDim] = useState({ width: 200, height: 267 });
  const [containerWidth, setContainerWidth] = useState(400);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      const margin = 40;
      const maxTotal = 1200;
      let totalW = Math.min(w - margin, maxTotal);
      if (totalW < 100) totalW = w;
      let pageW = totalW / 2;
      const minPageW = 150;
      if (pageW < minPageW) {
        pageW = minPageW;
        totalW = pageW * 2;
      }
      const pageH = (pageW * 4) / 3;
      setContainerWidth(totalW);
      setPageDim({ width: pageW, height: pageH });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (!fullPdfUrl) return;

    let cancelled = false;

    async function loadAndRender() {
      if (typeof window === "undefined" || !window.pdfjsLib) return;

      setLoadingPages(true);

      try {
        // ✅ Step 1: Download the PDF as Blob via axios
        const response = await axios.get(fullPdfUrl, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(response.data);

        const pdfjsLib = window.pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        // ✅ Step 2: Load PDF from blob URL
        const loadingTask = pdfjsLib.getDocument(blobUrl);
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        const numPages = pdf.numPages;
        setPageImages(Array(numPages).fill(null));

        // ✅ Step 3: Render each page to canvas
        for (let i = 1; i <= numPages; i++) {
          if (cancelled) break;
          const page = await pdf.getPage(i);
          const scale = pageDim.width / page.getViewport({ scale: 1 }).width;
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const context = canvas.getContext("2d");

          await page.render({ canvasContext: context, viewport }).promise;

          const dataUrl = canvas.toDataURL();
          setPageImages((prev) => {
            const arr = [...prev];
            arr[i - 1] = dataUrl;
            return arr;
          });
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
  }, [fullPdfUrl, pageDim.width]);

  useEffect(() => {
    const disableContextMenu = (e) => e.preventDefault();
    window.addEventListener("contextmenu", disableContextMenu);
    return () => window.removeEventListener("contextmenu", disableContextMenu);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const flipNext = useCallback(() => {
    book.current?.pageFlip().flipNext();
  }, []);

  const flipPrev = useCallback(() => {
    book.current?.pageFlip().flipPrev();
  }, []);

  const onFlipAudio = useCallback(() => {
    if (!volumeMuted) {
      new Audio("/turnpage-99756.mp3").play().catch(() => {});
    }
  }, [volumeMuted]);

  const toggleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.5 : 1));
  };

  return (
    <div>
      <div
        className="flipbook-wrapper"
        style={{
          width: containerWidth,
          margin: "0 auto",
          overflowX: "auto",
          boxShadow: "0 0 10px rgba(0,0,0,0.5)",
          borderRadius: "10px",
          backgroundColor: "#000",
        }}
      >
        {loadingPages && (
          <>
            <button className="custom-nav-button left" onClick={flipPrev}>
              <GrFormPrevious size={32} />
            </button>
            <button className="custom-nav-button right" onClick={flipNext}>
              <GrFormNext size={32} />
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
          {!loadingPages ? (
            <Skeleton width={pageDim.width * 2} height={pageDim.height} />
          ) : (
            <HTMLFlipBook
              width={isFullscreen ? pageDim.width * 2 : pageDim.width}
              height={pageDim.height}
              size="fixed"
              showCover={true}
              ref={book}
              onFlip={onFlipAudio}
              flippingTime={500}
              disableFlipByClick={false}
              swipeDistance={20}
              clickEventForward={false}
              showPageCorners={false}
              style={{ overflow: "hidden" }}
              mobileScrollSupport={false}
              minWidth={isFullscreen ? pageDim.width * 2 : undefined}
            >
              {pageImages.map((src, idx) => (
                <div className="flip-page" key={`page_${idx + 1}`}>
                  {src ? (
                    <img
                      src={src}
                      alt={`Page ${idx + 1}`}
                      width={pageDim.width}
                      height={pageDim.height}
                      style={{ display: "block" }}
                    />
                  ) : (
                    <Skeleton width={pageDim.width} height={pageDim.height} />
                  )}
                </div>
              ))}
            </HTMLFlipBook>
          )}
        </div>
      </div>

      {!loadingPages && (
        <div
          className="position-relative d-flex flex-wrap justify-content-center pt-1"
          style={{
            zIndex: 99,
            color: "white",
            bottom: 20,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "8px",
            padding: "10px 20px",
            maxWidth: containerWidth,
            margin: "0 auto",
          }}
        >
          <div
            title={zoomLevel === 1 ? "Zoom In" : "Zoom Out"}
            className="circle-button"
            onClick={toggleZoom}
          >
            {zoomLevel === 1 ? "➕" : "➖"}
          </div>

          <div
            title="Zoom In"
            className="circle-button"
            onClick={() =>
              setPageDim((prev) => ({
                width: prev.width + 20,
                height: ((prev.width + 20) * 4) / 3,
              }))
            }
          >
            🔍
          </div>

          <div
            title="Volume"
            className="circle-button"
            onClick={() => setVolumeMuted(!volumeMuted)}
          >
            {volumeMuted ? "🔇" : "🔊"}
          </div>

          <div
            title="Fullscreen"
            className="circle-button"
            onClick={() => {
              const el = document.documentElement;
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                el.requestFullscreen().catch(() => {});
              }
            }}
          >
            ⛶
          </div>

          <a
            title="Download PDF"
            className="circle-button"
            href={fullPdfUrl}
            download
            style={{ textDecoration: "none", color: "white" }}
          >
            ⬇️
          </a>
        </div>
      )}
    </div>
  );
}
