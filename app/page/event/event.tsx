import React from "react";
import EventCard, { eventType } from "./eventCard";
import Sidebar from "@/components/Sidebar/Sidebar";

const Event = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/event`, {
    cache: "no-cache",
  });
  const data: eventType[] = await res.json();

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <div className="row">
              {data.map((item) => (
                <EventCard key={item.id} item={item} />
              ))}
            </div>
          </div>
          <Sidebar />
        </div>
      </div>
    </>
  );
};

export default Event;
