export const dynamic = "force-dynamic"
import React from 'react';
import Home from './Home';
import MobileHome from '@/components/mobile-view/Home';
import styles from './page.module.css';

const page = () => {
  return (
    <>
      <div className={styles.desktopOnly}>
        <Home />
      </div>
      <div className={styles.mobileOnly}>
        <MobileHome />
      </div>
    </>
  );
};

export default page;
