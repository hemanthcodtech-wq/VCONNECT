import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Truck, CheckCircle, MapPin, CreditCard, ChevronLeft, ShoppingCart, Store, Pencil, X, Check } from 'lucide-react';

import { Header } from '../components/Header';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useLoadScript } from '@react-google-maps/api';


const GOOGLE_MAPS_LIBRARIES = ['places'];
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api";


import { COUNTRIES } from '../data/countries';

function flag(code) {
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)));
}

const getImgSrc = (item) => {
  if (item.variant?.image) return item.variant.image;
  let parsedImages = [];
  try {
    parsedImages = typeof item.product.images === 'string' ? JSON.parse(item.product.images) : item.product.images;
  } catch(e) {}
  if (Array.isArray(parsedImages) && parsedImages.length > 0) return parsedImages[0];
  return item.product.image_url || '';
};

function AddressAutocomplete({ value, onChange, onSelect }) {
  const [inputVal, setInputVal] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [apiError, setApiError] = useState(false); // true when quota/API fails
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const debounceTimer = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (window.google?.maps?.places) {
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
      } catch (err) {
        setApiError(true);
      }
    } else {
      // Google Maps not loaded at all — go straight to manual mode
      setApiError(true);
    }
  }, []);

  // Sync external value into the input (but don't override if user is typing)
  useEffect(() => {
    setInputVal(value || '');
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setSuggestions([]); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (e) => {
    const v = e.target.value;
    setInputVal(v);
    onChange(v);
    if (apiError) return; // no autocomplete if API is down
    clearTimeout(debounceTimer.current);
    if (!v.trim() || !autocompleteService.current) { setSuggestions([]); return; }
    debounceTimer.current = setTimeout(() => {
      autocompleteService.current.getPlacePredictions({ input: v }, (results, status) => {
        const PS = window.google.maps.places.PlacesServiceStatus;
        if (status === PS.OK) {
          setSuggestions(results);
        } else {
          setSuggestions([]);
          // Quota exhausted or request denied → switch to manual mode permanently
          if (status === PS.OVER_QUERY_LIMIT || status === PS.REQUEST_DENIED || status === 'UNKNOWN_ERROR') {
            setApiError(true);
          }
        }
      });
    }, 300);
  };

  const handleSelect = (suggestion) => {
    setSuggestions([]);
    placesService.current.getDetails(
      { placeId: suggestion.place_id, fields: ['address_components'] },
      (place, status) => {
        const PS = window.google.maps.places.PlacesServiceStatus;
        if (status !== PS.OK) {
          // If getDetails fails, at minimum fill in what we have from the suggestion text
          const line1 = suggestion.structured_formatting.main_text;
          setInputVal(line1);
          onChange(line1);
          if (status === PS.OVER_QUERY_LIMIT || status === PS.REQUEST_DENIED) setApiError(true);
          return;
        }
        const components = place.address_components || [];
        const get = (type) => components.find(c => c.types.includes(type))?.long_name || '';
        const line1 = `${get('street_number')} ${get('route')}`.trim() || get('premise') || get('sublocality_level_1') || suggestion.structured_formatting.main_text;
        setInputVal(line1);
        onChange(line1);
        onSelect({
          line1,
          city: get('locality') || get('administrative_area_level_2') || get('postal_town'),
          state: get('administrative_area_level_1'),
          pincode: get('postal_code'),
          country: get('country'),
        });
      }
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      {apiError ? (
        // ── Manual fallback mode ───────────────────────────────────────
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span className="text-xs font-semibold">Address lookup unavailable. Please type your address manually.</span>
          </div>
          <input
            value={inputVal}
            onChange={handleInput}
            placeholder="Enter your full address..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-blue/10 focus:ring-1 focus:ring-brand-gold/30 transition-all"
          />
        </div>
      ) : (
        // ── Autocomplete mode ──────────────────────────────────────────
        <div>
          <MapPin className="w-4 h-4 text-brand-blue absolute left-3.5 top-[13px] pointer-events-none" />
          <input
            value={inputVal}
            onChange={handleInput}
            placeholder="Start typing your address..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-blue/10 focus:ring-1 focus:ring-brand-gold/30 transition-all"
          />
          <p className="text-[10px] text-gray-400 mt-1 pl-1">You can edit this field freely after selecting a suggestion.</p>
          {suggestions.length > 0 && (
            <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
              {suggestions.map((s) => (
                <li key={s.place_id}>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-brand-blue hover:text-white flex items-start gap-2.5 border-b border-gray-50 last:border-0 group transition-colors"
                  >
                    <MapPin className="w-4 h-4 text-brand-blue group-hover:text-white shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{s.structured_formatting.main_text}</span>
                      <span className="text-xs block text-gray-500 group-hover:text-white/80">{s.structured_formatting.secondary_text}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '15px',
      color: '#08183A',
      fontFamily: 'inherit',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#ef4444' },
  },
};

function RazorpayPaymentForm({ isPlacingOrder, handlePlaceOrder, termsAccepted, setTermsAccepted, addressConfirmed, setAddressConfirmed, address, sessionSecondsLeft, onEditAddress, paymentError, onRetry, isStoreOrder }) {
  const isExpiringSoon = sessionSecondsLeft !== null && sessionSecondsLeft <= 60;
  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-brand-blue" />
          </div>
          Payment
        </h2>
        {sessionSecondsLeft !== null && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
            isExpiringSoon ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-amber-50 border-amber-200 text-amber-700'
          }`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Session expires in {Math.floor(sessionSecondsLeft/60)}:{String(sessionSecondsLeft%60).padStart(2,'0')}
          </div>
        )}
      </div>

      {/* Shipping address confirmation */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-green-800 flex items-center gap-1.5">📍 Shipping To</p>
          <button type="button" onClick={onEditAddress}
            className="text-[11px] font-bold text-gray-900 underline hover:text-brand-blue transition-colors">← Edit Address</button>
        </div>
        <div className="text-xs text-green-900 leading-relaxed">
          <p className="font-bold">{address.name}</p>
          <p>{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
          {!isStoreOrder && (
            <>
              <p>{address.city}{address.state ? `, ${address.state}` : ''} {address.pincode}</p>
              <p>{address.country}</p>
            </>
          )}
          <p className="text-green-700 mt-0.5">📞 {address.mobile}</p>
        </div>
        {(!isStoreOrder && !address.line2) ? (
          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            💡 No apartment/suite number provided. If applicable, please <button type="button" onClick={onEditAddress} className="underline font-bold">go back and add it</button> to ensure accurate delivery.
          </p>
        ) : null}
        <label className="flex items-start gap-2.5 cursor-pointer pt-1 border-t border-green-200">
          <input type="checkbox" checked={addressConfirmed} onChange={e => setAddressConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-green-700 shrink-0" />
          <span className="text-[11px] text-green-800 font-medium leading-relaxed">
            I confirm the above shipping address is correct and complete.
          </span>
        </label>
      </div>

      {/* Shipping T&C */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-3">
        <p className="text-xs font-bold text-blue-800">📦 Shipping Terms & Conditions</p>
        <ul className="space-y-1.5 text-xs text-blue-700 leading-relaxed">
          <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>Shipping typically takes <strong>1–3 business days</strong> depending on your location.</span></li>
          <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>If your package arrives damaged or has missing items, <strong>photo proof is required</strong> and must be reported within <strong>1–2 business days</strong> of delivery to . No claims will be accepted without proof.</span></li>
          <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>All sales are <strong>final — no returns or exchanges</strong>. Items are fashion jewellery and sold as-is.</span></li>
          <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>To keep your jewellery looking its best: avoid contact with water, perfume, and harsh chemicals. Store in a dry place when not in use.</span></li>
        </ul>
      </div>

      <div className="bg-white/80 p-5 rounded-2xl shadow-sm border border-brand-blue/10 space-y-4">
        {paymentError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-red-700">Payment Failed</p>
              <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{paymentError}</p>
              <button
                type="button"
                onClick={onRetry}
                className="mt-3 w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl py-3 flex items-center justify-center gap-2 transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Try Again
              </button>
            </div>
          </div>
        )}
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-brand-dark-blue shrink-0" />
          <span className="text-[11px] text-gray-500 leading-relaxed">
            I agree to the VConnect <a href="/terms-of-service" target="_blank" className="text-gray-900 font-bold underline">Terms & Conditions</a> and <a href="/privacy-policy" target="_blank" className="text-gray-900 font-bold underline">Privacy Policy</a>, understand that all sales are final—no returns or exchanges—as stated in the Shipping & Return Policy.
          </span>
        </label>
        <button
          onClick={() => handlePlaceOrder()}
          disabled={isPlacingOrder || !termsAccepted || !addressConfirmed}
          className={`w-full font-bold text-base rounded-xl py-4 flex items-center justify-center gap-2 transition-all ${
            isPlacingOrder || !termsAccepted || !addressConfirmed
              ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-400'
              : 'bg-brand-blue text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
          }`}
        >
          {isPlacingOrder ? (
            <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Processing...</>
          ) : 'Pay via Razorpay'}
        </button>
      </div>
    </div>
  );
}


export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getTotal, getSubtotal, getDiscount, appliedCoupon, clearCart } = useCartStore();
  const { token, user, addAddress, addresses, fetchProfile, updateAddress, selectedStore } = useAuthStore();
  const { showToast } = useToastStore();

  const { isLoaded: mapsLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  
  const orderType = 'shipping';
  const initialStep = token ? 2.5 : 1;
  const [step, setStep] = useState(initialStep);
  const [pickupContact, setPickupContact] = useState({ name: '', email: '', phone: '' });
  const [pickupDialCode, setPickupDialCode] = useState('IN');
  const [pickupDialOpen, setPickupDialOpen] = useState(false);
  const [pickupDialSearch, setPickupDialSearch] = useState('');
  const pickupDialRef = useRef(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  const [pickupTermsAccepted, setPickupTermsAccepted] = useState(false);
  const [sessionSecondsLeft, setSessionSecondsLeft] = useState(null);
  const sessionTimerRef = useRef(null);


  useEffect(() => {
    const handler = (e) => {
      if (pickupDialRef.current && !pickupDialRef.current.contains(e.target)) setPickupDialOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!token) {
      navigate('/login?redirect=/checkout');
    } else {
      fetchProfile();
    }
  }, []);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    mobile: user?.phone || ''
  });
  const [dialCountryCode, setDialCountryCode] = useState('IN');
  const dialCode = COUNTRIES.find(c => c.code === dialCountryCode)?.dial || '+1';
  const [dialSearch, setDialSearch] = useState('');
  const [dialOpen, setDialOpen] = useState(false);
  const dialRef = useRef(null);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef(null);

  useEffect(() => {
    if (selectedStore) {
      setAddress({
        name: selectedStore.name || user?.name || '',
        line1: selectedStore.address || '',
        line2: '',
        city: 'Store City',
        state: 'Store State',
        pincode: '000000',
        country: 'India',
        mobile: selectedStore.phone || user?.phone || ''
      });
    } else if (user) {
      let rawPhone = user.phone || '';
      let parsedCountry = 'IN';
      
      if (rawPhone.includes(':')) {
        const parts = rawPhone.split(':');
        if (parts.length > 1) {
          parsedCountry = parts[0];
          rawPhone = parts[1];
        }
      }
      
      const dialPrefix = COUNTRIES.find(c => c.code === parsedCountry)?.dial || '';
      const mobileDigits = rawPhone.startsWith(dialPrefix) ? rawPhone.slice(dialPrefix.length) : rawPhone;

      setPickupContact(prev => ({ ...prev, name: user.name || '', email: user.email || '', phone: mobileDigits }));
      setPickupDialCode(parsedCountry);
      
      setAddress(prev => ({ ...prev, name: user.name || '', mobile: mobileDigits }));
      setDialCountryCode(parsedCountry);
    }
  }, [user, selectedStore]);
  useEffect(() => {
    const handler = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target)) setCountryOpen(false);
      if (dialRef.current && !dialRef.current.contains(e.target)) setDialOpen(false);
      if (editDialRef.current && !editDialRef.current.contains(e.target)) setEditDialOpen(false);
      if (editCountryRef.current && !editCountryRef.current.contains(e.target)) setEditCountryOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  const [editingAddr, setEditingAddr] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editDialCode, setEditDialCode] = useState('IN');
  const [editDialOpen, setEditDialOpen] = useState(false);
  const [editDialSearch, setEditDialSearch] = useState('');
  const editDialRef = useRef(null);
  const [editCountryOpen, setEditCountryOpen] = useState(false);
  const [editCountrySearch, setEditCountrySearch] = useState('');
  const editCountryRef = useRef(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = (addr) => {
    const stored = addr.mobile || '';
    // Match by country name first (most reliable), then fall back to dial prefix
    const byCountry = COUNTRIES.find(c => c.name === addr.country);
    const byDial = COUNTRIES.find(c => stored.startsWith(c.dial) && c.code === (byCountry?.code || 'US'));
    const matched = byCountry || byDial || COUNTRIES.find(c => stored.startsWith(c.dial));
    const dialPrefix = matched?.dial || '+1';
    const countryCode = matched?.code || 'US';
    const digits = stored.startsWith(dialPrefix) ? stored.slice(dialPrefix.length) : stored;
    setEditDialCode(countryCode);
    setEditForm({ ...addr, mobile: digits });
    setEditingAddr(addr.id);
  };

  const saveEdit = async () => {
    const dial = COUNTRIES.find(c => c.code === editDialCode)?.dial || '+1';
    const fullMobile = `${dial}${editForm.mobile}`;
    const data = { ...editForm, mobile: fullMobile };
    setSavingEdit(true);
    await updateAddress(editingAddr, data);
    if (selectedSavedAddress === editingAddr) {
      setAddress({ name: data.name, line1: data.line1, line2: data.line2 || '', city: data.city, state: data.state || '', pincode: data.pincode, country: data.country || 'India', mobile: editForm.mobile });
    }
    setSavingEdit(false);
    setEditingAddr(null);
  };

  const [transactionId, setTransactionId] = useState(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveAddress, setSaveAddress] = useState(false);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState(null); // id of selected saved address
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  const overlayRef = useRef(null);
  const iconRef = useRef(null);
  const textRef = useRef(null);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  
  const [shippingConfig, setShippingConfig] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [taxLabel, setTaxLabel] = useState('Tax (enter pincode)');
  const [useCoins, setUseCoins] = useState(false);
  const coinsDiscount = 0;
  const finalTotal = subtotal - discount + shippingFee + taxAmount - coinsDiscount;

  useEffect(() => {
    fetch(`${BACKEND_URL}/general/shipping`)
      .then(r => r.json())
      .then(d => {
        setShippingConfig(d);
        const allowed = d?.settings?.allowed_countries || [];
        if (allowed.length > 0 && !allowed.includes(address.country)) {
          const defaultCountryName = allowed[0];
          setAddress(a => ({ ...a, country: defaultCountryName }));
          const cObj = COUNTRIES.find(c => c.name === defaultCountryName);
          if (cObj) setDialCountryCode(cObj.code);
        }
      })
      .catch(console.error);
  }, []);

  // Recompute shipping fee whenever config loads
  useEffect(() => {
    if (!shippingConfig?.settings) return;
    const threshold = parseFloat(shippingConfig.settings.free_shipping_threshold) || 0;
    const flat = parseFloat(shippingConfig.settings.flat_rate) || 0;
    setShippingFee(threshold > 0 && (subtotal - discount) >= threshold ? 0 : flat);
  }, [shippingConfig, subtotal, discount]);

  // Recompute tax whenever subtotal, discount, address pincode, or config changes
  useEffect(() => {
    if (!shippingConfig?.settings) return;
    const { tax_mode, tax_percentage } = shippingConfig.settings;
    const taxable = subtotal - discount;

    if (tax_mode === 'pincode') {
      const pin = address.pincode?.trim();
      const rule = pin ? (shippingConfig.pincodes || []).find(p => p.pincode === pin) : null;
      const pct = rule ? parseFloat(rule.percentage) : 0;
      setTaxAmount(taxable * (pct / 100));
      setTaxLabel(rule ? `Tax (${pct}% — pincode ${pin})` : 'Tax (0% — pincode not matched)');
    } else {
      const pct = parseFloat(tax_percentage) || 0;
      setTaxAmount(taxable * (pct / 100));
      setTaxLabel(`Tax (${pct}%)`);
    }
  }, [shippingConfig, subtotal, discount, address.pincode]);

  const couponCode = appliedCoupon?.code || location.state?.couponCode || '';

  // Redirect to cart if empty (only if order is not being placed and not succeeded)
  useEffect(() => {
    if (items.length === 0 && !isPlacingOrder && !orderSuccess) {
      navigate('/cart');
    }
  }, [items, navigate, isPlacingOrder, orderSuccess]);

  // If user logs in mid-way
  useEffect(() => {
    if (token && step === 1) setStep(2.5);
  }, [token, step]);

  // Auto-select saved address or show new form
  useEffect(() => {
    if (selectedStore) return; // Do not override if managing a store

    if (addresses.length > 0) {
      const def = addresses.find(a => a.is_default) || addresses[0];
      setSelectedSavedAddress(def.id);
      const c = COUNTRIES.find(c => c.name === def.country);
      if (c) setDialCountryCode(c.code);
      // Strip dial code prefix from stored mobile if present
      const dialPrefix = c?.dial || '';
      const rawMobile = def.mobile || '';
      const mobileDigits = rawMobile.startsWith(dialPrefix) ? rawMobile.slice(dialPrefix.length) : rawMobile;
      setAddress({ name: def.name, line1: def.line1, line2: def.line2 || '', city: def.city, state: def.state || '', pincode: def.pincode, country: def.country || 'India', mobile: mobileDigits });
      setShowNewAddressForm(false);
    } else {
      setShowNewAddressForm(true);
    }
  }, [addresses, selectedStore]);

  useGSAP(() => {
    if (orderSuccess) {
      const tl = gsap.timeline();
      
      tl.from(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' })
        .from(iconRef.current, { scale: 0, rotation: -180, duration: 0.6, ease: 'back.out(1.7)' })
        .from(textRef.current, { y: 20, opacity: 0, duration: 0.4, ease: 'power2.out' }, "-=0.2")
        .to(iconRef.current, { scale: 1.1, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut', delay: 0.2 });
    }
  }, { dependencies: [orderSuccess] });

  const createOrder = async (pMethod, razorpayOrderId = null, razorpayPaymentId = null, razorpaySignature = null) => {
    const endpoint = token ? `${BACKEND_URL}/auth/orders` : `${BACKEND_URL}/general/orders`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ items, address: (orderType === 'pickup') ? { name: pickupContact.name, mobile: `${COUNTRIES.find(c=>c.code===pickupDialCode)?.dial||'+1'}${pickupContact.phone}`, email: pickupContact.email } : address, total: finalTotal, coupon_code: couponCode, payment_method: pMethod, order_type: orderType, razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature, discount_amount: discount, shipping_fee: shippingFee, tax_amount: taxAmount, store_id: selectedStore?.id })
    });
    return res.json();
  };

  const handleProceedToPayment = async () => {
    if (orderType !== 'pickup') {
      const errs = {};
      if (!selectedStore) {
        if (!address.name.trim()) errs.name = 'Full name is required';
        if (!address.line1.trim()) errs.line1 = 'Address is required';
        if (!address.city.trim()) errs.city = 'City is required';
        if (!address.pincode.trim()) errs.pincode = 'ZIP code is required';
        if (!address.country.trim()) errs.country = 'Country is required';
        const mobileDigits = address.mobile.replace(/\D/g, '');
        if (!address.mobile.trim()) {
          errs.mobile = 'Phone number is required';
        } else if (['US', 'CA', 'IN'].includes(dialCountryCode) && mobileDigits.length !== 10) {
          errs.mobile = `Enter a valid 10-digit number`;
        } else if (!['US', 'CA', 'IN'].includes(dialCountryCode) && (mobileDigits.length < 5 || mobileDigits.length > 15)) {
          errs.mobile = 'Enter a valid phone number';
        }
      }
      if (Object.keys(errs).length > 0) {
        setFieldErrors(errs);
        showToast('Please fix the highlighted fields.', 'error');
        return;
      }
      setFieldErrors({});
      // Shippo address validation
      try {
        const token = localStorage.getItem('token');
        const valRes = await fetch(`${BACKEND_URL}/general/validate-address`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify({
            name: address.name,
            street1: address.line1,
            street2: address.line2 || '',
            city: address.city,
            state: address.state || '',
            zip: address.pincode,
            country: address.country,
            phone: address.mobile
          })
        });
        const valData = await valRes.json();
        if (!valData.valid && !selectedStore) {
          showToast(valData.message || 'Address could not be validated. Please check and try again.', 'error');
          return;
        }
      } catch (e) {
        console.warn('Address validation failed, proceeding anyway:', e);
      }
    } else if (orderType === 'pickup') {
      if (!pickupContact.name.trim()) { showToast('Please enter your name.', 'error'); return; }
      if (!pickupContact.phone.trim() || pickupContact.phone.replace(/\D/g, '').length < 10) {
        showToast('Please enter a valid 10-digit phone number for pickup notification.', 'error');
        return;
      }
    }
    if (token && saveAddress && orderType !== 'pickup') {
      addAddress({ ...address, mobile: `${dialCode}${address.mobile}`, is_default: saveAsDefault }).catch(() => {});
    }
    
    if (orderType === 'pickup') {
      setSessionSecondsLeft(SESSION_MINUTES * 60);
      setStep(3);
      return;
    }

    // Call place order directly
    await handlePlaceOrder();
  };

  // Session countdown effect
  useEffect(() => {
    if (sessionSecondsLeft === null) return;
    if (sessionSecondsLeft <= 0) {
      clearInterval(sessionTimerRef.current);
      showToast('Your session has expired. Please restart checkout.', 'error');
      setStep(2.5);
      setSessionSecondsLeft(null);
      return;
    }
    sessionTimerRef.current = setInterval(() => setSessionSecondsLeft(s => s - 1), 1000);
    return () => clearInterval(sessionTimerRef.current);
  }, [sessionSecondsLeft]);

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    setPaymentError(null);
    try {
      const stockRes = await fetch(`${BACKEND_URL}/general/check-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      });
      const stockData = await stockRes.json();
      if (!stockData.available) {
        const names = stockData.unavailable.map(u => `"${u.name}" (${u.available ?? 0} left)`).join(', ');
        showToast(`Sorry, ${names} is no longer available in the requested quantity.`, 'error');
        setIsPlacingOrder(false);
        return;
      }

      // Direct Order Placement Flow
      const createOrderData = await createOrder('cod');
      if (createOrderData.success) {
        setIsPlacingOrder(false);
        setOrderSuccess(true);
        setTimeout(() => {
          clearCart();
          navigate(`/order-tracking/${createOrderData.order.order_number}`);
        }, 3000);
      } else {
        showToast('Failed to place order.', 'error');
        setPaymentError('We could not create your order. Please try again.');
        setIsPlacingOrder(false);
      }
    } catch (err) {
      console.error(err);
      setIsPlacingOrder(false);
    }
  };

  const pickupEnabled = shippingConfig?.settings?.pickup_enabled ?? false;

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center mb-6 px-2 bg-white/80 p-3 rounded-xl shadow-sm border border-brand-blue/10">
      <div className="flex flex-col items-center cursor-pointer" onClick={() => navigate('/cart')}>
        <div className="w-6 h-6 rounded-full bg-white text-brand-blue flex items-center justify-center text-xs font-bold border border-brand-blue/10">✓</div>
        <span className="text-[10px] text-gray-900 font-bold mt-1">Cart</span>
      </div>
      <div className={`h-px flex-1 mx-2 ${step >= 2 ? 'bg-brand-blue text-white/40' : 'bg-brand-blue text-white/20'}`}></div>
      <div className="flex flex-col items-center">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-white text-brand-blue border border-brand-blue/10' : 'bg-brand-beige-darker text-gray-900/50 border border-brand-dark-blue/10'}`}>
          {step > 2 ? '✓' : '1'}
        </div>
        <span className={`text-[10px] font-bold mt-1 ${step >= 2 ? 'text-gray-900' : 'text-gray-900/50'}`}>Shipping</span>
      </div>
      <div className={`h-px flex-1 mx-2 ${step >= 2.5 ? 'bg-brand-blue text-white/40' : 'bg-brand-blue text-white/20'}`}></div>
      <div className="flex flex-col items-center" onClick={() => { if (step === 3 && orderType !== 'pickup') { setStep(2.5); setSessionSecondsLeft(null); clearInterval(sessionTimerRef.current); setAddressConfirmed(false); setTermsAccepted(false); } }} style={{ cursor: step === 3 && orderType !== 'pickup' ? 'pointer' : 'default' }}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2.5 ? 'bg-white text-brand-blue border border-brand-blue/10' : 'bg-brand-beige-darker text-gray-900/50 border border-brand-dark-blue/10'}`}>
          {step > 2.5 ? '✓' : '2'}
        </div>
        <span className={`text-[10px] font-bold mt-1 ${step >= 2.5 ? 'text-gray-900' : 'text-gray-900/50'}`}>Address</span>
      </div>
      <div className={`h-px flex-1 mx-2 ${step >= 3 ? 'bg-brand-blue text-white/40' : 'bg-brand-blue text-white/20'}`}></div>
      <div className={`flex flex-col items-center ${step < 3 ? 'opacity-70' : ''}`}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 3 ? 'bg-white text-brand-blue border border-brand-blue/10' : 'bg-brand-beige-darker text-gray-900/50 border border-brand-dark-blue/10'}`}>3</div>
        <span className={`text-[10px] font-bold mt-1 ${step >= 3 ? 'text-gray-900' : 'text-gray-900/50'}`}>Payment</span>
      </div>
    </div>
  );

  const SESSION_MINUTES = 5;
  const formatTime = (s) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  const allowedCountries = shippingConfig?.settings?.allowed_countries || [];
  const displayCountries = allowedCountries.length > 0 
    ? COUNTRIES.filter(c => allowedCountries.includes(c.name))
    : COUNTRIES;

  return (
    <div className="min-h-screen bg-white font-sans pb-36">
      {/* ── Yellow Hero Header ── */}
      <div className="bg-[#FFC107] pt-12 pb-10 px-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
        </div>
      </div>

      {/* ── White Card ── */}
      <div className="bg-white rounded-t-[28px] -mt-5 relative z-10 min-h-screen p-4 md:p-8 space-y-4 md:max-w-7xl mx-auto">
        {renderStepIndicator()}

        {/* Mobile Order Summary (collapsible) */}
        <div className="lg:hidden">
          <button
            onClick={() => setSummaryOpen(o => !o)}
            className="w-full flex items-center justify-between bg-white/90 border border-brand-blue/10 rounded-2xl px-4 py-3.5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-brand-blue" />
              <span className="text-sm font-bold text-gray-900">Order Summary</span>
              <span className="text-xs bg-brand-blue text-white font-bold px-2 py-0.5 rounded-full">{items.length} item{items.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-brand-blue">₹{finalTotal.toFixed(2)}</span>
              <svg className={`w-4 h-4 text-gray-900/50 transition-transform ${summaryOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </button>

          {summaryOpen && (
            <div className="mt-2 bg-white/90 border border-brand-blue/10 rounded-2xl p-4 shadow-sm space-y-4">
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={`${item.product.id}-${item.variant?.size}`} className="flex gap-3">
                    <div className="w-14 h-14 bg-white rounded-xl border border-brand-blue/10 p-1 shrink-0">
                      <img src={getImgSrc(item)} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-900/60">Qty: {item.qty} | {item.variant?.size || 'Standard'}</p>
                      <p className="text-sm font-bold text-brand-blue">₹{((item.variant?.price || item.product.price) * item.qty).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-brand-blue/10 pt-3 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-900/70">
                  <span>Item Total</span><span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-brand-blue">
                    <span>Coupon ({appliedCoupon.code})</span><span>- ₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-900/70">
                  <span>Shipping</span>
                  <span className="font-medium">{shippingFee === 0 && (parseFloat(shippingConfig?.settings?.free_shipping_threshold) || 0) > 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${shippingFee.toFixed(2)}`}</span>
                </div>
                {(taxAmount > 0 || shippingConfig?.settings?.tax_mode === 'pincode') && (
                  <div className="flex justify-between text-sm text-gray-900/70">
                    <span>{taxLabel || 'Tax'}</span><span className="font-medium">₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-brand-blue/10">
                  <span>Grand Total</span><span className="text-brand-blue">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-12 items-start">
          {/* Left Column: Forms */}
          <div className="lg:col-span-8 space-y-6">


            {step === 2.5 && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-brand-blue" />
              </div>
              Shipping Address
            </h2>

            {/* Store Address Only */}
            <div className="bg-white rounded-2xl border-2 border-brand-blue/10 p-5 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-bold text-gray-900 uppercase tracking-wider">Store Shipping Address</p>
                <div className="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-lg uppercase tracking-wider">Verified</div>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed">
                <p className="font-bold text-gray-900 text-base mb-1">{address.name}</p>
                <p>{address.line1}</p>
                <p className="mt-2 text-gray-500 font-medium flex items-center gap-1.5"><svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> {address.mobile}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
                This is the registered address for your store. Orders will be shipped here automatically.
              </div>
            </div>


          </div>
        )}
        {step === 3 && orderType === 'pickup' && (
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-start gap-3">
                <Store className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-800">Store Pickup Selected</p>
                  <p className="text-sm text-blue-700 mt-1">Once your order is ready, our team will message you via <strong>WhatsApp/Text</strong> from <strong>+91 88860 00847</strong></p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-t border-blue-200 pt-3">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-800">Nearby Pickup Location</p>
                  <p className="text-sm text-blue-700">10-34 Malkapur X road, Sangareddy-502001</p>
                  <a href="https://maps.google.com/?q=Aspari+main+road+opposite+APGB+Bank,+518347" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-bold underline hover:text-blue-800">View on Google Maps →</a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-brand-blue/10 p-5 space-y-4">
              <p className="text-sm font-bold text-gray-900">Contact Details for Pickup Notification</p>

              {/* Full Name */}
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Full Name *</label>
                <input
                  value={pickupContact.name}
                  onChange={e => setPickupContact(p => ({ ...p, name: e.target.value }))}
                  placeholder="Your full name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-blue/10 focus:ring-1 focus:ring-brand-gold/30 transition-all"
                />
              </div>

              {/* Phone with country code */}
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Mobile *</label>
                <div className="flex gap-2">
                  {/* Country code picker */}
                  <div ref={pickupDialRef} className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => { setPickupDialOpen(o => !o); setPickupDialSearch(''); }}
                      className="h-full min-w-[90px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm flex items-center gap-1.5 focus:outline-none focus:border-brand-blue/10 hover:border-brand-blue/10 transition-all"
                    >
                      <span>{String.fromCodePoint(...[...pickupDialCode.toUpperCase()].map(x => 127397 + x.charCodeAt(0)))}</span>
                      <span className="font-bold text-gray-700 text-xs">{COUNTRIES.find(c=>c.code===pickupDialCode)?.dial || '+1'}</span>
                      <svg className={`w-3 h-3 text-gray-400 transition-transform shrink-0 ${pickupDialOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    {pickupDialOpen && (
                      <div className="absolute z-50 mt-1 left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                        <div className="p-2 border-b border-gray-100">
                          <input
                            autoFocus
                            type="text"
                            value={pickupDialSearch}
                            onChange={e => setPickupDialSearch(e.target.value)}
                            placeholder="Search country..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue/10"
                          />
                        </div>
                        <ul className="max-h-52 overflow-y-auto">
                          {COUNTRIES.filter(c =>
                            c.name.toLowerCase().includes(pickupDialSearch.toLowerCase()) ||
                            c.dial.includes(pickupDialSearch)
                          ).map(c => (
                            <li key={c.code}>
                              <button
                                type="button"
                                onClick={() => { setPickupDialCode(c.code); setPickupDialOpen(false); }}
                                className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${
                                  pickupDialCode === c.code ? 'bg-brand-blue text-white/10 font-bold text-gray-900' : 'text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                <span>{String.fromCodePoint(...[...c.code.toUpperCase()].map(x => 127397 + x.charCodeAt(0)))}</span>
                                <span className="flex-1 truncate">{c.name}</span>
                                <span className="text-gray-400 font-mono text-xs shrink-0">{c.dial}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={pickupContact.phone}
                    onChange={e => setPickupContact(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 15) }))}
                    placeholder="Phone number"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-blue/10 focus:ring-1 focus:ring-brand-gold/30 transition-all"
                  />
                </div>
                <p className="text-[10px] text-amber-600 font-medium mt-1.5 flex items-center gap-1">
                  💬 For best experience, please provide your WhatsApp number — we'll send pickup updates via WhatsApp/Text.
                </p>
              </div>

              {/* Email */}
              {!user?.email && (
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Email (optional)</label>
                  <input
                    value={pickupContact.email}
                    onChange={e => setPickupContact(p => ({ ...p, email: e.target.value }))}
                    placeholder="your@email.com"
                    type="email"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-brand-blue/10 focus:ring-1 focus:ring-brand-gold/30 transition-all"
                  />
                </div>
              )}
            </div>

            {/* Pickup T&C */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
              <p className="text-xs font-bold text-amber-800">⚠️ Pickup Terms & Conditions</p>
              <ul className="space-y-1.5 text-xs text-amber-700 leading-relaxed">
                <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>Please inspect your item(s) carefully at the time of pickup before leaving the store.</span></li>
                <li className="flex items-start gap-2"><span className="shrink-0">•</span><span><strong>Any damage must be reported within 1–2 business days</strong> of pickup. Claims after this window cannot be accepted.</span></li>
                <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>Bring a valid photo ID and your order confirmation when picking up.</span></li>
                <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>Orders not picked up within 7 days of the ready notification may be subject to restocking.</span></li>
                <li className="flex items-start gap-2"><span className="shrink-0">•</span><span>All sales are <strong>final — no returns or exchanges</strong> on pickup orders.</span></li>
              </ul>
              <label className="flex items-start gap-2.5 cursor-pointer pt-1 border-t border-amber-200">
                <input type="checkbox" checked={pickupTermsAccepted} onChange={e => setPickupTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-amber-700 shrink-0" />
                <span className="text-xs text-amber-800 font-medium leading-relaxed">
                  I have read and agree to the above pickup terms & conditions.
                </span>
              </label>
            </div>
          </div>
        )}

        {step === 3 && orderType === 'pickup' && (
          <div className="max-w-3xl mx-auto mt-4">
            <button
              onClick={() => {
                if (!pickupContact.name.trim()) { showToast('Please enter your name.', 'error'); return; }
                if (pickupContact.phone.replace(/\D/g, '').length < 7) { showToast('Please enter a valid phone number.', 'error'); return; }
                if (!pickupTermsAccepted) { showToast('Please accept the Pickup Terms & Conditions to proceed.', 'error'); return; }
                handlePlaceOrder(null, null);
              }}
              disabled={isPlacingOrder || !pickupTermsAccepted}
              className={`w-full font-bold text-base rounded-xl py-4 flex items-center justify-center gap-2 transition-all ${
                isPlacingOrder || !pickupTermsAccepted
                  ? 'opacity-50 cursor-not-allowed bg-gray-200 text-gray-400'
                  : 'bg-white text-brand-blue shadow-lg shadow-brand-dark-blue/20 hover:shadow-xl hover:-translate-y-0.5'
              }`}
            >
              {isPlacingOrder
                ? <><div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Placing Order...</>
                : '✓ Confirm Pickup Order'
              }
            </button>
          </div>
        )}
        {step === 3 && orderType !== 'pickup' && (
          <RazorpayPaymentForm
            isStoreOrder={!!selectedStore}
            isPlacingOrder={isPlacingOrder}
            handlePlaceOrder={handlePlaceOrder}
            termsAccepted={termsAccepted}
            setTermsAccepted={setTermsAccepted}
            addressConfirmed={addressConfirmed}
            setAddressConfirmed={setAddressConfirmed}
            address={address}
            sessionSecondsLeft={sessionSecondsLeft}
            onEditAddress={() => { setStep(2.5); setSessionSecondsLeft(null); clearInterval(sessionTimerRef.current); setAddressConfirmed(false); setTermsAccepted(false); }}
            paymentError={paymentError}
            onRetry={() => setPaymentError(null)}
          />
        )}
      </div>          {/* Right Column: Order Summary (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="bg-white/80 p-6 rounded-3xl shadow-sm border border-brand-blue/10">
              <h3 className="font-serif font-bold text-gray-900 mb-6 text-xl">Order Summary</h3>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto hide-scrollbar pr-2 mb-6">
                {items.map(item => (
                  <div key={`${item.product.id}-${item.variant?.size}`} className="flex gap-4">
                    <div className="w-16 h-16 bg-white rounded-xl border border-brand-blue/10 p-1 shrink-0">
                      <img src={getImgSrc(item)} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-1">{item.product.name}</h4>
                      <p className="text-xs text-gray-900/60 mt-1">Qty: {item.qty} | {item.variant?.size || 'Std'}</p>
                      {item.product.product_code && (
                        <span className="text-[10px] font-bold text-brand-orange bg-brand-orange text-white/10 px-1.5 py-0.5 rounded border border-[#D4AF37]/20">#{item.product.product_code}</span>
                      )}
                      <p className="text-sm font-bold text-brand-blue mt-1">₹{((item.variant?.price || item.product.price) * item.qty).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-brand-blue/10 pt-4 mb-6">
                <div className="flex justify-between text-sm text-gray-900/80 mb-2">
                  <span>Item Total</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-sm text-brand-blue mb-2">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span className="font-medium">- ₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-900/80 mb-2">
                  <span>Shipping Fee</span>
                  <span className="font-medium text-gray-900">{shippingFee === 0 && (parseFloat(shippingConfig?.settings?.free_shipping_threshold) || 0) > 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${shippingFee.toFixed(2)}`}</span>
                </div>
                {(taxAmount > 0 || shippingConfig?.settings?.tax_mode === 'pincode') && (
                  <div className="flex justify-between text-sm text-gray-900/80 mb-2">
                    <span>{taxLabel || 'Tax'}</span>
                    <span className="font-medium text-gray-900">₹{taxAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-gray-900 text-xl pt-2 border-t border-brand-blue/10">
                  <span>Grand Total</span>
                  <span className="text-brand-blue">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {(step === 2 || step === 2.5) ? (
                <button 
                  onClick={step === 2 && pickupEnabled ? undefined : handleProceedToPayment}
                  disabled={step === 2 && pickupEnabled}
                  className={`w-full bg-brand-blue text-white font-bold text-base rounded-xl py-4 shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:bg-brand-blue/90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${step === 2 && pickupEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  Place Order
                </button>
              ) : null}
              
              <div className="flex items-center justify-center gap-2 mt-4 text-gray-400">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-medium">100% Secure Transaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-brand-beige/95 backdrop-blur-md border-t border-brand-blue/10 p-4 pb-safe z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] mx-auto w-full">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-4">
            <div>
              <>
                <p className="text-xs font-bold text-gray-900/60 uppercase tracking-wider mb-1">Payable Amount</p>
                <div className="flex flex-col">
                  {appliedCoupon && <span className="text-[10px] text-brand-blue font-bold -mb-1">Code applied: {appliedCoupon.code}</span>}
                  <p className="text-2xl font-bold text-gray-900 leading-none">₹{finalTotal.toFixed(2)}</p>
                </div>
              </>
            </div>
          </div>
          
          {(step === 2 || step === 2.5) ? (
            <button 
              onClick={step === 2 && pickupEnabled ? undefined : handleProceedToPayment}
              disabled={step === 2 && pickupEnabled}
              className={`w-full bg-brand-blue text-white font-bold text-base rounded-xl py-4 shadow-lg shadow-brand-blue/30 hover:shadow-xl hover:bg-brand-blue/90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 ${step === 2 && pickupEnabled ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              Place Order
            </button>
          ) : null}
        
        <div className="flex items-center justify-center gap-1 mt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[9px] text-gray-400 font-medium">Your order is safe and secure</span>
        </div>
        </div>
      </div>

      {/* Placing Order Spinner */}
      {isPlacingOrder && (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="w-14 h-14 border-4 border-brand-blue/10 border-t-brand-gold rounded-full animate-spin mb-4" />
          <p className="text-sm font-semibold text-gray-900">Processing your Order...</p>
        </div>
      )}

      {/* Order Confirmed Overlay */}
      {orderSuccess && (
        <div ref={overlayRef} className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center w-full h-full">
          <div className="flex flex-col items-center gap-4 px-6 text-center">
            <div ref={iconRef} className="w-24 h-24 bg-brand-blue text-white rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
            </div>
            <h2 ref={textRef} className="text-2xl font-serif font-bold text-gray-900">Order Confirmed!</h2>
            <p className="text-sm text-gray-600 max-w-sm leading-relaxed">
              Thank you for placing your order with VConnect. We're delighted to begin preparing your selection and will keep you updated throughout its journey to you.
            </p>
            {transactionId && (
              <p className="text-xs text-gray-400 font-mono bg-gray-100 px-4 py-2 rounded-lg">
                Transaction ID: <span className="text-gray-900 font-semibold">{transactionId}</span>
              </p>
            )}
            <p className="text-sm text-gray-400">Redirecting to tracking...</p>
          </div>
        </div>
      )}
    </div>
  );
}
