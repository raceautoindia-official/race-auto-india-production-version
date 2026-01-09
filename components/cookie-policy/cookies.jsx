import React from 'react';

export default function Page() {
  return (
    <div className='container'>
      <h1>Cookie Policy</h1>
      <p><strong>Effective Date:</strong> 1st August 2023</p>
      <p><strong>Last Updated:</strong> 9th July 2025</p>

      <p>
        At <strong>Race Editoriale LLp</strong>, we are committed to protecting your digital privacy.
        This Cookie Policy explains how we use cookies and similar technologies on our website
        in compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) of India.
      </p>

      <h2>1. What Are Cookies?</h2>
      <p>
        Cookies are small text files placed on your device (computer, tablet, or smartphone) when you visit a website.
        They help us recognize you, enhance your experience, and tailor our services based on your preferences and interactions.
      </p>

      <h2>2. Why We Use Cookies</h2>
      <p>We use cookies to:</p>
      <ul>
        <li>Ensure the website functions smoothly</li>
        <li>Analyze traffic and user behavior</li>
        <li>Remember your preferences and settings</li>
        <li>Show you relevant content and ads</li>
        <li>Secure our services against misuse</li>
      </ul>

      <h2>3. Types of Cookies We Use</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', marginBottom: '1rem' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Type</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Purpose</th>
            <th style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Consent Required?</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Strictly Necessary</td>
            <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Required for core website functions like navigation and security</td>
            <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>❌ No</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Analytics</td>
            <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Track visitor usage to help us improve performance</td>
            <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>✅ Yes</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Marketing</td>
            <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Deliver targeted ads across platforms</td>
            <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>✅ Yes</td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Functional</td>
            <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>Save settings like language or region</td>
            <td style={{ border: '1px solid #ccc', padding: '0.5rem' }}>✅ Yes (if personal)</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Your Consent Rights (Under DPDP Act)</h2>
      <p>
        According to the DPDP Act, 2023, we must:
      </p>
      <ul>
        <li>Ask for your explicit, informed consent before using non-essential cookies</li>
        <li>Give you the option to accept, reject, or customize cookies</li>
        <li>Allow you to withdraw consent at any time</li>
      </ul>
      <p>
        You can manage your cookie preferences at any time by visiting our Cookie Settings panel or by adjusting your browser settings.
      </p>

      <h2>5. Third-Party Cookies</h2>
      <p>
        We may partner with third-party services such as:
      </p>
      <ul>
        <li>Google Analytics</li>
        <li>Meta Pixel (Facebook)</li>
        <li>YouTube (embedded video tracking)</li>
      </ul>
      <p>
        These providers may place cookies on your device to support analytics and marketing efforts.
        Their data practices are governed by their respective privacy policies.
      </p>

      <h2>6. Data Security & Retention</h2>
      <p>
        We ensure all cookie data is:
      </p>
      <ul>
        <li>Collected lawfully and transparently</li>
        <li>Stored securely with encryption and access controls</li>
        <li>Retained only as long as necessary for the original purpose</li>
        <li>Not shared or sold without your consent</li>
      </ul>

      <h2>7. Updates to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time. Updates will be posted on this page with a new “Last Updated” date.
        Continued use of our website constitutes your agreement to the latest version.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        For questions or concerns regarding this Cookie Policy or your data privacy rights under DPDP, please contact:
      </p>
      <address>
        Race Editoriale LLp<br/>
        📧 Email: <a href="mailto:info@raceautoindia.com">info@raceautoindia.com</a>
      </address>
    </div>
  );
}
