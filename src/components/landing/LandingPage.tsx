import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Microscope, Sparkles, Shield, Cpu, Zap } from 'lucide-react';
import Hero3D from './Hero3D';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const { scrollYProgress } = useScroll();
    
    const yHero = useTransform(scrollYProgress, [0, 0.5], [0, -200]);
    const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    const features = [
        { icon: <Microscope size={24} />, title: 'Deep Research', desc: 'Investigate complex topics across all fields with Gemini 2.5 Flash Grounding.' },
        { icon: <Zap size={24} />, title: 'Instant Synthesis', desc: 'Summarize extensive data into beautiful markdown and actionable insights.' },
        { icon: <Cpu size={24} />, title: 'Agentic Intelligence', desc: 'Multimodal analysis of images, videos, and real-time data streams.' },
        { icon: <Shield size={24} />, title: 'Production Ready', desc: 'Built-in resilience, error handling, and cloud synchronization.' }
    ];

    return (
        <div className="relative w-full overflow-x-hidden pt-20">
            {/* Hero Section */}
            <section className="relative h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
                <React.Suspense fallback={<div className="absolute inset-0 bg-slate-950" />}>
                    <Hero3D />
                </React.Suspense>
                
                <motion.div 
                    style={{ y: yHero, opacity: opacityHero }}
                    className="relative z-10 max-w-4xl"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 backdrop-blur-xl"
                    >
                        <Sparkles size={16} />
                        <span>The Future of Intelligence is Lumina</span>
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tight leading-none"
                    >
                        DISCOVER THE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">UNSEEN.</span>
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed"
                    >
                        Next-generation AI Research Assistant powered by Gemini. 
                        Investigate, analyze, and synthesize with the most advanced models.
                    </motion.p>
                    
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                        <button 
                            onClick={() => navigate('/app')}
                            className="group px-10 py-5 rounded-2xl bg-white text-slate-950 font-bold text-lg hover:bg-blue-50 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)] flex items-center gap-3 active:scale-95"
                        >
                            Start Researching
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button className="px-10 py-5 rounded-2xl bg-white/5 text-white border border-white/10 font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-xl active:scale-95">
                            View Showcase
                        </button>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="relative py-32 px-6 z-10">
                <div className="max-w-7xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center mb-24"
                    >
                        <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Built for Excellence</h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Engineered with the latest web technologies and AI advancements to provide a seamless research experience.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                className="glass-panel p-8 rounded-3xl group hover:border-blue-500/50 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-40 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent pointer-events-none" />
                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="glass-panel p-16 rounded-[4rem] border-white/5 overflow-hidden relative"
                    >
                        {/* Decorative blobs */}
                        <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 blur-[120px] rounded-full" />
                        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 blur-[120px] rounded-full" />
                        
                        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">Ready to transcend the <br /> <span className="text-glow">ordinary?</span></h2>
                        <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Join thousands of researchers pushing the boundaries of what's possible with AI. Lumina is open and ready.
                        </p>
                        <button 
                            onClick={() => navigate('/app')}
                            className="px-12 py-6 rounded-3xl bg-blue-600 text-white font-black text-xl hover:bg-blue-500 transition-all shadow-[0_0_60px_rgba(37,99,235,0.3)] active:scale-95"
                        >
                            Enter the Nexus
                        </button>
                    </motion.div>
                </div>
            </section>

            <footer className="py-12 px-6 text-center text-slate-500 border-t border-white/5 relative z-10">
                <p>© 2026 Lumina Intelligence Labs. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
