import { useState, useEffect, useMemo, useRef, createContext, useContext, useCallback } from 'react'
import type { FormEvent, ReactNode } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────
type Category = 'Heritage & Culture' | 'Spiritual & Pilgrimage' | 'Forts & Palaces' | 'Waterfalls & Nature' | 'Wildlife & Sanctuaries'
type Lang = 'en' | 'hi'

interface CityLink {
  slug: string
  name: string
  localName: string
  state: string
  tagline: string
  taglineHi: string
  category: Category
  discoveryScore: number
  tags: string[]
  image: string
  url: string
  isStockImage?: boolean
}

interface UPUser {
  name: string
  email: string
}

// ─── Destinations config ─────────────────────────────────────────────────────
const W = 'https://commons.wikimedia.org/wiki/Special:FilePath/'

const cities: CityLink[] = [
  {
    slug: 'agra', name: 'Agra', localName: 'आगरा', state: 'Uttar Pradesh',
    tagline: 'The Taj Mahal & three UNESCO sites.',
    taglineHi: 'ताज महल और तीन यूनेस्को स्थल।',
    category: 'Heritage & Culture', discoveryScore: 9.2,
    tags: ['UNESCO World Heritage', 'Mughal Architecture', 'Taj Mahal'],
    image: W + 'Taj_Mahal_Sunset.jpg?width=1200',
    url: 'https://agratourism.netlify.app/agra'
  },
  {
    slug: 'fatehpur-sikri', name: 'Fatehpur Sikri', localName: 'फ़तेहपुर सीकरी', state: 'Uttar Pradesh',
    tagline: "Akbar's abandoned red-sandstone capital.",
    taglineHi: 'अकबर की परित्यक्त लाल बलुआ पत्थर की राजधानी।',
    category: 'Forts & Palaces', discoveryScore: 8.6,
    tags: ['UNESCO World Heritage', 'Day Trip from Agra', 'Red Sandstone City'],
    image: W + 'Fatehput_Sikiri_Buland_Darwaza_gate_2010.jpg?width=1200',
    url: 'https://agratourism.netlify.app/fatehpur-sikri'
  },
  {
    slug: 'varanasi', name: 'Varanasi', localName: 'वाराणसी (काशी)', state: 'Uttar Pradesh',
    tagline: 'Ghats, temples & the nightly Ganga Aarti.',
    taglineHi: 'घाट, मंदिर और रात्रि गंगा आरती।',
    category: 'Spiritual & Pilgrimage', discoveryScore: 9.3,
    tags: ['Ganga Ghats', 'Kashi Vishwanath', 'Ganga Aarti'],
    image: W + 'Ganga_Aarti_at_ghats_in_Varanasi.jpg?width=1200',
    url: 'https://varanasitourism1.netlify.app/'
  },
  {
    slug: 'mathura', name: 'Mathura', localName: 'मथुरा', state: 'Uttar Pradesh',
    tagline: "Krishna's birthplace, gateway to Braj.",
    taglineHi: 'कृष्ण जन्मभूमि, ब्रज का प्रवेशद्वार।',
    category: 'Spiritual & Pilgrimage', discoveryScore: 8.9,
    tags: ['Krishna Janmabhoomi', 'Braj Bhoomi', 'Vishram Ghat'],
    image: W + 'Vishram Ghat.jpg?width=1200',
    url: 'https://mathuratourism2.netlify.app/mathura'
  },
  {
    slug: 'vrindavan', name: 'Vrindavan', localName: 'वृन्दावन', state: 'Uttar Pradesh',
    tagline: 'Prem Mandir, Banke Bihari & ISKCON.',
    taglineHi: 'प्रेम मंदिर, बांके बिहारी और इस्कॉन।',
    category: 'Spiritual & Pilgrimage', discoveryScore: 9.0,
    tags: ['Prem Mandir', 'ISKCON', 'Living Temple City'],
    image: W + 'A_Hindu_temple_Prem_Mandir_Love_temple_sights_culture_India.jpg?width=1200',
    url: 'https://mathuratourism2.netlify.app/vrindavan'
  },
  {
    slug: 'prayagraj', name: 'Prayagraj', localName: 'प्रयागराज', state: 'Uttar Pradesh',
    tagline: 'Triveni Sangam & the Kumbh Mela.',
    taglineHi: 'त्रिवेणी संगम और कुंभ मेला।',
    category: 'Spiritual & Pilgrimage', discoveryScore: 9.1,
    tags: ['Triveni Sangam', 'Kumbh Mela', 'Allahabad Fort'],
    image: W + 'Triveni_Sangam.JPG?width=1200',
    url: 'https://prayagrajtourism1.netlify.app/'
  },
  {
    slug: 'mokaam-waterfall', name: 'Mokaam Waterfall', localName: 'मुकाम जलप्रपात', state: 'Uttar Pradesh',
    tagline: 'A hidden cascade, off the map.',
    taglineHi: 'एक छिपा झरना, नक्शे से परे।',
    category: 'Waterfalls & Nature', discoveryScore: 5.1,
    tags: ['Hidden Waterfall', 'Eco-Tourism', 'Off the Beaten Track'],
    image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&h=800&fit=crop&auto=format',
    url: '',
    isStockImage: true
  },
  {
    slug: 'lucknow', name: 'Lucknow', localName: 'लखनऊ', state: 'Uttar Pradesh',
    tagline: 'Nawabi grandeur & living tehzeeb.',
    taglineHi: 'नवाबी शान और जीवंत तहज़ीब।',
    category: 'Heritage & Culture', discoveryScore: 8.7,
    tags: ['Nawabi Heritage', 'Bara Imambara', '1857 Rebellion'],
    image: W + 'Bara Imambara Lucknow.jpg?width=1200',
    url: ''
  },
  {
    slug: 'mirzapur', name: 'Mirzapur', localName: 'मिर्ज़ापुर', state: 'Uttar Pradesh',
    tagline: 'Forest waterfalls & carpet looms.',
    taglineHi: 'वन झरने और कालीन बुनाई।',
    category: 'Waterfalls & Nature', discoveryScore: 7.9,
    tags: ['Lakhaniya Dari Falls', 'Chunar Fort', 'Carpet Weaving'],
    image: W + 'Lakhaniya Dari.jpg?width=1200',
    url: ''
  },
  {
    slug: 'bakhira', name: 'Bakhira Bird Sanctuary', localName: 'बखिरा पक्षी अभयारण्य', state: 'Uttar Pradesh',
    tagline: 'A Ramsar wetland for migratory birds.',
    taglineHi: 'प्रवासी पक्षियों के लिए रामसर आर्द्रभूमि।',
    category: 'Wildlife & Sanctuaries', discoveryScore: 6.1,
    tags: ['Ramsar Wetland', 'Migratory Birds', 'Sarus Crane'],
    image: W + 'Nature photography of bakhira jheel.jpg?width=1200',
    url: ''
  }
]

const categories = ['All', 'Heritage & Culture', 'Spiritual & Pilgrimage', 'Forts & Palaces', 'Waterfalls & Nature', 'Wildlife & Sanctuaries'] as const

// ─── Translation dictionary ──────────────────────────────────────────────────
type Bi = { en: string; hi: string }
const T = {
  navDestinations: { en: 'Destinations', hi: 'गंतव्य' },
  navCategories: { en: 'Categories', hi: 'श्रेणियाँ' },
  navCircuits: { en: 'Circuits', hi: 'सर्किट' },
  navWhyD360: { en: 'Why D360', hi: 'D360 क्यों' },
  navLogin: { en: 'Log In / Sign Up', hi: 'लॉग इन / साइन अप' },
  navExplore: { en: 'Explore', hi: 'अन्वेषण करें' },
  navSignedInAs: { en: 'Signed in as', hi: 'साइन इन है:' },
  navExploreDestinations: { en: 'Explore Destinations', hi: 'गंतव्य देखें' },
  navTagline: { en: 'Uttar Pradesh Tourism', hi: 'उत्तर प्रदेश पर्यटन' },
  userMyTrips: { en: 'My Trips', hi: 'मेरी यात्राएँ' },
  userMyWishlist: { en: 'My Wishlist', hi: 'मेरी विशलिस्ट' },
  userProfile: { en: 'Profile Settings', hi: 'प्रोफ़ाइल सेटिंग्स' },
  userSignOut: { en: 'Sign Out', hi: 'साइन आउट' },
  authWelcomeBack: { en: 'Welcome back', hi: 'वापसी पर स्वागत है' },
  authCreateAccount: { en: 'Create your account', hi: 'अपना खाता बनाएं' },
  authLoginSub: { en: 'Log in to save trips and get personalized picks.', hi: 'यात्राएं सहेजने और निजी सुझाव पाने के लिए लॉग इन करें।' },
  authSignupSub: { en: 'Sign up to save destinations and track your UP itinerary.', hi: 'गंतव्य सहेजने और अपनी यूपी यात्रा ट्रैक करने के लिए साइन अप करें।' },
  authLogIn: { en: 'Log In', hi: 'लॉग इन' },
  authSignUp: { en: 'Sign Up', hi: 'साइन अप' },
  authFullName: { en: 'Full Name', hi: 'पूरा नाम' },
  authEmail: { en: 'Email', hi: 'ईमेल' },
  authPassword: { en: 'Password', hi: 'पासवर्ड' },
  authCreateAccountBtn: { en: 'Create Account', hi: 'खाता बनाएं' },
  authDemoNote: { en: 'This is a demo account system for the UP Tourism preview — no real data leaves your browser.', hi: 'यह UP पर्यटन प्रीव्यू के लिए एक डेमो खाता प्रणाली है — कोई भी डेटा आपके ब्राउज़र से बाहर नहीं जाता।' },
  heroEyebrow: { en: 'Official D360 Guide to Uttar Pradesh Tourism', hi: 'उत्तर प्रदेश पर्यटन के लिए आधिकारिक D360 गाइड' },
  heroTitleLine1: { en: 'Discover Beyond', hi: 'सामान्य से परे' },
  heroTitleLine2: { en: 'the Usual', hi: 'की खोज करें' },
  heroSubtitle: { en: 'Spiritual circuits, forts, waterfalls and wildlife — all of Uttar Pradesh, richly documented.', hi: 'आध्यात्मिक सर्किट, किले, झरने और वन्यजीव — संपूर्ण उत्तर प्रदेश का विस्तृत दस्तावेज़।' },
  heroSearchPlaceholder: { en: 'Search Agra, Vrindavan, Varanasi…', hi: 'आगरा, वृन्दावन, वाराणसी खोजें…' },
  heroTrending: { en: 'Trending:', hi: 'ट्रेंडिंग:' },
  categoryEyebrow: { en: 'Explore by Interest', hi: 'रुचि अनुसार अन्वेषण' },
  categoryTitle: { en: 'More of Uttar Pradesh, one interest at a time', hi: 'उत्तर प्रदेश को एक-एक रुचि से जानिए' },
  categorySubtitle: { en: 'New pages added regularly.', hi: 'नए पृष्ठ नियमित रूप से जुड़ते हैं।' },
  categoryDestinationWord: { en: 'destinations', hi: 'गंतव्य' },
  statDestinations: { en: 'Destinations Documented', hi: 'दस्तावेज़ित गंतव्य' },
  statCategories: { en: 'Interest Categories', hi: 'रुचि श्रेणियाँ' },
  statAttractions: { en: 'Attractions & Hidden Gems', hi: 'आकर्षण और छिपे रत्न' },
  statAI: { en: 'Ask D360 AI Trip Planning', hi: 'D360 AI यात्रा योजना' },
  carouselHandpicked: { en: 'Handpicked for You', hi: 'आपके लिए चुनिंदा' },
  carouselHidden: { en: 'Unlock Lesser-Known Wonders of UP', hi: 'यूपी के अनदेखे चमत्कार खोजें' },
  badgeSoon: { en: 'Soon', hi: 'जल्द' },
  gridEyebrow: { en: 'All Destinations', hi: 'सभी गंतव्य' },
  gridTitle: { en: 'Every place, one platform', hi: 'हर जगह, एक मंच' },
  gridNoMatch: { en: 'No destinations match', hi: 'कोई गंतव्य मेल नहीं खाता' },
  gridTryDifferent: { en: 'try a different search.', hi: 'अलग खोज आज़माएं।' },
  gridComingSoon: { en: 'Coming Soon', hi: 'जल्द आ रहा है' },
  gridExploreWord: { en: 'Explore', hi: 'देखें' },
  gridSiteLaunchingSoon: { en: 'Site launching soon', hi: 'साइट जल्द लॉन्च होगी' },
  gridRepresentativeImage: { en: 'representative image', hi: 'प्रतिनिधि छवि' },
  categoryAll: { en: 'All', hi: 'सभी' },
  offersEyebrow: { en: 'Seasonal Highlights', hi: 'मौसमी विशेषताएं' },
  offersTitle: { en: 'Time it right', hi: 'सही समय चुनें' },
  circuitsEyebrow: { en: 'Linked Circuits', hi: 'जुड़े हुए सर्किट' },
  circuitsTitle: { en: 'Destinations that belong together, built together', hi: 'साथ बने, साथ जुड़े गंतव्य' },
  circuitStart: { en: 'Start the circuit', hi: 'सर्किट शुरू करें' },
  askingEyebrow: { en: 'Travelers Are Asking', hi: 'यात्री पूछ रहे हैं' },
  askingTitle: { en: 'Real questions, answered by Ask D360', hi: 'असली सवाल, Ask D360 के जवाब' },
  trustEyebrow: { en: 'Trust & Transparency Pledge', hi: 'विश्वास और पारदर्शिता प्रतिज्ञा' },
  trustTitle: { en: 'Why D360', hi: 'D360 क्यों' },
  trustSubtitle: { en: 'Depth Over Breadth', hi: 'विस्तार से अधिक गहराई' },
  newsletterTitle: { en: 'Get notified about new destinations', hi: 'नए गंतव्यों की सूचना पाएं' },
  newsletterSub: { en: 'New UP pages as they launch.', hi: 'नए यूपी पृष्ठ लॉन्च होते ही।' },
  newsletterThanks: { en: "You're on the list — thank you!", hi: 'आप सूची में हैं — धन्यवाद!' },
  newsletterBtn: { en: 'Notify Me', hi: 'मुझे सूचित करें' },
  ctaTitle: { en: 'Your next destination is already documented', hi: 'आपका अगला गंतव्य पहले से दस्तावेज़ित है' },
  ctaSub: { en: 'Start exploring.', hi: 'अन्वेषण शुरू करें।' },
  ctaBtn: { en: 'Browse All Destinations', hi: 'सभी गंतव्य देखें' },
  footerAbout: { en: 'Discover Beyond the Usual — editorially researched travel guides for Uttar Pradesh and the Braj region.', hi: 'सामान्य से परे की खोज — उत्तर प्रदेश और ब्रज क्षेत्र के लिए संपादकीय रूप से शोधित यात्रा गाइड।' },
  footerDestinations: { en: 'Destinations', hi: 'गंतव्य' },
  footerCategories: { en: 'Categories', hi: 'श्रेणियाँ' },
  footerExplore: { en: 'Explore', hi: 'अन्वेषण करें' },
  footerLinkedCircuits: { en: 'Linked Circuits', hi: 'जुड़े सर्किट' },
  footerWhyD360: { en: 'Why D360', hi: 'D360 क्यों' },
  footerMyWishlist: { en: 'My Wishlist', hi: 'मेरी विशलिस्ट' },
  footerAboutHeading: { en: 'About', hi: 'परिचय' },
  footerAboutText: { en: 'Built as part of the Darshan 360 project. DishaAI trip-planning assistant coming soon.', hi: 'दर्शन 360 परियोजना के भाग के रूप में निर्मित। DishaAI यात्रा सहायक जल्द आ रहा है।' },
  footerCopyright: { en: '© 2026 D360 — Uttar Pradesh Tourism · Discover Beyond the Usual.', hi: '© 2026 D360 — उत्तर प्रदेश पर्यटन · सामान्य से परे की खोज।' },
  footerCountry: { en: 'Uttar Pradesh, India', hi: 'उत्तर प्रदेश, भारत' },
  dishaGreeting: { en: "Namaste! I'm DishaAI, your Uttar Pradesh trip-planning assistant. Full DishaAI integration is coming soon — for now, ask me about any destination on this site.", hi: 'नमस्ते! मैं DishaAI हूं, आपका उत्तर प्रदेश यात्रा सहायक। पूर्ण DishaAI एकीकरण जल्द आ रहा है — अभी इस साइट पर किसी भी गंतव्य के बारे में पूछें।' },
  dishaPreviewLabel: { en: 'Preview · Full integration coming soon', hi: 'प्रीव्यू · पूर्ण एकीकरण जल्द आ रहा है' },
  dishaInputPlaceholder: { en: 'Ask about any UP destination…', hi: 'यूपी के किसी भी गंतव्य के बारे में पूछें…' },
  dishaFallback: { en: "That's a great question for the full DishaAI assistant, which is being integrated soon. In the meantime, try a suggested question below, or explore a destination page directly for a dedicated Ask D360 assistant.", hi: 'यह पूर्ण DishaAI सहायक के लिए एक बेहतरीन सवाल है, जो जल्द एकीकृत होने वाला है। तब तक नीचे दिए सुझाए सवालों में से एक आज़माएं, या किसी गंतव्य पृष्ठ पर सीधे Ask D360 सहायक आज़माएं।' }
}
function useT() {
  const { lang } = useApp()
  return (key: keyof typeof T): string => T[key][lang]
}

const categoryLabels: Record<Category, Bi> = {
  'Spiritual & Pilgrimage': { en: 'Spiritual & Pilgrimage', hi: 'आध्यात्मिक और तीर्थ यात्रा' },
  'Heritage & Culture': { en: 'Heritage & Culture', hi: 'विरासत और संस्कृति' },
  'Forts & Palaces': { en: 'Forts & Palaces', hi: 'किले और महल' },
  'Waterfalls & Nature': { en: 'Waterfalls & Nature', hi: 'झरने और प्रकृति' },
  'Wildlife & Sanctuaries': { en: 'Wildlife & Sanctuaries', hi: 'वन्यजीव और अभयारण्य' }
}

const categoryBlurbs: Record<Category, Bi> = {
  'Spiritual & Pilgrimage': { en: 'Temples, ghats and living pilgrimage circuits', hi: 'मंदिर, घाट और जीवंत तीर्थ सर्किट' },
  'Heritage & Culture': { en: 'Mughal, Nawabi and colonial-era heritage', hi: 'मुगल, नवाबी और औपनिवेशिक विरासत' },
  'Forts & Palaces': { en: 'Fortresses, palaces and royal capitals', hi: 'किले, महल और शाही राजधानियाँ' },
  'Waterfalls & Nature': { en: 'Cascades, forests and off-the-map nature', hi: 'झरने, जंगल और अनदेखी प्रकृति' },
  'Wildlife & Sanctuaries': { en: 'Wetlands, sanctuaries and migratory birdlife', hi: 'आर्द्रभूमि, अभयारण्य और प्रवासी पक्षी' }
}

const trendingSearches: Bi[] = [
  { en: 'Varanasi Ganga Aarti', hi: 'वाराणसी गंगा आरती' },
  { en: 'Taj Mahal', hi: 'ताज महल' },
  { en: 'Vrindavan temples', hi: 'वृन्दावन मंदिर' },
  { en: 'Kumbh Mela', hi: 'कुंभ मेला' },
  { en: 'Bara Imambara', hi: 'बड़ा इमामबाड़ा' }
]

// ─── Hooks ───────────────────────────────────────────────────────────────────
function useReveal<T extends HTMLElement>() {
  const [ref, setRef] = useState<T | null>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    if (!ref) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(ref)
    return () => observer.disconnect()
  }, [ref])
  return { setRef, visible }
}

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(target * eased)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target, duration])
  return value
}

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try { window.localStorage.setItem(key, JSON.stringify(value)) } catch { /* ignore */ }
  }, [key, value])
  return [value, setValue] as const
}

// ─── App-wide context (auth + wishlist + language) ──────────────────────────
interface AppCtx {
  user: UPUser | null
  login: (u: UPUser) => void
  logout: () => void
  wishlist: string[]
  toggleWishlist: (slug: string) => void
  lang: Lang
  toggleLang: () => void
}
const AppContext = createContext<AppCtx | null>(null)
function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// ─── Icons ───────────────────────────────────────────────────────────────────
function IconSearch() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></svg> }
function IconArrowRight() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg> }
function IconMenu() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 12h18M3 6h18M3 18h18"/></svg> }
function IconX() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 6 6 18M6 6l12 12"/></svg> }
function IconStar() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01z"/></svg> }
function IconMapPin() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg> }
function IconRoute() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h7a4 4 0 0 0 4-4v-1a4 4 0 0 0-4-4H9a4 4 0 0 1-4-4V5"/></svg> }
function IconHeart({ filled = false }: { filled?: boolean }) { return <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg> }
function IconUser() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> }
function IconChevronDown() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg> }
function IconChat() { return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg> }
function IconSend() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20l18-8L3 4v6l12 2-12 2v6z"/></svg> }
function IconTemple() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2l3 5H9l3-5zM5 9h14l1 3H4l1-3zM6 12v9h12v-9M10 21v-5h4v5"/></svg> }
function IconMonument() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2a5 5 0 0 1 5 5v3H7V7a5 5 0 0 1 5-5z"/><path d="M4 21V10h16v11M2 21h20"/></svg> }
function IconFort() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 21V9l3-2 2 2 3-2 3 2 2-2 3 2v12z"/><path d="M4 21h16M9 21v-5h6v5"/></svg> }
function IconWaterfall() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 3h16v6a4 4 0 0 1-4 4H8a4 4 0 0 0-4 4v3M9 21v-4M13 21v-6M17 21v-3"/></svg> }
function IconBird() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M16 7a3 3 0 0 1 3 3c0 2-2 3-2 3l4 1-3 2-4-1-6 4 2-5-4-2 5-1-1-4 3 2 1-2z"/></svg> }
function IconSparkles2() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2zM19 15l.8 2.7L22.5 18.5l-2.7.8L19 22l-.8-2.7-2.7-.8 2.7-.8L19 15z"/></svg> }
function IconMail() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg> }
function IconCheck() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg> }
function IconChevronLeft() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg> }
function IconChevronRight() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg> }
function IconGlobe() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 0 1 0 18 13 13 0 0 1 0-18z"/></svg> }

const categoryIcons: Record<Category, JSX.Element> = {
  'Spiritual & Pilgrimage': <IconTemple />,
  'Heritage & Culture': <IconMonument />,
  'Forts & Palaces': <IconFort />,
  'Waterfalls & Nature': <IconWaterfall />,
  'Wildlife & Sanctuaries': <IconBird />
}

// ─── Language Toggle ─────────────────────────────────────────────────────────
function LangToggle({ dark }: { dark: boolean }) {
  const { lang, toggleLang } = useApp()
  return (
    <button
      onClick={toggleLang}
      aria-label="Toggle language"
      className={`flex items-center gap-1.5 text-xs font-medium border px-2.5 py-1.5 transition-colors ${dark ? 'border-d360-border text-d360-ink hover:border-d360-primary hover:text-d360-primary' : 'border-white/30 text-white hover:border-white hover:bg-white/10'}`}
      style={{ borderRadius: '2px' }}
    >
      <IconGlobe />
      <span className={lang === 'en' ? 'font-semibold' : 'opacity-60'}>EN</span>
      <span className="opacity-40">/</span>
      <span className={lang === 'hi' ? 'font-semibold' : 'opacity-60'}>हिं</span>
    </button>
  )
}

// ─── Auth Modal ──────────────────────────────────────────────────────────────
function AuthModal({ onClose }: { onClose: () => void }) {
  const { login } = useApp()
  const t = useT()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    login({ name: mode === 'signup' && name ? name : email.split('@')[0], email })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" style={{ animation: 'fade-slide-up 0.25s ease-out' }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md p-8 animate-fade-slide-up" style={{ borderRadius: '3px' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-d360-muted hover:text-d360-ink transition-colors" aria-label="Close"><IconX /></button>
        <div className="font-display text-2xl text-d360-ink mb-1">{mode === 'login' ? t('authWelcomeBack') : t('authCreateAccount')}</div>
        <p className="text-sm text-d360-muted mb-6">{mode === 'login' ? t('authLoginSub') : t('authSignupSub')}</p>
        <div className="flex mb-6 border border-d360-border" style={{ borderRadius: '2px' }}>
          <button onClick={() => setMode('login')} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === 'login' ? 'bg-d360-primary text-white' : 'text-d360-muted hover:text-d360-ink'}`}>{t('authLogIn')}</button>
          <button onClick={() => setMode('signup')} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${mode === 'signup' ? 'bg-d360-primary text-white' : 'text-d360-muted hover:text-d360-ink'}`}>{t('authSignUp')}</button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-medium text-d360-ink mb-1.5 block">{t('authFullName')}</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Priya Sharma" className="w-full px-4 py-2.5 border border-d360-border text-sm outline-none focus:border-d360-primary transition-colors" style={{ borderRadius: '2px' }} />
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-d360-ink mb-1.5 block">{t('authEmail')}</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-2.5 border border-d360-border text-sm outline-none focus:border-d360-primary transition-colors" style={{ borderRadius: '2px' }} />
          </div>
          <div>
            <label className="text-xs font-medium text-d360-ink mb-1.5 block">{t('authPassword')}</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2.5 border border-d360-border text-sm outline-none focus:border-d360-primary transition-colors" style={{ borderRadius: '2px' }} />
          </div>
          <button type="submit" className="mt-2 py-3 bg-d360-primary text-white text-sm font-medium hover:bg-d360-primary/90 transition-colors" style={{ borderRadius: '2px' }}>
            {mode === 'login' ? t('authLogIn') : t('authCreateAccountBtn')}
          </button>
        </form>
        <p className="text-[11px] text-d360-muted mt-5 text-center leading-relaxed">{t('authDemoNote')}</p>
      </div>
    </div>
  )
}

// ─── User Menu ───────────────────────────────────────────────────────────────
function UserMenu({ dark }: { dark: boolean }) {
  const { user, logout, wishlist } = useApp()
  const t = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])
  if (!user) return null
  const initials = user.name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase()
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="flex items-center gap-2">
        <span className="w-8 h-8 flex items-center justify-center bg-d360-primary text-white text-xs font-medium" style={{ borderRadius: '50%' }}>{initials}</span>
        <span className={`hidden lg:inline text-sm font-medium ${dark ? 'text-d360-ink' : 'text-white'}`}>{user.name}</span>
        <span className={dark ? 'text-d360-ink' : 'text-white'}><IconChevronDown /></span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-3 w-56 bg-white border border-d360-border shadow-xl py-2 animate-fade-slide-up" style={{ borderRadius: '3px' }}>
          <div className="px-4 py-2 border-b border-d360-border mb-1">
            <p className="text-sm font-medium text-d360-ink truncate">{user.name}</p>
            <p className="text-xs text-d360-muted truncate">{user.email}</p>
          </div>
          <a href="#destinations" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-d360-ink hover:bg-d360-surface transition-colors">{t('userMyTrips')}</a>
          <a href="#destinations" onClick={() => setOpen(false)} className="flex items-center justify-between px-4 py-2 text-sm text-d360-ink hover:bg-d360-surface transition-colors">
            <span>{t('userMyWishlist')}</span>
            {wishlist.length > 0 && <span className="text-[10px] font-mono px-1.5 py-0.5 bg-d360-surface text-d360-primary" style={{ borderRadius: '2px' }}>{wishlist.length}</span>}
          </a>
          <a href="#destinations" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-d360-ink hover:bg-d360-surface transition-colors">{t('userProfile')}</a>
          <button onClick={() => { logout(); setOpen(false) }} className="w-full text-left px-4 py-2 text-sm text-d360-primary hover:bg-d360-surface transition-colors border-t border-d360-border mt-1">{t('userSignOut')}</button>
        </div>
      )}
    </div>
  )
}

// ─── Nav ─────────────────────────────────────────────────────────────────────
function Nav({ onAuthOpen }: { onAuthOpen: () => void }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, wishlist } = useApp()
  const t = useT()
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  const links: [string, string][] = [[t('navDestinations'), '#destinations'], [t('navCategories'), '#categories'], [t('navCircuits'), '#circuits'], [t('navWhyD360'), '#why-d360']]
  const dark = scrolled
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-d360-bg/95 backdrop-blur border-b border-d360-border' : 'bg-gradient-to-b from-black/60 via-black/25 to-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <a href="/" className="flex flex-col leading-none">
            <span className={`font-display text-xl lg:text-2xl tracking-tight ${dark ? 'text-d360-ink' : 'text-white'}`}>D360</span>
            <span className={`text-[9px] lg:text-[10px] font-mono tracking-[0.18em] uppercase mt-0.5 ${dark ? 'text-d360-primary' : 'text-white/70'}`}>{t('navTagline')}</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {links.map(([label, href]) => (
              <a key={href} href={href} className={`text-sm font-medium transition-colors hover:text-d360-primary ${dark ? 'text-d360-ink' : 'text-white/90'}`}>{label}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <LangToggle dark={dark} />
            <a href="#destinations" className={`relative transition-colors hover:text-d360-primary ${dark ? 'text-d360-ink' : 'text-white'}`} aria-label="Wishlist">
              <IconHeart filled={wishlist.length > 0} />
              {wishlist.length > 0 && <span className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center bg-d360-primary text-white text-[9px] font-mono" style={{ borderRadius: '50%' }}>{wishlist.length}</span>}
            </a>
            {user ? (
              <UserMenu dark={dark} />
            ) : (
              <button onClick={onAuthOpen} className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-d360-primary ${dark ? 'text-d360-ink' : 'text-white'}`}>
                <IconUser /> {t('navLogin')}
              </button>
            )}
            <button onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })} className="px-4 py-2 bg-d360-primary text-white text-sm font-medium hover:bg-d360-primary/90 transition-colors" style={{ borderRadius: '2px' }}>{t('navExplore')}</button>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <LangToggle dark={dark} />
            <button className={dark ? 'text-d360-ink' : 'text-white'} onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <IconX /> : <IconMenu />}
            </button>
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-d360-bg border-t border-d360-border px-6 py-4 flex flex-col gap-4">
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMobileOpen(false)} className="text-sm font-medium text-d360-ink py-1 border-b border-d360-border last:border-0">{label}</a>
          ))}
          {user ? (
            <div className="text-sm font-medium text-d360-ink py-1">{t('navSignedInAs')} {user.name}</div>
          ) : (
            <button onClick={() => { setMobileOpen(false); onAuthOpen() }} className="text-sm font-medium text-d360-primary py-1 text-left">{t('navLogin')}</button>
          )}
          <button onClick={() => { setMobileOpen(false); document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' }) }} className="mt-2 py-3 bg-d360-primary text-white text-sm font-medium" style={{ borderRadius: '2px' }}>{t('navExploreDestinations')}</button>
        </div>
      )}
    </nav>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero({ onSearch }: { onSearch: (q: string) => void }) {
  const { lang } = useApp()
  const t = useT()
  const [index, setIndex] = useState(0)
  const [query, setQuery] = useState('')
  useEffect(() => {
    const timer = setInterval(() => setIndex(i => (i + 1) % cities.length), 5000)
    return () => clearInterval(timer)
  }, [])
  return (
    <section className="relative h-screen min-h-[600px] flex items-end overflow-hidden">
      {cities.map((c, i) => (
        <div key={c.slug} className="absolute inset-0 transition-opacity duration-1000" style={{ opacity: i === index ? 1 : 0 }}>
          <img src={c.image} alt={c.name} className={`w-full h-full object-cover ${i === index ? 'animate-ken-burns' : ''}`} />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-d360-primary/25 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-d360-amber/20 rounded-full blur-3xl animate-blob pointer-events-none" style={{ animationDelay: '-6s' }} />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pb-20 lg:pb-28 w-full">
        <p className="text-white/80 text-xs font-mono tracking-[0.2em] uppercase mb-4 flex items-center gap-2"><IconSparkles2 /> {t('heroEyebrow')}</p>
        <h1 className="font-display text-white text-5xl sm:text-6xl lg:text-7xl leading-[0.95] mb-6 max-w-3xl">{t('heroTitleLine1')}<br/>{t('heroTitleLine2')}</h1>
        <p className="text-white/85 text-base lg:text-lg max-w-xl mb-8">{t('heroSubtitle')}</p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <div className="flex-1 flex items-center gap-3 bg-white/95 px-5 py-3.5" style={{ borderRadius: '2px' }}>
            <span className="text-d360-muted"><IconSearch /></span>
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); onSearch(e.target.value) }}
              placeholder={t('heroSearchPlaceholder')}
              className="flex-1 bg-transparent outline-none text-sm text-d360-ink placeholder:text-d360-muted"
            />
          </div>
          <button onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-d360-primary text-white text-sm font-medium hover:bg-d360-primary/90 transition-colors whitespace-nowrap" style={{ borderRadius: '2px' }}>
            {t('navExplore')} <IconArrowRight />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <span className="text-white/50 text-xs">{t('heroTrending')}</span>
          {trendingSearches.map(tr => (
            <button key={tr.en} onClick={() => { setQuery(tr[lang]); onSearch(tr[lang]) }} className="text-xs text-white/80 border border-white/25 px-2.5 py-1 hover:border-white/60 hover:text-white transition-colors" style={{ borderRadius: '2px' }}>{tr[lang]}</button>
          ))}
        </div>
        <div className="flex gap-2 mt-8">
          {cities.map((c, i) => (
            <button key={c.slug} onClick={() => setIndex(i)} aria-label={c.name} className="h-1 transition-all rounded-full" style={{ width: i === index ? '28px' : '12px', backgroundColor: i === index ? '#C05C28' : 'rgba(255,255,255,0.4)' }} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Category Explorer ───────────────────────────────────────────────────────
function CategoryTile({ cat, index, onSelect }: { cat: Category; index: number; onSelect: (cat: Category) => void }) {
  const { lang } = useApp()
  const t = useT()
  const { setRef, visible } = useReveal<HTMLButtonElement>()
  const count = cities.filter(c => c.category === cat).length
  return (
    <button
      ref={setRef}
      onClick={() => { onSelect(cat); document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' }) }}
      className="pluck-card group flex flex-col items-start gap-3 p-5 bg-white border border-d360-border hover:border-d360-primary text-left"
      style={{
        borderRadius: '2px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: visible ? `${index * 80}ms` : '0ms'
      }}
    >
      <span className="w-10 h-10 flex items-center justify-center bg-d360-surface text-d360-primary group-hover:bg-d360-primary group-hover:text-white transition-colors" style={{ borderRadius: '2px' }}>{categoryIcons[cat]}</span>
      <div>
        <div className="font-display text-d360-ink text-base leading-tight mb-1">{categoryLabels[cat][lang]}</div>
        <p className="text-xs text-d360-muted leading-snug">{categoryBlurbs[cat][lang]}</p>
      </div>
      <span className="text-[10px] font-mono text-d360-muted mt-1">{count} {t('categoryDestinationWord')}</span>
    </button>
  )
}

function CategoryExplorer({ onSelect }: { onSelect: (cat: Category) => void }) {
  const t = useT()
  const cats = Object.keys(categoryLabels) as Category[]
  return (
    <section id="categories" className="bg-d360-bg py-16 lg:py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-d360-primary text-xs font-mono tracking-[0.2em] uppercase mb-3">{t('categoryEyebrow')}</p>
        <h2 className="font-display text-d360-ink text-3xl lg:text-4xl mb-3 max-w-xl">{t('categoryTitle')}</h2>
        <p className="text-d360-muted text-sm max-w-xl mb-10">{t('categorySubtitle')}</p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {cats.map((cat, i) => <CategoryTile key={cat} cat={cat} index={i} onSelect={onSelect} />)}
        </div>
      </div>
    </section>
  )
}

// ─── Stats Bar ───────────────────────────────────────────────────────────────
function StatItem({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const n = useCountUp(value, active)
  return (
    <div>
      <div className="font-display text-white text-3xl lg:text-4xl mb-1">{Math.round(n)}{suffix}</div>
      <div className="text-white/60 text-xs lg:text-sm">{label}</div>
    </div>
  )
}

function StatsBar() {
  const t = useT()
  const { setRef, visible } = useReveal<HTMLDivElement>()
  const stats = [
    { value: cities.length, suffix: '', label: t('statDestinations') },
    { value: 5, suffix: '', label: t('statCategories') },
    { value: 150, suffix: '+', label: t('statAttractions') },
    { value: 24, suffix: '/7', label: t('statAI') }
  ]
  return (
    <section className="bg-d360-ink py-10 lg:py-14" ref={setRef as any}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map(s => <StatItem key={s.label} value={s.value} suffix={s.suffix} label={s.label} active={visible} />)}
      </div>
    </section>
  )
}

// ─── Marquee ticker ──────────────────────────────────────────────────────────
function Ticker() {
  const { lang } = useApp()
  const items = [...cities.map(c => c.name), ...(Object.keys(categoryLabels) as Category[]).map(c => categoryLabels[c][lang])]
  const doubled = [...items, ...items]
  return (
    <div className="bg-d360-surface border-y border-d360-border py-3 overflow-hidden">
      <div className="flex gap-10 animate-marquee whitespace-nowrap" style={{ width: 'max-content' }}>
        {doubled.map((tItem, i) => (
          <span key={i} className="text-xs font-mono text-d360-muted tracking-wide flex items-center gap-2">
            <span className="w-1 h-1 bg-d360-primary" style={{ borderRadius: '50%' }} />{tItem}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Carousel (image-heavy, minimal text) ───────────────────────────────────
interface CarouselItem { slug: string; name: string; image: string; badge: Bi; url: string }

function CarouselCard({ item, index }: { item: CarouselItem; index: number }) {
  const { lang } = useApp()
  const t = useT()
  const { setRef, visible } = useReveal<HTMLAnchorElement>()
  const isLive = item.url.length > 0
  const Tag = isLive ? 'a' : 'div'
  const tagProps = isLive ? { href: item.url } : {}
  return (
    <Tag
      ref={setRef as any}
      {...tagProps}
      className="pluck-card group flex-shrink-0 block relative overflow-hidden"
      style={{
        width: '280px', height: '360px', borderRadius: '3px', scrollSnapAlign: 'start',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
        transitionDelay: visible ? `${(index % 6) * 70}ms` : '0ms'
      }}
    >
      <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/10" />
      <span className="absolute top-4 left-4 bg-white text-d360-ink text-[10px] font-bold px-2.5 py-1.5 tracking-wide animate-badge-glow" style={{ borderRadius: '2px' }}>{item.badge[lang]}</span>
      {!isLive && <span className="absolute top-4 right-4 bg-black/60 text-white text-[9px] font-mono px-2 py-1 uppercase tracking-wide" style={{ borderRadius: '2px' }}>{t('badgeSoon')}</span>}
      <h3 className="absolute bottom-5 left-5 right-5 font-display text-white text-2xl leading-tight">{item.name}</h3>
    </Tag>
  )
}

function Carousel({ title, items }: { title: string; items: CarouselItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const scrollBy = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }
  return (
    <section className="bg-d360-bg py-14 lg:py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-d360-ink text-2xl lg:text-3xl">{title}</h2>
          <div className="hidden sm:flex gap-2">
            <button onClick={() => scrollBy(-1)} aria-label="Scroll left" className="w-9 h-9 flex items-center justify-center border border-d360-border text-d360-ink hover:border-d360-primary hover:text-d360-primary transition-colors" style={{ borderRadius: '50%' }}><IconChevronLeft /></button>
            <button onClick={() => scrollBy(1)} aria-label="Scroll right" className="w-9 h-9 flex items-center justify-center border border-d360-border text-d360-ink hover:border-d360-primary hover:text-d360-primary transition-colors" style={{ borderRadius: '50%' }}><IconChevronRight /></button>
          </div>
        </div>
      </div>
      <div ref={trackRef} className="no-scrollbar flex gap-4 overflow-x-auto pb-2 px-6 lg:px-8 max-w-7xl mx-auto" style={{ scrollSnapType: 'x mandatory' }}>
        {items.map((item, i) => <CarouselCard key={item.slug} item={item} index={i} />)}
      </div>
    </section>
  )
}

function HandpickedCarousel() {
  const t = useT()
  const items: CarouselItem[] = [
    { slug: 'varanasi', name: 'Varanasi', image: W + 'Ganga_Aarti_at_ghats_in_Varanasi.jpg?width=600', badge: { en: 'TOP PICK', hi: 'शीर्ष चयन' }, url: 'https://varanasitourism1.netlify.app/' },
    { slug: 'agra', name: 'Agra', image: W + 'Taj_Mahal_Sunset.jpg?width=600', badge: { en: 'TOP PICK', hi: 'शीर्ष चयन' }, url: 'https://agratourism.netlify.app/agra' },
    { slug: 'vrindavan', name: 'Vrindavan', image: W + 'A_Hindu_temple_Prem_Mandir_Love_temple_sights_culture_India.jpg?width=600', badge: { en: 'TOP PICK', hi: 'शीर्ष चयन' }, url: 'https://mathuratourism2.netlify.app/vrindavan' },
    { slug: 'prayagraj', name: 'Prayagraj', image: W + 'Triveni_Sangam.JPG?width=600', badge: { en: 'TOP PICK', hi: 'शीर्ष चयन' }, url: 'https://prayagrajtourism1.netlify.app/' },
    { slug: 'lucknow', name: 'Lucknow', image: W + 'Bara Imambara Lucknow.jpg?width=600', badge: { en: 'HERITAGE', hi: 'विरासत' }, url: '' },
    { slug: 'mathura', name: 'Mathura', image: W + 'Vishram Ghat.jpg?width=600', badge: { en: 'SPIRITUAL', hi: 'आध्यात्मिक' }, url: 'https://mathuratourism2.netlify.app/mathura' }
  ]
  return <Carousel title={t('carouselHandpicked')} items={items} />
}

function HiddenGemsCarousel() {
  const t = useT()
  const items: CarouselItem[] = [
    { slug: 'mokaam-waterfall', name: 'Mokaam Falls', image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600&h=800&fit=crop&auto=format', badge: { en: 'HIDDEN GEM', hi: 'छिपा रत्न' }, url: '' },
    { slug: 'bakhira', name: 'Bakhira Sanctuary', image: W + 'Nature photography of bakhira jheel.jpg?width=600', badge: { en: 'WILDLIFE', hi: 'वन्यजीव' }, url: '' },
    { slug: 'mirzapur', name: 'Mirzapur Falls', image: W + 'Lakhaniya Dari.jpg?width=600', badge: { en: 'HIDDEN GEM', hi: 'छिपा रत्न' }, url: '' },
    { slug: 'fatehpur-sikri', name: 'Fatehpur Sikri', image: W + 'Fatehput_Sikiri_Buland_Darwaza_gate_2010.jpg?width=600', badge: { en: 'FORT', hi: 'किला' }, url: 'https://agratourism.netlify.app/fatehpur-sikri' }
  ]
  return <Carousel title={t('carouselHidden')} items={items} />
}

// ─── Destinations Grid ───────────────────────────────────────────────────────
function DestinationsGrid({ query, activeCategory, setActiveCategory }: { query: string; activeCategory: typeof categories[number]; setActiveCategory: (c: typeof categories[number]) => void }) {
  const { lang } = useApp()
  const t = useT()
  const filtered = useMemo(() => {
    return cities.filter(c => {
      const matchesCategory = activeCategory === 'All' || c.category === activeCategory
      const q = query.trim().toLowerCase()
      const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.tags.some(tg => tg.toLowerCase().includes(q)) || c.category.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [activeCategory, query])

  return (
    <section id="destinations" className="bg-d360-bg py-16 lg:py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <p className="text-d360-primary text-xs font-mono tracking-[0.2em] uppercase mb-3">{t('gridEyebrow')}</p>
            <h2 className="font-display text-d360-ink text-3xl lg:text-4xl">{t('gridTitle')}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-medium border transition-colors ${activeCategory === cat ? 'bg-d360-primary border-d360-primary text-white' : 'bg-white border-d360-border text-d360-muted hover:border-d360-muted'}`}
                style={{ borderRadius: '2px' }}
              >
                {cat === 'All' ? t('categoryAll') : categoryLabels[cat][lang]}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-d360-muted text-sm py-12 text-center">{t('gridNoMatch')} "{query}" — {t('gridTryDifferent')}</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((c, i) => <DestinationCard key={c.slug} city={c} index={i} />)}
          </div>
        )}
      </div>
    </section>
  )
}

function DestinationCard({ city: c, index }: { city: CityLink; index: number }) {
  const { lang, wishlist, toggleWishlist } = useApp()
  const t = useT()
  const { setRef, visible } = useReveal<HTMLAnchorElement>()
  const [imgLoaded, setImgLoaded] = useState(false)
  const isLive = c.url.length > 0
  const Tag = isLive ? 'a' : 'div'
  const tagProps = isLive ? { href: c.url } : {}
  const saved = wishlist.includes(c.slug)
  const displayName = lang === 'hi' ? c.localName : c.name
  const subName = lang === 'hi' ? c.name : c.localName
  return (
    <Tag
      ref={setRef as any}
      {...tagProps}
      className={`pluck-card group border border-d360-border bg-white hover:border-d360-muted block ${isLive ? '' : 'cursor-default opacity-90'}`}
      style={{
        borderRadius: '2px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.96)',
        transitionDelay: visible ? `${(index % 6) * 90}ms` : '0ms'
      }}
    >
      <div className="overflow-hidden relative" style={{ height: '220px' }}>
        {!imgLoaded && <div className="absolute inset-0 animate-shimmer" />}
        <img src={c.image} alt={c.name} onLoad={() => setImgLoaded(true)} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 bg-white/90 text-d360-ink text-[10px] font-mono px-2 py-1 flex items-center gap-1" style={{ borderRadius: '2px' }}>{categoryLabels[c.category][lang]}</div>
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(c.slug) }}
            aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            className={`w-8 h-8 flex items-center justify-center transition-colors ${saved ? 'bg-d360-primary text-white' : 'bg-white/90 text-d360-ink hover:text-d360-primary'}`}
            style={{ borderRadius: '2px' }}
          >
            <IconHeart filled={saved} />
          </button>
          <div className="bg-d360-ink/80 text-white text-xs font-mono px-2 py-1 flex items-center gap-1" style={{ borderRadius: '2px' }}><IconStar />{c.discoveryScore}</div>
        </div>
        {!isLive && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white text-xs font-mono tracking-[0.15em] uppercase border border-white/60 px-3 py-1.5" style={{ borderRadius: '2px' }}>{t('gridComingSoon')}</span></div>}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-display text-white text-2xl">{displayName}</h3>
          <p className="text-white/70 text-xs font-mono">{subName} · {c.state}</p>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm text-d360-muted leading-relaxed mb-4">{lang === 'hi' ? c.taglineHi : c.tagline}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {c.tags.map(tg => <span key={tg} className="text-[10px] font-mono px-2 py-1 bg-d360-surface text-d360-muted" style={{ borderRadius: '2px' }}>{tg}</span>)}
        </div>
        <div className="flex items-center justify-between">
          {isLive ? (
            <span className="flex items-center gap-2 text-sm font-medium text-d360-primary group-hover:gap-3 transition-all">{t('gridExploreWord')} {c.name} <IconArrowRight /></span>
          ) : (
            <span className="text-sm font-medium text-d360-muted">{t('gridSiteLaunchingSoon')}</span>
          )}
          {c.isStockImage && <span className="text-[10px] text-d360-muted italic">{t('gridRepresentativeImage')}</span>}
        </div>
      </div>
    </Tag>
  )
}

// ─── Featured Offers ─────────────────────────────────────────────────────────
function OfferCard({ offer: o, index }: { offer: { title: Bi; description: Bi; tag: Bi; image: string }; index: number }) {
  const { lang } = useApp()
  const { setRef, visible } = useReveal<HTMLDivElement>()
  return (
    <div ref={setRef} className="pluck-card bg-white border border-d360-border overflow-hidden" style={{ borderRadius: '2px', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transitionDelay: visible ? `${index * 100}ms` : '0ms' }}>
      <div className="relative overflow-hidden" style={{ height: '160px' }}>
        <img src={o.image} alt={o.title[lang]} className="w-full h-full object-cover" />
        <span className="absolute top-3 left-3 bg-d360-primary text-white text-[10px] font-mono px-2 py-1 uppercase tracking-wide" style={{ borderRadius: '2px' }}>{o.tag[lang]}</span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-d360-ink text-lg mb-2">{o.title[lang]}</h3>
        <p className="text-sm text-d360-muted leading-relaxed">{o.description[lang]}</p>
      </div>
    </div>
  )
}

function FeaturedOffers() {
  const t = useT()
  const offers = [
    { title: { en: 'Winter Birding Season', hi: 'शीतकालीन पक्षी दर्शन सीजन' }, description: { en: 'Sarus Cranes & migratory flocks at Bakhira.', hi: 'बखिरा में सारस क्रेन और प्रवासी पक्षी।' }, tag: { en: 'Best in Winter', hi: 'सर्दियों में सर्वश्रेष्ठ' }, image: W + 'Sarus crane (Grus antigone).jpg?width=800' },
    { title: { en: 'Ganga Aarti, Every Evening', hi: 'हर शाम गंगा आरती' }, description: { en: 'The nightly fire ritual at Dashashwamedh Ghat.', hi: 'दशाश्वमेध घाट पर रात्रि अग्नि आरती।' }, tag: { en: 'Free & Daily', hi: 'निःशुल्क व दैनिक' }, image: W + 'Ganga_Aarti_at_ghats_in_Varanasi.jpg?width=800' },
    { title: { en: 'Monsoon Waterfall Season', hi: 'मानसून झरना सीजन' }, description: { en: "Mirzapur's falls run fullest, Jul–Sep.", hi: 'मिर्ज़ापुर के झरने जुलाई–सितंबर में पूरे उफान पर।' }, tag: { en: 'Best Jul–Sep', hi: 'जुलाई–सितंबर सर्वश्रेष्ठ' }, image: W + 'Lakhaniya Dari.jpg?width=800' }
  ]
  return (
    <section className="bg-d360-surface py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-d360-primary text-xs font-mono tracking-[0.2em] uppercase mb-3">{t('offersEyebrow')}</p>
        <h2 className="font-display text-d360-ink text-3xl lg:text-4xl mb-10 max-w-xl">{t('offersTitle')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {offers.map((o, i) => <OfferCard key={o.title.en} offer={o} index={i} />)}
        </div>
      </div>
    </section>
  )
}

// ─── Circuits ────────────────────────────────────────────────────────────────
function Circuits() {
  const t = useT()
  const circuits = [
    {
      title: { en: 'Agra Heritage Circuit', hi: 'आगरा विरासत सर्किट' },
      description: { en: 'The Taj Mahal, Agra Fort & Fatehpur Sikri.', hi: 'ताज महल, आगरा किला और फतेहपुर सीकरी।' },
      stops: ['Agra', 'Fatehpur Sikri'],
      image: W + 'Taj_Mahal_Sunset.jpg?width=1200',
      url: 'https://your-agra-site.netlify.app/agra'
    },
    {
      title: { en: 'Braj Pilgrimage Circuit', hi: 'ब्रज तीर्थ सर्किट' },
      description: { en: "Mathura's birthplace temples & Vrindavan.", hi: 'मथुरा के जन्मस्थान मंदिर और वृन्दावन।' },
      stops: ['Mathura', 'Vrindavan'],
      image: W + 'A_Hindu_temple_Prem_Mandir_Love_temple_sights_culture_India.jpg?width=1200',
      url: 'https://your-mathura-site.netlify.app/mathura'
    }
  ]
  return (
    <section id="circuits" className="bg-d360-surface py-16 lg:py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-d360-primary text-xs font-mono tracking-[0.2em] uppercase mb-3 flex items-center gap-2"><IconRoute /> {t('circuitsEyebrow')}</p>
        <h2 className="font-display text-d360-ink text-3xl lg:text-4xl mb-10 max-w-xl">{t('circuitsTitle')}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {circuits.map((c, i) => <CircuitCard key={c.title.en} circuit={c} index={i} />)}
        </div>
      </div>
    </section>
  )
}

function CircuitCard({ circuit: c, index }: { circuit: { title: Bi; description: Bi; stops: string[]; image: string; url: string }; index: number }) {
  const { lang } = useApp()
  const t = useT()
  const { setRef, visible } = useReveal<HTMLAnchorElement>()
  return (
    <a
      ref={setRef}
      href={c.url}
      className="pluck-card group flex flex-col sm:flex-row border border-d360-border bg-white hover:border-d360-muted overflow-hidden"
      style={{
        borderRadius: '2px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.96)',
        transitionDelay: visible ? `${index * 120}ms` : '0ms'
      }}
    >
      <div className="sm:w-2/5 overflow-hidden" style={{ minHeight: '180px' }}>
        <img src={c.image} alt={c.title[lang]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-display text-d360-ink text-xl mb-2">{c.title[lang]}</h3>
          <p className="text-sm text-d360-muted leading-relaxed mb-4">{c.description[lang]}</p>
          <div className="flex flex-wrap gap-1.5">
            {c.stops.map(s => <span key={s} className="text-[10px] font-mono px-2 py-1 bg-d360-surface text-d360-ink border border-d360-border" style={{ borderRadius: '2px' }}>{s}</span>)}
          </div>
        </div>
        <span className="flex items-center gap-2 text-sm font-medium text-d360-primary group-hover:gap-3 transition-all mt-4">{t('circuitStart')} <IconArrowRight /></span>
      </div>
    </a>
  )
}

// ─── Travelers Are Asking (real AI-prompt style Q&A, not fabricated reviews) ─
function QuestionCard({ q, index, onOpenChat }: { q: Bi; index: number; onOpenChat: (q: Bi) => void }) {
  const { lang } = useApp()
  const { setRef, visible } = useReveal<HTMLButtonElement>()
  return (
    <button
      ref={setRef}
      onClick={() => onOpenChat(q)}
      className="pluck-card text-left p-5 bg-white border border-d360-border hover:border-d360-primary flex items-start justify-between gap-3"
      style={{ borderRadius: '2px', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transitionDelay: visible ? `${index * 70}ms` : '0ms' }}
    >
      <span className="text-sm text-d360-ink leading-relaxed">{q[lang]}</span>
      <span className="text-d360-primary flex-shrink-0 mt-0.5"><IconArrowRight /></span>
    </button>
  )
}

const askingQuestions: Bi[] = [
  { en: 'What time is the Ganga Aarti at Varanasi?', hi: 'वाराणसी में गंगा आरती किस समय होती है?' },
  { en: 'Can I combine Fatehpur Sikri and the Taj Mahal in one day?', hi: 'क्या एक दिन में फतेहपुर सीकरी और ताज महल दोनों देखे जा सकते हैं?' },
  { en: "When do Mirzapur's waterfalls have the most water?", hi: 'मिर्ज़ापुर के झरनों में सबसे ज़्यादा पानी कब होता है?' },
  { en: 'What migratory birds can I see at Bakhira in January?', hi: 'जनवरी में बखिरा में कौन से प्रवासी पक्षी दिखते हैं?' },
  { en: 'How do I plan a 3-day Braj pilgrimage circuit?', hi: '3-दिवसीय ब्रज तीर्थ यात्रा की योजना कैसे बनाएं?' },
  { en: "Is Lucknow's Bara Imambara maze safe for kids?", hi: 'क्या बड़ा इमामबाड़ा की भूलभुलैया बच्चों के लिए सुरक्षित है?' }
]

function TravelersAsking({ onOpenChat }: { onOpenChat: (q: Bi) => void }) {
  const t = useT()
  return (
    <section className="bg-d360-bg py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-d360-primary text-xs font-mono tracking-[0.2em] uppercase mb-3">{t('askingEyebrow')}</p>
        <h2 className="font-display text-d360-ink text-3xl lg:text-4xl mb-10 max-w-xl">{t('askingTitle')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {askingQuestions.map((q, i) => <QuestionCard key={q.en} q={q} index={i} onOpenChat={onOpenChat} />)}
        </div>
      </div>
    </section>
  )
}

// ─── Why D360 (Trust section) ────────────────────────────────────────────────
function WhyD360() {
  const t = useT()
  const { lang } = useApp()
  const pillars = [
    { num: '01', hindi: 'सत्यापित तस्वीरें', title: { en: 'Verified, Real Imagery', hi: 'सत्यापित, वास्तविक तस्वीरें' }, bullets: [{ en: 'Real Wikimedia Commons Photos', hi: 'वास्तविक विकिमीडिया कॉमन्स तस्वीरें' }, { en: 'No Generic Stock Where Avoidable', hi: 'जहाँ संभव, सामान्य स्टॉक फोटो नहीं' }, { en: 'Mismatches Openly Flagged', hi: 'बेमेल तस्वीरें खुलकर बताई गईं' }] },
    { num: '02', hindi: 'संपादकीय शोध', title: { en: 'Editorially Researched', hi: 'संपादकीय रूप से शोधित' }, bullets: [{ en: '20-Section Research Dossiers', hi: '20-खंड शोध दस्तावेज़' }, { en: 'History, Culture, Food & Safety', hi: 'इतिहास, संस्कृति, भोजन और सुरक्षा' }, { en: 'Not Scraped Listicle Content', hi: 'कॉपी-पेस्ट सूचियाँ नहीं' }] },
    { num: '03', hindi: 'एआई यात्रा सहायक', title: { en: 'Ask D360, Anywhere', hi: 'कहीं भी Ask D360' }, bullets: [{ en: 'Destination-Specific Q&A', hi: 'गंतव्य-विशिष्ट प्रश्नोत्तर' }, { en: 'DishaAI Preview Live Now', hi: 'DishaAI प्रीव्यू अभी लाइव' }, { en: '24/7 Trip-Planning Help', hi: '24/7 यात्रा योजना सहायता' }] },
    { num: '04', hindi: 'सम्पूर्ण उत्तर प्रदेश', title: { en: 'Uttar Pradesh, in Full', hi: 'संपूर्ण उत्तर प्रदेश' }, bullets: [{ en: '5 Interest Categories', hi: '5 रुचि श्रेणियाँ' }, { en: 'New Destinations Added Often', hi: 'नए गंतव्य अक्सर जुड़ते हैं' }, { en: 'Spiritual, Forts, Falls & Wildlife', hi: 'आध्यात्मिक, किले, झरने और वन्यजीव' }] }
  ]
  return (
    <section id="why-d360" className="bg-d360-ink py-16 lg:py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <p className="text-d360-amber text-xs font-mono tracking-[0.2em] uppercase mb-3">{t('trustEyebrow')}</p>
        <h2 className="font-display text-white text-3xl lg:text-4xl mb-2 max-w-2xl">{t('trustTitle')}</h2>
        <p className="font-display italic text-d360-amber text-2xl lg:text-3xl mb-12 max-w-2xl">{t('trustSubtitle')}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pillars.map((p, i) => <TrustCard key={p.num} pillar={p} index={i} />)}
        </div>
      </div>
    </section>
  )
}

function TrustCard({ pillar: p, index }: { pillar: { num: string; hindi: string; title: Bi; bullets: Bi[] }; index: number }) {
  const { lang } = useApp()
  const { setRef, visible } = useReveal<HTMLDivElement>()
  return (
    <div ref={setRef} className="pluck-card p-6 border border-white/10 bg-white/[0.03]" style={{ borderRadius: '2px', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transitionDelay: visible ? `${index * 90}ms` : '0ms' }}>
      <div className="flex items-start justify-between mb-4">
        <span className="font-mono text-d360-amber text-sm">{p.num}</span>
        {lang === 'en' && <span className="font-mono text-white/40 text-[10px] text-right">{p.hindi}</span>}
      </div>
      <h3 className="font-display text-white text-lg mb-4 leading-snug">{p.title[lang]}</h3>
      <div className="flex flex-col gap-2">
        {p.bullets.map(b => (
          <div key={b.en} className="flex items-start gap-2 text-xs text-white/60">
            <span className="text-d360-amber mt-0.5 flex-shrink-0"><IconCheck /></span>{b[lang]}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Newsletter ──────────────────────────────────────────────────────────────
function Newsletter() {
  const t = useT()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  return (
    <section className="bg-d360-surface py-14">
      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <div className="w-12 h-12 flex items-center justify-center bg-white text-d360-primary mx-auto mb-5" style={{ borderRadius: '2px' }}><IconMail /></div>
        <h2 className="font-display text-d360-ink text-2xl lg:text-3xl mb-2">{t('newsletterTitle')}</h2>
        <p className="text-d360-muted text-sm mb-6">{t('newsletterSub')}</p>
        {submitted ? (
          <p className="text-d360-primary text-sm font-medium">{t('newsletterThanks')}</p>
        ) : (
          <form onSubmit={e => { e.preventDefault(); if (email) setSubmitted(true) }} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 px-4 py-3 border border-d360-border text-sm outline-none focus:border-d360-primary transition-colors bg-white" style={{ borderRadius: '2px' }} />
            <button type="submit" className="px-6 py-3 bg-d360-primary text-white text-sm font-medium hover:bg-d360-primary/90 transition-colors whitespace-nowrap" style={{ borderRadius: '2px' }}>{t('newsletterBtn')}</button>
          </form>
        )}
      </div>
    </section>
  )
}

// ─── CTA Band ────────────────────────────────────────────────────────────────
function CTABand() {
  const t = useT()
  return (
    <section className="bg-d360-ink py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <h2 className="font-display text-white text-3xl lg:text-4xl mb-4">{t('ctaTitle')}</h2>
        <p className="text-white/60 text-sm lg:text-base mb-8 max-w-xl mx-auto">{t('ctaSub')}</p>
        <button onClick={() => document.getElementById('destinations')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 px-7 py-3.5 bg-d360-primary text-white text-sm font-medium hover:bg-d360-primary/90 transition-colors" style={{ borderRadius: '2px' }}>
          {t('ctaBtn')} <IconArrowRight />
        </button>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  const { lang } = useApp()
  const t = useT()
  return (
    <footer className="bg-d360-dark py-14">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div>
            <div className="font-display text-white text-2xl mb-1">D360</div>
            <div className="text-d360-primary text-[10px] font-mono tracking-[0.18em] uppercase mb-3">{t('navTagline')}</div>
            <p className="text-white/50 text-sm leading-relaxed">{t('footerAbout')}</p>
          </div>
          <div>
            <h4 className="text-white text-sm font-medium mb-4">{t('footerDestinations')}</h4>
            <div className="flex flex-col gap-2">
              {cities.map(c => c.url ? <a key={c.slug} href={c.url} className="text-white/50 hover:text-white text-sm transition-colors">{c.name}</a> : <span key={c.slug} className="text-white/30 text-sm">{c.name} <span className="text-[10px]">({t('badgeSoon')})</span></span>)}
            </div>
          </div>
          <div>
            <h4 className="text-white text-sm font-medium mb-4">{t('footerCategories')}</h4>
            <div className="flex flex-col gap-2">
              {(Object.keys(categoryLabels) as Category[]).map(cat => (
                <a key={cat} href="#categories" className="text-white/50 hover:text-white text-sm transition-colors">{categoryLabels[cat][lang]}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-white text-sm font-medium mb-4">{t('footerExplore')}</h4>
            <div className="flex flex-col gap-2">
              <a href="#circuits" className="text-white/50 hover:text-white text-sm transition-colors">{t('footerLinkedCircuits')}</a>
              <a href="#why-d360" className="text-white/50 hover:text-white text-sm transition-colors">{t('footerWhyD360')}</a>
              <a href="#destinations" className="text-white/50 hover:text-white text-sm transition-colors">{t('footerMyWishlist')}</a>
            </div>
          </div>
          <div>
            <h4 className="text-white text-sm font-medium mb-4">{t('footerAboutHeading')}</h4>
            <p className="text-white/50 text-sm leading-relaxed">{t('footerAboutText')}</p>
          </div>
        </div>
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4">
          <p className="text-white/40 text-xs">{t('footerCopyright')}</p>
          <div className="flex items-center gap-2 text-white/40 text-xs">
            <IconMapPin /> {t('footerCountry')}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── DishaAI Chat Widget (preview — full integration pending) ──────────────
interface ChatMessage { role: 'user' | 'bot'; text: string }

function answerDishaAI(q: string, lang: Lang): string {
  const s = q.toLowerCase()
  if (s.includes('ganga aarti') || s.includes('varanasi') || s.includes('गंगा आरती') || s.includes('वाराणसी')) {
    return lang === 'hi'
      ? 'वाराणसी में दशाश्वमेध घाट पर गंगा आरती रोज़ शाम लगभग 7:00 बजे शुरू होती है (सर्दियों में थोड़ा पहले)। घाट से मुफ्त देखी जा सकती है, या नदी पर आगे की सीट के लिए नाव बुक करें।'
      : "The Ganga Aarti at Dashashwamedh Ghat in Varanasi begins around 7:00 PM daily (a little earlier in winter). It's free to watch from the ghats, or you can book a boat for a front-row view on the water."
  }
  if ((s.includes('fatehpur sikri') && s.includes('taj')) || (s.includes('फतेहपुर') && s.includes('ताज'))) {
    return lang === 'hi'
      ? 'हां — फतेहपुर सीकरी आगरा से लगभग 37 किमी दूर है, सड़क मार्ग से लगभग 45–60 मिनट। ज़्यादातर लोग सुबह आगरा किला और ताज महल देखते हैं, फिर दोपहर में फतेहपुर सीकरी।'
      : "Yes — Fatehpur Sikri is about 37 km from Agra, roughly 45–60 minutes by road. Most visitors do Agra Fort and the Taj Mahal in the morning, then Fatehpur Sikri in the afternoon as a half-day extension."
  }
  if (s.includes('waterfall') || s.includes('mirzapur') || s.includes('झरन') || s.includes('मिर्ज़ापुर')) {
    return lang === 'hi'
      ? 'मिर्ज़ापुर के झरने — लखानिया दरी और विंडहैम फॉल्स — जुलाई से सितंबर तक, मानसून के ठीक बाद सबसे भरे रहते हैं। इन महीनों के बाहर बहाव काफी कम हो जाता है।'
      : "Mirzapur's waterfalls — Lakhaniya Dari and Wyndham Falls — run fullest from July through September, right after monsoon. Outside those months the flow drops off noticeably."
  }
  if (s.includes('bakhira') || s.includes('bird') || s.includes('migratory') || s.includes('बखिरा') || s.includes('पक्षी')) {
    return lang === 'hi'
      ? 'जनवरी बखिरा में प्रवासी पक्षियों के चरम मौसम का समय है — नॉर्दर्न पिंटेल, ग्रेलैग गीज़ के बड़े झुंड और निवासी सारस क्रेन दिखते हैं। सुबह 11 बजे से पहले सबसे साफ नज़ारा मिलता है।'
      : "January is peak migration season at Bakhira — expect large flocks of Northern Pintails, Greylag Geese and resident Sarus Cranes. Mornings before 11 AM offer the clearest sightings."
  }
  if (s.includes('braj') || s.includes('mathura') || s.includes('vrindavan') || s.includes('ब्रज') || s.includes('मथुरा') || s.includes('वृन्दावन')) {
    return lang === 'hi'
      ? '3-दिवसीय ब्रज सर्किट अच्छा रहता है: दिन 1 मथुरा में (जन्मभूमि, द्वारकाधीश, विश्राम घाट), दिन 2 वृन्दावन में (प्रेम मंदिर, बांके बिहारी, इस्कॉन), दिन 3 गोवर्धन और बरसाना तक विस्तार।'
      : "A 3-day Braj circuit works well: Day 1 in Mathura (Janmabhoomi, Dwarkadhish, Vishram Ghat), Day 2 in Vrindavan (Prem Mandir, Banke Bihari, ISKCON), Day 3 extending to Govardhan and Barsana."
  }
  if (s.includes('imambara') || s.includes('lucknow') || s.includes('bhool bhulaiya') || s.includes('इमामबाड़ा') || s.includes('लखनऊ')) {
    return lang === 'hi'
      ? 'हां, बड़ा इमामबाड़ा के ऊपर भूलभुलैया एक वयस्क के साथ बच्चों के लिए आमतौर पर सुरक्षित है — यह संकरे रास्तों का नेटवर्क है, कोई शारीरिक खतरा नहीं, और गाइड मौके पर उपलब्ध हैं।'
      : "Yes, the Bhool Bhulaiya maze above Bara Imambara is generally safe for kids with an adult — it's a network of narrow passages, not a physical hazard, and guides are available on-site."
  }
  return T.dishaFallback[lang]
}

function DishaAIWidget({ open, onOpenChange, pendingQuestion, onConsumeQuestion }: { open: boolean; onOpenChange: (v: boolean) => void; pendingQuestion: string | null; onConsumeQuestion: () => void }) {
  const { lang } = useApp()
  const t = useT()
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'bot', text: T.dishaGreeting[lang] }
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const suggestions: Bi[] = [
    { en: 'Best time for Ganga Aarti?', hi: 'गंगा आरती के लिए सबसे अच्छा समय?' },
    { en: 'Plan a 3-day Braj circuit', hi: '3-दिन का ब्रज सर्किट बनाएं' },
    { en: "When are Mirzapur's waterfalls fullest?", hi: 'मिर्ज़ापुर के झरने कब सबसे भरे होते हैं?' }
  ]

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const send = useCallback((text: string) => {
    const q = text.trim()
    if (!q) return
    setMessages(m => [...m, { role: 'user', text: q }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setMessages(m => [...m, { role: 'bot', text: answerDishaAI(q, lang) }])
      setTyping(false)
    }, 700 + Math.random() * 500)
  }, [lang])

  useEffect(() => {
    if (open && pendingQuestion) {
      send(pendingQuestion)
      onConsumeQuestion()
    }
  }, [open, pendingQuestion, send, onConsumeQuestion])

  return (
    <>
      <button
        onClick={() => onOpenChange(!open)}
        aria-label="Open DishaAI chat"
        className="fixed bottom-6 right-6 z-[90] w-16 h-16 flex items-center justify-center bg-d360-primary text-white shadow-xl hover:bg-d360-primary/90 transition-colors animate-chat-pulse"
        style={{ borderRadius: '50%' }}
      >
        {open ? <IconX /> : <IconChat />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[90] w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-white border border-d360-border shadow-2xl flex flex-col animate-fade-slide-up" style={{ borderRadius: '4px' }}>
          <div className="bg-d360-ink text-white px-5 py-4 flex items-center justify-between" style={{ borderRadius: '4px 4px 0 0' }}>
            <div>
              <div className="font-display text-base flex items-center gap-2"><IconSparkles2 /> DishaAI</div>
              <div className="text-[10px] text-white/60 font-mono uppercase tracking-wide">{t('dishaPreviewLabel')}</div>
            </div>
            <button onClick={() => onOpenChange(false)} className="text-white/70 hover:text-white"><IconX /></button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={`max-w-[85%] text-sm leading-relaxed px-3.5 py-2.5 animate-fade-slide-up ${m.role === 'user' ? 'self-end bg-d360-primary text-white' : 'self-start bg-d360-surface text-d360-ink'}`} style={{ borderRadius: '10px' }}>
                {m.text}
              </div>
            ))}
            {typing && (
              <div className="self-start bg-d360-surface text-d360-ink px-3.5 py-2.5 flex items-center gap-1" style={{ borderRadius: '10px' }}>
                <span className="w-1.5 h-1.5 bg-d360-muted animate-typing-dot" style={{ borderRadius: '50%', animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-d360-muted animate-typing-dot" style={{ borderRadius: '50%', animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-d360-muted animate-typing-dot" style={{ borderRadius: '50%', animationDelay: '300ms' }} />
              </div>
            )}
            <div ref={endRef} />
          </div>

          {messages.length < 3 && (
            <div className="px-4 pb-2 flex flex-col gap-1.5">
              {suggestions.map(s => (
                <button key={s.en} onClick={() => send(s[lang])} className="text-left text-xs text-d360-primary border border-d360-border hover:border-d360-primary px-3 py-2 transition-colors" style={{ borderRadius: '2px' }}>{s[lang]}</button>
              ))}
            </div>
          )}

          <form onSubmit={e => { e.preventDefault(); send(input) }} className="border-t border-d360-border p-3 flex items-center gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('dishaInputPlaceholder')}
              className="flex-1 px-3.5 py-2.5 text-sm bg-d360-surface outline-none focus:ring-1 focus:ring-d360-primary"
              style={{ borderRadius: '20px' }}
            />
            <button type="submit" aria-label="Send" className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-d360-primary text-white hover:bg-d360-primary/90 transition-colors" style={{ borderRadius: '50%' }}>
              <IconSend />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

// ─── App Provider ────────────────────────────────────────────────────────────
function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<UPUser | null>('d360-user', null)
  const [wishlist, setWishlist] = useLocalStorage<string[]>('d360-wishlist', [])
  const [lang, setLang] = useLocalStorage<Lang>('d360-lang', 'en')

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const login = (u: UPUser) => setUser(u)
  const logout = () => setUser(null)
  const toggleWishlist = (slug: string) => {
    setWishlist(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug])
  }
  const toggleLang = () => setLang(prev => prev === 'en' ? 'hi' : 'en')

  return (
    <AppContext.Provider value={{ user, login, logout, wishlist, toggleWishlist, lang, toggleLang }}>
      {children}
    </AppContext.Provider>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<typeof categories[number]>('All')
  const [authOpen, setAuthOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatSeed, setChatSeed] = useState<string | null>(null)

  return (
    <AppProvider>
      <InnerApp
        query={query} setQuery={setQuery}
        activeCategory={activeCategory} setActiveCategory={setActiveCategory}
        authOpen={authOpen} setAuthOpen={setAuthOpen}
        chatOpen={chatOpen} setChatOpen={setChatOpen}
        chatSeed={chatSeed} setChatSeed={setChatSeed}
      />
    </AppProvider>
  )
}

function InnerApp({ query, setQuery, activeCategory, setActiveCategory, authOpen, setAuthOpen, chatOpen, setChatOpen, chatSeed, setChatSeed }: {
  query: string; setQuery: (q: string) => void
  activeCategory: typeof categories[number]; setActiveCategory: (c: typeof categories[number]) => void
  authOpen: boolean; setAuthOpen: (v: boolean) => void
  chatOpen: boolean; setChatOpen: (v: boolean) => void
  chatSeed: string | null; setChatSeed: (v: string | null) => void
}) {
  const { lang } = useApp()
  return (
    <div className="bg-d360-bg font-sans">
      <Nav onAuthOpen={() => setAuthOpen(true)} />
      <Hero onSearch={setQuery} />
      <StatsBar />
      <Ticker />
      <HandpickedCarousel />
      <CategoryExplorer onSelect={setActiveCategory} />
      <DestinationsGrid query={query} activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
      <HiddenGemsCarousel />
      <FeaturedOffers />
      <Circuits />
      <TravelersAsking onOpenChat={(q: Bi) => { setChatSeed(q[lang]); setChatOpen(true) }} />
      <WhyD360 />
      <Newsletter />
      <CTABand />
      <Footer />
      <DishaAIWidget open={chatOpen} onOpenChange={setChatOpen} pendingQuestion={chatSeed} onConsumeQuestion={() => setChatSeed(null)} />
      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
    </div>
  )
}
