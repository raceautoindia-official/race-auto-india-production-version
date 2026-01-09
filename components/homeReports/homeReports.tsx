'use client';
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import ClientReportContent from './ClientReportContent';


const ReportPlayer = dynamic(() => import('./ReportsVideo'), { ssr: false });

type ReportData = {
  title: string;
  summary: string;
  image_url: string;
};

const HomeReports = (): JSX.Element => {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/reports`, {
          cache: 'no-store',
        });
        const data = await res.json();
        setReport(data[0]);
      } catch (err) {
        console.error(err);
        setError('Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error || !report) return <p>{error || 'No report found.'}</p>;

  return <ClientReportContent data={report} />;
};

export default HomeReports;
