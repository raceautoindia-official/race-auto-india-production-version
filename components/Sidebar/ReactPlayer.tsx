import React, { Suspense } from "react";
import Video from "./Video";

const ReactPlayer_Server = () => {
  return (
    <Suspense fallback={<p>Loading video...</p>}>
      <Video />
    </Suspense>
  );
};

export default ReactPlayer_Server;
