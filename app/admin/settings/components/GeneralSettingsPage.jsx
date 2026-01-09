'use client'
/* eslint-disable react/prop-types */
import { Tab, Tabs } from "react-bootstrap";
import dynamic from "next/dynamic";
const HeaderCode = dynamic(() => import("./HeaderCode"), { ssr: false });
const FontSetting = dynamic(() => import("./Fontsettings"), { ssr: false });
const LogoSettings = dynamic(() => import("./Logo"), { ssr: false });
const ContactForm = dynamic(() => import("./contactSettings"), { ssr: false });
const SocialMediaForm = dynamic(() => import("./SocialMediaLinks"), { ssr: false });
const SettingsForm = dynamic(() => import("./Settings"), { ssr: false });

const Admin_GeneralSettingsPage = () => {
  return (
    <>

        <div className="row">
          <Tabs
            defaultActiveKey="General Settings"
            id="headerTab"
            className="mt-3 ms-3"
          >
            <Tab eventKey="General Settings" title="GeneralSettings" className="">
              <SettingsForm />
            </Tab>
            <Tab eventKey="Header Code" title="Header Code" className="">
              <HeaderCode />
            </Tab>
            <Tab eventKey="Font style" title="Font style" className="">
              <FontSetting />
            </Tab>
            <Tab eventKey="Logo Settings" title="Logo Settings" className="">
              <LogoSettings />
            </Tab>
            <Tab eventKey="contact Settings" title="Contact Settings" className="">
              <ContactForm />
            </Tab>
            <Tab eventKey="Social Media Settings" title="Social Media Settings" className="">
              <SocialMediaForm />
            </Tab>
          </Tabs>
      </div>
    </>
  );
};

export default Admin_GeneralSettingsPage;
