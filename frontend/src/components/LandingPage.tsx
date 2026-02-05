import { motion } from 'framer-motion';
import { Bot, Calendar, ArrowRight, Sparkles, Clock, Shield, Home, DoorOpen, History } from 'lucide-react';


interface LandingPageProps {
    onNavigate: (view: 'ai' | 'manual' | 'rooms' | 'history') => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
    return (
        <div className="flex flex-col min-h-[80vh]">
            {/* Navbar */}
            <nav className="flex items-center justify-between py-4 px-6 mb-8">
                <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    RoomBook AI
                </div>
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => onNavigate('ai')}
                        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                        <Home className="w-4 h-4" />
                        Home
                    </button>
                    <button
                        onClick={() => onNavigate('rooms')}
                        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                        <DoorOpen className="w-4 h-4" />
                        Rooms
                    </button>
                    <button
                        onClick={() => onNavigate('history')}
                        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
                    >
                        <History className="w-4 h-4" />
                        History
                    </button>
                </div>
            </nav>

            <div className="flex flex-col items-center justify-center flex-1 text-center space-y-16">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6 max-w-3xl"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span>Next Gen Workspace Orchestration</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-indigo-100 to-indigo-400">
                        Booking Reimagined
                        <br />
                        <span className="text-indigo-500">Powered by Intelligence</span>
                    </h1>

                    <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                        Stop wrestling with calendar grids. Our context-aware AI agent negotiates time, space, and requirements instantly—turning the mundane task of scheduling into a seamless conversation.
                    </p>
                </motion.div>

                {/* Feature Grid / Yapping */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl text-left"
                >
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-4">
                            <Clock className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Zero Latency</h3>
                        <p className="text-muted-foreground text-sm">Real-time conflict resolution and instant confirmation across all your collaborative spaces.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                            <Bot className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Natural Language</h3>
                        <p className="text-muted-foreground text-sm">Speak normally. "Book the war room for 5 people next Tuesday" is all you need to say.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                            <Shield className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Enterprise Grade</h3>
                        <p className="text-muted-foreground text-sm">Secure, reliable, and built to scale with your organization's growing needs.</p>
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="flex flex-col sm:flex-row gap-6 w-full max-w-2xl"
                >
                    <button
                        onClick={() => onNavigate('ai')}
                        className="group relative flex-1 p-8 rounded-2xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300 hover:scale-[1.02]"
                    >
                        <div className="absolute inset-0 bg-indigo-500/5 blur-xl group-hover:bg-indigo-500/10 transition-colors" />
                        <div className="relative flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all">
                                <Bot className="w-8 h-8 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold">Ask AI Agent</h3>
                                <p className="text-indigo-200/60 text-sm">Interactive Conversational Booking</p>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-indigo-300 text-sm font-medium group-hover:text-white transition-colors">
                                Start Chat <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => onNavigate('manual')}
                        className="group relative flex-1 p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
                    >
                        <div className="relative flex flex-col items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                                <Calendar className="w-8 h-8 text-white" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-bold">Manual Form</h3>
                                <p className="text-muted-foreground text-sm">Traditional Scheduler Interface</p>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-gray-400 text-sm font-medium group-hover:text-white transition-colors">
                                Open Form <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </button>
                </motion.div>

            </div>
        </div>
    );
}
