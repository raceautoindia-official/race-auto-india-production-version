'use client'
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import ChatBot from "react-chatbotify";
import emailjs from "@emailjs/browser";
import { toast } from 'react-toastify';

// Detect if the user is on desktop or mobile
const isDesktop = !(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

const FloatingChatBot = () => {
  const router = useRouter();
  const [latestNews, setLatestNews] = useState([])

  const latestNewsApi = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/latest-news`)

      const data = res.data.map(item => {
        return {
          title: item.title, // Assuming 'title' exists in item
          link: `${process.env.NEXT_PUBLIC_BACKEND_URL}${item.title_slug}`
        };
      });
      setLatestNews(data.slice(0, 5))
    } catch (err) {
      console.log(err)
    }
  }


  const helpOptions = [
    "Subscription Inquiries",
    "Explore Our Services",
    "Payment Assistance",
    "Latest News Coverage",
    "Advertising",
    "Other Queries"
  ];

  const subscriptionOptions = [
    "Plans",
    "Payments Methods",
    "Discounts",
    "Others",
    "Back"
  ];

  const planOptions = [
    "Silver Plan",
    "Gold Plan",
    "Platinum Plan",
    "Back"
  ];

  const serviceOptions = [
    "Content Creation",
    "Advertising",
    "Branding",
    "Marketing Development",
    "Back"
  ];

  const paymentOptions = [
    "Issues with the Payment Methods",
    "Plan Not Activated",
    "Payment Dispute",
    "Upgrade Issues",
    "Others",
    "Back"
  ];


  const styles = {
    chatButtonStyle: { background: 'pink', marginBottom: 50 },
    chatInputAreaStyle: { minHeight: 15 },
    chatInputAreaFocusedStyle: { minHeight: 15 },
    tooltipStyle: { marginBottom: 50 },
  };

  const settings = {
    voice: { disabled: true },
    audio: { disabled: true },
    botBubble: { simStream: true, showAvatar: true, avatar: '/images/chat-bot-icon.webp' },
    chatHistory: { storageKey: "floating_chatbot", },
    tooltip: { mode: "NEVER" },
    header: { title: 'Race Team', showAvatar: true, avatar: '/images/chat-bot-icon.webp' },
    chatButton: { icon: '/images/chat-bot-icon.webp', },
    notification: { volume: 0.1 },
    chatWindow: { defaultOpen: isDesktop },
    footer: { text: 'RACE EDITORIALE' },
    fileAttachment: { disabled: true },
    emoji: { disabled: true }
  };

  const flow = {
    start: {
      message: "Hello, I am Olivia 👋! Welcome to Race Auto India’s chatbot. How can I assist you today?",
      transition: { duration: 0 },
      path: "show_options",
      chatDisabled: true
    },
    show_options: {
      message: "Here are a few helpful things you can check out:",
      options: helpOptions,
      path: "process_options"
    },
    process_options: {
      transition: { duration: 0 },
      chatDisabled: true,
      path: async (params) => {
        switch (params.userInput) {
          case "Subscription Inquiries":
            return "subscription_options";
          case "Explore Our Services":
            return "service_options";
          case "Payment Assistance":
            return "payment_options";
          case "Latest News Coverage":
            return "news_options";
          case "Advertising":
            return "advertising_options";
          case "Other Queries":
            return "other_queries";
          default:
            return "unknown_input";
        }
      },
    },

    // Subscription Inquiry Flow
    subscription_options: {
      message: "Please choose from the following subscription-related topics:",
      options: subscriptionOptions,
      path: async (params) => params.userInput === "Back" ? "show_options" : "process_subscription"
    },
    process_subscription: {
      transition: { duration: 0 },
      chatDisabled: true,
      path: async (params) => {
        switch (params.userInput) {
          case "Plans":
            return "plan_details";
          case "Payments Methods":
            return "message_payment_methods";
          case "Discounts":
            return "message_discounts";
          case "Others":
            return "message_others"
          case "Back":
            return "show_options"
          default:
            return "unknown_input";
        }
      }
    },
    plan_details: {
      message: "We offer three subscription plans: Gold, Silver, and Platinum.",
      options: planOptions,
      path: async (params) => params.userInput === "Back" ? "subscription_options" : "plan_info"
    },
    plan_info: {
      transition: { duration: 0 },
      path: async (params) => {
        switch (params.userInput) {
          case "Gold Plan":
            // Delay to ensure the chat message appears
            return "message_gold"; // Respond in chat before navigation

          case "Silver Plan":
            return "message_silver";

          case "Platinum Plan":
            return "message_platinum";

          case "Compare Plans":
            return "message_compare";

          default:
            return "unknown_input";
        }
      }
    },

    message_gold: {
      message: "✨ Gold Plan includes premium content access, priority support, and monthly analytics reports.",
      transition: { duration: 1000 },
      path: "back_option"
    },
    message_silver: {
      message: "🥈 Silver Plan gives access to most content, standard support, and quarterly analytics reports.",
      // options: silverPlan.length !== 0 ? silverPlan : null,
      transition: { duration: 1000 },
      path: "back_option"
    },
    message_platinum: {
      message: "🏆 Platinum Plan offers full access, top-priority support, custom reports, and exclusive events.",
      // options: platinumPlan.length !== 0 ? platinumPlan : null,
      transition: { duration: 1000 },
      path: "back_option"
    },
    // message_compare: {
    //   message: "Gold: Premium access + Priority support. Silver: Standard access + Standard support. Platinum: All-inclusive + Exclusive perks.",
    //   transition: { duration: 1000 },
    //   path: "back_option"
    // },

    know_more: {
      message: "You are currently on the subscription page, where you can view all details about the plan. Do you need any further assistance?",
      options: ['Main menu', 'Previous Menu'],
      path: async (params) => params.userInput === "Main menu" ? 'subscription_options' : "plan_details"
    },
    // Back option path
    back_option: {
      message: "Would you like to know more about this plan?",
      options: ["Yes", "No"],
      path: async (params) => {
        if (params.userInput === "Yes") {
          setTimeout(() => {
            router.push("/subscription"); // Navigate after chatbot response
          }, 500); // Delay ensures the message appears first
          return "know_more"; // Chatbot continues to "know_more"
        }
        return "plan_details";
      }
    },

    message_payment_methods: {
      message: "We support online payments, including UPI, QR scanner, debit/credit cards, and net banking. To learn more about manual payment, please click the button below.",
      options: ["Back", "Manual Payment"],
      path: async (params) => params.userInput === "Manual Payment"
        ? "manual_payment_info"
        : "subscription_options"
    },

    manual_payment_info: {
      message: "Please mail us your information at kh@raceinnovations.in. Our team will reach out within 24 working hours.",
      options: ["Back"],
      path: "message_payment_methods"
    },

    message_discounts: {
      message: "We offer various discounts based on the plan you select. To know more, please choose a plan below.",
      options: ["Silver", "Gold", "Platinum", "Back"],
      path: async (params) => {
        switch (params.userInput) {
          case "Silver":
            return "silver_discount";
          case "Gold":
          case "Platinum":
            return "gold_platinum_discount";
          default:
            return "subscription_options";
        }
      }
    },

    silver_discount: {
      message: "Currently, no promo codes are available for the Silver plan.",
      options: ["Back"],
      path: "message_discounts"
    },

    gold_platinum_discount: {
      message: "For this plan, you will receive a 5% discount on monthly subscriptions with the promo code RACE5 and a 10% discount on annual subscriptions with the promo code RACE10.",
      options: ["Back"],
      path: "message_discounts"
    },


    message_others: {
      message: "For any other inquiries like upgradation or customization, feel free to reach out to us at **kh@raceinnovations.in** with your contact details. Our team will respond within 24 working hours.",
      options: ["Back"],
      path: "subscription_options"
    },



    payment_options: {
      message: `For any payment-related issues, please select an option below.`,
      options: paymentOptions,
      path: async (params) => {
        switch (params.userInput) {
          case "Payment Method Issues":
            return "ask_email_payment_method";
          case "Plan Not Activated":
            return "ask_email_payment_not_activated";
          case "Payment Dispute":
            return "ask_email_payment_value_dispute";
          case "Upgrade Issues":
            return "ask_email_payment_upgrade";
          case "Others":
            return "ask_email_payment_other";
          default:
            return "unknown_input";
        }
      }
    },

    ask_email_payment_method: {
      message: "If you're having payment issues, try updating details or using another method. Still unresolved? Share your email for further assistance.",
      function: (params) => sendEmail(params.userInput, "Payment Method Issue"),
      path: "confirm_email",
    },

    ask_email_payment_not_activated: {
      message: "If your plan isn’t activated, verify the payment or check for banking issues. Still facing trouble? Provide your email or contact us at kh@raceinnovations.in with payment proof.",
      function: (params) => sendEmail(params.userInput, "Payment Not Activated Issue"),
      path: "confirm_email",
    },

    ask_email_payment_value_dispute: {
      message: "If your payment amount is incorrect, check with your bank. Still an issue? Enter your email or contact us at kh@raceinnovations.in with proof.",
      function: (params) => sendEmail(params.userInput, "Payment Value Dispute"),
      path: "confirm_email",
    },

    ask_email_payment_upgrade: {
      message: "It seems you're facing an issue with upgrading your payment plan. Please enter your email for assistance.",
      function: (params) => sendEmail(params.userInput, "Payment Upgrade Issue"),
      path: "confirm_email",
    },

    ask_email_payment_other: {
      message: "For any other payment-related issues, please provide your email so we can assist you.",
      function: (params) => sendEmail(params.userInput, "Other Payment Issue"),
      path: "confirm_email",
    },

    confirm_email: {
      message: `Our team will reach out within 24 hours regarding your issue.`,
      options: ["Back"],
      path: "payment_options"
    },

    // Function to send email


    // Service Flow
    service_options: {
      message: "Explore our various services below:",
      options: serviceOptions,
      path: async (params) => params.userInput === "Back" ? "show_options" : "services_process"
    },

    services_process: {
      transition: { duration: 0 },
      path: async (params) => {
        switch (params.userInput) {
          case "Content Creation":
            return "message_content_creation";
          case "Advertising":
            return "message_advertising";
          case "Branding":
            return "message_branding";
          case "Marketing Development":
            return "message_marketing_development";
          default:
            return "unknown_input";
        }
      }
    },

    message_content_creation: {
      message: "Our content creation services include high-quality articles, blogs, videos, and social media content tailored to engage your audience. Let us craft compelling stories for your brand. For inquiries, reach out to us at **kh@raceinnovations.in**.",
      options: ["Back"],
      path: "service_options"
    },

    message_advertising: {
      message: "We provide strategic advertising solutions, including digital ads, print media, and social media promotions to maximize your brand’s reach and engagement. For more details, contact us at **kh@raceinnovations.in**.",
      options: ["Back"],
      path: "service_options"
    },

    message_branding: {
      message: "Our branding services help establish a strong brand identity through logo design, visual aesthetics, and messaging that resonates with your target audience. To discuss your branding needs, email us at **kh@raceinnovations.in**.",
      options: ["Back"],
      path: "service_options"
    },

    message_marketing_development: {
      message: "We create tailored marketing strategies, including market research, campaign planning, and execution, to help grow your business effectively. For expert guidance, reach us at **kh@raceinnovations.in**.",
      options: ["Back"],
      path: "service_options"
    },


    // Additional Sections
    news_options: {
      message: "Here you can explore our latest news updates or report any issues with published articles.",
      options: [
        "Latest News Updates",
        "Segment Specific Updates",
        "Issues with Published News",
        "Back"
      ],
      path: async (params) => params.userInput === "Back" ? "show_options" : "news_process"
    },

    news_process: {
      transition: { duration: 0 },
      path: async (params) => {
        switch (params.userInput) {
          case "Latest News Updates":
            return "message_latest_news";
          case "Segment Specific Updates":
            return "message_segment_updates";
          case "Data Upgradation":
            return "message_data_upgradation";
          case "Issues with Published News":
            return "message_news_issues";
          default:
            return "unknown_input";
        }
      }
    },

    message_segment_updates: {
      message: `Explore the latest updates in different segments:\n
      - [Cars](${process.env.NEXT_PUBLIC_BACKEND_URL}/news/cars)\n
      - [Bikes](${process.env.NEXT_PUBLIC_BACKEND_URL}/news/bikes)\n
      - [ThreeWheeler](${process.env.NEXT_PUBLIC_BACKEND_URL}/news/3w)\n
      - [Agricultural Machinery](${process.env.NEXT_PUBLIC_BACKEND_URL}/news/agriculture)\n
      - [Construction and Machinery](${process.env.NEXT_PUBLIC_BACKEND_URL}/news/construction)\n
      - [Commercial Vehicles](${process.env.NEXT_PUBLIC_BACKEND_URL}/news/commercial-vehicles)`,
      options: ["Back"],
      path: "news_options"
    },



    message_latest_news: {
      message: latestNews.map(news => `${news.title} - [Read More](${news.link})`).join("\n"),
      options: ["Back"],
      path: "news_options"
    },


    message_news_issues: {
      message: `**📢 Report Issues with Published News**\n\n
      If you find any inaccuracies or need corrections in an article, please provide the following details:\n
      - **Article Title** 📝  
      - **Your Concern** 🧐  
      - **Required Changes** ✍️  
      - **Your Email ID** 📧  
      - **Your Phone Number** 📞\n\n
      Send the details to **[kh@raceinnovations.in](mailto:kh@raceinnovations.in)**, and our team will review and update the article as needed.`,
      options: ["⬅️ Back"],
      path: "news_options"
    },

    advertising_options: {
      message: `For advertising inquiries, please select an option below.`,
      options: ["Web Advertising", "Magazine Advertising", "Others", "Back"],
      path: async (params) => {
        switch (params.userInput) {
          case "Web Advertising":
            return "ask_email_web_advertising";
          case "Magazine Advertising":
            return "ask_email_magazine_advertising";
          case "Others":
            return "ask_email_advertising_other";
          case "Back":
            return "process_options"
          default:
            return "unknown_input";
        }
      }
    },

    ask_email_web_advertising: {
      message: "To advertise on our website, please provide your email ID for further details.",
      function: (params) => sendEmail(params.userInput, "Web Advertising Inquiry"),
      path: "confirm_advertising_email",
    },

    ask_email_magazine_advertising: {
      message: "To advertise in our magazine, please provide your email ID for further details.",
      function: (params) => sendEmail(params.userInput, "Magazine Advertising Inquiry"),
      path: "confirm_advertising_email",
    },

    ask_email_advertising_other: {
      message: "For any other advertising inquiries, please provide your email ID so we can assist you.",
      function: (params) => sendEmail(params.userInput, "Other Advertising Inquiry"),
      path: "confirm_advertising_email",
    },

    confirm_advertising_email: {
      message: `Our team will reach out within 24 hours regarding your advertising inquiry.`,
      options: ["Back"],
      path: "advertising_options"
    },

    other_queries: {
      message: "Please let us know your query, and our team will get back to you shortly.",
      path: "show_options"
    },

    unknown_input: {
      message: "Sorry, I didn't understand that. Could you please select an option below?",
      options: helpOptions,
      path: "process_options"
    }
  };

  const sendEmail = (userEmail, issueType) => {
    const templateParams = {
      user_email: userEmail,
      message: `${issueType}. User Email: ${userEmail}`,
    };

    emailjs
      .send("service_ozx53eb", "template_kfrvsrl", templateParams, {
        publicKey: "KUwUOlg39l7VrDi7m",
      })
      .then(
        () => {
          toast.success("Message Submitted! Our team will contact you soon.", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        },
        (error) => {
          console.log(error);
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
      );
  }

  useEffect(() => {

    latestNewsApi()
  }, [])

  return (
    <ChatBot id="floating-chat-bot" flow={flow} settings={settings} styles={styles}></ChatBot>
  );
};

export default FloatingChatBot;
