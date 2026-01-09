'use client'
import React, { useState } from 'react'
import styles from './styles/subscriptionDropdown.module.css'
import PricingPlans from './MobileCardSub'

const SubscriptionDropdown = () => {
    const [menuVisible, setMenuVisible] = useState(false);

    const handleToggle = () => {
        setMenuVisible(!menuVisible)
    }
    return (
        <>
            <button onClick={handleToggle}>hello</button>
            <div
                className={`${styles.subscription_menu_slide} ${menuVisible ? styles.subscription_menu_slideUp : styles.subscription_menu_hidden
                    }`}
            ><PricingPlans hide={handleToggle} /></div>
        </>
    )
}

export default SubscriptionDropdown