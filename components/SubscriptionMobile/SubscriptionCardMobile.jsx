'use client';

import React, { useMemo } from 'react';
import { PiCheckCircleFill, PiXCircleFill } from 'react-icons/pi';
import { IoDiamond } from 'react-icons/io5';
import { Tooltip } from 'react-tooltip';
import SubscriptionForm from '@/app/subscription/component/subscription-v2/SubscriptionForm';
import './styles/subscriptionMobileCard.css';

const PLAN_RANK = {
  bronze: 1,
  silver: 2,
  gold: 3,
  platinum: 4,
};

const CARD_META = {
  bronze: {
    accent: '#b28b47',
    accentSoft: 'rgba(178, 139, 71, 0.12)',
    titleColor: '#8c651e',
    iconSrc: '/images/bronze.png',
    iconAlt: 'Individual Basic icon',
  },
  silver: {
    accent: '#64748b',
    accentSoft: 'rgba(100, 116, 139, 0.12)',
    titleColor: '#334155',
    iconSrc: '/images/silver.jpg',
    iconAlt: 'Individual Pro icon',
  },
  gold: {
    accent: '#c3932d',
    accentSoft: 'rgba(195, 147, 45, 0.12)',
    titleColor: '#a26708',
    iconSrc: '/images/gold-star.png',
    iconAlt: 'Business icon',
  },
  platinum: {
    accent: '#0f172a',
    accentSoft: 'rgba(15, 23, 42, 0.08)',
    titleColor: '#0f172a',
    iconSrc: '/images/platinum.png',
    iconAlt: 'Business Pro icon',
  },
};

export default function MobilePricingCard({
  title,
  planKey,
  subtitle,
  price,
  multipliedPrice,
  features,
  currency,
  isYear,
  isPopular,
  segmentLabel,
  userCount,
  subscriptionData = [],
  hasToken = false,
  isPreview = true,
  onDetails,
}) {
  const meta = CARD_META[planKey] || CARD_META.bronze;

  const fakePrice =
    typeof price === 'number' && typeof multipliedPrice === 'number'
      ? price * multipliedPrice
      : null;

  const discountPercent =
    typeof fakePrice === 'number' && typeof price === 'number' && fakePrice > price
      ? Math.round(((fakePrice - price) / fakePrice) * 100)
      : null;

  const userPlan = subscriptionData.length > 0 ? subscriptionData[0]?.plan_name : null;

  const isUserSubscribed =
    subscriptionData.length !== 0 &&
    String(subscriptionData[0]?.status || '').toLowerCase() === 'active' &&
    subscriptionData[0]?.start_date &&
    new Date(subscriptionData[0].start_date) <= new Date() &&
    subscriptionData[0]?.end_date &&
    new Date(subscriptionData[0].end_date) > new Date();

  const currentPlanRank = isUserSubscribed ? PLAN_RANK[userPlan] || 0 : 0;
  const viewedPlanRank = PLAN_RANK[planKey] || 0;

  const isThisUserPlan = isUserSubscribed && userPlan === planKey;
  const isLowerThanCurrent = isUserSubscribed && currentPlanRank > viewedPlanRank;

  const orderedFeatures = useMemo(() => {
    return (features || [])
      .filter((feature) => feature.available !== 2)
      .sort((a, b) => {
        const order = { 1: 0, 3: 1, 4: 2, 0: 3 };
        return order[a.available] - order[b.available];
      });
  }, [features]);

  const visibleFeatures = isPreview ? orderedFeatures.slice(0, 4) : orderedFeatures;

  const normalizeFeatureLabel = (label) => {
    if (!label) return '';
    let text = label;
    if (planKey === 'silver') {
      text = text.replace(/Everything in Silver Plan/gi, 'Everything in Individual Basic Plan');
    }
    return text;
  };

  const renderActionButton = () => {
    if (isThisUserPlan) {
      return (
        <button type="button" className="mobile-subscription-card__action-btn is-disabled" disabled>
          Current Plan
        </button>
      );
    }

    if (isLowerThanCurrent) {
      return (
        <button type="button" className="mobile-subscription-card__action-btn is-disabled" disabled>
          Included in Your Plan
        </button>
      );
    }

    return <SubscriptionForm plan={planKey} />;
  };

  return (
    <article
      className={`mobile-subscription-card ${isThisUserPlan ? 'mobile-subscription-card--current' : ''}`}
      style={{ '--card-accent': meta.accent }}
    >
      <div className="mobile-subscription-card__badges">
        {discountPercent && discountPercent > 0 && (
          <span className="mobile-subscription-card__badge mobile-subscription-card__badge--discount">
            {discountPercent}% Off
          </span>
        )}

        {isPopular && (
          <span className="mobile-subscription-card__badge mobile-subscription-card__badge--popular">
            Popular
          </span>
        )}

        {isThisUserPlan && (
          <span className="mobile-subscription-card__badge mobile-subscription-card__badge--current">
            Your Plan
          </span>
        )}
      </div>

      <div className="mobile-subscription-card__top">
        <div className="mobile-subscription-card__title-wrap">
          <h3
            className="mobile-subscription-card__title"
            style={{ color: meta.titleColor }}
          >
            {title}
          </h3>

          <div className="mobile-subscription-card__tags">
            <span
              className="mobile-subscription-card__tag"
              style={{ background: meta.accentSoft, color: meta.titleColor }}
            >
              {segmentLabel}
            </span>

            {userCount && (
              <span className="mobile-subscription-card__tag">{userCount}</span>
            )}
          </div>
        </div>

        <div className="mobile-subscription-card__icon">
          <img src={meta.iconSrc} alt={meta.iconAlt} />
        </div>
      </div>

      <p className="mobile-subscription-card__subtitle">{subtitle}</p>

      <div className="mobile-subscription-card__price-box">
        {fakePrice && fakePrice > price && (
          <div className="mobile-subscription-card__old-price">
            {fakePrice.toLocaleString('en-US', {
              style: 'currency',
              currency: currency || 'INR',
            })}
          </div>
        )}

        <div className="mobile-subscription-card__price-row">
          <div className="mobile-subscription-card__price">
            {typeof price === 'number'
              ? price.toLocaleString('en-US', {
                  style: 'currency',
                  currency: currency || 'INR',
                })
              : 'N/A'}
          </div>
          <div className="mobile-subscription-card__cycle">/{isYear ? 'year' : 'month'}</div>
        </div>
      </div>

      <ul className="mobile-subscription-card__feature-list">
        {visibleFeatures.map((feature, index) => {
          const tooltipId = `mobile-tip-${planKey}-${index}`;
          const featureText = normalizeFeatureLabel(feature.plan);

          const tooltipProps = {
            'data-tooltip-id': tooltipId,
            'data-tooltip-html': feature.description || '',
          };

          if (feature.available === 1) {
            return (
              <li key={index} className="mobile-subscription-card__feature-item">
                <PiCheckCircleFill
                  className="mobile-subscription-card__feature-icon"
                  color="#15803d"
                />
                <span className="mobile-subscription-card__feature-text" {...tooltipProps}>
                  {featureText}
                </span>
                <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
              </li>
            );
          }

          if (feature.available === 3) {
            return (
              <li key={index} className="mobile-subscription-card__feature-item is-featured">
                <IoDiamond className="mobile-subscription-card__feature-icon" color="#d97706" />
                <span className="mobile-subscription-card__feature-text" {...tooltipProps}>
                  {featureText}
                </span>
                <span className="mobile-subscription-card__feature-pill">Featured</span>
                <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
              </li>
            );
          }

          if (feature.available === 4) {
            return (
              <li key={index} className="mobile-subscription-card__feature-item is-new">
                <span className="mobile-subscription-card__feature-text" {...tooltipProps}>
                  {featureText}
                </span>
                <span className="mobile-subscription-card__feature-pill is-new">New</span>
                <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
              </li>
            );
          }

          return (
            <li key={index} className="mobile-subscription-card__feature-item is-disabled">
              <PiXCircleFill
                className="mobile-subscription-card__feature-icon"
                color="#94a3b8"
              />
              <span className="mobile-subscription-card__feature-text" {...tooltipProps}>
                {featureText}
              </span>
              <Tooltip id={tooltipId} className="custom-tooltip" place="top" html />
            </li>
          );
        })}
      </ul>

      {isPreview && orderedFeatures.length > 4 && (
        <button
          type="button"
          className="mobile-subscription-card__details-link"
          onClick={onDetails}
        >
          See full details
        </button>
      )}

      <div className="mobile-subscription-card__action">
        {renderActionButton()}
      </div>
    </article>
  );
}
