import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const API_URL    = import.meta.env.VITE_API_URL    || 'http://localhost:5000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Fallback shown until /api/settings responds (or if the admin never customizes it).
const DEFAULT_BRANDING = {
  companyName: 'ReadSpace', logoImage: null,
  city: 'Chh Sambhajinagar',
  address: 'Ajab Nagar, Chh. Sambhajinagar, Maharashtra 431001',
  contactEmail: 'info@readspace.in',
  contactPhone: '+91 98765 43210',
  contactHours: 'Mon–Sat: 6:00 AM – 11:00 PM',
  instagramUrl: '', linkedinUrl: '', facebookUrl: '', youtubeUrl: '',
  mapEmbedUrl: '',
};

const BrandingContext = createContext(DEFAULT_BRANDING);

// Wrap the app once (in App.jsx) so every page — public site AND admin panel —
// reads the same live company name / logo / city / contact details without
// re-fetching per page.
export function BrandingProvider({ children }) {
  const [branding, setBranding] = useState(DEFAULT_BRANDING);

  useEffect(() => {
    const apply = s => setBranding({
      companyName:  s?.companyName?.trim() || DEFAULT_BRANDING.companyName,
      logoImage:    s?.logoImage || null,
      city:         s?.city?.trim()         || DEFAULT_BRANDING.city,
      address:      s?.address?.trim()      || DEFAULT_BRANDING.address,
      contactEmail: s?.contactEmail?.trim() || DEFAULT_BRANDING.contactEmail,
      contactPhone: s?.contactPhone?.trim() || DEFAULT_BRANDING.contactPhone,
      contactHours: s?.contactHours?.trim() || DEFAULT_BRANDING.contactHours,
      // social links + map stay '' (not defaulted) when unset — an empty
      // string is how the Contact page knows to hide that icon / show the
      // "map not set" placeholder, so don't fall back to a sample value here.
      instagramUrl: s?.instagramUrl?.trim() || '',
      linkedinUrl:  s?.linkedinUrl?.trim()  || '',
      facebookUrl:  s?.facebookUrl?.trim()  || '',
      youtubeUrl:   s?.youtubeUrl?.trim()   || '',
      mapEmbedUrl:  s?.mapEmbedUrl?.trim()  || '',
    });

    fetch(`${API_URL}/api/settings`).then(r => r.json()).then(apply).catch(() => {});

    // live-updates the moment admin saves Settings — no refresh needed anywhere
    const socket = io(SOCKET_URL);
    socket.on('settings_updated', apply);
    return () => socket.disconnect();
  }, []);

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}

// Small reusable brand mark: shows the uploaded logo image if the admin set
// one, otherwise falls back to the 📚 emoji — used in navbar/footers/admin.
// `size` can be a number (px) or a CSS size string like '100%' — pass '100%'
// when the mark sits inside a responsively-sized wrapper (see CSS classes
// .nav-logo-icon / .footer-logo-icon / .admin-logo-icon) so the logo scales
// with its container instead of being locked to a fixed pixel size.
export function BrandMark({ size = 28, style = {} }) {
  const { companyName, logoImage } = useBranding();
  const isFluid = typeof size !== 'number';
  const dim = isFluid ? size : `${size}px`;
  return logoImage
    ? <img src={logoImage} alt={companyName} style={{ width: dim, height: dim, maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 6, display: 'block', ...style }} />
    : <span style={{ fontSize: isFluid ? '1em' : `${size * 0.8}px`, lineHeight: 1, ...style }}>📚</span>;
}
