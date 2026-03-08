import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, RefreshCw, ChevronLeft, Users, User, UserCheck, Heart, Zap, Star, Share2, Send, MessageCircle, Instagram, Menu, X, Volume2, VolumeX, Info, Shield, HelpCircle, Link as LinkIcon } from 'lucide-react';
import ScratchCard from './components/ScratchCard';
import AdBanner from './components/AdBanner';

type CategoryType = 'all' | 'men' | 'women' | 'oral' | 'favorites' | 'activities';

interface Category {
  id: CategoryType;
  label: string;
  icon: React.ReactNode;
  color: string;
  images: string[];
}

const CATEGORIES: Category[] = [
  {
    id: 'men',
    label: 'For Men',
    icon: <User className="w-8 h-8" />,
    color: 'from-blue-400 to-indigo-600',
    images: Array.from({ length: 17 }, (_, i) => 
      `https://raw.githubusercontent.com/dearyash47/men/main/${i + 1}.png`
    )
  },
  {
    id: 'women',
    label: 'For Women',
    icon: <UserCheck className="w-8 h-8" />,
    color: 'from-pink-400 to-rose-600',
    images: Array.from({ length: 29 }, (_, i) => 
      `https://raw.githubusercontent.com/dearyash47/women/main/${i + 1}.png`
    )
  },
  {
    id: 'all',
    label: 'All Pose',
    icon: <Star className="w-8 h-8" />,
    color: 'from-yellow-400 to-orange-500',
    images: Array.from({ length: 59 }, (_, i) => 
      `https://raw.githubusercontent.com/dearyash47/all/main/${i + 1}.jpg`
    )
  },
  {
    id: 'oral',
    label: 'For Oral',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-purple-400 to-fuchsia-600',
    images: Array.from({ length: 24 }, (_, i) => 
      `https://raw.githubusercontent.com/dearyash47/oral/main/${i + 1}.png`
    )
  },
  {
    id: 'activities' as CategoryType,
    label: 'Activities',
    icon: <Users className="w-8 h-8" />,
    color: 'from-emerald-400 to-teal-600',
    images: [] // We'll handle activities differently
  }
];

const ACTIVITIES = [
  "Cook dinner together",
  "10 minute massage challenge",
  "Dance together for 5 minutes",
  "Watch a movie together",
  "Kiss 10 minute without touch body",
  "Hug for 60 seconds",
  "Write a love note for each other",
  "Blindfold surprise challenge",
  "Go for a short walk together",
  "Compliment your partner 5 times",
];

export default function App() {
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('magical_pose_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [key, setKey] = useState(0);
  const [currentActivity, setCurrentActivity] = useState("");
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());
  const [showSplash, setShowSplash] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [modalContent, setModalContent] = useState<{ title: string, content: string } | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const developerEmail = "dearyash47@gmail.com";
  
  // Load Adsterra Interstitial Script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://defrostgauntlet.com/0d/65/3d/0d653dfc2cb447fb6e12ac57ad6e2b88.js";
    script.async = true;
    document.body.appendChild(script);

    window.AdsterraInterstitial = window.AdsterraInterstitial || {
      show: function() { console.log("Interstitial ad shown"); }
    };

    return () => document.body.removeChild(script);
  }, []);

  // Background music
  useEffect(() => {
    if (!showSplash && !isMuted && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log("Playback failed:", error);
        });
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [showSplash, isMuted]);

  const handleEnter = () => {
    setShowSplash(false);
    // Try to play audio on first interaction
    if (!isMuted && audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed on enter:", e));
    }
  };

  // Preload images for the selected category
  useEffect(() => {
    if (!selectedCategory || selectedCategory.id === 'activities') return;
    
    const imagesToPreload = selectedCategory.id === 'favorites' ? favorites : selectedCategory.images;
    
    imagesToPreload.forEach(src => {
      if (!preloadedImages.has(src)) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          setPreloadedImages(prev => new Set(prev).add(src));
        };
      }
    });
  }, [selectedCategory, favorites]);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setIsScratching(false);
    setScratchPercentage(0);

    if (category.id === 'activities') {
      setCurrentActivity(ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)]);
      return;
    }

    const images = category.id === 'favorites' ? favorites : category.images;
    if (images.length === 0) return;

    const randomIndex = Math.floor(Math.random() * images.length);
    setCurrentPoseIndex(randomIndex);
  };

  const handleStart = () => {
    setIsScratching(true);
  };

  const handleReset = () => {
    if (!selectedCategory) return;
    
    if (selectedCategory.id === 'activities') {
      setCurrentActivity(ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)]);
    } else {
      const images = selectedCategory.id === 'favorites' ? favorites : selectedCategory.images;
      if (images.length > 0) {
        setCurrentPoseIndex((prev) => (prev + 1) % images.length);
      }
    }

    setKey((prev) => prev + 1);
    setIsScratching(true);
    setScratchPercentage(0);
  };

  const handleShare = (platform: 'whatsapp' | 'telegram' | 'instagram' | 'partner' | 'copy') => {
    const text = selectedCategory?.id === 'activities' 
      ? `Hey! We just revealed this activity: "${currentActivity}". Let's do it! 💖`
      : `Check out this magical pose I revealed! 🔥`;
    
    const url = window.location.href;
    const fullText = `${text} ${url}`;

    if (platform === 'copy') {
      navigator.clipboard.writeText(fullText);
      alert('Link copied to clipboard! 📋');
      return;
    }
    
    if (platform === 'partner') {
      if (navigator.share) {
        navigator.share({
          title: 'Scratch Desire',
          text: text,
          url: url,
        }).catch((error) => {
          console.log('Error sharing', error);
          // Fallback to WhatsApp if share is cancelled or fails
          window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
        });
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
      }
      return;
    }

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'instagram':
        navigator.clipboard.writeText(fullText);
        alert('Link copied! Open Instagram to share it in your Story or DM. 📸');
        window.open('https://www.instagram.com/', '_blank');
        break;
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setIsScratching(false);
    setScratchPercentage(0);
  };

  const categoriesWithFavorites: Category[] = [
    ...CATEGORIES,
    {
      id: 'favorites',
      label: 'Favorites',
      icon: <Heart className="w-8 h-8" />,
      color: 'from-red-400 to-pink-600',
      images: favorites
    }
  ];

  return (
    <>
      {/* Background Music */}
      <audio 
        ref={audioRef}
        src="https://cdn.pixabay.com/audio/2022/05/27/audio_1808f30304.mp3" // Smooth romantic track
        loop
      />

      <AnimatePresence>
        {showSplash ? (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] scratch-gradient flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Heart className="w-16 h-16 text-white fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                </motion.div>
                <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-300 animate-pulse" />
              </div>
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase text-shadow">
                  Scratch Desire
                </h1>
                <p className="text-white/80 font-bold italic tracking-widest mt-1 text-xs uppercase">
                  Reveal your passion
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEnter}
                className="mt-6 px-10 py-3 bg-white text-purple-900 font-black rounded-full uppercase tracking-tighter shadow-2xl flex items-center gap-2 group text-sm"
              >
                <span>Enter Now</span>
                <Sparkles className="w-4 h-4 text-purple-600 group-hover:rotate-12 transition-transform" />
              </motion.button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="main-app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 scratch-gradient flex flex-col items-center pt-[calc(env(safe-area-inset-top)+4rem)] pb-8 px-4 md:pt-24 md:pb-12 md:px-12 font-sans selection:bg-white/30 overflow-hidden touch-none"
          >
            {/* Menu Button */}
            <div className="fixed top-[calc(env(safe-area-inset-top)+1rem)] left-4 z-50">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white/20 transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Mute Button */}
            <div className="fixed top-[calc(env(safe-area-inset-top)+1rem)] right-4 z-50">
              <button 
                onClick={() => setIsMuted(!isMuted)}
                className="p-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white hover:bg-white/20 transition-colors"
              >
                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
              </button>
            </div>

            {/* Side Menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                  />
                  <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed top-0 left-0 bottom-0 w-72 bg-purple-950 border-r border-white/10 z-[70] p-6 flex flex-col shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-10">
                      <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Menu</h2>
                      <button onClick={() => setIsMenuOpen(false)} className="text-white/60 hover:text-white">
                        <X className="w-6 h-6" />
                      </button>
                    </div>

                    <div className="flex-1 space-y-4">
                      {[
                        { icon: <Star className="w-5 h-5" />, label: 'Write a Review', action: () => setShowReviewForm(true) },
                        { icon: <Shield className="w-5 h-5" />, label: 'Privacy Policy', action: () => setModalContent({ title: 'Privacy Policy', content: 'Your privacy is our priority. We do not store any personal images or data on our servers. All favorites are stored locally on your device.' }) },
                        { icon: <HelpCircle className="w-5 h-5" />, label: 'Help', action: () => setModalContent({ title: 'Help', content: 'Select a category from the home screen, then scratch the card to reveal a romantic pose or activity.' }) },
                        { icon: <Info className="w-5 h-5" />, label: 'About', action: () => setShowAbout(true) },
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            item.action();
                            if (item.label !== 'About' && item.label !== 'Write a Review') setIsMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 text-white hover:bg-white/10 transition-all group active:scale-95"
                        >
                          <div className="text-purple-400 group-hover:text-purple-300 transition-colors">{item.icon}</div>
                          <span className="font-bold uppercase tracking-wider text-sm">{item.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-white/10 text-center">
                      <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Version 1.2.0</p>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Review Modal */}
            <AnimatePresence>
              {showReviewForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-[80] flex items-center justify-center p-6"
                >
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowReviewForm(false)} />
                  <div className="relative bg-purple-900 border border-white/20 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4 text-center">Write a Review</h3>
                    <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4 text-center">Your feedback helps us grow!</p>
                    
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your thoughts here..."
                      className="w-full h-32 bg-white/10 border border-white/20 rounded-2xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 transition-colors resize-none mb-6"
                    />

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={() => {
                          if (!reviewText.trim()) return alert("Please write something first!");
                          const subject = encodeURIComponent("Scratch Desire App Review");
                          const body = encodeURIComponent(reviewText);
                          window.open(`mailto:${developerEmail}?subject=${subject}&body=${body}`);
                          setShowReviewForm(false);
                          setIsMenuOpen(false);
                          setReviewText("");
                        }}
                        className="w-full bg-white text-purple-900 font-black py-4 rounded-full uppercase tracking-tighter active:scale-95 transition-transform flex items-center justify-center gap-2"
                      >
                        <Send className="w-5 h-5" />
                        Send Review
                      </button>
                      <button 
                        onClick={() => setShowReviewForm(false)}
                        className="w-full bg-white/10 text-white font-bold py-3 rounded-full uppercase tracking-widest text-xs active:scale-95 transition-transform"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info Modal */}
            <AnimatePresence>
              {modalContent && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-[80] flex items-center justify-center p-6"
                >
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setModalContent(null)} />
                  <div className="relative bg-purple-900 border border-white/20 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl text-center">
                    <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-4">{modalContent.title}</h3>
                    <p className="text-white/80 leading-relaxed mb-8 italic">
                      {modalContent.content}
                    </p>
                    <button 
                      onClick={() => setModalContent(null)}
                      className="w-full bg-white text-purple-900 font-black py-4 rounded-full uppercase tracking-tighter active:scale-95 transition-transform"
                    >
                      Got it
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* About Modal */}
            <AnimatePresence>
              {showAbout && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="fixed inset-0 z-[80] flex items-center justify-center p-6"
                >
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAbout(false)} />
                  <div className="relative bg-purple-900 border border-white/20 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl text-center">
                    <Heart className="w-16 h-16 text-pink-500 fill-pink-500 mx-auto mb-6 animate-pulse" />
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">Scratch Desire</h3>
                    <p className="text-white/60 font-bold uppercase tracking-widest text-xs mb-6">Powered by Pari Pagal</p>
                    <p className="text-white/80 leading-relaxed mb-8 italic">
                      Bringing magic and passion to your relationship through fun reveals and challenges.
                    </p>
                    <button 
                      onClick={() => {
                        setShowAbout(false);
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-white text-purple-900 font-black py-4 rounded-full uppercase tracking-tighter active:scale-95 transition-transform"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2 mb-10 z-20 relative w-full"
      >
        {selectedCategory && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleBack}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </motion.button>
        )}
        <h1 className="text-3xl md:text-6xl font-black text-white italic tracking-tighter text-shadow uppercase truncate px-10">
          {selectedCategory ? selectedCategory.label : 'Scratch Desire'}
        </h1>
        <p className="text-base md:text-2xl font-semibold text-white/90 italic text-shadow">
          {selectedCategory ? 'Scratch to reveal!' : 'Select a category'}
        </p>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-4xl relative">
        <AnimatePresence mode="wait">
          {!selectedCategory ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 p-4 w-full max-h-full overflow-y-auto no-scrollbar place-items-center"
            >
              {categoriesWithFavorites.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleCategorySelect(cat)}
                  className={`flex flex-col items-center gap-2 ${cat.id === 'favorites' && favorites.length === 0 ? 'opacity-50 grayscale' : ''}`}
                  disabled={cat.id === 'favorites' && favorites.length === 0}
                >
                  <div className={`w-28 h-28 md:w-40 md:h-40 rounded-full bg-gradient-to-br ${cat.color} shadow-xl flex items-center justify-center border-4 border-white/30 overflow-hidden relative active:brightness-90 transition-all`}>
                    <div className="text-white drop-shadow-lg">
                      {cat.icon}
                    </div>
                  </div>
                  <span className="text-white font-bold text-xs md:text-base uppercase tracking-widest text-shadow text-center">
                    {cat.label} {cat.id === 'favorites' && `(${favorites.length})`}
                  </span>
                </motion.button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="scratch-view"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              {(selectedCategory.id !== 'favorites' || favorites.length > 0) ? (
                <>
                  {!isScratching ? (
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      className="relative cursor-pointer"
                      onClick={handleStart}
                    >
                      <div className={`w-60 h-60 md:w-80 md:h-80 rounded-full bg-gradient-to-br ${selectedCategory.color} backdrop-blur-md border-4 border-white/40 flex items-center justify-center overflow-hidden shadow-2xl`}>
                        <div className="relative z-10 flex flex-col items-center gap-2">
                          <div className="text-white animate-bounce">
                            {selectedCategory.icon}
                          </div>
                          <span className="text-white font-black text-xl md:text-2xl tracking-widest uppercase text-shadow">
                            Ready?
                          </span>
                        </div>
                      </div>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="absolute -inset-4 border-2 border-dashed border-white/30 rounded-full"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={key}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center gap-4"
                    >
                      <ScratchCard 
                        revealImage={selectedCategory.id === 'activities' ? 'https://picsum.photos/seed/love/400/400' : (selectedCategory.id === 'favorites' ? favorites[currentPoseIndex] : selectedCategory.images[currentPoseIndex])} 
                        onComplete={() => {}}
                        onProgress={setScratchPercentage}
                      />

                      {selectedCategory.id === 'activities' && (
                        <div className="absolute inset-0 flex items-center justify-center p-8 text-center pointer-events-none">
                          <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: scratchPercentage / 100 }}
                            className="text-purple-900 font-black text-xl md:text-3xl italic leading-tight"
                          >
                            {currentActivity}
                          </motion.p>
                        </div>
                      )}
                      
                      <AnimatePresence>
                        {scratchPercentage >= 50 && (
                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex flex-col items-center gap-3 mt-2 w-full max-w-[280px]"
                          >
                            <button 
                              onClick={() => handleShare('partner')}
                              className="w-full py-3 bg-white text-purple-900 font-black rounded-full uppercase tracking-tighter shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform text-sm"
                            >
                              <Heart className="w-4 h-4 fill-purple-900" />
                              Share to Partner
                            </button>

                            <div className="flex items-center justify-between w-full gap-2">
                              <button 
                                onClick={() => handleShare('whatsapp')}
                                className="flex-1 py-2.5 bg-green-500 rounded-full text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                              >
                                <MessageCircle className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleShare('telegram')}
                                className="flex-1 py-2.5 bg-blue-500 rounded-full text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                              >
                                <Send className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleShare('copy')}
                                className="flex-1 py-2.5 bg-gray-600 rounded-full text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                                title="Copy Link"
                              >
                                <LinkIcon className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={() => handleShare('instagram')}
                                className="flex-1 py-2.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-full text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform"
                              >
                                <Instagram className="w-5 h-5" />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="text-white text-center p-8">
                  <Heart className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p className="text-xl font-bold italic uppercase tracking-widest opacity-50">No favorites yet</p>
                </div>
              )}
            </motion.div>
          )}
          <AdBanner />
        </AnimatePresence>
      </div>

      {/* Footer Section */}
      <motion.div 
        className="w-full max-w-xs mt-4 mb-6 space-y-3 z-20"
      >
        {selectedCategory && (
          <>
            {!isScratching ? (
              <button
                onClick={handleStart}
                className="w-full bg-white text-purple-900 font-black text-xl py-3.5 rounded-full shadow-2xl active:scale-95 transition-transform uppercase tracking-tighter"
              >
                Start Scratching
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="w-full bg-white/20 backdrop-blur-md text-white font-bold text-lg py-3.5 rounded-full border-2 border-white/30 active:bg-white/30 transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <RefreshCw className="w-5 h-5" />
                Scratch Again
              </button>
            )}
          </>
        )}
      </motion.div>

      {/* Background Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl" />
      </div>
      </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
