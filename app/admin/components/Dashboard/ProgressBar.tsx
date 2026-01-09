import React from "react";

const ProgressBar = () => {
  return (
    <>
    <h3>Main category</h3>
      <div className="progress mb-3">
        <div
          className="progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          aria-valuenow={75}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ width: "75%" }}
        />
      </div>
      <div className="progress mb-3">
        <div
          className="progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          aria-valuenow={75}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ width: "75%" }}
        />
      </div>
      <div className="progress mb-3">
        <div
          className="progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          aria-valuenow={75}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ width: "75%" }}
        />
      </div>
      <div className="progress mb-3">
        <div
          className="progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          aria-valuenow={75}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ width: "75%" }}
        />
      </div>
    </>
  );
};

export default ProgressBar;
