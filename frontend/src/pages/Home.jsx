import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Heart, Activity, Bell, FileText, Shield, Users,
    ChevronRight, ArrowRight, CheckCircle, MessageSquare,
    BarChart, Zap, Search, Calendar, Plus, LogIn,
    LayoutDashboard, TrendingUp, Smartphone, UserPlus, Phone, Mail,
    Menu, X
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TheaterEffect from '../components/TheaterEffect';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [systemName, setSystemName] = useState(localStorage.getItem('caretrack_system_name') || 'CareTrack');
    const heroRef = useRef(null);
    const cardFanRef = useRef(null);
    const horizontalRef = useRef(null);
    const horizontalWrapperRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // --- Animations ---
        const ctx = gsap.context(() => {
            // Text Reveals
            gsap.from(".text-reveal", {
                y: "100%",
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: "power4.out",
                delay: 0.5
            });

            // Parallax Effects (Desktop only)
            ScrollTrigger.matchMedia({
                "(min-width: 769px)": function() {
                    // Card Fan Logic
                    const cards = gsap.utils.toArray('.card-fan-item');
                    gsap.set(cards, { x: 0, rotation: 0 });

                    gsap.to(cards, {
                        x: (i) => (i - (cards.length - 1) / 2) * 150,
                        rotation: (i) => (i - (cards.length - 1) / 2) * 15,
                        ease: "none",
                        scrollTrigger: {
                            trigger: ".card-fan-section",
                            start: "top top",
                            end: "bottom bottom",
                            scrub: 1,
                        }
                    });

                    // Horizontal Scroll Logic
                    if (horizontalRef.current) {
                        const sections = gsap.utils.toArray('.horizontal-scroll-item');
                        gsap.to(sections, {
                            xPercent: -100 * (sections.length - 1),
                            ease: "none",
                            scrollTrigger: {
                                trigger: horizontalRef.current,
                                pin: true,
                                scrub: 1,
                                snap: 1 / (sections.length - 1),
                                end: () => "+=" + horizontalRef.current.offsetWidth
                            }
                        });
                    }

                    gsap.to(".hero-background-layer", {
                        y: 100,
                        ease: "none",
                        scrollTrigger: {
                            trigger: ".hero-section",
                            start: "top top",
                            end: "bottom top",
                            scrub: true
                        }
                    });

                    gsap.to(".parallax-layer", {
                        y: -100,
                        ease: "none",
                        scrollTrigger: {
                            trigger: ".hero-section",
                            start: "top top",
                            end: "bottom top",
                            scrub: true
                        }
                    });
                },
                "(max-width: 768px)": function() {
                    const cards = gsap.utils.toArray('.card-fan-item');
                    gsap.set(cards, { clearProps: "all" });
                    const sections = gsap.utils.toArray('.horizontal-scroll-item');
                    gsap.set(sections, { clearProps: "all" });
                }
            });
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            ctx.revert();
        };
    }, []);

    const features = [
        {
            title: 'Clinical Oversight',
            description: 'Doctors and nurses monitor vital trends and clinical history to ensure seamless recovery coordination.',
            icon: Activity,
            image: '/assets/health_check.png'
        },
        {
            title: 'Doctor Dashboard',
            description: 'Comprehensive view of all patients, prioritize critical cases with real-time health data visualization.',
            icon: LayoutDashboard,
            image: '/assets/doctor_dashboard.png'
        },
        {
            title: 'Smart Alert Engine',
            description: 'Automatic notification system that flags abnormal vitals, ensuring timely medical intervention.',
            icon: Bell,
            image: '/assets/alert_engine.jpg'
        },
        {
            title: 'Recovery Tracking',
            description: 'Monitor long-term health trends and post-surgery recovery with structured compliance metrics.',
            icon: TrendingUp,
            image: '/assets/recovery_tracking.jpg'
        },
    ];

    return (
        <div className="min-h-screen bg-white selection:bg-black selection:text-white">
            <TheaterEffect />

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled || mobileMenuOpen ? 'glass-nav py-4' : 'bg-transparent py-6 sm:py-8'}`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-lg sm:text-xl font-bold tracking-tighter uppercase">{systemName}</span>
                    </div>

                    <div className="hidden lg:flex items-center gap-10 xl:gap-12">
                        {['Features', 'Process', 'About'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="nav-link text-black uppercase tracking-widest text-[11px] font-bold">
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="hidden sm:flex items-center gap-4 lg:gap-6">
                        <button onClick={() => navigate('/login')} className="text-xs font-bold uppercase tracking-widest hover:opacity-50 transition-opacity px-2 py-1">Login</button>
                        <button onClick={() => navigate('/register')} className="pill-button pill-button-primary text-xs uppercase tracking-widest whitespace-nowrap">Join Platform</button>
                    </div>

                    {/* Mobile Hamburger Button */}
                    <div className="flex sm:hidden items-center gap-2">
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 rounded-xl text-black hover:bg-black/5 transition-colors"
                            aria-label="Toggle Menu"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {mobileMenuOpen && (
                    <div className="sm:hidden bg-white/95 backdrop-blur-xl border-b border-gray-100 px-6 py-6 space-y-4 shadow-xl animate-fade-in">
                        <div className="flex flex-col space-y-3">
                            {['Features', 'Process', 'About'].map((item) => (
                                <a 
                                    key={item} 
                                    href={`#${item.toLowerCase()}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-sm font-bold uppercase tracking-wider py-2 text-slate-800 hover:text-teal-600 transition-colors"
                                >
                                    {item}
                                </a>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                            <button 
                                onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}
                                className="w-full py-3 text-center text-xs font-bold uppercase tracking-widest border border-black/10 rounded-full hover:bg-gray-50 transition-colors"
                            >
                                Login
                            </button>
                            <button 
                                onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}
                                className="w-full py-3 text-center text-xs font-bold uppercase tracking-widest bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                            >
                                Join Platform
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="hero-section relative min-h-screen pt-28 pb-16 lg:py-0 flex items-center justify-center overflow-hidden">
                {/* Visual Background Layer */}
                <div className="hero-background-layer absolute inset-0 pointer-events-none z-0">
                    <img src="/assets/hero_bg.jpg" alt="" className="w-full h-full object-cover" />
                </div>

                <div className="container mx-auto px-4 sm:px-6 lg:px-10 relative z-10 theater-container">
                    <div className="theater-screen grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center text-left">
                        <div className="hero-content-left">
                            <div className="text-reveal-wrapper mb-4 sm:mb-6">
                                <span className="text-reveal inline-block text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-gray-400">Award-winning Patient Care</span>
                            </div>
                            <h1 className="hero-title text-reveal-wrapper mb-6 sm:mb-10">
                                <span className="text-reveal block">Remote Monitoring</span>
                                <span className="text-reveal block text-gray-300">Redefined</span>
                            </h1>
                            <div className="text-reveal-wrapper mb-8 sm:mb-12">
                                <p className="text-reveal text-base sm:text-lg lg:text-xl text-gray-500 leading-relaxed font-medium">
                                    Experience a futuristic approach to post-surgery recovery. Real-time data, automated alerts, and seamless doctor-patient connectivity.
                                </p>
                            </div>
                            <div className="text-reveal-wrapper flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
                                <div className="text-reveal">
                                    <button onClick={() => navigate('/register')} className="pill-button pill-button-primary w-full sm:w-auto sm:min-w-[200px] text-center">Get Started</button>
                                </div>
                                <div className="text-reveal">
                                    <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="pill-button pill-button-secondary w-full sm:w-auto sm:min-w-[200px] text-center">Explore Ecosystem</button>
                                </div>
                            </div>
                        </div>
                        <div className="hero-content-right relative">
                            <div className="hero-image-wrapper p-3 sm:p-4 bg-gray-100/50 backdrop-blur-xl rounded-[28px] sm:rounded-[40px] border border-white/20 shadow-2xl relative z-10 overflow-hidden transform hover:scale-[1.02] transition-transform duration-700 max-w-[340px] sm:max-w-[420px] mx-auto lg:ml-auto">
                                <img src="/assets/hero_visual.jpg" alt="Healthcare Excellence" className="w-full h-full object-cover rounded-[20px] sm:rounded-[32px]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                            </div>
                            {/* Decorative badge */}
                            <div className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-6 bg-white p-4 sm:p-6 rounded-2xl shadow-xl z-20 hidden md:block animate-bounce border border-gray-50">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Live Status</p>
                                <p className="text-xs sm:text-sm font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    System Operational
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Elements (Parallax) */}
                <div className="absolute top-1/4 left-10 parallax-layer hidden lg:block">
                    <div className="w-1 h-20 bg-gray-100"></div>
                </div>
                <div className="absolute bottom-1/4 right-10 parallax-layer hidden lg:block" style={{ transitionDelay: '0.2s' }}>
                    <div className="w-1 h-32 bg-gray-100"></div>
                </div>
            </section>

            {/* Card Fan Section */}
            <section id="features" className="card-fan-section bg-gray-50/50">
                <div className="card-fan-container">
                    <div className="text-center absolute top-12 sm:top-20 left-4 right-4 z-10">
                        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-2 sm:mb-4">Core Ecosystem</h2>
                        <p className="text-sm sm:text-base text-gray-500">Everything you need, fanned out for your convenience.</p>
                    </div>
                    {features.map((feature, i) => (
                        <div key={i} className="card-fan-item">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                                    <feature.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">0{i + 1}</span>
                            </div>
                            <div className="mb-4 sm:mb-6 rounded-xl overflow-hidden h-36 sm:h-40 bg-gray-50">
                                <img src={feature.image} alt={feature.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{feature.title}</h3>
                            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-4 sm:mb-6">{feature.description}</p>
                            <div className="mt-auto">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-black flex items-center gap-2 group cursor-pointer hover:gap-3 transition-all">
                                    Detailed Insights <ArrowRight className="w-3 h-3" />
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Horizontal Scroll Section */}
            <section id="process" ref={horizontalRef} className="horizontal-scroll-container">
                <div ref={horizontalWrapperRef} className="horizontal-scroll-wrapper">
                    <div className="horizontal-scroll-item">
                        <div className="max-w-4xl text-center">
                            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-8 lg:mb-10 tracking-tighter">The Patient Journey</h2>
                            <p className="text-lg sm:text-2xl text-gray-400">Step by step recovery monitoring.</p>
                        </div>
                    </div>
                    <div className="horizontal-scroll-item bg-black text-white">
                        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-20 items-center">
                            <div>
                                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-8">01 Enrollment</h3>
                                <p className="text-sm sm:text-base lg:text-xl text-gray-400 leading-relaxed">Seamlessly transition from surgery to recovery with structured digital enrollment by your clinical team.</p>
                            </div>
                            <div className="h-[240px] sm:h-[320px] md:h-[400px] bg-gray-900 rounded-2xl sm:rounded-3xl border border-gray-800 overflow-hidden">
                                <img src="/assets/enrollment.jpg" alt="Enrollment" className="w-full h-full object-cover opacity-80" />
                            </div>
                        </div>
                    </div>
                    <div className="horizontal-scroll-item">
                        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-20 items-center">
                            <div className="h-[240px] sm:h-[320px] md:h-[400px] bg-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden order-2 md:order-1">
                                <img src="/assets/monitoring.jpg" alt="Monitoring" className="w-full h-full object-cover" />
                            </div>
                            <div className="order-1 md:order-2">
                                <h3 className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-8">02 Oversight</h3>
                                <p className="text-sm sm:text-base lg:text-xl text-gray-500 leading-relaxed">Clinicians monitor your health history 24/7, with instant alerts if data trends indicate a need for intervention.</p>
                            </div>
                        </div>
                    </div>
                    <div className="horizontal-scroll-item bg-teal-600 text-white">
                        <div className="max-w-4xl text-center px-4">
                            <h3 className="text-3xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-8 lg:mb-10">03 Recovery</h3>
                            <p className="text-base sm:text-xl lg:text-2xl opacity-80 mb-8 sm:mb-12">Achieve your health goals faster with data-driven recovery paths.</p>
                            <button onClick={() => navigate('/register')} className="pill-button bg-white text-black px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-xl font-bold">Start Your Path</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials - Mask Reveal Hover */}
            <section id="about" className="py-16 sm:py-24 lg:py-32 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-10">
                    <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-teal-600 mb-2 block">Trusted Feedback</span>
                        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">Loved by Healthcare Teams</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                        {[
                            { quote: "CareTrack has completely transformed how our cardiology department handles post-op recovery.", author: "Dr. Sarah Johnson", image: "/assets/doctor_1.jpg" },
                            { quote: "The patient adherence rates we've seen since implementing CareTrack are unprecedented.", author: "Dr. Michael Chen", image: "/assets/doctor_2.jpg" }
                        ].map((t, i) => (
                            <div key={i} className="mask-reveal p-6 sm:p-10 lg:p-16 border border-gray-100 bg-gray-50/50">
                                <div className="mask-overlay" style={{ backgroundImage: `url(${t.image})` }}></div>
                                <p className="text-xl sm:text-2xl lg:text-3xl font-medium mb-8 sm:mb-12 relative z-10 leading-snug">"{t.quote}"</p>
                                <div className="relative z-10 mt-auto">
                                    <p className="font-bold uppercase tracking-widest text-xs">{t.author}</p>
                                    <p className="text-xs opacity-50">Healthcare Professional</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 sm:py-20 border-t border-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-10 text-center">
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] text-gray-400 mb-6 sm:mb-8">Stay Connected</p>
                    <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-8 sm:mb-12">
                        {['Instagram', 'Twitter', 'LinkedIn'].map(s => (
                            <a key={s} href="#" className="text-xs sm:text-sm font-bold uppercase tracking-widest hover:text-teal-600 transition-colors">{s}</a>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400">© 2026 {systemName.toUpperCase()} INC. ESTABLISHED 2024.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
