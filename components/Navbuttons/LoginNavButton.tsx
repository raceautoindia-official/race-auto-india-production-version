// "use client";

// import React from "react";
// import { CiLogin } from "react-icons/ci";
// import ProfileButton from "./ProfileButton";
// import Cookies from "js-cookie";
// import AuthModal from "@/app/test/components/LoginFormTest";
// import { useAuthModal } from "@/utils/AuthModelProvider";

// const LoginNavButton = () => {
//   const token = Cookies.get("authToken") || null;
//   const { show, close, open } = useAuthModal();

//   if (!token) {
//     return (
//       <>
//         <CiLogin
//           onClick={open}
//           size={25}
//           style={{ cursor: "pointer" }}
//           className="ms-auto"
//         />
//         {show && <AuthModal show={show} onClose={close} />}
//       </>
//     );
//   }

//   return <ProfileButton token={token} />;
// };

// export default LoginNavButton;


"use client";

import React, { useState } from "react";
import { CiLogin } from "react-icons/ci";
import ProfileButton from "./ProfileButton";
import Cookies from "js-cookie";
import AuthModal from "@/app/test/components/LoginFormTest";

const LoginNavButton = () => {
  const token = Cookies.get("authToken") || null;
  const [show, setShow] = useState(false);

  const openModal = () => setShow(true);
  const closeModal = () => setShow(false);

  if (!token) {
    return (
      <>
        <CiLogin
          onClick={openModal}
          size={25}
          style={{ cursor: "pointer" }}
          className="ms-auto"
        />
        {show && <AuthModal show={show} onClose={closeModal} />}
      </>
    );
  }

  return <ProfileButton token={token} />;
};

export default LoginNavButton;
