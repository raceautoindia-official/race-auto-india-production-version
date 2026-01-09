import React from "react";
import Image from "next/image";

const defaultImage = "/race/image-8.png";

function Business({ image }) {
  const imageSrc = image || defaultImage;

  return (
    <div className="container-fluid">
      <h5 className="mt-2">Business</h5>
      <div className="row">
        {[1, 2].map((_, idx) => (
          <div key={idx} className="col-6">
            <div>
              <div
                style={{ position: "relative", width: "100%", height: "200px" }}
              >
                <Image
                  src={imageSrc}
                  alt="news"
                  fill
                  className="rounded object-fit-cover"
                />
              </div>
              <p className="mt-2">
                TIL Limited Rolls out 400th Hyster-TIL ReachStacker
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Business;
