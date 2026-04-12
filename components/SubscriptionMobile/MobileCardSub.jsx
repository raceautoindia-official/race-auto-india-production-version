'use client';

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { IoMdCloseCircle } from 'react-icons/io';
import { IoChevronBackCircle } from 'react-icons/io5';
import MobilePricingCard from './SubscriptionCardMobile';
import './styles/subscriptionMobileCard.css';

const PLAN_UI_TITLE = {
  bronze: 'Individual Basic',
  silver: 'Individual Pro',
  gold: 'Business',
  platinum: 'Business Pro',
};

const PLAN_META = {
  bronze: {
    subtitle: 'Built for individual professionals who need premium news access and a clean entry plan.',
    segmentLabel: 'Individual Plan',
    userCount: null,
  },
  silver: {
    subtitle: 'Designed for advanced individual users who need more tools and broader content access.',
    segmentLabel: 'Individual Plan',
    userCount: null,
  },
  gold: {
    subtitle: 'For growing teams that need shared business access for up to 5 users.',
    segmentLabel: 'Business Plan',
    userCount: '5 Users',
  },
  platinum: {
    subtitle: 'For enterprise-ready teams that need broader business access for up to 10 users.',
    segmentLabel: 'Business Plan',
    userCount: '10 Users',
  },
};

export default function PricingPlans({ hide }) {
  const [planData, setPlanData] = useState([]);
  const [currency, setCurrency] = useState('INR');
  const [isYear, setIsYear] = useState(true);
  const [categoryView, setCategoryView] = useState('individual');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [email, setEmail] = useState('');
  const [hasToken, setHasToken] = useState(false);
  const [subcriptionData, setSubcriptionData] = useState([]);

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (token) {
      setHasToken(true);
      try {
        const decoded = jwtDecode(token);
        setEmail(decoded.email || '');
      } catch (error) {
        console.error(error);
      }
    }
  }, []);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription`)
      .then((res) => setPlanData(res.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!email) return;

    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/purchase/${email}`)
      .then((res) => setSubcriptionData(res.data || []))
      .catch((err) => {
        console.error(err);
        setSubcriptionData([]);
      });
  }, [email]);

  const pricingKeys = ['monthly price', 'annual price', 'usd', 'multiplied_price'];

  const features = planData.filter(
    (item) => !pricingKeys.includes(String(item.plan).toLowerCase())
  );
  const monthly = planData.find(
    (item) => String(item.plan).toLowerCase() === 'monthly price'
  ) || {};
  const annual = planData.find(
    (item) => String(item.plan).toLowerCase() === 'annual price'
  ) || {};
  const multiplied = planData.find(
    (item) => String(item.plan).toLowerCase() === 'multiplied_price'
  ) || {};
  const usdRate =
    planData.find((item) => String(item.plan).toLowerCase() === 'usd')?.platinum || 1;

  const makePlan = (tier) => {
    const rawPrice = isYear ? annual[tier] ?? 0 : monthly[tier] ?? 0;
    const priceValue =
      currency === 'USD' ? Math.round((rawPrice / usdRate) * 100) / 100 : rawPrice;

    return {
      key: tier,
      planKey: tier,
      title: PLAN_UI_TITLE[tier] ?? tier,
      subtitle: PLAN_META[tier]?.subtitle || '',
      segmentLabel: PLAN_META[tier]?.segmentLabel || '',
      userCount: PLAN_META[tier]?.userCount || null,
      price: priceValue,
      multipliedPrice: multiplied[tier] ?? 1,
      features: features.map((f) => ({
        plan: f.plan,
        available: f[tier],
        description: f.description || '',
      })),
      currency,
      isYear,
      isPopular: tier === 'platinum',
    };
  };

  const visiblePlanKeys = useMemo(() => {
    return categoryView === 'individual'
      ? ['bronze', 'silver']
      : ['gold', 'platinum'];
  }, [categoryView]);

  const plans = useMemo(() => {
    return visiblePlanKeys.map((tier) => makePlan(tier));
  }, [visiblePlanKeys, planData, currency, isYear]);

  const currentMeta =
    categoryView === 'individual'
      ? {
          eyebrow: 'Individual Membership',
          description:
            'Compare the individual plans only, with a cleaner mobile layout built for solo users.',
        }
      : {
          eyebrow: 'Business Membership',
          description:
            'Compare the business plans only, with shared-access pricing for teams and enterprises.',
        };

  return (
    <div className="mobile-subscription-shell">
      <div className="mobile-subscription-shell__header">
        {!selectedPlan ? (
          <button
            type="button"
            className="mobile-subscription-shell__icon-button"
            onClick={hide}
            aria-label="Close"
          >
            <IoMdCloseCircle size={28} />
          </button>
        ) : (
          <button
            type="button"
            className="mobile-subscription-shell__icon-button"
            onClick={() => setSelectedPlan(null)}
            aria-label="Back"
          >
            <IoChevronBackCircle size={28} />
          </button>
        )}
      </div>

      {!selectedPlan ? (
        <>
          <div className="mobile-subscription-hero">
            <span className="mobile-subscription-hero__eyebrow">Subscription Plans</span>
            <h4 className="mobile-subscription-hero__title">Grow better with the right plan</h4>
            <p className="mobile-subscription-hero__subtitle">
              Choose only the relevant plan group and compare a cleaner set of cards on mobile.
            </p>
          </div>

          <div className="mobile-subscription-controls">
            <div className="mobile-subscription-toggle-row">
              <div className="mobile-subscription-toggle-group">
                <button
                  type="button"
                  className={currency === 'INR' ? 'is-active' : ''}
                  onClick={() => setCurrency('INR')}
                >
                  INR
                </button>
                <button
                  type="button"
                  className={currency === 'USD' ? 'is-active' : ''}
                  onClick={() => setCurrency('USD')}
                >
                  USD
                </button>
              </div>

              <div className="mobile-subscription-toggle-group">
                <button
                  type="button"
                  className={!isYear ? 'is-active' : ''}
                  onClick={() => setIsYear(false)}
                >
                  Month
                </button>
                <button
                  type="button"
                  className={isYear ? 'is-active' : ''}
                  onClick={() => setIsYear(true)}
                >
                  Yearly
                </button>
              </div>
            </div>

            <div className="mobile-subscription-toggle-row">
              <div className="mobile-subscription-toggle-group mobile-subscription-toggle-group--full">
                <button
                  type="button"
                  className={categoryView === 'individual' ? 'is-active' : ''}
                  onClick={() => setCategoryView('individual')}
                >
                  Individuals
                </button>
                <button
                  type="button"
                  className={categoryView === 'business' ? 'is-active' : ''}
                  onClick={() => setCategoryView('business')}
                >
                  Business
                </button>
              </div>
            </div>

            <div className="mobile-subscription-summary">
            
              <p className="mobile-subscription-summary__text">{currentMeta.description}</p>
            </div>
          </div>

          <div className="mobile-subscription-plan-list">
            {plans.map((plan) => (
              <MobilePricingCard
                key={plan.key}
                {...plan}
                subscriptionData={subcriptionData}
                hasToken={hasToken}
                isPreview
                onDetails={() => setSelectedPlan(plan)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="mobile-subscription-detail-view">
          <MobilePricingCard
            {...selectedPlan}
            subscriptionData={subcriptionData}
            hasToken={hasToken}
            isPreview={false}
          />
        </div>
      )}
    </div>
  );
}