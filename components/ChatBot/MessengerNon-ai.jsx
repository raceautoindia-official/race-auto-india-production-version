'use client';

import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';

import AuthModal from '@/app/test/components/LoginFormTest';
import RazorpayPaymentForm from '@/app/subscription/component/subscription-v2/razorpayV2Form';
import { getPlanUITitle } from '@/lib/subscriptionPlan';

const ChatBot = dynamic(
  () => import('react-chatbotify').then((m) => m.default),
  { ssr: false }
);

const UA_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

const PLAN_LABEL_TO_KEY = {
  'Individual Basic': 'bronze',
  'Individual Pro': 'silver',
  Business: 'gold',
  'Business Pro': 'platinum',
};

const PLAN_KEY_TO_LABEL = {
  bronze: getPlanUITitle('bronze'),
  silver: getPlanUITitle('silver'),
  gold: getPlanUITitle('gold'),
  platinum: getPlanUITitle('platinum'),
};

const CHATBOT_HISTORY_KEY = 'floating_chatbot';
const CHATBOT_PURCHASE_INTENT_KEY = 'floating_chatbot_purchase_intent';
const CHATBOT_RESUME_LOCK_KEY = 'floating_chatbot_purchase_resume_lock';

const isValidEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());

const formatSubscriptionDate = (dateValue) => {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  if (!Number.isFinite(date.getTime())) return null;

  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const buildActiveSubscriptionMessage = (subscription) => {
  const planLabel = getPlanUITitle(subscription?.plan_name || 'none');
  const expiryDate = formatSubscriptionDate(subscription?.end_date);
  const accessPrefix = subscription?.is_member
    ? 'You already have active shared access'
    : 'You already have an active subscription';

  if (expiryDate) {
    return `${accessPrefix} to ${planLabel} until ${expiryDate}. You can manage your plan from your profile subscription page.`;
  }

  return `${accessPrefix} to ${planLabel}. You can manage your plan from your profile subscription page.`;
};

const FloatingChatBot = () => {
  const router = useRouter();

  const [latestNews, setLatestNews] = useState([]);
  const [subscriptionRows, setSubscriptionRows] = useState([]);

  const [selectedPlan, setSelectedPlan] = useState('silver');
  const [selectedBillingCycle, setSelectedBillingCycle] =
    useState('annual');
  const [selectedAmount, setSelectedAmount] = useState(0);

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [purchaseStatusMessage, setPurchaseStatusMessage] = useState('');

  const [enquiryTopic, setEnquiryTopic] = useState('General enquiry');

  const isDesktop = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const ua = navigator?.userAgent ?? '';
    return !UA_REGEX.test(ua);
  }, []);

  const latestNewsMessage = useMemo(() => {
    if (!latestNews.length) {
      return 'Latest updates are not available right now. Please check again shortly or visit the latest news page.';
    }

    return latestNews
      .map((news) => `${news.title} - [Read More](${news.link})`)
      .join('\n');
  }, [latestNews]);

  const loadAuthUser = () => {
    const token = Cookies.get('authToken');
    if (!token) {
      setUserEmail('');
      return '';
    }

    try {
      const decoded = jwtDecode(token);
      const email = String(decoded?.email || '').trim();
      setUserEmail(email);
      return email;
    } catch {
      setUserEmail('');
      return '';
    }
  };

  const getPriceFromRows = (
    rows,
    plan,
    cycle
  ) => {
    const key = cycle === 'monthly' ? 'monthly price' : 'annual price';
    const row = rows.find((item) => String(item?.plan || '').toLowerCase() === key);
    return Number(row?.[plan] ?? 0);
  };

  const setSelection = (plan, cycle) => {
    const resolvedCycle = cycle || selectedBillingCycle;
    setSelectedPlan(plan);
    setSelectedBillingCycle(resolvedCycle);
    setSelectedAmount(getPriceFromRows(subscriptionRows, plan, resolvedCycle));
  };

  const submitEnquiryEmail = async (email) => {
    const payload = {
      name: 'Chatbot Enquiry',
      email,
      message: `Chatbot enquiry type: ${enquiryTopic}`,
    };

    await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/contact`, payload);
  };

  const persistPurchaseIntent = (intent) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(CHATBOT_PURCHASE_INTENT_KEY, JSON.stringify(intent));
    sessionStorage.removeItem(CHATBOT_RESUME_LOCK_KEY);
  };

  const readPurchaseIntent = () => {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(CHATBOT_PURCHASE_INTENT_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      sessionStorage.removeItem(CHATBOT_PURCHASE_INTENT_KEY);
      return null;
    }
  };

  const clearPurchaseIntent = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(CHATBOT_PURCHASE_INTENT_KEY);
    sessionStorage.removeItem(CHATBOT_RESUME_LOCK_KEY);
  };

  const appendBotHistoryMessage = (message) => {
    if (typeof window === 'undefined' || !message) return;

    try {
      const raw = localStorage.getItem(CHATBOT_HISTORY_KEY);
      const history = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(history)) return;

      history.push({
        id: `chatbot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        content: message,
        sender: 'BOT',
        type: 'string',
        timestamp: new Date().toUTCString(),
        tags: [],
      });

      localStorage.setItem(CHATBOT_HISTORY_KEY, JSON.stringify(history));
    } catch {
      // If chat history storage is unavailable, skip the resume message quietly.
    }
  };

  const fetchEffectiveSubscription = async (email) => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/effective/${encodeURIComponent(email)}`
    );

    const ownSub = response?.data?.own || null;
    const membershipSub = response?.data?.membership || null;

    return ownSub || membershipSub || null;
  };

  const startCheckoutIfEligible = async ({
    source = 'chatbot',
    email = userEmail,
    intent = null,
  } = {}) => {
    if (!email) {
      return { blocked: true, needsAuth: true };
    }

    try {
      const activeSubscription = await fetchEffectiveSubscription(email);

      if (activeSubscription) {
        const message = buildActiveSubscriptionMessage(activeSubscription);
        setPurchaseStatusMessage(message);
        clearPurchaseIntent();

        if (source === 'resume') {
          appendBotHistoryMessage(message);
        }

        return {
          blocked: true,
          isSubscribed: true,
          message,
        };
      }

      setShowCheckoutModal(true);
      clearPurchaseIntent();

      if (source === 'resume') {
        appendBotHistoryMessage(
          `You're signed in now. Opening secure checkout for ${PLAN_KEY_TO_LABEL[intent?.plan || selectedPlan]} (${intent?.billingCycle || selectedBillingCycle}).`
        );
      }

      return { blocked: false };
    } catch {
      const message =
        'We could not verify your subscription status right now. Please try again in a moment.';
      setPurchaseStatusMessage(message);

      if (source === 'resume') {
        appendBotHistoryMessage(message);
      }

      return {
        blocked: true,
        message,
      };
    }
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
    loadAuthUser();

    if (!Cookies.get('authToken')) {
      clearPurchaseIntent();
    }
  };

  useEffect(() => {
    loadAuthUser();

    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/latest-news`)
      .then((res) => {
        const data = (res.data || []).map((item) => ({
          title: item.title,
          link: `${process.env.NEXT_PUBLIC_BACKEND_URL}${item.title_slug}`,
        }));
        setLatestNews(data.slice(0, 5));
      })
      .catch(() => setLatestNews([]));

    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription`)
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setSubscriptionRows(rows);
        setSelectedAmount(getPriceFromRows(rows, 'silver', 'annual'));
      })
      .catch(() => {
        setSubscriptionRows([]);
        setSelectedAmount(0);
      });
  }, []);

  useEffect(() => {
    if (!subscriptionRows.length) return;
    setSelectedAmount(getPriceFromRows(subscriptionRows, selectedPlan, selectedBillingCycle));
  }, [subscriptionRows, selectedPlan, selectedBillingCycle]);

  // Restore a pending chatbot purchase intent once after the auth-triggered reload.
  // The effect is intentionally mount-only so we don't re-run resume logic later.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = Cookies.get('authToken');
    const intent = readPurchaseIntent();
    const resumeLocked = sessionStorage.getItem(CHATBOT_RESUME_LOCK_KEY) === '1';

    if (!token || !intent || resumeLocked) return;

    sessionStorage.setItem(CHATBOT_RESUME_LOCK_KEY, '1');
    setSelectedPlan(intent.plan || 'silver');
    setSelectedBillingCycle(intent.billingCycle || 'annual');
    setSelectedAmount(Number(intent.amount || 0));
    setShowAuthModal(false);
    const email = loadAuthUser();

    void (async () => {
      if (!email) {
        sessionStorage.removeItem(CHATBOT_RESUME_LOCK_KEY);
        return;
      }

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/effective/${encodeURIComponent(email)}`
        );
        const activeSubscription = response?.data?.own || response?.data?.membership || null;

        if (activeSubscription) {
          const message = buildActiveSubscriptionMessage(activeSubscription);
          setPurchaseStatusMessage(message);
          clearPurchaseIntent();
          appendBotHistoryMessage(message);
          return;
        }

        setShowCheckoutModal(true);
        clearPurchaseIntent();
        appendBotHistoryMessage(
          `You're signed in now. Opening secure checkout for ${PLAN_KEY_TO_LABEL[intent.plan || 'silver']} (${intent.billingCycle || 'annual'}).`
        );
      } catch {
        const message =
          'We could not verify your subscription status right now. Please try again in a moment.';
        setPurchaseStatusMessage(message);
        appendBotHistoryMessage(message);
      }
    })().finally(() => {
      sessionStorage.removeItem(CHATBOT_RESUME_LOCK_KEY);
    });
  }, []);

  const helpOptions = [
    'Subscription Inquiries',
    'Explore Our Services',
    'Payment Assistance',
    'Latest News Coverage',
    'Advertising',
    'Other Queries',
  ];

  const subscriptionOptions = [
    'View Plan Details',
    'Buy a Plan',
    'Payment Assistance',
    'Contact Sales',
    'Back',
  ];

  const planOptions = [
    'Individual Basic',
    'Individual Pro',
    'Business',
    'Business Pro',
    'Buy a Plan',
    'Back',
  ];

  const serviceOptions = [
    'Content Creation',
    'Advertising',
    'Branding',
    'Marketing Development',
    'Back',
  ];

  const paymentOptions = [
    'Payment cancelled',
    'Plan not activated',
    'Payment amount dispute',
    'Other payment issue',
    'Back',
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
    chatHistory: { storageKey: 'floating_chatbot' },
    tooltip: { mode: 'NEVER' },
    header: { title: 'Race Team', showAvatar: true, avatar: '/images/chat-bot-icon.webp' },
    chatButton: { icon: '/images/chat-bot-icon.webp' },
    notification: { volume: 0.1 },
    chatWindow: { defaultOpen: isDesktop },
    footer: { text: 'RACE EDITORIALE' },
    fileAttachment: { disabled: true },
    emoji: { disabled: true },
  };

  const flow = {
    start: {
      message: "Hello, I am Olivia. Welcome to Race Auto India's chatbot. How can I assist you today?",
      transition: { duration: 0 },
      path: 'show_options',
      chatDisabled: true,
    },

    show_options: {
      message: 'Here are a few helpful things you can check out:',
      options: helpOptions,
      path: 'process_options',
    },

    process_options: {
      transition: { duration: 0 },
      chatDisabled: true,
      path: async (params) => {
        switch (params.userInput) {
          case 'Subscription Inquiries':
            return 'subscription_options';
          case 'Explore Our Services':
            return 'service_options';
          case 'Payment Assistance':
            return 'payment_options';
          case 'Latest News Coverage':
            return 'news_options';
          case 'Advertising':
            return 'advertising_options';
          case 'Other Queries':
            return 'other_queries';
          default:
            return 'unknown_input';
        }
      },
    },

    subscription_options: {
      message: 'Please choose a subscription action:',
      options: subscriptionOptions,
      path: async (params) => {
        switch (params.userInput) {
          case 'View Plan Details':
            return 'plan_details';
          case 'Buy a Plan':
            return 'buy_plan_select';
          case 'Payment Assistance':
            return 'payment_options';
          case 'Contact Sales':
            setEnquiryTopic('Subscription sales enquiry');
            return 'ask_enquiry_email';
          default:
            return 'show_options';
        }
      },
    },

    plan_details: {
      message:
        'Available plans: Individual Basic, Individual Pro, Business, and Business Pro. Select one for quick details.',
      options: planOptions,
      path: async (params) => {
        if (params.userInput === 'Back') return 'subscription_options';
        if (params.userInput === 'Buy a Plan') return 'buy_plan_select';

        const key = PLAN_LABEL_TO_KEY[params.userInput];
        if (key) {
          setSelectedPlan(key);
          return `plan_info_${key}`;
        }

        return 'unknown_input';
      },
    },

    plan_info_bronze: {
      message:
        'Individual Basic gives you entry-level premium coverage designed for individual users.',
      options: ['Buy this plan', 'View more plans', 'Back to subscription menu'],
      path: async (params) => {
        if (params.userInput === 'Buy this plan') {
          setSelection('bronze');
          return 'buy_plan_billing_cycle';
        }
        if (params.userInput === 'View more plans') return 'plan_details';
        return 'subscription_options';
      },
    },

    plan_info_silver: {
      message:
        'Individual Pro gives broader content access and is built for advanced individual use.',
      options: ['Buy this plan', 'View more plans', 'Back to subscription menu'],
      path: async (params) => {
        if (params.userInput === 'Buy this plan') {
          setSelection('silver');
          return 'buy_plan_billing_cycle';
        }
        if (params.userInput === 'View more plans') return 'plan_details';
        return 'subscription_options';
      },
    },

    plan_info_gold: {
      message:
        'Business includes shared team access and is built for growing teams.',
      options: ['Buy this plan', 'View more plans', 'Back to subscription menu'],
      path: async (params) => {
        if (params.userInput === 'Buy this plan') {
          setSelection('gold');
          return 'buy_plan_billing_cycle';
        }
        if (params.userInput === 'View more plans') return 'plan_details';
        return 'subscription_options';
      },
    },

    plan_info_platinum: {
      message:
        'Business Pro includes the broadest business access for high-scale team usage.',
      options: ['Buy this plan', 'View more plans', 'Back to subscription menu'],
      path: async (params) => {
        if (params.userInput === 'Buy this plan') {
          setSelection('platinum');
          return 'buy_plan_billing_cycle';
        }
        if (params.userInput === 'View more plans') return 'plan_details';
        return 'subscription_options';
      },
    },

    buy_plan_select: {
      message: 'Select the plan you want to purchase:',
      options: ['Individual Basic', 'Individual Pro', 'Business', 'Business Pro', 'Back'],
      path: async (params) => {
        if (params.userInput === 'Back') return 'subscription_options';
        const key = PLAN_LABEL_TO_KEY[params.userInput];
        if (!key) return 'unknown_input';
        setSelection(key);
        return 'buy_plan_billing_cycle';
      },
    },

    buy_plan_billing_cycle: {
      message: 'Choose your billing cycle:',
      options: ['Monthly', 'Annual', 'Back'],
      path: async (params) => {
        if (params.userInput === 'Back') return 'buy_plan_select';

        const cycle = params.userInput === 'Monthly' ? 'monthly' : 'annual';
        setSelectedBillingCycle(cycle);
        setSelectedAmount(getPriceFromRows(subscriptionRows, selectedPlan, cycle));
        return 'buy_plan_summary';
      },
    },

    buy_plan_summary: {
      message: `You selected ${PLAN_KEY_TO_LABEL[selectedPlan]} (${selectedBillingCycle}) for INR ${selectedAmount.toLocaleString(
        'en-IN'
      )}. Continue to secure Razorpay checkout?`,
      options: [
        'Proceed to Secure Checkout',
        'Change Billing Cycle',
        'Change Plan',
        'Back to Subscription Menu',
      ],
      path: async (params) => {
        if (params.userInput === 'Change Billing Cycle') return 'buy_plan_billing_cycle';
        if (params.userInput === 'Change Plan') return 'buy_plan_select';
        if (params.userInput === 'Back to Subscription Menu') return 'subscription_options';

        if (!userEmail) {
          return 'purchase_login_required';
        }

        const checkoutResult = await startCheckoutIfEligible();
        if (checkoutResult.blocked) {
          return 'purchase_blocked_status';
        }

        return 'checkout_opened';
      },
    },

    purchase_login_required: {
      message: 'Please sign in first to complete plan purchase securely.',
      options: ['Sign In', 'Back'],
      path: async (params) => {
        if (params.userInput === 'Sign In') {
          persistPurchaseIntent({
            plan: selectedPlan,
            billingCycle: selectedBillingCycle,
            amount: selectedAmount,
          });
          setShowAuthModal(true);
          return 'purchase_login_wait';
        }

        clearPurchaseIntent();
        return 'buy_plan_summary';
      },
    },

    purchase_login_wait: {
      message: 'Login or signup modal is open. Complete authentication to continue checkout.',
      options: ['Back to Summary'],
      path: async () => {
        clearPurchaseIntent();
        return 'buy_plan_summary';
      },
    },

    purchase_blocked_status: {
      message: () =>
        purchaseStatusMessage ||
        'We could not continue to payment right now. Please review your subscription status and try again.',
      options: ['Manage Subscription', 'Back to Subscription Menu'],
      path: async (params) => {
        if (params.userInput === 'Manage Subscription') {
          router.push('/profile/subscription');
          return 'show_options';
        }

        return 'subscription_options';
      },
    },

    checkout_opened: {
      message:
        'Secure checkout has been opened. Complete payment to activate your subscription using the existing Race Auto India flow.',
      options: ['Back to Subscription Menu', 'Main menu'],
      path: async (params) =>
        params.userInput === 'Back to Subscription Menu' ? 'subscription_options' : 'show_options',
    },

    payment_options: {
      message: 'Choose the payment issue you are facing:',
      options: paymentOptions,
      path: async (params) => {
        if (params.userInput === 'Back') return 'show_options';

        const topicMap = {
          'Payment cancelled': 'Payment cancelled issue',
          'Plan not activated': 'Plan not activated after payment',
          'Payment amount dispute': 'Payment amount dispute',
          'Other payment issue': 'Other payment issue',
        };

        const topic = topicMap[params.userInput];
        if (!topic) return 'unknown_input';

        setEnquiryTopic(topic);
        return 'ask_enquiry_email';
      },
    },

    ask_enquiry_email: {
      message:
        'Please type your email address so our team can contact you. We will submit this through our official support email flow.',
      path: async (params) => {
        const email = String(params.userInput || '').trim().toLowerCase();
        if (!isValidEmail(email)) {
          return 'invalid_enquiry_email';
        }

        try {
          await submitEnquiryEmail(email);
          toast.success('Enquiry submitted successfully. Our team will contact you soon.');
          return 'enquiry_sent';
        } catch {
          return 'enquiry_failed';
        }
      },
    },

    invalid_enquiry_email: {
      message: 'That email looks invalid. Please enter a valid email address.',
      path: 'ask_enquiry_email',
    },

    enquiry_sent: {
      message: 'Your enquiry has been submitted. Our team will respond as soon as possible.',
      options: ['Main menu', 'Back'],
      path: async (params) =>
        params.userInput === 'Back' ? 'subscription_options' : 'show_options',
    },

    enquiry_failed: {
      message:
        'We could not submit your enquiry right now. You can retry here or contact us on the contact page.',
      options: ['Try Again', 'Contact Page', 'Main menu'],
      path: async (params) => {
        if (params.userInput === 'Try Again') return 'ask_enquiry_email';
        if (params.userInput === 'Contact Page') {
          router.push('/contact');
          return 'show_options';
        }
        return 'show_options';
      },
    },

    service_options: {
      message: 'Explore our services below:',
      options: serviceOptions,
      path: async (params) => {
        if (params.userInput === 'Back') return 'show_options';

        const serviceMap = {
          'Content Creation': 'Content creation service enquiry',
          Advertising: 'Service enquiry for advertising',
          Branding: 'Branding service enquiry',
          'Marketing Development': 'Marketing development service enquiry',
        };

        const topic = serviceMap[params.userInput];
        if (!topic) return 'unknown_input';

        setEnquiryTopic(topic);
        return 'ask_enquiry_email';
      },
    },

    news_options: {
      message: 'Choose a news support option:',
      options: ['Latest News Updates', 'Segment Specific Updates', 'Issues with Published News', 'Back'],
      path: async (params) => {
        if (params.userInput === 'Back') return 'show_options';
        if (params.userInput === 'Latest News Updates') return 'message_latest_news';
        if (params.userInput === 'Segment Specific Updates') return 'message_segment_updates';
        if (params.userInput === 'Issues with Published News') {
          setEnquiryTopic('Issue with published news');
          return 'ask_enquiry_email';
        }
        return 'unknown_input';
      },
    },

    message_segment_updates: {
      message: `Explore updates in key segments:\n- [Cars](${process.env.NEXT_PUBLIC_BACKEND_URL}/news/cars)\n- [Bikes](${process.env.NEXT_PUBLIC_BACKEND_URL}/news/bikes)\n- [ThreeWheeler](${process.env.NEXT_PUBLIC_BACKEND_URL}/news/3w)\n- [Agricultural Machinery](${process.env.NEXT_PUBLIC_BACKEND_URL}/news/agriculture)\n- [Construction and Machinery](${process.env.NEXT_PUBLIC_BACKEND_URL}/news/construction)\n- [Commercial Vehicles](${process.env.NEXT_PUBLIC_BACKEND_URL}/news/commercial-vehicles)`,
      options: ['Back'],
      path: 'news_options',
    },

    message_latest_news: {
      message: latestNewsMessage,
      options: ['Back'],
      path: 'news_options',
    },

    advertising_options: {
      message: 'Choose your advertising enquiry type:',
      options: ['Web Advertising', 'Magazine Advertising', 'Other Advertising', 'Back'],
      path: async (params) => {
        if (params.userInput === 'Back') return 'show_options';

        const topicMap = {
          'Web Advertising': 'Web advertising enquiry',
          'Magazine Advertising': 'Magazine advertising enquiry',
          'Other Advertising': 'General advertising enquiry',
        };

        const topic = topicMap[params.userInput];
        if (!topic) return 'unknown_input';

        setEnquiryTopic(topic);
        return 'ask_enquiry_email';
      },
    },

    other_queries: {
      message:
        'Please share your email so we can route your query to the right team and respond quickly.',
      path: async (params) => {
        const email = String(params.userInput || '').trim().toLowerCase();
        if (!isValidEmail(email)) {
          setEnquiryTopic('General enquiry');
          return 'invalid_enquiry_email';
        }

        setEnquiryTopic('General enquiry');
        try {
          await submitEnquiryEmail(email);
          return 'enquiry_sent';
        } catch {
          return 'enquiry_failed';
        }
      },
    },

    unknown_input: {
      message: 'Sorry, I did not understand that. Please choose one of the options below.',
      options: helpOptions,
      path: 'process_options',
    },
  };

  return (
    <>
      <ChatBot id="floating-chat-bot" flow={flow} settings={settings} styles={styles} />

      <AuthModal show={showAuthModal} onClose={handleAuthModalClose} />

      <Modal
        show={showCheckoutModal}
        onHide={() => setShowCheckoutModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-center w-100">Secure Checkout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <RazorpayPaymentForm
            closeModal={() => setShowCheckoutModal(false)}
            planInfo={{
              planTier: selectedPlan,
              billingCycle: selectedBillingCycle,
              price: selectedAmount,
            }}
          />
        </Modal.Body>
      </Modal>
    </>
  );
};

export default FloatingChatBot;
