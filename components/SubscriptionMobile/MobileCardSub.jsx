'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { IoMdCloseCircle } from 'react-icons/io';
import { IoChevronBackCircle } from 'react-icons/io5';
import MobilePricingCard from './SubscriptionCardMobile';
import SubscriptionForm from '@/app/subscription/component/subscription-v2/SubscriptionForm';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export default function PricingPlans({ hide }) {
    const [planData, setPlanData] = useState([]);
    const [currency, setCurrency] = useState('INR');
    const [billing, setBilling] = useState('Yearly');
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [email, setEmail] = useState('');
    const [token, setToken] = useState(null);
    const [subcriptionData, setSubcriptionData] = useState([]);

    useEffect(() => {
        const token = Cookies.get('authToken');
        if (token) {
            setToken(token);
            const decoded = jwtDecode(token);
            setEmail(decoded.email);
        }
    }, []);

    useEffect(() => {
        if (email !== '') {
            axios
                .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/purchase/${email}`)
                .then(res => setSubcriptionData(res.data))
                .catch(err => console.error(err));
        }
    }, [email]);

    useEffect(() => {
        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription`)
            .then(res => setPlanData(res.data))
            .catch(console.error);
    }, []);

    const pricingKeys = ['monthly price', 'annual price', 'usd', "multiplied_price"];
    const features = planData.filter(item => !pricingKeys.includes(item.plan.toLowerCase()));
    const monthly = planData.find(item => item.plan.toLowerCase() === 'monthly price') || {};
    const annual = planData.find(item => item.plan.toLowerCase() === 'annual price') || {};
    const usdRate = planData.find(item => item.plan.toLowerCase() === 'usd')?.platinum || 1;

    const makePlan = (tier) => {
        const base = billing === 'Monthly' ? monthly[tier] : annual[tier];
        const rawPrice = base;
        const priceValue = currency === 'USD'
            ? Math.round((rawPrice / usdRate) * 100) / 100
            : rawPrice;

        const config = {
            silver: { backgroundColor: '#F7F7F7', icon: '✰', description: 'For Growing Businesses' },
            gold: { backgroundColor: '#e4e4e4', icon: '✯', description: 'For Expanding Enterprises' },
            platinum: { backgroundColor: '#DBDBDB', icon: '💎', description: 'For Large Corporations', badge: 'Popular' }
        }[tier];

        return {
            id: tier,
            title: tier.charAt(0).toUpperCase() + tier.slice(1),
            subtitle: config.description,
            price: priceValue,
            features: features.map(f => ({
                plan: f.plan,
                available: f[tier],
                description: f.description || ''
            })),
            color: config.backgroundColor,
            icon: config.icon,
            isPopular: Boolean(config.badge),
            currency,
            isYear: billing === 'Yearly',
        };
    };

    const plans = ['silver', 'gold', 'platinum'].map(tier => makePlan(tier));

    return (
        <div className="container pb-5 pt-2 mb-5">
            <div className="" >
                {!selectedPlan ? (
                    <IoMdCloseCircle size={30} onClick={hide} color="black" />
                ) : (
                    <IoChevronBackCircle size={30} color="black" onClick={() => setSelectedPlan(null)} />
                )}
            </div>

            {!selectedPlan ? (
                <>
                    <h4 className="mb-4 text-center">Grow better with the right plan</h4>

                    <div className="d-flex align-items-center justify-content-center mb-4">
                        <div className="btn-group bg-secondary me-3" role="group" style={{ borderRadius: 20 }}>
                            <button
                                type="button"
                                className={`btn ${currency === 'INR' ? 'btn-dark text-white' : 'text-white'}`}
                                onClick={() => setCurrency('INR')}
                            >
                                INR
                            </button>
                            <button
                                type="button"
                                className={`btn ${currency === 'USD' ? 'btn-dark text-white' : 'text-white'}`}
                                onClick={() => setCurrency('USD')}
                            >
                                USD
                            </button>
                        </div>
                        <div className="btn-group bg-secondary" role="group" style={{ borderRadius: 20 }}>
                            <button
                                type="button"
                                className={`btn ${billing === 'Monthly' ? 'btn-dark text-white' : 'text-white'}`}
                                onClick={() => setBilling('Monthly')}
                            >
                                Month
                            </button>
                            <button
                                type="button"
                                className={`btn ${billing === 'Yearly' ? 'btn-dark text-white' : 'text-white'}`}
                                onClick={() => setBilling('Yearly')}
                            >
                                Yearly
                            </button>
                        </div>
                    </div>

                    <div className="row">
                        {plans.map(plan => {
                            const userPlan = subcriptionData.length > 0 ? subcriptionData[0].plan_name : null;
                            const isUserSubscribed = subcriptionData.length !== 0 && new Date(subcriptionData[0].end_date) > new Date();
                            const isThisUserPlan = isUserSubscribed && userPlan === plan.title.toLowerCase();
                            const isSilverPlan = plan.title.toLowerCase() === 'silver';
                            const showYourPlanBadge = isThisUserPlan || (!token && isSilverPlan);

                            return (
                                <div key={plan.id} className="col-12 mb-4 ">
                                    <div
                                        className="card h-100 border p-3"
                                        style={{ backgroundColor: plan.color, borderRadius: 20 }}
                                    >
                                        {plan.isPopular && (
                                            <span
                                                className="badge bg-success position-absolute"
                                                style={{ top: '4rem', right: '2rem' }}
                                            >
                                                Popular
                                            </span>
                                        )}

                                        {showYourPlanBadge && (
                                            <span
                                                className="badge bg-warning position-absolute"
                                                style={{ top: '4rem', right: '2rem' }}
                                            >
                                                Your Plan
                                            </span>
                                        )}

                                        <div className="d-flex align-items-center mb-3">
                                            <span className="fs-4 me-2" style={{ color: 'black' }}>
                                                {plan.icon}
                                            </span>
                                            <h5 className="card-title mb-0" style={{ color: 'black' }}>
                                                {plan.title}
                                            </h5>
                                            <p
                                                className="text-decoration-none ms-auto"
                                                style={{ color: 'blue', cursor: 'pointer' }}
                                                onClick={() => setSelectedPlan(makePlan(plan.id))}
                                            >
                                                See Details &gt;
                                            </p>
                                        </div>

                                        <h3 className="card-text fw-bold" style={{ color: 'black' }}>
                                            {plan.title.toLowerCase() === 'silver'
                                                ? 'Free'
                                                : currency === 'USD'
                                                    ? `$${plan.price}`
                                                    : `₹${plan.price}`}
                                            {plan.title.toLowerCase() !== 'silver' && (
                                                <small className="text-muted">/{billing === 'Monthly' ? 'mo' : 'yr'}</small>
                                            )}
                                        </h3>


                                        <div className="d-flex justify-content-between align-items-center">
                                            <p style={{ color: 'black' }}>{plan.subtitle}</p>
                                            {!isSilverPlan && (!isThisUserPlan) && (
                                                <SubscriptionForm plan={plan.title.toLowerCase()} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                <MobilePricingCard {...selectedPlan} />
            )}
        </div>
    );
}
