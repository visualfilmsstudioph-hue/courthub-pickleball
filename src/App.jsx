import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MapPin,
  Star,
  Plus,
  Camera,
  MessageSquare,
  Users,
  Wind,
  Sun,
  ShieldCheck,
  Search,
  Filter,
  ThumbsUp,
  CheckCircle2,
  Clock,
  Sparkles,
  SlidersHorizontal,
  X,
  ChevronRight,
  Award,
  Flame,
  Calendar,
  Edit3,
  Trash2,
  Eye,
  Upload,
  Check,
  AlertCircle,
  Share2,
  Compass,
  Layers,
  Zap,
  Info,
  ArrowLeft,
  Cloud,
  RefreshCw,
  UserCheck,
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
} from 'firebase/firestore';

// ==========================================
// FIREBASE CLOUD INITIALIZATION (WIRED TO YOUR PROJECT!)
// ==========================================
const MY_EXTERNAL_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCyLOywAqtJPnIxPZ0zG0Ze9BFHAav9quY',
  authDomain: 'courthub-pickleball.firebaseapp.com',
  projectId: 'courthub-pickleball',
  storageBucket: 'courthub-pickleball.firebasestorage.app',
  messagingSenderId: '142882102779',
  appId: '1:142882102779:web:3053c77c7d7691df727f5e',
  measurementId: 'G-6QEZBXZ5NT',
};

const firebaseConfig =
  typeof __firebase_config !== 'undefined' && __firebase_config
    ? JSON.parse(__firebase_config)
    : MY_EXTERNAL_FIREBASE_CONFIG;

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId =
  typeof __app_id !== 'undefined' ? __app_id : 'courthub-pickleball-live';

// ==========================================
// IMAGE COMPRESSION HELPER FOR CLOUD STORAGE
// ==========================================
const compressImageFile = (file, maxWidth = 800, quality = 0.65) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(ev.target?.result || '');
      img.src = ev.target?.result;
    };
    reader.readAsDataURL(file);
  });
};

// ==========================================
// PRESET PHOTOS, AMENITIES & INITIAL COURTS
// ==========================================
const PRESET_COURT_PHOTOS = [
  {
    label: 'Championship Blue/Green Courts',
    url: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Sunset Outdoor Pickleball Complex',
    url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Indoor Climate Controlled Arena',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Stadium Night LED Courts',
    url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Resort Palm Pickleball Club',
    url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=1200&q=80',
  },
];

const ALL_AMENITIES = [
  'Pro LED Lighting',
  'Permanent Pro Nets',
  'Open Play Paddle Rack',
  'Individual Court Fencing',
  'Water Bottle Refill',
  'Covered Shade Cabanas',
  'Restrooms & Lockers',
  'Pro Shop & Demo Paddles',
];

const INITIAL_COURTS = [
  {
    id: 'court-kitchen-club',
    name: 'The Kitchen Sync Pickleball Club',
    city: 'Austin, TX',
    address: '420 Dink Blvd, Austin, TX',
    courtCount: 14,
    surface: 'Pro Cushion Acrylic',
    type: 'Outdoor',
    feeStatus: 'Free Public',
    priceText: 'Free Open Play',
    featured: true,
    paddlesStacked: 6,
    lastCheckIn: 'Updated 12 mins ago',
    windIndex: '4 mph (Calm)',
    coverPhoto: PRESET_COURT_PHOTOS[0].url,
    description:
      'Premier 14-court dedicated pickleball facility with tournament-grade Pro Cushion Acrylic, permanent Douglas nets, and divided 4-up 4-off paddle racks sorted by DUPR skill brackets.',
    amenities: [
      'Pro LED Lighting',
      'Permanent Pro Nets',
      'Open Play Paddle Rack',
      'Individual Court Fencing',
      'Water Bottle Refill',
      'Covered Shade Cabanas',
    ],
    gallery: [
      PRESET_COURT_PHOTOS[0].url,
      PRESET_COURT_PHOTOS[1].url,
      PRESET_COURT_PHOTOS[3].url,
    ],
    lfgPosts: [
      {
        id: 'lfg-1',
        player: 'Marcus V.',
        dupr: '4.0+',
        time: 'Today @ 6:00 PM',
        note: 'Need 2 more for competitive 4.0+ doubles on Court 3!',
        joined: 2,
        joinedUsers: [],
      },
    ],
    reviews: [
      {
        id: 'rev-101',
        author: 'Elena Rostova',
        avatar: 'ER',
        dupr: '4.25 DUPR',
        date: 'Oct 18, 2026',
        rating: 5,
        metrics: { surface: 5, lighting: 5, nets: 5, vibe: 5 },
        comment:
          'Hands down the best gritty surface in town. Zero dead spots in the kitchen, LED lights have no glare for high lobs, and the paddle rack rotation is super welcoming.',
        photos: [PRESET_COURT_PHOTOS[0].url],
        likes: 14,
        likedByMe: false,
        likedByUsers: [],
        replies: [
          {
            id: 'rep-1',
            author: 'Coach_Devon',
            text: 'Totally agree! Courts 1-4 were just resurfaced last month.',
            time: '4:15 PM',
          },
        ],
      },
    ],
  },
  {
    id: 'court-emerald-dome',
    name: 'Emerald City Indoor Dink House',
    city: 'Seattle, WA',
    address: '880 Rainier Ave S, Seattle, WA',
    courtCount: 10,
    surface: 'Concrete Post-Tension',
    type: 'Indoor',
    feeStatus: 'Paid Drop-in',
    priceText: '$12 Drop-in',
    featured: true,
    paddlesStacked: 2,
    lastCheckIn: 'Updated 5 mins ago',
    windIndex: '0 mph (Climate Controlled)',
    coverPhoto: PRESET_COURT_PHOTOS[2].url,
    description:
      'Climate-controlled 10-court indoor pickleball sanctuary with 35-foot ceilings, indirect acoustic LED lighting, and a full pro shop for demoing carbon-fiber paddles.',
    amenities: [
      'Pro LED Lighting',
      'Permanent Pro Nets',
      'Open Play Paddle Rack',
      'Restrooms & Lockers',
      'Pro Shop & Demo Paddles',
    ],
    gallery: [PRESET_COURT_PHOTOS[2].url, PRESET_COURT_PHOTOS[4].url],
    lfgPosts: [],
    reviews: [
      {
        id: 'rev-102',
        author: 'Tyler Chen',
        avatar: 'TC',
        dupr: '3.75 DUPR',
        date: 'Oct 15, 2026',
        rating: 4,
        metrics: { surface: 5, lighting: 4, nets: 5, vibe: 5 },
        comment:
          'Perfect escape from wind and rain. Ball bounce is super true and the baseline run-off room is generous for ATP shots!',
        photos: [],
        likes: 8,
        likedByMe: false,
        likedByUsers: [],
        replies: [],
      },
    ],
  },
];

const calculateCourtStats = (reviews = []) => {
  if (!reviews || reviews.length === 0) {
    return {
      count: 0,
      avg: '0.0',
      surface: '5.0',
      lighting: '5.0',
      nets: '5.0',
      vibe: '5.0',
    };
  }
  const count = reviews.length;
  const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
  const surf = reviews.reduce(
    (acc, r) => acc + Number(r.metrics?.surface || r.rating || 5),
    0
  );
  const light = reviews.reduce(
    (acc, r) => acc + Number(r.metrics?.lighting || r.rating || 5),
    0
  );
  const nets = reviews.reduce(
    (acc, r) => acc + Number(r.metrics?.nets || r.rating || 5),
    0
  );
  const vibe = reviews.reduce(
    (acc, r) => acc + Number(r.metrics?.vibe || r.rating || 5),
    0
  );

  return {
    count,
    avg: (sum / count).toFixed(1),
    surface: (surf / count).toFixed(1),
    lighting: (light / count).toFixed(1),
    nets: (nets / count).toFixed(1),
    vibe: (vibe / count).toFixed(1),
  };
};

const getCrowdBadgeStyle = (paddles) => {
  if (paddles <= 3) {
    return {
      label: `Open Courts (${paddles} Paddles Stacked)`,
      bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      dot: 'bg-emerald-400',
    };
  }
  if (paddles <= 9) {
    return {
      label: `Moderate Rotation (${paddles} Paddles Stacked)`,
      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400',
    };
  }
  return {
    label: `Packed / Heavy Stack (${paddles} Paddles Stacked)`,
    bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-400',
  };
};

// ==========================================
// MAIN APPLICATION COMPONENT
// ==========================================
export default function App() {
  // Cloud Auth & Sync States
  const [user, setUser] = useState(null);
  const [cloudLoading, setCloudLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState('Connecting...');
  const hasSeededRef = useRef(false);

  // Welcome Front Page State
  const [showWelcomePage, setShowWelcomePage] = useState(true);

  // Player Profile & Registration (Synced to Cloud)
  const [playerProfile, setPlayerProfile] = useState({
    displayName: 'Pickleball Player',
    dupr: '3.75 DUPR',
    mainCourt: 'The Kitchen Sync Pickleball Club',
    paddle: 'JOOLA Perseus 16mm Carbon',
    registered: false,
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Public Community Dinkers Roster & App Support Ratings
  const [communityPlayers, setCommunityPlayers] = useState([]);
  const [appSupportList, setAppSupportList] = useState([]);

  // Mode: 'player' | 'owner'
  const [role, setRole] = useState('player');
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(
    () => sessionStorage.getItem('courthub_owner_auth') === 'true'
  );
  const [showOwnerLoginModal, setShowOwnerLoginModal] = useState(false);
  const [ownerUserInput, setOwnerUserInput] = useState('');
  const [ownerPassInput, setOwnerPassInput] = useState('');
  const [ownerLoginError, setOwnerLoginError] = useState('');

  const [courts, setCourts] = useState(INITIAL_COURTS);
  const [selectedCourtId, setSelectedCourtId] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Owner Login & Logout Handlers
  const handleOwnerModeClick = () => {
    if (isOwnerAuthenticated) {
      setRole('owner');
    } else {
      setOwnerLoginError('');
      setShowOwnerLoginModal(true);
    }
  };

  const handleOwnerLoginSubmit = (e) => {
    e.preventDefault();
    if (
      ownerUserInput.trim().toUpperCase() === 'JAYEM' &&
      ownerPassInput === '123456789'
    ) {
      setIsOwnerAuthenticated(true);
      sessionStorage.setItem('courthub_owner_auth', 'true');
      setShowOwnerLoginModal(false);
      setOwnerUserInput('');
      setOwnerPassInput('');
      setOwnerLoginError('');
      setRole('owner');
      triggerToast('Welcome back, JAYEM! App Owner Mode unlocked.');
    } else {
      setOwnerLoginError('Invalid Owner Username or Password.');
    }
  };

  const handleOwnerLogout = () => {
    setIsOwnerAuthenticated(false);
    sessionStorage.removeItem('courthub_owner_auth');
    setRole('player');
    triggerToast('App Owner Mode locked.', 'info');
  };

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [feeFilter, setFeeFilter] = useState('All');
  const [surfaceFilter, setSurfaceFilter] = useState('All');
  const [minRatingFilter, setMinRatingFilter] = useState(0);

  // Owner Add/Edit Court Modal State
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);

  // Lightbox Photo Viewer State
  const [lightboxUrl, setLightboxUrl] = useState(null);

  // 1. One-time Firebase Auth Listener
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== 'undefined' &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Cloud Firestore Listeners (Courts + User Profile)
  useEffect(() => {
    if (!user) return;

    const courtsColRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'pickleball_courts'
    );
    const unsubscribeCourts = onSnapshot(
      courtsColRef,
      async (snapshot) => {
        if (snapshot.empty && !hasSeededRef.current) {
          hasSeededRef.current = true;
          setSyncStatus('Seeding Courts...');
          try {
            for (const defaultCourt of INITIAL_COURTS) {
              const courtDocRef = doc(
                db,
                'artifacts',
                appId,
                'public',
                'data',
                'pickleball_courts',
                defaultCourt.id
              );
              await setDoc(courtDocRef, {
                ...defaultCourt,
                createdAt: Date.now(),
              });
            }
            setSyncStatus('Cloud Live');
          } catch (seedErr) {
            console.error('Error seeding initial courts:', seedErr);
          }
          setCloudLoading(false);
          return;
        }

        const loadedCourts = snapshot.docs.map((d) => ({
          ...d.data(),
          id: d.id,
        }));

        loadedCourts.sort((a, b) => {
          if (a.featured !== b.featured) return a.featured ? -1 : 1;
          return (b.createdAt || 0) - (a.createdAt || 0);
        });

        if (loadedCourts.length > 0) {
          setCourts(loadedCourts);
        }
        setCloudLoading(false);
        setSyncStatus('Cloud Live');
      },
      (err) => {
        console.error('Firestore courts listener error:', err);
        setSyncStatus('Offline Mode');
        setCloudLoading(false);
      }
    );

    const profileDocRef = doc(
      db,
      'artifacts',
      appId,
      'users',
      user.uid,
      'profile',
      'player_settings'
    );
    const unsubscribeProfile = onSnapshot(
      profileDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPlayerProfile({
            displayName: data.displayName || 'Pickleball Player',
            dupr: data.dupr || '3.75 DUPR',
            mainCourt: data.mainCourt || 'The Kitchen Sync Pickleball Club',
            paddle: data.paddle || 'JOOLA Perseus 16mm Carbon',
            registered: Boolean(data.registered),
          });
        } else {
          const shortId = user.uid.slice(0, 4).toUpperCase();
          setPlayerProfile({
            displayName: `Dinker_${shortId}`,
            dupr: '3.75 DUPR',
            mainCourt: 'The Kitchen Sync Pickleball Club',
            paddle: 'Selkirk LUXX Control Air',
            registered: false,
          });
        }
      },
      (err) => {
        console.error('Profile listener error:', err);
      }
    );

    // 3. Public Registered Dinkers Directory Listener
    const playersColRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'registered_dinkers'
    );
    const unsubscribePlayers = onSnapshot(
      playersColRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        setCommunityPlayers(list);
      },
      (err) => console.error('Players roster listener error:', err)
    );

    // 4. App Support & Test App Ratings Listener
    const supportColRef = collection(
      db,
      'artifacts',
      appId,
      'public',
      'data',
      'app_support_ratings'
    );
    const unsubscribeSupport = onSnapshot(
      supportColRef,
      (snap) => {
        const list = snap.docs.map((d) => ({ ...d.data(), id: d.id }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setAppSupportList(list);
      },
      (err) => console.error('App support listener error:', err)
    );

    return () => {
      unsubscribeCourts();
      unsubscribeProfile();
      unsubscribePlayers();
      unsubscribeSupport();
    };
  }, [user]);

  // Save User Profile & Registration to Cloud (Private + Public Roster)
  const handleSaveProfile = async (newProfile, enterCourtsAfter = false) => {
    const fullProfile = {
      ...playerProfile,
      ...newProfile,
      registered: true,
    };
    setPlayerProfile(fullProfile);
    setIsProfileModalOpen(false);
    if (enterCourtsAfter) {
      setShowWelcomePage(false);
    }
    if (!user) return;
    try {
      const profileDocRef = doc(
        db,
        'artifacts',
        appId,
        'users',
        user.uid,
        'profile',
        'player_settings'
      );
      await setDoc(profileDocRef, {
        ...fullProfile,
        updatedAt: Date.now(),
      });

      const publicPlayerRef = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'registered_dinkers',
        user.uid
      );
      await setDoc(publicPlayerRef, {
        uid: user.uid,
        displayName: fullProfile.displayName,
        dupr: fullProfile.dupr,
        mainCourt: fullProfile.mainCourt,
        paddle: fullProfile.paddle,
        updatedAt: Date.now(),
      });

      triggerToast(
        `Registered as ${fullProfile.displayName} (${fullProfile.dupr} • ${fullProfile.paddle})!`
      );
    } catch (err) {
      console.error('Error saving profile:', err);
      triggerToast('Could not save profile to cloud.', 'error');
    }
  };

  // Submit Support & Rating for the Test App
  const handleSendAppSupport = async (stars, message) => {
    if (!user) return;
    try {
      const supportRef = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'app_support_ratings',
        user.uid
      );
      await setDoc(supportRef, {
        uid: user.uid,
        author: playerProfile.displayName,
        dupr: playerProfile.dupr,
        paddle: playerProfile.paddle,
        stars: Number(stars || 5),
        message:
          message?.trim() || 'Supporting this awesome Pickleball test app!',
        createdAt: Date.now(),
      });
      triggerToast('Thank you for supporting and rating our test app!');
    } catch (err) {
      console.error('Error submitting app rating:', err);
    }
  };

  const activeCourt = useMemo(
    () => courts.find((c) => c.id === selectedCourtId) || null,
    [courts, selectedCourtId]
  );

  const filteredCourts = useMemo(() => {
    return courts.filter((court) => {
      const stats = calculateCourtStats(court.reviews);
      const matchesSearch =
        court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        court.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        court.surface.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'All' || court.type === typeFilter;
      const matchesFee = feeFilter === 'All' || court.feeStatus === feeFilter;
      const matchesSurface =
        surfaceFilter === 'All' || court.surface.includes(surfaceFilter);
      const matchesRating =
        Number(stats.avg) >= minRatingFilter ||
        (stats.count === 0 && minRatingFilter === 0);

      return (
        matchesSearch &&
        matchesType &&
        matchesFee &&
        matchesSurface &&
        matchesRating
      );
    });
  }, [
    courts,
    searchQuery,
    typeFilter,
    feeFilter,
    surfaceFilter,
    minRatingFilter,
  ]);

  const totalReviewsCount = useMemo(
    () => courts.reduce((acc, c) => acc + (c.reviews?.length || 0), 0),
    [courts]
  );
  const totalCourtsNumber = useMemo(
    () => courts.reduce((acc, c) => acc + Number(c.courtCount || 0), 0),
    [courts]
  );

  // ==========================================
  // OWNER CLOUD ACTIONS
  // ==========================================
  const handleSaveCourt = async (courtData) => {
    if (!user) return;
    try {
      if (editingCourt) {
        const courtDocRef = doc(
          db,
          'artifacts',
          appId,
          'public',
          'data',
          'pickleball_courts',
          editingCourt.id
        );
        await updateDoc(courtDocRef, {
          ...courtData,
          updatedAt: Date.now(),
        });
        triggerToast(`Synced updates for "${courtData.name}" to cloud!`);
      } else {
        const newId = `court-${Date.now()}`;
        const newCourt = {
          ...courtData,
          id: newId,
          createdAt: Date.now(),
          createdByUid: user.uid,
          paddlesStacked: 2,
          lastCheckIn: `Just added by ${playerProfile.displayName}`,
          windIndex:
            courtData.type === 'Indoor'
              ? '0 mph (Climate Controlled)'
              : '5 mph (Light Breeze)',
          gallery: [courtData.coverPhoto],
          lfgPosts: [],
          reviews: [],
        };
        const courtDocRef = doc(
          db,
          'artifacts',
          appId,
          'public',
          'data',
          'pickleball_courts',
          newId
        );
        await setDoc(courtDocRef, newCourt);
        triggerToast(
          `New Pickleball Court "${courtData.name}" published to the cloud!`
        );
      }
    } catch (err) {
      console.error('Error saving court to Firestore:', err);
      triggerToast('Error saving court to cloud storage.', 'error');
    }
    setIsCourtModalOpen(false);
    setEditingCourt(null);
  };

  const handleToggleFeatured = async (courtId, e) => {
    e.stopPropagation();
    if (!user) return;
    const target = courts.find((c) => c.id === courtId);
    if (!target) return;
    try {
      const courtDocRef = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'pickleball_courts',
        courtId
      );
      await updateDoc(courtDocRef, {
        featured: !target.featured,
      });
      triggerToast('Updated court featured status in cloud!');
    } catch (err) {
      console.error('Error toggling featured status:', err);
    }
  };

  const handleDeleteCourt = async (courtId, e) => {
    e.stopPropagation();
    if (!user) return;
    const target = courts.find((c) => c.id === courtId);
    try {
      const courtDocRef = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'pickleball_courts',
        courtId
      );
      await deleteDoc(courtDocRef);
      if (selectedCourtId === courtId) setSelectedCourtId(null);
      triggerToast(`Removed "${target?.name}" from cloud listings.`, 'info');
    } catch (err) {
      console.error('Error deleting court:', err);
    }
  };

  // ==========================================
  // PLAYER COMMUNITY CLOUD ACTIONS
  // ==========================================
  const handleAddReview = async (courtId, newReview) => {
    if (!user) return;
    const target = courts.find((c) => c.id === courtId);
    if (!target) return;

    const updatedGallery =
      newReview.photos && newReview.photos.length > 0
        ? [...newReview.photos, ...(target.gallery || [])]
        : target.gallery || [];

    const updatedReviews = [newReview, ...(target.reviews || [])];

    try {
      const courtDocRef = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'pickleball_courts',
        courtId
      );
      await updateDoc(courtDocRef, {
        gallery: updatedGallery,
        reviews: updatedReviews,
      });
      triggerToast('Your court review & photos are now live in the cloud!');
    } catch (err) {
      console.error('Error saving review to cloud:', err);
      triggerToast('Failed to save review. Try smaller photos.', 'error');
    }
  };

  const handleToggleLikeReview = async (courtId, reviewId) => {
    if (!user) return;
    const target = courts.find((c) => c.id === courtId);
    if (!target) return;

    const updatedReviews = (target.reviews || []).map((r) => {
      if (r.id !== reviewId) return r;
      const likedByUsers = Array.isArray(r.likedByUsers) ? r.likedByUsers : [];
      const alreadyLiked = likedByUsers.includes(user.uid) || r.likedByMe;
      const nextLikedUsers = alreadyLiked
        ? likedByUsers.filter((uid) => uid !== user.uid)
        : [...likedByUsers, user.uid];

      return {
        ...r,
        likedByMe: !alreadyLiked,
        likedByUsers: nextLikedUsers,
        likes: alreadyLiked
          ? Math.max(0, (r.likes || 1) - 1)
          : (r.likes || 0) + 1,
      };
    });

    try {
      const courtDocRef = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'pickleball_courts',
        courtId
      );
      await updateDoc(courtDocRef, { reviews: updatedReviews });
    } catch (err) {
      console.error('Error updating review like:', err);
    }
  };

  const handleAddReplyToReview = async (
    courtId,
    reviewId,
    authorName,
    replyText
  ) => {
    if (!replyText.trim() || !user) return;
    const target = courts.find((c) => c.id === courtId);
    if (!target) return;

    const updatedReviews = (target.reviews || []).map((r) => {
      if (r.id !== reviewId) return r;
      return {
        ...r,
        replies: [
          ...(r.replies || []),
          {
            id: `rep-${Date.now()}`,
            author:
              authorName || playerProfile.displayName || 'Pickleball_Player',
            authorUid: user.uid,
            text: replyText.trim(),
            time: new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ],
      };
    });

    try {
      const courtDocRef = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'pickleball_courts',
        courtId
      );
      await updateDoc(courtDocRef, { reviews: updatedReviews });
      triggerToast('Comment synced to review thread!');
    } catch (err) {
      console.error('Error adding reply:', err);
    }
  };

  const handleUpdatePaddleStack = async (courtId, newPaddleCount) => {
    if (!user) return;
    try {
      const courtDocRef = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'pickleball_courts',
        courtId
      );
      await updateDoc(courtDocRef, {
        paddlesStacked: newPaddleCount,
        lastCheckIn: `Updated by ${
          playerProfile.displayName
        } (${new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })})`,
      });
      triggerToast(
        `Live Paddle Rack synced: ${newPaddleCount} paddles stacked!`
      );
    } catch (err) {
      console.error('Error updating paddle stack:', err);
    }
  };

  const handleAddLfgPost = async (courtId, post) => {
    if (!user) return;
    const target = courts.find((c) => c.id === courtId);
    if (!target) return;

    const newPost = {
      ...post,
      id: `lfg-${Date.now()}`,
      creatorUid: user.uid,
      joined: 1,
      joinedUsers: [user.uid],
    };

    try {
      const courtDocRef = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'pickleball_courts',
        courtId
      );
      await updateDoc(courtDocRef, {
        lfgPosts: [newPost, ...(target.lfgPosts || [])],
      });
      triggerToast('Open Play session published to live bulletin!');
    } catch (err) {
      console.error('Error posting LFG:', err);
    }
  };

  const handleJoinLfg = async (courtId, lfgId) => {
    if (!user) return;
    const target = courts.find((c) => c.id === courtId);
    if (!target) return;

    const updatedLfg = (target.lfgPosts || []).map((p) => {
      if (p.id !== lfgId) return p;
      const joinedUsers = Array.isArray(p.joinedUsers) ? p.joinedUsers : [];
      if (joinedUsers.includes(user.uid)) return p;
      return {
        ...p,
        joined: (p.joined || 1) + 1,
        joinedByMe: true,
        joinedUsers: [...joinedUsers, user.uid],
      };
    });

    try {
      const courtDocRef = doc(
        db,
        'artifacts',
        appId,
        'public',
        'data',
        'pickleball_courts',
        courtId
      );
      await updateDoc(courtDocRef, { lfgPosts: updatedLfg });
      triggerToast('You joined this Open Play session! Grab your paddle.');
    } catch (err) {
      console.error('Error joining LFG:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-lime-400 selection:text-slate-950">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-lime-400 text-slate-950 font-semibold shadow-2xl shadow-lime-400/25 border border-lime-300 animate-bounce">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-3">
          {/* Logo */}
          <div
            onClick={() => setSelectedCourtId(null)}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-lime-500/20 group-hover:scale-105 transition-transform">
              <svg
                className="w-7 h-7 text-slate-950"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <circle cx="12" cy="12" r="10" fill="currentColor" />
                <circle cx="9" cy="8" r="1.4" fill="#020617" />
                <circle cx="15" cy="8" r="1.4" fill="#020617" />
                <circle cx="7" cy="13" r="1.4" fill="#020617" />
                <circle cx="12" cy="12" r="1.5" fill="#020617" />
                <circle cx="17" cy="13" r="1.4" fill="#020617" />
                <circle cx="10" cy="17" r="1.4" fill="#020617" />
                <circle cx="14.5" cy="17" r="1.4" fill="#020617" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">
                  COURT<span className="text-lime-400">HUB</span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-lime-400/15 text-lime-400 border border-lime-400/30">
                  Pickleball
                </span>
                <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Cloud className="w-3 h-3 text-lime-400" />
                  {syncStatus}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Real-Time Cloud Courts, Live Paddle Stacks & Player Reviews
              </p>
            </div>
          </div>

          {/* Player Identity + Role Switcher & Owner CTA */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsProfileModalOpen(true)}
              title="Customize your Nickname, DUPR, Main Court & Paddle"
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-lime-400/20 text-lime-400 font-bold flex items-center justify-center text-[11px]">
                {playerProfile.displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="text-left">
                <div className="font-bold text-white leading-none">
                  {playerProfile.displayName}
                </div>
                <div className="text-[10px] text-lime-400 font-semibold mt-0.5">
                  {playerProfile.dupr} • {playerProfile.paddle}
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowWelcomePage(!showWelcomePage)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                showWelcomePage
                  ? 'bg-lime-400/20 border-lime-400 text-lime-300'
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              <span className="hidden sm:inline">
                {showWelcomePage ? 'Explore Courts' : 'Welcome Page'}
              </span>
            </button>

            <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex items-center">
              <button
                onClick={() => setRole('player')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  role === 'player'
                    ? 'bg-lime-400 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Player View</span>
              </button>
              <button
                onClick={handleOwnerModeClick}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                  role === 'owner'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>App Owner Mode</span>
              </button>
            </div>

            {role === 'owner' && (
              <button
                onClick={() => {
                  setEditingCourt(null);
                  setIsCourtModalOpen(true);
                }}
                className="flex items-center gap-1.5 bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-slate-950 font-bold px-3.5 py-2.5 rounded-xl shadow-lg shadow-lime-400/20 transition-all hover:scale-[1.02] active:scale-95 text-xs sm:text-sm"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Add Pickleball Court</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}
          </div>
        </div>

        {/* CLOUD USER BAR & OWNER MODE BANNER */}
        <div className="bg-slate-900/90 border-t border-slate-800/80 px-4 py-1.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Connected to courthub-pickleball
              </span>
              {user && (
                <span className="font-mono text-slate-400">
                  Player ID:{' '}
                  <strong className="text-slate-200 select-all">
                    {user.uid}
                  </strong>
                </span>
              )}
            </div>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="text-lime-400 hover:underline font-semibold flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>
                {playerProfile.displayName} ({playerProfile.dupr} • Main:{' '}
                {playerProfile.mainCourt} • Paddle: {playerProfile.paddle}) —
                Edit Registration
              </span>
            </button>
          </div>
        </div>

        {role === 'owner' && (
          <div className="bg-emerald-500/10 border-t border-emerald-500/20 px-4 py-2.5">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-emerald-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-lime-400 shrink-0" />
                <span>
                  <strong>Owner Cloud Dashboard (Logged in as JAYEM):</strong>{' '}
                  Any pickleball court you add, feature, or edit is saved
                  permanently to the cloud for all players.
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setEditingCourt(null);
                    setIsCourtModalOpen(true);
                  }}
                  className="underline font-bold text-lime-400 hover:text-lime-300"
                >
                  + Add a Court Now
                </button>
                <button
                  onClick={handleOwnerLogout}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                >
                  Lock Owner Mode
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT VIEW SWITCHER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cloudLoading ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-lime-400 animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-white">
              Syncing Pickleball Courts from Cloud...
            </h3>
            <p className="text-xs text-slate-400">
              Loading live paddle stacks, player reviews, and court photos.
            </p>
          </div>
        ) : showWelcomePage ? (
          <WelcomeFrontPage
            playerProfile={playerProfile}
            courts={courts}
            communityPlayers={communityPlayers}
            appSupportList={appSupportList}
            onRegisterAndEnter={(profileData) =>
              handleSaveProfile(profileData, true)
            }
            onEnterCourts={() => setShowWelcomePage(false)}
            onSendSupport={handleSendAppSupport}
          />
        ) : selectedCourtId && activeCourt ? (
          <CourtDetailView
            court={activeCourt}
            user={user}
            playerProfile={playerProfile}
            role={role}
            onBack={() => setSelectedCourtId(null)}
            onEditCourt={() => {
              setEditingCourt(activeCourt);
              setIsCourtModalOpen(true);
            }}
            onAddReview={handleAddReview}
            onToggleLikeReview={handleToggleLikeReview}
            onAddReply={handleAddReplyToReview}
            onUpdatePaddleStack={handleUpdatePaddleStack}
            onAddLfgPost={handleAddLfgPost}
            onJoinLfg={handleJoinLfg}
            onOpenLightbox={setLightboxUrl}
          />
        ) : (
          <>
            {/* HERO BANNER */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 p-6 sm:p-10 mb-8 shadow-2xl">
              <div className="absolute -right-16 -top-16 w-72 h-72 bg-lime-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute right-20 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/15 border border-lime-400/30 text-lime-300 text-xs font-bold uppercase tracking-wider">
                    <Flame className="w-3.5 h-3.5 text-lime-400" />
                    <span>
                      100% Dedicated Pickleball Court Network • Cloud Synced
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                    Find Your Next Court.{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-400">
                      Check the Paddle Stack.
                    </span>
                  </h1>
                  <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed">
                    Explore owner-verified pickleball courts, inspect real
                    player photos of surface grit and night lighting, rate your
                    experience, and coordinate DUPR Open Play sessions in real
                    time.
                  </p>

                  {/* Quick Stats Bar */}
                  <div className="pt-2 flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-lime-400 font-bold">
                        {courts.length}
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          Verified Hubs
                        </div>
                        <div className="text-xs text-slate-400">
                          {totalCourtsNumber} Total Courts
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-amber-400 font-bold">
                        <Star className="w-4 h-4 fill-amber-400" />
                      </div>
                      <div>
                        <div className="font-bold text-white">
                          {totalReviewsCount} Player Reviews
                        </div>
                        <div className="text-xs text-slate-400">
                          Saved in Cloud
                        </div>
                      </div>
                    </div>

                    {role === 'player' ? (
                      <button
                        onClick={handleOwnerModeClick}
                        className="text-xs font-semibold text-lime-400 hover:text-lime-300 flex items-center gap-1 bg-lime-400/10 px-3 py-2 rounded-xl border border-lime-400/20"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Switch to App Owner Mode to Add Courts</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingCourt(null);
                          setIsCourtModalOpen(true);
                        }}
                        className="text-xs font-bold text-slate-950 bg-lime-400 hover:bg-lime-300 flex items-center gap-1.5 px-4 py-2.5 rounded-xl shadow-lg shadow-lime-400/20"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add New Pickleball Court</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Live Court Radar Card */}
                <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-ping" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Live Paddle Stack Radar
                      </span>
                    </div>
                    <span className="text-[11px] text-lime-400 font-semibold">
                      Cloud Live
                    </span>
                  </div>
                  <div className="space-y-3">
                    {courts.slice(0, 3).map((c) => {
                      const badge = getCrowdBadgeStyle(c.paddlesStacked);
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCourtId(c.id)}
                          className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800/80 cursor-pointer transition-all flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {c.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {c.city} • {c.courtCount} Courts
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border shrink-0 ${badge.bg}`}
                          >
                            {c.paddlesStacked} Paddles
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* REGISTERED DINKERS BAR */}
            {communityPlayers.length > 0 && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 mb-8">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-lime-400" />
                    <span className="text-xs font-black uppercase tracking-wider text-white">
                      Registered Community Dinkers ({communityPlayers.length})
                    </span>
                  </div>
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="text-xs font-bold text-lime-400 hover:underline"
                  >
                    + Update Your Setup
                  </button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {communityPlayers.slice(0, 8).map((p) => (
                    <div
                      key={p.id}
                      className="shrink-0 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-lime-400/20 text-lime-300 font-black text-xs flex items-center justify-center">
                        {(p.displayName || 'DK').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">
                            {p.displayName}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            {p.dupr}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Paddle:{' '}
                          <span className="text-lime-400">{p.paddle}</span> •
                          Main:{' '}
                          <span className="text-slate-300">{p.mainCourt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEARCH & FILTER BAR */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 mb-8 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search court name, city, or surface..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-lime-400"
                  />
                </div>

                <div className="md:col-span-2">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-lime-400"
                  >
                    <option value="All">All Court Types</option>
                    <option value="Outdoor">Outdoor</option>
                    <option value="Indoor">Indoor</option>
                    <option value="Covered">Covered Canopy</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <select
                    value={surfaceFilter}
                    onChange={(e) => setSurfaceFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-lime-400"
                  >
                    <option value="All">All Surface Types</option>
                    <option value="Pro Cushion">Pro Cushion Acrylic</option>
                    <option value="Concrete">Concrete Post-Tension</option>
                    <option value="Asphalt">Asphalt</option>
                    <option value="Sport Court">Modular Sport Court</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <select
                    value={feeFilter}
                    onChange={(e) => setFeeFilter(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-lime-400"
                  >
                    <option value="All">Free & Paid</option>
                    <option value="Free Public">Free Public</option>
                    <option value="Paid Drop-in">Paid Drop-in</option>
                    <option value="Membership">Membership</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-medium">
                    Minimum Rating:
                  </span>
                  {[0, 3.5, 4.0, 4.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => setMinRatingFilter(r)}
                      className={`px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                        minRatingFilter === r
                          ? 'bg-lime-400/20 border-lime-400 text-lime-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {r === 0 ? 'Any Rating' : `${r}+ Stars ★`}
                    </button>
                  ))}
                </div>
                <div className="text-slate-400">
                  Showing{' '}
                  <strong className="text-white">
                    {filteredCourts.length}
                  </strong>{' '}
                  of {courts.length} Pickleball Locations
                </div>
              </div>
            </div>

            {/* COURT CARDS GRID */}
            {filteredCourts.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                  <Compass className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  No Pickleball Courts Match Your Filters
                </h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Try clearing your search filters or switch to App Owner Mode
                  to add a new court in this area.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('All');
                    setFeeFilter('All');
                    setSurfaceFilter('All');
                    setMinRatingFilter(0);
                  }}
                  className="px-4 py-2 rounded-xl bg-lime-400 text-slate-950 font-bold text-sm"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCourts.map((court) => {
                  const stats = calculateCourtStats(court.reviews);
                  const crowdBadge = getCrowdBadgeStyle(court.paddlesStacked);

                  return (
                    <div
                      key={court.id}
                      onClick={() => setSelectedCourtId(court.id)}
                      className="group bg-slate-900/90 hover:bg-slate-900 border border-slate-800/90 hover:border-lime-400/50 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
                    >
                      <div className="relative h-60 overflow-hidden bg-slate-950">
                        <img
                          src={court.coverPhoto}
                          alt={court.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {court.featured && (
                              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-lime-400 text-slate-950 shadow-lg flex items-center gap-1">
                                <Award className="w-3.5 h-3.5" /> Owner Featured
                              </span>
                            )}
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-950/85 backdrop-blur-md text-white border border-slate-700">
                              {court.type} • {court.courtCount} Courts
                            </span>
                          </div>

                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/90 text-slate-950 shadow-md">
                            {court.priceText}
                          </span>
                        </div>

                        {role === 'owner' && (
                          <div className="absolute bottom-14 right-4 flex items-center gap-1.5 z-20">
                            <button
                              onClick={(e) => handleToggleFeatured(court.id, e)}
                              title="Toggle Featured Badge"
                              className="p-2 rounded-xl bg-slate-950/90 hover:bg-lime-400 text-slate-200 hover:text-slate-950 border border-slate-700 transition-colors"
                            >
                              <Award className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingCourt(court);
                                setIsCourtModalOpen(true);
                              }}
                              title="Edit Court Specs"
                              className="p-2 rounded-xl bg-slate-950/90 hover:bg-lime-400 text-slate-200 hover:text-slate-950 border border-slate-700 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteCourt(court.id, e)}
                              title="Delete Court"
                              className="p-2 rounded-xl bg-slate-950/90 hover:bg-rose-500 text-rose-400 hover:text-white border border-slate-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-lime-400 mb-0.5">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{court.city}</span>
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-lime-300 transition-colors">
                              {court.name}
                            </h2>
                          </div>

                          <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 shrink-0">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-black text-white text-sm">
                              {stats.count > 0 ? stats.avg : 'New'}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({stats.count})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div
                              className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold border ${crowdBadge.bg}`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${crowdBadge.dot}`}
                              />
                              <span>{crowdBadge.label}</span>
                            </div>

                            <span className="text-xs font-semibold text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
                              Surface: {court.surface}
                            </span>
                          </div>

                          <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
                            {court.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(court.amenities || []).slice(0, 4).map((item) => (
                              <span
                                key={item}
                                className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800"
                              >
                                {item}
                              </span>
                            ))}
                            {(court.amenities || []).length > 4 && (
                              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-950 text-lime-400 border border-slate-800">
                                +{court.amenities.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3.5 h-3.5 text-lime-400" />
                              {(court.reviews || []).length} Reviews
                            </span>
                            <span className="flex items-center gap-1">
                              <Camera className="w-3.5 h-3.5 text-emerald-400" />
                              {(court.gallery || []).length} Photos
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-amber-400" />
                              {(court.lfgPosts || []).length} Open Play LFG
                            </span>
                          </div>

                          <span className="inline-flex items-center gap-1 text-xs font-bold text-lime-400 group-hover:translate-x-1 transition-transform shrink-0">
                            <span>Explore & Review</span>
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* OWNER LOGIN MODAL */}
      {showOwnerLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">
                    App Owner Login
                  </h2>
                  <p className="text-xs text-slate-400">
                    Enter admin credentials to manage courts
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowOwnerLoginModal(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOwnerLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Owner Username
                </label>
                <input
                  type="text"
                  required
                  value={ownerUserInput}
                  onChange={(e) => setOwnerUserInput(e.target.value)}
                  placeholder="Enter username"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Owner Password
                </label>
                <input
                  type="password"
                  required
                  value={ownerPassInput}
                  onChange={(e) => setOwnerPassInput(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              {ownerLoginError && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs font-bold text-rose-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{ownerLoginError}</span>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOwnerLoginModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black"
                >
                  Unlock Owner Mode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OWNER ADD / EDIT COURT MODAL */}
      {isCourtModalOpen && (
        <OwnerCourtModal
          initialData={editingCourt}
          onClose={() => {
            setIsCourtModalOpen(false);
            setEditingCourt(null);
          }}
          onSave={handleSaveCourt}
        />
      )}

      {/* PLAYER PROFILE CUSTOMIZATION MODAL */}
      {isProfileModalOpen && (
        <PlayerProfileModal
          profile={playerProfile}
          courts={courts}
          userUid={user?.uid}
          onClose={() => setIsProfileModalOpen(false)}
          onSave={(data) => handleSaveProfile(data, false)}
        />
      )}

      {/* FULLSCREEN PHOTO LIGHTBOX */}
      {lightboxUrl && (
        <div
          onClick={() => setLightboxUrl(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-900 text-white hover:bg-lime-400 hover:text-slate-950 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={lightboxUrl}
            alt="Pickleball Court Fullscreen"
            className="max-w-full max-h-[85vh] rounded-2xl object-contain border border-slate-800 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}

// ==========================================
// WELCOME DINKERS FRONT PAGE COMPONENT
// ==========================================
function WelcomeFrontPage({
  playerProfile,
  courts,
  communityPlayers,
  appSupportList,
  onRegisterAndEnter,
  onEnterCourts,
  onSendSupport,
}) {
  const [nickname, setNickname] = useState(playerProfile?.displayName || '');
  const [dupr, setDupr] = useState(playerProfile?.dupr || '3.75 DUPR');
  const [mainCourt, setMainCourt] = useState(
    playerProfile?.mainCourt ||
      courts[0]?.name ||
      'The Kitchen Sync Pickleball Club'
  );
  const [paddle, setPaddle] = useState(
    playerProfile?.paddle || 'JOOLA Perseus 16mm Carbon'
  );

  const [appStars, setAppStars] = useState(5);
  const [supportNote, setSupportNote] = useState('');
  const [hasSubmittedSupport, setHasSubmittedSupport] = useState(false);

  useEffect(() => {
    if (playerProfile?.displayName) setNickname(playerProfile.displayName);
    if (playerProfile?.dupr) setDupr(playerProfile.dupr);
    if (playerProfile?.mainCourt) setMainCourt(playerProfile.mainCourt);
    if (playerProfile?.paddle) setPaddle(playerProfile.paddle);
  }, [playerProfile]);

  const avgAppRating = useMemo(() => {
    if (!appSupportList || appSupportList.length === 0) return '5.0';
    const sum = appSupportList.reduce(
      (acc, item) => acc + Number(item.stars || 5),
      0
    );
    return (sum / appSupportList.length).toFixed(1);
  }, [appSupportList]);

  const handleQuickRegister = (e) => {
    e.preventDefault();
    if (!nickname.trim()) return;
    onRegisterAndEnter({
      displayName: nickname.trim(),
      dupr,
      mainCourt: mainCourt.trim() || 'Local Pickleball Club',
      paddle: paddle.trim() || 'Carbon Fiber Paddle',
    });
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    onSendSupport(appStars, supportNote);
    setSupportNote('');
    setHasSubmittedSupport(true);
  };

  return (
    <div className="space-y-10 py-2">
      {/* MAIN WELCOME HERO BANNER */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 border-2 border-lime-400/30 p-8 sm:p-14 text-center shadow-2xl">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-lime-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime-400/15 border border-lime-400/40 text-lime-300 text-xs sm:text-sm font-black uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <span>
              Official Pickleball Court Community & Live Stack Network
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400 drop-shadow-sm">
            WELCOME DINKERS
          </h1>

          <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
            <p className="text-base sm:text-xl font-bold text-white leading-relaxed">
              “This is a test app — if you guys like this app, please support me
              or give a rating!”
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {avgAppRating} App Rating ({appSupportList.length || 1}{' '}
                Supporters)
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                <Users className="w-3.5 h-3.5" />
                {communityPlayers.length} Registered Dinkers
              </span>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onEnterCourts}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-lime-400 to-emerald-400 hover:from-lime-300 hover:to-emerald-300 text-slate-950 font-black text-base sm:text-lg shadow-2xl shadow-lime-400/30 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95"
            >
              <Compass className="w-6 h-6 stroke-[2.5]" />
              <span>Enter Courts / Find Your Court</span>
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN SECTION: PLAYER REGISTRATION + APP SUPPORT & RATINGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-lime-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-lime-400/20">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    Quick Dinker Registration
                  </h2>
                  {playerProfile?.registered && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Registered ✓
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  No password or email needed! Just enter your Nickname, DUPR,
                  Main Court, and Paddle.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleQuickRegister} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-lime-400 uppercase tracking-wider block mb-1.5">
                  1. Your Nickname *
                </label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g., KitchenKing_99"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-lime-400 uppercase tracking-wider block mb-1.5">
                  2. Your DUPR Skill Rating *
                </label>
                <select
                  value={dupr}
                  onChange={(e) => setDupr(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
                >
                  <option value="2.5 DUPR">2.5 DUPR (Beginner)</option>
                  <option value="3.0 DUPR">3.0 DUPR (Novice)</option>
                  <option value="3.5 DUPR">3.5 DUPR (Intermediate)</option>
                  <option value="3.75 DUPR">
                    3.75 DUPR (Upper-Intermediate)
                  </option>
                  <option value="4.0 DUPR">4.0 DUPR (Advanced)</option>
                  <option value="4.5 DUPR">4.5 DUPR (Competitive)</option>
                  <option value="5.0+ DUPR">5.0+ DUPR (Tour / Pro)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-lime-400 uppercase tracking-wider block mb-1.5">
                  3. What Court Do You Main In? *
                </label>
                <input
                  type="text"
                  required
                  list="court-suggestions"
                  value={mainCourt}
                  onChange={(e) => setMainCourt(e.target.value)}
                  placeholder="Select or type your home court..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
                />
                <datalist id="court-suggestions">
                  {courts.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-xs font-bold text-lime-400 uppercase tracking-wider block mb-1.5">
                  4. What Paddle Do You Own? *
                </label>
                <input
                  type="text"
                  required
                  list="paddle-suggestions"
                  value={paddle}
                  onChange={(e) => setPaddle(e.target.value)}
                  placeholder="e.g., JOOLA Perseus 16mm / Selkirk..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
                />
                <datalist id="paddle-suggestions">
                  <option value="JOOLA Perseus 16mm Carbon" />
                  <option value="Selkirk LUXX Control Air" />
                  <option value="CRBN-1X Power Series 16mm" />
                  <option value="Six Zero Double Black Diamond" />
                  <option value="Gearbox Pro Power Elongated" />
                  <option value="Bread & Butter Filth" />
                  <option value="Vatic Pro Prism Flash" />
                </datalist>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Your setup badge will appear on your court reviews & Open Play
                check-ins!
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-sm shadow-lg shadow-lime-400/20 flex items-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Register Dinker & Enter Courts</span>
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    Support & Rate This Test App
                  </h3>
                  <p className="text-xs text-slate-400">
                    Leave a rating or encouragement for the creator!
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSupportSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Tap Stars to Rate This App:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setAppStars(st)}
                      className="p-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-400 transition-colors"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          st <= appStars
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-black text-amber-400">
                    {appStars}.0 / 5.0
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Leave a Support Note or Feature Idea:
                </label>
                <textarea
                  rows={2}
                  value={supportNote}
                  onChange={(e) => setSupportNote(e.target.value)}
                  placeholder="Love the live paddle stack and court photos! Keep building..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-400/20 transition-all"
              >
                {hasSubmittedSupport
                  ? 'Update My App Rating ★'
                  : 'Send Support & Rate App ★'}
              </button>
            </form>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Recent Dinker App Ratings ({appSupportList.length})
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {appSupportList.length === 0 ? (
                <div className="text-xs text-slate-500 py-2">
                  Be the first dinker to rate and support this test app!
                </div>
              ) : (
                appSupportList.slice(0, 4).map((sup) => (
                  <div
                    key={sup.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{sup.author}</span>
                      <span className="text-amber-400 font-black">
                        {'★'.repeat(sup.stars || 5)}
                      </span>
                    </div>
                    <p className="text-slate-300">{sup.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REGISTERED DINKERS SHOWCASE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-lime-400" />
              <span>Registered Dinkers Roster ({communityPlayers.length})</span>
            </h3>
            <p className="text-xs text-slate-400">
              See who is registered, their DUPR skill level, their main home
              court, and what paddle they swing!
            </p>
          </div>
          <button
            onClick={onEnterCourts}
            className="px-4 py-2 rounded-xl bg-lime-400 text-slate-950 font-black text-xs hover:bg-lime-300"
          >
            Find Your Court →
          </button>
        </div>

        {communityPlayers.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400">
            No dinkers registered in the roster yet — fill out the 4 fields
            above to be #1 on the board!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {communityPlayers.slice(0, 9).map((player) => (
              <div
                key={player.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3.5"
              >
                <div className="w-11 h-11 rounded-2xl bg-lime-400/20 border border-lime-400/40 text-lime-300 font-black flex items-center justify-center shrink-0">
                  {(player.displayName || 'DK').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-white text-sm truncate">
                      {player.displayName}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold shrink-0">
                      {player.dupr}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 truncate">
                    <span className="text-slate-500">Main Court:</span>{' '}
                    {player.mainCourt}
                  </div>
                  <div className="text-xs text-lime-400 font-semibold truncate">
                    <span className="text-slate-500 font-normal">Paddle:</span>{' '}
                    {player.paddle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// DETAILED COURT VIEW & COMMUNITY HUB
// ==========================================
function CourtDetailView({
  court,
  user,
  playerProfile,
  role,
  onBack,
  onEditCourt,
  onAddReview,
  onToggleLikeReview,
  onAddReply,
  onUpdatePaddleStack,
  onAddLfgPost,
  onJoinLfg,
  onOpenLightbox,
}) {
  const stats = calculateCourtStats(court.reviews);
  const crowdBadge = getCrowdBadgeStyle(court.paddlesStacked);

  const [reviewFilter, setReviewFilter] = useState('all');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [authorName, setAuthorName] = useState(
    playerProfile?.displayName || ''
  );
  const [duprLevel, setDuprLevel] = useState(
    playerProfile?.dupr || '3.75 DUPR'
  );
  const [overallRating, setOverallRating] = useState(5);
  const [surfaceRating, setSurfaceRating] = useState(5);
  const [lightingRating, setLightingRating] = useState(5);
  const [netsRating, setNetsRating] = useState(5);
  const [vibeRating, setVibeRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const fileInputRef = useRef(null);

  const [replyTexts, setReplyTexts] = useState({});
  const [replyAuthor, setReplyAuthor] = useState(
    playerProfile?.displayName || ''
  );

  const [lfgPlayer, setLfgPlayer] = useState(playerProfile?.displayName || '');
  const [lfgDupr, setLfgDupr] = useState(
    playerProfile?.dupr?.replace(' DUPR', '') || '3.75'
  );
  const [lfgTime, setLfgTime] = useState('Today @ 6:00 PM');
  const [lfgNote, setLfgNote] = useState('');

  useEffect(() => {
    if (playerProfile?.displayName) {
      setAuthorName(playerProfile.displayName);
      setReplyAuthor(playerProfile.displayName);
      setLfgPlayer(playerProfile.displayName);
    }
    if (playerProfile?.dupr) {
      setDuprLevel(playerProfile.dupr);
    }
  }, [playerProfile]);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const compressedDataUrl = await compressImageFile(file, 800, 0.65);
      if (compressedDataUrl) {
        setUploadedPhotos((prev) => [...prev, compressedDataUrl]);
      }
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const finalAuthor =
      authorName.trim() || playerProfile?.displayName || 'Community Dinker';
    const initials = finalAuthor
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    const newRev = {
      id: `rev-${Date.now()}`,
      author: finalAuthor,
      authorUid: user?.uid || 'anon',
      avatar: initials,
      dupr: duprLevel,
      mainCourt: playerProfile?.mainCourt || court.name,
      paddle: playerProfile?.paddle || 'Carbon Fiber Paddle',
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      rating: overallRating,
      metrics: {
        surface: surfaceRating,
        lighting: lightingRating,
        nets: netsRating,
        vibe: vibeRating,
      },
      comment: reviewComment.trim(),
      photos: uploadedPhotos,
      likes: 1,
      likedByMe: true,
      likedByUsers: user?.uid ? [user.uid] : [],
      replies: [],
    };

    onAddReview(court.id, newRev);
    setReviewComment('');
    setUploadedPhotos([]);
    setShowReviewForm(false);
  };

  const handleCreateLfg = (e) => {
    e.preventDefault();
    if (!lfgPlayer.trim() || !lfgNote.trim()) return;
    onAddLfgPost(court.id, {
      player: lfgPlayer.trim(),
      dupr: lfgDupr.trim() || '3.5+',
      time: lfgTime.trim() || 'Today',
      note: lfgNote.trim(),
    });
    setLfgNote('');
  };

  const filteredReviews = useMemo(() => {
    const list = court.reviews || [];
    if (reviewFilter === 'photos') {
      return list.filter((r) => r.photos && r.photos.length > 0);
    }
    if (reviewFilter === 'high') {
      return list.filter((r) => Number(r.rating) >= 4.5);
    }
    return list;
  }, [court.reviews, reviewFilter]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-sm font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-lime-400" />
          <span>Back to All Pickleball Courts</span>
        </button>

        {role === 'owner' && (
          <button
            onClick={onEditCourt}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-sm shadow-lg"
          >
            <Edit3 className="w-4 h-4" />
            <span>Owner: Edit Court Specs</span>
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative h-72 sm:h-96 bg-slate-950">
          <img
            src={court.coverPhoto}
            alt={court.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          <div className="absolute top-5 left-5 right-5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {court.featured && (
                <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-lime-400 text-slate-950 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Owner Verified Hub
                </span>
              )}
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-950/85 backdrop-blur-md text-white border border-slate-700">
                {court.type} • {court.courtCount} Pickleball Courts
              </span>
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-slate-950/85 backdrop-blur-md text-lime-400 border border-slate-700">
                {court.surface}
              </span>
            </div>

            <span className="px-4 py-1.5 rounded-full text-xs font-black bg-emerald-400 text-slate-950">
              {court.priceText}
            </span>
          </div>

          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-lime-400 text-sm font-bold">
                <MapPin className="w-4 h-4" />
                <span>{court.address || court.city}</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white">
                {court.name}
              </h1>
            </div>

            <div className="bg-slate-950/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="text-center">
                <div className="flex items-center gap-1 text-2xl font-black text-white">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                  <span>{stats.count > 0 ? stats.avg : 'New'}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {stats.count} Player Reviews
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-900/95 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border ${crowdBadge.bg}`}
              >
                <span
                  className={`w-2.5 h-2.5 rounded-full ${crowdBadge.dot} animate-pulse`}
                />
                <span>{crowdBadge.label}</span>
              </span>
              <span className="text-xs text-slate-400">
                {court.lastCheckIn}
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {court.description}
            </p>
          </div>

          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-lime-400">
                At the Court? Update Live Paddle Stack:
              </span>
              <span className="text-xs text-slate-400">{court.windIndex}</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0, 4, 8, 14].map((cnt) => (
                <button
                  key={cnt}
                  onClick={() => onUpdatePaddleStack(court.id, cnt)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                    court.paddlesStacked === cnt
                      ? 'bg-lime-400 text-slate-950 border-lime-300'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-lime-400/50'
                  }`}
                >
                  {cnt === 0 ? '0 (Wide Open)' : `${cnt} Stacked`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-lime-400" />
                <span>Pickleball-Specific Rating Breakdown</span>
              </h3>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-lime-400/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {showReviewForm
                    ? 'Close Review Form'
                    : 'Write Review & Add Photos'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Surface Grit & Bounce', score: stats.surface },
                { label: 'Night LED Lighting', score: stats.lighting },
                { label: 'Net Cord Tension', score: stats.nets },
                { label: 'Open Play Vibe', score: stats.vibe },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5"
                >
                  <div className="text-xs text-slate-400">{m.label}</div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xl font-black text-white">
                      {m.score}
                    </span>
                    <span className="text-xs font-bold text-lime-400">
                      / 5.0 ★
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {showReviewForm && (
            <form
              onSubmit={handleSubmitReview}
              className="bg-slate-900 border-2 border-lime-400/40 rounded-3xl p-6 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-base font-black text-white">
                  Share Your Court Experience & Upload Photos
                </h4>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Player Name"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    DUPR Skill
                  </label>
                  <select
                    value={duprLevel}
                    onChange={(e) => setDuprLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                  >
                    <option value="3.0 DUPR">3.0 DUPR</option>
                    <option value="3.5 DUPR">3.5 DUPR</option>
                    <option value="3.75 DUPR">3.75 DUPR</option>
                    <option value="4.0 DUPR">4.0 DUPR</option>
                    <option value="4.5+ DUPR">4.5+ DUPR</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    Overall Star Rating
                  </label>
                  <div className="flex items-center gap-1 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setOverallRating(star)}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= overallRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                {[
                  {
                    label: 'Surface Grit',
                    val: surfaceRating,
                    set: setSurfaceRating,
                  },
                  {
                    label: 'LED Lighting',
                    val: lightingRating,
                    set: setLightingRating,
                  },
                  { label: 'Net Quality', val: netsRating, set: setNetsRating },
                  {
                    label: 'Open Play Vibe',
                    val: vibeRating,
                    set: setVibeRating,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-lime-400">{item.val}/5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={item.val}
                      onChange={(e) => item.set(Number(e.target.value))}
                      className="w-full accent-lime-400"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Your Thoughts & Court Review *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="How was the kitchen bounce, wind protection, paddle queue speed, and lighting?"
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
                />
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-300">
                    Add Court Photos (Upload from device or 1-click sample)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-lime-400 flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setUploadedPhotos((prev) => [
                          ...prev,
                          PRESET_COURT_PHOTOS[
                            Math.floor(
                              Math.random() * PRESET_COURT_PHOTOS.length
                            )
                          ].url,
                        ])
                      }
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
                    >
                      + Sample Court Photo
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {uploadedPhotos.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-lime-400"
                      >
                        <img
                          src={url}
                          alt="Upload preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setUploadedPhotos((prev) =>
                              prev.filter((_, i) => i !== idx)
                            )
                          }
                          className="absolute top-1 right-1 bg-slate-950/80 text-white rounded-full p-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs"
                >
                  Publish Review to Cloud
                </button>
              </div>
            </form>
          )}

          {(court.gallery || []).length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Camera className="w-5 h-5 text-lime-400" />
                  <span>
                    Player & Owner Court Photos ({(court.gallery || []).length})
                  </span>
                </h3>
                <span className="text-xs text-slate-400">
                  Click any photo to enlarge
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {(court.gallery || []).map((imgUrl, index) => (
                  <div
                    key={index}
                    onClick={() => onOpenLightbox(imgUrl)}
                    className="h-24 sm:h-28 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer group"
                  >
                    <img
                      src={imgUrl}
                      alt={`Court view ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-lime-400" />
                <span>
                  Player Reviews & Court Discussions ({filteredReviews.length})
                </span>
              </h3>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'all', label: 'All Reviews' },
                  { id: 'photos', label: 'With Photos' },
                  { id: 'high', label: 'Top Rated' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setReviewFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      reviewFilter === tab.id
                        ? 'bg-lime-400 text-slate-950 border-lime-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredReviews.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-2">
                <p className="text-sm font-bold text-white">
                  No reviews match this filter yet.
                </p>
                <p className="text-xs text-slate-400">
                  Be the first player to rate this pickleball court and upload a
                  photo!
                </p>
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-lime-400/20 border border-lime-400/40 text-lime-300 font-black flex items-center justify-center">
                        {rev.avatar || 'PB'}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-white text-sm">
                            {rev.author}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                            {rev.dupr || '3.75 DUPR'}
                          </span>
                          {rev.paddle && (
                            <span className="px-2 py-0.5 rounded-md bg-lime-400/15 text-lime-300 text-[11px] font-semibold">
                              Paddle: {rev.paddle}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {rev.date}
                          {rev.mainCourt ? ` • Mains at ${rev.mainCourt}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="font-black text-white text-sm">
                        {rev.rating}.0
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-200 leading-relaxed">
                    {rev.comment}
                  </p>

                  {rev.metrics && (
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        Surface:{' '}
                        <strong className="text-lime-400">
                          {rev.metrics.surface}/5
                        </strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        Lights:{' '}
                        <strong className="text-lime-400">
                          {rev.metrics.lighting}/5
                        </strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        Nets:{' '}
                        <strong className="text-lime-400">
                          {rev.metrics.nets}/5
                        </strong>
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
                        Open Play:{' '}
                        <strong className="text-lime-400">
                          {rev.metrics.vibe}/5
                        </strong>
                      </span>
                    </div>
                  )}

                  {rev.photos && rev.photos.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {rev.photos.map((pUrl, i) => (
                        <img
                          key={i}
                          src={pUrl}
                          alt="Player review"
                          onClick={() => onOpenLightbox(pUrl)}
                          className="w-28 h-20 object-cover rounded-xl border border-slate-700 cursor-pointer hover:border-lime-400 transition-colors"
                        />
                      ))}
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      {(() => {
                        const isLiked =
                          (Array.isArray(rev.likedByUsers) &&
                            user &&
                            rev.likedByUsers.includes(user.uid)) ||
                          rev.likedByMe;
                        return (
                          <button
                            onClick={() => onToggleLikeReview(court.id, rev.id)}
                            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              isLiked
                                ? 'bg-lime-400/20 border-lime-400 text-lime-300'
                                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>Helpful Dink ({rev.likes || 0})</span>
                          </button>
                        );
                      })()}

                      <span className="text-xs text-slate-400">
                        {(rev.replies || []).length}{' '}
                        {(rev.replies || []).length === 1
                          ? 'Comment'
                          : 'Comments'}
                      </span>
                    </div>

                    {(rev.replies || []).length > 0 && (
                      <div className="pl-4 border-l-2 border-slate-800 space-y-2.5">
                        {rev.replies.map((rep) => (
                          <div
                            key={rep.id}
                            className="bg-slate-950/90 p-3 rounded-xl text-xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-lime-400">
                                {rep.author}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {rep.time}
                              </span>
                            </div>
                            <p className="text-slate-300">{rep.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={replyAuthor}
                        onChange={(e) => setReplyAuthor(e.target.value)}
                        placeholder="Your handle"
                        className="w-28 sm:w-36 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                      />
                      <input
                        type="text"
                        value={replyTexts[rev.id] || ''}
                        onChange={(e) =>
                          setReplyTexts((prev) => ({
                            ...prev,
                            [rev.id]: e.target.value,
                          }))
                        }
                        placeholder="Reply or ask a question about this review..."
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-lime-400"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onAddReply(
                            court.id,
                            rev.id,
                            replyAuthor,
                            replyTexts[rev.id] || ''
                          );
                          setReplyTexts((prev) => ({ ...prev, [rev.id]: '' }));
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-lime-400 hover:text-slate-950 text-xs font-bold text-slate-200 transition-colors shrink-0"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-lime-400" />
              <span>Verified Court Amenities</span>
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {(court.amenities || []).map((amen) => (
                <div
                  key={amen}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs font-semibold text-slate-200"
                >
                  <Check className="w-4 h-4 text-lime-400 shrink-0" />
                  <span>{amen}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-lime-400" />
                  <span>Open Play Meetups (LFG)</span>
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-lime-400/15 text-lime-400">
                  Live Cloud Board
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Heading to this court? Post your DUPR level and time so others
                can join your stack!
              </p>
            </div>

            <form
              onSubmit={handleCreateLfg}
              className="space-y-2.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800"
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={lfgPlayer}
                  onChange={(e) => setLfgPlayer(e.target.value)}
                  placeholder="Your Name"
                  className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
                <input
                  type="text"
                  required
                  value={lfgDupr}
                  onChange={(e) => setLfgDupr(e.target.value)}
                  placeholder="DUPR (e.g. 3.75)"
                  className="px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
              <input
                type="text"
                required
                value={lfgTime}
                onChange={(e) => setLfgTime(e.target.value)}
                placeholder="When? (e.g., Today @ 5:30 PM)"
                className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
              />
              <input
                type="text"
                required
                value={lfgNote}
                onChange={(e) => setLfgNote(e.target.value)}
                placeholder="Note (e.g., Need 2 more for 4.0+ doubles!)"
                className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-xs transition-colors"
              >
                + Post Open Play Session
              </button>
            </form>

            <div className="space-y-3">
              {(court.lfgPosts || []).length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">
                  No open play sessions posted for today yet. Start one above!
                </p>
              ) : (
                (court.lfgPosts || []).map((post) => {
                  const hasJoined =
                    post.joinedByMe ||
                    (Array.isArray(post.joinedUsers) &&
                      user &&
                      post.joinedUsers.includes(user.uid));
                  return (
                    <div
                      key={post.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-white">
                          {post.player}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                          DUPR {post.dupr}
                        </span>
                      </div>
                      <div className="text-xs text-lime-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{post.time}</span>
                      </div>
                      <p className="text-xs text-slate-300">{post.note}</p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400">
                          {post.joined} Players In
                        </span>
                        <button
                          disabled={hasJoined}
                          onClick={() => onJoinLfg(court.id, post.id)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                            hasJoined
                              ? 'bg-emerald-500/20 text-emerald-300 cursor-default'
                              : 'bg-slate-800 hover:bg-lime-400 hover:text-slate-950 text-white'
                          }`}
                        >
                          {hasJoined ? 'Joined ✓' : "I'm In!"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// PLAYER PROFILE CUSTOMIZATION MODAL
// ==========================================
function PlayerProfileModal({
  profile,
  courts = [],
  userUid,
  onClose,
  onSave,
}) {
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [dupr, setDupr] = useState(profile?.dupr || '3.75 DUPR');
  const [mainCourt, setMainCourt] = useState(
    profile?.mainCourt || courts[0]?.name || 'The Kitchen Sync Pickleball Club'
  );
  const [paddle, setPaddle] = useState(
    profile?.paddle || 'JOOLA Perseus 16mm Carbon'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    onSave({
      displayName: displayName.trim(),
      dupr,
      mainCourt: mainCourt.trim() || 'Local Pickleball Club',
      paddle: paddle.trim() || 'Carbon Fiber Paddle',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-black">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                Dinker Registration & Gear
              </h2>
              <p className="text-xs text-slate-400">
                Your Nickname, DUPR, Main Court & Paddle synced to the cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Nickname *
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Jordan 'The Dinker' Hayes"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Your DUPR / Skill Rating *
            </label>
            <select
              value={dupr}
              onChange={(e) => setDupr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
            >
              <option value="2.5 DUPR">2.5 DUPR (Beginner)</option>
              <option value="3.0 DUPR">3.0 DUPR (Novice)</option>
              <option value="3.5 DUPR">3.5 DUPR (Intermediate)</option>
              <option value="3.75 DUPR">3.75 DUPR (Upper-Intermediate)</option>
              <option value="4.0 DUPR">4.0 DUPR (Advanced)</option>
              <option value="4.5 DUPR">4.5 DUPR (Competitive)</option>
              <option value="5.0+ DUPR">5.0+ DUPR (Pro / Open)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              What Court Do You Main In? *
            </label>
            <input
              type="text"
              required
              value={mainCourt}
              onChange={(e) => setMainCourt(e.target.value)}
              placeholder="e.g., The Kitchen Sync Pickleball Club"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              What Paddle Do You Own? *
            </label>
            <input
              type="text"
              required
              value={paddle}
              onChange={(e) => setPaddle(e.target.value)}
              placeholder="e.g., JOOLA Perseus 16mm Carbon"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
            />
          </div>

          {userUid && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              <span className="block font-semibold text-slate-300 mb-0.5">
                Cloud Player ID:
              </span>
              <span className="font-mono select-all break-all text-lime-400">
                {userUid}
              </span>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 text-xs font-black"
            >
              Save Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// OWNER ADD / EDIT COURT MODAL COMPONENT
// ==========================================
function OwnerCourtModal({ initialData, onClose, onSave }) {
  const [name, setName] = useState(initialData?.name || '');
  const [city, setCity] = useState(initialData?.city || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [courtCount, setCourtCount] = useState(initialData?.courtCount || 8);
  const [surface, setSurface] = useState(
    initialData?.surface || 'Pro Cushion Acrylic'
  );
  const [type, setType] = useState(initialData?.type || 'Outdoor');
  const [feeStatus, setFeeStatus] = useState(
    initialData?.feeStatus || 'Free Public'
  );
  const [priceText, setPriceText] = useState(
    initialData?.priceText || 'Free Open Play'
  );
  const [coverPhoto, setCoverPhoto] = useState(
    initialData?.coverPhoto || PRESET_COURT_PHOTOS[0].url
  );
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [amenities, setAmenities] = useState(
    initialData?.amenities || [
      'Pro LED Lighting',
      'Permanent Pro Nets',
      'Open Play Paddle Rack',
      'Water Bottle Refill',
    ]
  );
  const [featured, setFeatured] = useState(initialData?.featured ?? true);

  const fileInputRef = useRef(null);

  const toggleAmenity = (item) => {
    setAmenities((prev) =>
      prev.includes(item) ? prev.filter((a) => a !== item) : [...prev, item]
    );
  };

  const handleCustomPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImageFile(file, 900, 0.7);
    if (compressed) setCoverPhoto(compressed);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) return;
    onSave({
      name: name.trim(),
      city: city.trim(),
      address: address.trim() || city.trim(),
      courtCount: Number(courtCount),
      surface,
      type,
      feeStatus,
      priceText: priceText.trim() || feeStatus,
      coverPhoto,
      description:
        description.trim() ||
        `Dedicated ${courtCount}-court ${type.toLowerCase()} pickleball facility featuring ${surface} surfaces and community open play.`,
      amenities,
      featured,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8 max-h-[92vh] overflow-y-auto space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-lime-400 text-slate-950 flex items-center justify-center font-black">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                {initialData
                  ? 'Edit Pickleball Court'
                  : 'Owner: Add New Pickleball Court'}
              </h2>
              <p className="text-xs text-slate-400">
                Publish an official court listing for players to discover,
                review, and share photos.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Pickleball Court / Facility Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Highland Park Pickleball Center"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                City & State *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g., Denver, CO"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Number of Courts
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={courtCount}
                onChange={(e) => setCourtCount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Indoor / Outdoor
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
              >
                <option value="Outdoor">Outdoor</option>
                <option value="Indoor">Indoor</option>
                <option value="Covered">Covered Canopy</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Court Surface Type
              </label>
              <select
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
              >
                <option value="Pro Cushion Acrylic">Pro Cushion Acrylic</option>
                <option value="Concrete Post-Tension">
                  Concrete Post-Tension
                </option>
                <option value="Asphalt Post-Tension">
                  Asphalt Post-Tension
                </option>
                <option value="Modular Sport Court">Modular Sport Court</option>
                <option value="Indoor Hardwood">Indoor Hardwood</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Access Type
              </label>
              <select
                value={feeStatus}
                onChange={(e) => setFeeStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
              >
                <option value="Free Public">Free Public</option>
                <option value="Paid Drop-in">Paid Drop-in</option>
                <option value="Membership">Membership Club</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Display Price / Drop-in Info
              </label>
              <input
                type="text"
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
                placeholder="e.g., Free Open Play or $10 Drop-in"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Court Description & Open Play Schedule
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the courts, paddle rack system, lighting hours, and skill levels..."
              className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-lime-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Pickleball Amenities (Select all that apply)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_AMENITIES.map((item) => {
                const active = amenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-left flex items-center gap-2 transition-all ${
                      active
                        ? 'bg-lime-400/20 border-lime-400 text-lime-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 shrink-0 ${
                        active ? 'opacity-100' : 'opacity-20'
                      }`}
                    />
                    <span className="truncate">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">
                Court Cover Photo (Pick preset or upload custom image)
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-lime-400 hover:underline flex items-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" /> Upload From Device
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomPhotoUpload}
                className="hidden"
              />
            </div>

            <div className="grid grid-cols-5 gap-2">
              {PRESET_COURT_PHOTOS.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => setCoverPhoto(preset.url)}
                  className={`relative h-16 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    coverPhoto === preset.url
                      ? 'border-lime-400 scale-105'
                      : 'border-slate-800 opacity-70'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-lime-400 rounded"
            />
            <span className="text-xs font-bold text-slate-300">
              Mark as "Owner Featured" Premier Pickleball Hub
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-sm shadow-lg shadow-lime-400/20"
            >
              {initialData ? 'Save Changes' : 'Publish Pickleball Court'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
