import React from "react";
import "./service.css";

const Services = () => {
  const services = [
    {
      title: "Content Creation",
      description:
        "Boost your brand with captivating website content that connects and converts. Ready to make an impact? Contact us today!",
      icon: "📝", // Writing/Content icon
    },
    {
      title: "Advertising",
      description:
        "Amplify your brand with targeted, AI-driven website advertising that boosts engagement and drives growth. Ready to reach the right audience? Contact us today!",
      icon: "📢", // Megaphone for advertising
    },
    {
      title: "Branding",
      description:
        "Elevate your brand with dynamic website branding and mass communication powered by our in-house AI tool. Ready to lead the market? Contact us now!",
      icon: "🎨", // Paint palette for branding
    },
    {
      title: "Marketing Development",
      description:
        "Boost your business with expert digital marketing, lead generation, and website marketing development strategies. Need help growing your business? Contact us today!",
      icon: "📈", // Graph for marketing growth
    },
  ];

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Our Services</h2>
      <div className="row">
        {services.map((service, index) => (
          <div className="col-lg-3 col-md-6 mb-4" key={index}>
            <div className="card h-100 border-0 shadow-sm text-center p-3 card__container">
              <h5 className="card-title mb-3 card__title">
                {service.title} <span className="">{service.icon}</span>
              </h5>
              <p className="card-text card__text">{service.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
