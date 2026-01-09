import React, { Suspense } from "react";
import Video from './MobileVideo'

const ReactPlayer_Server = () => {
  return (
    <Suspense fallback={<p>Loading video...</p>}>
      <Video />
    </Suspense>
  );
};

export default ReactPlayer_Server;