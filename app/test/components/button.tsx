'use client'
const DownloadDB = () => {
    const handleDownload = () => {
      window.location.href =`${process.env.BACKEND_URL}api/test/db`;
    };
  
    return (
      <button 
        onClick={handleDownload} 
        style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
      >
        📥 Download Database
      </button>
    );
  };
  
  export default DownloadDB;