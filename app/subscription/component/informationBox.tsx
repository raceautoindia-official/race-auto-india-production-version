import React from "react";

const InfoBox = () => {
  return (
    <>
      <div className="card text-white mb-3 shadow-lg border-0">
        <div className="card-header bg-primary">Information</div>
        <div className="card-body text-dark">
          <div className="promo-box">
            <p>
              <strong>
                To avail the discount from 10-50%, reach us at 9384857578 /
                9962110101 or mail us at raceautoindia@gmail.com
              </strong>
            </p>
            <p>
              Bronze package can be availed free in the first month on the
              confirmation of any of the premium packages.
            </p>
            <p className="note display-6">
              <strong>NOTE:</strong> Exclusive new article - content should be
              provided by you before the 20th of every month. Our team will
              ensure its publishing on the website and magazine on priority.
            </p>
            <p className="highlight p-0 m-0">
              <strong>RACE FLASH REPORT:</strong> Forecast and analytics package
              is additional, reach us for more details.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfoBox;
