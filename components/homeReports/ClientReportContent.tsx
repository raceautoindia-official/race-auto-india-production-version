'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ReportPlayer = dynamic(() => import('./ReportsVideo'), { ssr: false });

type ReportData = {
  title: string;
  summary: string;
  image_url: string;
};

const ClientReportContent = ({ data }: { data: ReportData }): JSX.Element => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1200);
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const truncateText = (text: string, wordLimit: number): string => {
    const words = text.split(" ");
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  const summaryContent = isMobile
    ? expanded
      ? data.summary
      : truncateText(data.summary, 50)
    : data.summary;

  return (
    <div className="row my-5">
      <div className="col-lg-4">
        <h2 className="mb-3" style={{ fontWeight: 700 }}>Report</h2>
        <h5 className="mb-3">{data.title}</h5>
        <p>
          {summaryContent}
          {isMobile && data.summary.split(" ").length > 50 && (
            <span
              onClick={() => setExpanded(!expanded)}
              style={{ color: "#007bff", cursor: "pointer", marginLeft: "5px" }}
            >
              {expanded ? "Show Less" : "Read More"}
            </span>
          )}
        </p>
      </div>
      <div className="col-lg-8">
        <div style={{ width: "100%", aspectRatio: "16/9", position: "relative" }}>
          <ReportPlayer url={data.image_url} />
        </div>
      </div>
    </div>
  );
};

export default ClientReportContent;
