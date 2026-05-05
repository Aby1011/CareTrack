import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Heart, Activity, Bell, FileText, Shield, Users,
    ChevronRight, ArrowRight, CheckCircle, MessageSquare,
    BarChart, Zap, Search, Calendar, Plus, LogIn,
    LayoutDashboard, TrendingUp, Smartphone, UserPlus, Phone, Mail
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import TheaterEffect from '../components/TheaterEffect';
import './Home.css';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
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

            // Parallax Effects
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
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-nav py-4' : 'bg-transparent py-8'}`}>
                <div className="container mx-auto px-10 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tighter uppercase">{systemName}</span>
                    </div>

                    <div className="hidden lg:flex items-center gap-12">
                        {['Features', 'Process', 'Modules', 'About'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="nav-link text-black uppercase tracking-widest text-[10px] font-bold">
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/login')} className="text-xs font-bold uppercase tracking-widest hover:opacity-50 transition-opacity">Login</button>
                        <button onClick={() => navigate('/register')} className="pill-button pill-button-primary text-xs uppercase tracking-widest">Join Platform</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section relative h-screen flex items-center justify-center overflow-hidden">
                {/* Visual Background Layer */}
                <div className="hero-background-layer absolute inset-0 pointer-events-none z-0">
                    <img src="/assets/hero_bg.jpg" alt="" className="w-full h-full object-cover" />
                </div>

                <div className="container mx-auto px-10 relative z-10 theater-container">
                    <div className="theater-screen grid md:grid-cols-2 gap-20 items-center text-left">
                        <div className="hero-content-left">
                            <div className="text-reveal-wrapper mb-6">
                                <span className="text-reveal inline-block text-xs font-bold uppercase tracking-[0.3em] text-gray-400">Award-winning Patient Care</span>
                            </div>
                            <h1 className="hero-title text-reveal-wrapper mb-10">
                                <span className="text-reveal block">Remote Monitoring</span>
                                <span className="text-reveal block text-gray-300">Redefined</span>
                            </h1>
                            <div className="text-reveal-wrapper mb-12">
                                <p className="text-reveal text-xl text-gray-500 leading-relaxed font-medium">
                                    Experience a futuristic approach to post-surgery recovery. Real-time data, automated alerts, and seamless doctor-patient connectivity.
                                </p>
                            </div>
                            <div className="text-reveal-wrapper flex flex-col sm:flex-row items-center gap-6">
                                <div className="text-reveal">
                                    <button onClick={() => navigate('/register')} className="pill-button pill-button-primary min-w-[200px]">Get Started</button>
                                </div>
                                <div className="text-reveal">
                                    <button className="pill-button pill-button-secondary min-w-[200px]">Watch Demo</button>
                                </div>
                            </div>
                        </div>
                        <div className="hero-content-right relative">
                            <div className="hero-image-wrapper p-4 bg-gray-100/50 backdrop-blur-xl rounded-[40px] border border-white/20 shadow-2xl relative z-10 overflow-hidden transform hover:scale-[1.02] transition-transform duration-700">
                                <img src="/assets/hero_visual.jpg" alt="Healthcare Excellence" className="w-full h-full object-cover rounded-[32px]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                            </div>
                            {/* Decorative badge */}
                            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl z-20 hidden lg:block animate-bounce border border-gray-50">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Live Status</p>
                                <p className="text-sm font-bold flex items-center gap-2">
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
            <section className="card-fan-section bg-gray-50/50">
                <div className="card-fan-container">
                    <div className="text-center absolute top-20 left-0 right-0 z-10">
                        <h2 className="text-4xl font-bold tracking-tight mb-4">Core Ecosystem</h2>
                        <p className="text-gray-500">Everything you need, fanned out for your convenience.</p>
                    </div>
                    {features.map((feature, i) => (
                        <div key={i} className="card-fan-item">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                                    <feature.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300">0{i + 1}</span>
                            </div>
                            <div className="mb-6 rounded-xl overflow-hidden h-40 bg-gray-50">
                                <img src={feature.image} alt={feature.title} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">{feature.description}</p>
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
            <section ref={horizontalRef} className="horizontal-scroll-container">
                <div ref={horizontalWrapperRef} className="horizontal-scroll-wrapper">
                    <div className="horizontal-scroll-item">
                        <div className="max-w-4xl text-center">
                            <h2 className="text-7xl font-bold mb-10 tracking-tighter">The Patient Journey</h2>
                            <p className="text-2xl text-gray-400">Swipe to see how it works.</p>
                        </div>
                    </div>
                    <div className="horizontal-scroll-item bg-black text-white">
                        <div className="max-w-4xl grid md:grid-cols-2 gap-20 items-center">
                            <div>
                                <h3 className="text-5xl font-bold mb-8">01 Enrollment</h3>
                                <p className="text-xl text-gray-400 leading-relaxed">Seamlessly transition from surgery to recovery with structured digital enrollment by your clinical team.</p>
                            </div>
                            <div className="h-[400px] bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
                                <img src="/assets/enrollment.jpg" alt="Enrollment" className="w-full h-full object-cover opacity-80" />
                            </div>
                        </div>
                    </div>
                    <div className="horizontal-scroll-item">
                        <div className="max-w-4xl grid md:grid-cols-2 gap-20 items-center">
                            <div className="h-[400px] bg-gray-100 rounded-3xl overflow-hidden">
                                <img src="/assets/monitoring.jpg" alt="Monitoring" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-5xl font-bold mb-8">02 Oversight</h3>
                                <p className="text-xl text-gray-500 leading-relaxed">Clinicians monitor your health history 24/7, with instant alerts if data trends indicate a need for intervention.</p>
                            </div>
                        </div>
                    </div>
                    <div className="horizontal-scroll-item bg-teal-600 text-white">
                        <div className="max-w-4xl text-center">
                            <h3 className="text-7xl font-bold mb-10">03 Recovery</h3>
                            <p className="text-2xl opacity-80 mb-12">Achieve your health goals faster with data-driven recovery paths.</p>
                            <button className="pill-button bg-white text-black px-12 py-6 text-xl">Start Your Path</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials - Mask Reveal Hover */}
            <section className="py-32 bg-white">
                <div className="container mx-auto px-10">
                    <div className="grid md:grid-cols-2 gap-10">
                        {[
                            { quote: "CareTrack has completely transformed how our cardiology department handles post-op recovery.", author: "Dr. Sarah Johnson", image: "/assets/doctor_1.jpg" },
                            { quote: "The patient adherence rates we've seen since implementing CareTrack are unprecedented.", author: "Dr. Michael Chen", image: "/assets/doctor_2.jpg" }
                        ].map((t, i) => (
                            <div key={i} className="mask-reveal p-16 border border-gray-100 bg-gray-50/50">
                                <div className="mask-overlay" style={{ backgroundImage: `url(${t.image})` }}></div>
                                <p className="text-3xl font-medium mb-12 relative z-10">"{t.quote}"</p>
                                <div className="relative z-10">
                                    <p className="font-bold uppercase tracking-widest text-xs">{t.author}</p>
                                    <p className="text-xs opacity-50">Healthcare Professional</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-gray-50">
                <div className="container mx-auto px-10 text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.5em] text-gray-400 mb-8">Stay Connected</p>
                    <div className="flex justify-center gap-12 mb-12">
                        {['Instagram', 'Twitter', 'LinkedIn'].map(s => (
                            <a key={s} href="#" className="text-sm font-bold uppercase tracking-widest hover:opacity-50 transition-opacity">{s}</a>
                        ))}
                    </div>
                    <p className="text-xs text-gray-300">© 2026 {systemName.toUpperCase()} INC. ESTABLISHED 2024.</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
