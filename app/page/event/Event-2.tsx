import React from "react";
import { eventType } from "./eventCard";
import EventCard_2 from "./eventCard-2";
import EventSlider from "./EventSlider";
import ReactPlayer_Server from "./ReactPlayer";
import Link from "next/link";
import Sidebar from "@/components/Sidebar/Sidebar";
import db from "@/lib/db";

const Event_2 = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/event`, {
    cache: "no-cache",
  });
  const data: eventType[] = await res.json();

  const [eventRes]: any = await db.execute(
    `SELECT banner_content FROM event_settings`
  );

  return (
    <>
      <EventSlider />

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7">
            {/* <p className="my-3">
              Drive Your Passion with Exclusive Insights from RACE Auto India!!
            </p>
            <p>
              Subscribe to RACE Auto India today and stay ahead of the curve
              with our exclusive updates, in-depth reviews, and expert analyses
              on the latest in the automotive world.
            </p> */}
            <div
              dangerouslySetInnerHTML={{ __html: eventRes[0].banner_content }}
              style={{ userSelect: "text" }} // Allow text selection
            ></div>
            <Link href="/subscription">
              <button className="btn btn-danger">Subscribe Now</button>
            </Link>
          </div>
          <div className="col-md-5 mt-3">
            <ReactPlayer_Server />
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="row">
              {data.map((item) => (
                <EventCard_2 key={item.id} item={item} />
              ))}
            </div>
          </div>
          <Sidebar />
        </div>
      </div>
    </>
  );
};

export default Event_2;
