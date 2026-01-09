/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/display-name */
"use client";
import "core-js/full/promise/with-resolvers";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import { IoExit, IoVolumeHighSharp, IoVolumeMuteSharp } from "react-icons/io5";
import { IoMdDownload } from "react-icons/io";
import HTMLFlipBook from "react-pageflip";
import { pdfjs, Document, Page as ReactPdfPage } from "react-pdf";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaCheck } from "react-icons/fa";
import { useRouter, useParams } from "next/navigation";
import "./page.css";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Page = forwardRef(({ pageNumber }, ref) => {
  return (
    <div ref={ref}>
      <ReactPdfPage pageNumber={pageNumber} width={400} />
    </div>
  );
});

function Test() {
  const book = useRef();
  const router = useRouter(); // Next.js router for navigation
  const params = useParams(); // Use Next.js useParams hook for dynamic route
  const { title_slug } = params;
  const [pdf_url, setPdf_url] = useState("");
  const [file, setFile]=useState(null)
  const [totalPage, setTotalPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [pdfloading, setPdfloading] = useState(true);
  const [volume, setVolume] = useState(false);
  const [isMobile, setIsMobile] = useState(false);


  const pdfData = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine/${title_slug}`,
      );
      setPdf_url(res.data[0].pdf_url);
    } catch (err) {
      console.log(err);
    }
  };


  const handleLoadSuccess = async(pdfObject) => {
    const totalPages = pdfObject.numPages;
    setTotalPage(totalPages);
    setPdfloading(false);
    const data = await pdfObject.getData()
    const blob = new Blob([data], { type: 'application/pdf' })
    setFile(URL.createObjectURL(blob))
  };

  const handleLoadProgress = ({ loaded, total }) => {
    setLoadingProgress((loaded / total) * 100); // Calculate loading progress as a percentage
  };



  
  // const onFlip = useCallback(() => {
  //   const audio = new Audio(pageFlipSound);
  //   if (!volume) {
  //     audio.play();
  //   } else {
  //     audio.pause();
  //   }
  // }, [volume]);

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
        { once: true },
      );
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    pdfData();

    window.addEventListener("keydown", handleKeyPress);
    window.addEventListener("touchstart", handleTouchStart);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("resize", handleResize);
    };
  }, []);


  return (
    <>
    


    {pdfloading && <div className="d-flex justify-content-center mt-2"><Skeleton height={510} width={360}/></div>}
   
      <Document
        file={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${pdf_url}`}
        style={{ width: "100%", aspectRatio: "1.4/1" }}
        onLoadSuccess={handleLoadSuccess}
        onLoadProgress={handleLoadProgress}
        onLoadError={(error) => {
          console.error("Error loading PDF: ", error);
          setPdfloading(false);
        }}
      >
        <HTMLFlipBook
          width={360}
          height={510}
          ref={book}
          showCover={true}
          // onFlip={onFlip}
          flippingTime={500}
          disableFlipByClick={!isMobile}
          swipeDistance={20}
          clickEventForward={false}
          showPageCorners={false}
          style={{ overflow: "hidden" }}
          className="mt-2"
        >
          {pagesMap.map((item, i) => (
            <Page key={i} pageNumber={i + 1} scale={2.0}></Page>
          ))}
        </HTMLFlipBook>
      </Document>
      <div className="row mt-2  justify-content-center align-items-center">
        <div
          className="d-flex justify-content-center pt-1"
          style={{ zIndex: 99, backgroundColor: "white", color: "black" }}
        >
          <GrFormPrevious
            onClick={() => {
              book.current.pageFlip().flipPrev("top");
              if (currentPage !== 1) {
                setCurrentPage((pre) => pre - 1);
              }
            }}
            style={{ cursor: "pointer" }}
            className="mx-2"
            size={25}
          />
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
              className="btn btn-dark p-0 px-1 m-0 mb-1"
              style={{ borderRadius: 0 }}
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
              className="mx-3"
              style={{
                backgroundColor: "#212529",
                padding: 2,
                color: "white",
              }}
            >
              <b>{totalPage}</b>
            </p>
          )}
          <GrFormNext
            onClick={() => {
              book.current.pageFlip().flipNext("top");
              if (currentPage !== totalPage / 2) {
                setCurrentPage((pre) => pre + 1);
              }
            }}
            style={{ cursor: "pointer" }}
            className=""
            size={25}
          />

          {/* {volume ? (
            <IoVolumeMuteSharp
              onClick={() => {
                setVolume(false);
              }}
              style={{ cursor: "pointer" }}
              className="mx-3"
              size={25}
            />
          ) : (
            <IoVolumeHighSharp
              onClick={() => {
                setVolume(true);
              }}
              style={{ cursor: "pointer" }}
              className="mx-3"
              size={25}
            />
          )} */}
          {/* <a
            href={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${pdf_url}`}
            style={{
              cursor: "pointer",
              textDecoration: "none",
              color: "inherit",
            }}
            className="mx-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            <IoMdDownload size={25} />
          </a> */}
          <IoExit
            onClick={() => {
              router.push("/magazine");
            }}
            style={{ cursor: "pointer" }}
            className="mx-3"
            size={25}
          />
        </div>
      </div>
     
    </>
  );
}

export default Test;
