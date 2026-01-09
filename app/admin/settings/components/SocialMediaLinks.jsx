'use client'
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const SocialMediaForm = () => {
  const [facebookUrl, setFacebookUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [pinterestUrl, setPinterestUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [vkUrl, setVkUrl] = useState("");
  const [telegramUrl, setTelegramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");

  const getSocialMediaLinks = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/settings/social-media`,

      );
      const {
        facebook_url,
        twitter_url,
        instagram_url,
        pinterest_url,
        linkedin_url,
        vk_url,
        telegram_url,
        youtube_url,
      } = res.data[0];
      setFacebookUrl(facebook_url || '');
      setTwitterUrl(twitter_url || '');
      setInstagramUrl(instagram_url || '');
      setPinterestUrl(pinterest_url || '');
      setLinkedinUrl(linkedin_url || '');
      setVkUrl(vk_url || '');
      setTelegramUrl(telegram_url || '');
      setYoutubeUrl(youtube_url || '');

    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/settings/social-media`,
        {
          facebook_url: facebookUrl,
          twitter_url: twitterUrl,
          instagram_url: instagramUrl,
          pinterest_url: pinterestUrl,
          linkedin_url: linkedinUrl,
          vk_url: vkUrl,
          telegram_url: telegramUrl,
          youtube_url: youtubeUrl,
        },
      );
      toast.success("Social media links submitted", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (err) {
      console.log(err);
      toast.warn(
        "An error occurred while submitting the form. Please try again later.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
  };

  useEffect(() => {
    getSocialMediaLinks();
  }, []);

  return (
    <>
      <div className="col-12">
        <div className="shadow-sm p-3 mb-5 mt-5 bg-white rounded border-0">
          <div className="row">
            <div className="form-group">
              <label htmlFor="facebookUrl">Facebook URL</label>
              <input
                type="text"
                className="form-control"
                id="facebookUrl"
                name="facebookUrl"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="twitterUrl ">Twitter URL</label>
              <input
                type="text"
                className="form-control"
                id="twitterUrl"
                name="twitterUrl"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="instagramUrl">Instagram URL</label>
              <input
                type="text"
                className="form-control"
                id="instagramUrl"
                name="instagramUrl"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="pinterestUrl">Pinterest URL</label>
              <input
                type="text"
                className="form-control"
                id="pinterestUrl"
                name="pinterestUrl"
                value={pinterestUrl}
                onChange={(e) => setPinterestUrl(e.target.value)}
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="linkedinUrl">LinkedIn URL</label>
              <input
                type="text"
                className="form-control"
                id="linkedinUrl"
                name="linkedinUrl"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="vkUrl">VK URL</label>
              <input
                type="text"
                className="form-control"
                id="vkUrl"
                name="vkUrl"
                value={vkUrl}
                onChange={(e) => setVkUrl(e.target.value)}
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="telegramUrl">Telegram URL</label>
              <input
                type="text"
                className="form-control"
                id="telegramUrl"
                name="telegramUrl"
                value={telegramUrl}
                onChange={(e) => setTelegramUrl(e.target.value)}
              />
            </div>
            <div className="form-group mt-3">
              <label htmlFor="youtubeUrl">YouTube URL</label>
              <input
                type="text"
                className="form-control"
                id="youtubeUrl"
                name="youtubeUrl"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
            </div>

          </div>
          <button className="btn btn-primary mt-3" onClick={handleSubmit}>
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

export default SocialMediaForm;
