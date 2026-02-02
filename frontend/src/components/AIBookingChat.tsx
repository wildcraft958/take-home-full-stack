import { useState, useRef, useEffect } from 'react';
import { converseWithAgent, submitBooking, ConversationMessage, ConversationResponse } from '@/api/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Send, Bot, User, Loader2, Calendar, Clock, MapPin, Check, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message extends ConversationMessage {
    id: number;
}

interface BookingData {
    room_name: string | null;
    room_id?: number;
    date: string | null;
    start_time: string | null;
    end_time: string | null;
    title: string | null;
    booked_by: string | null;
}

interface AIBookingChatProps {
    onBookingSuccess: () => void;
}

export function AIBookingChat({ onBookingSuccess }: AIBookingChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 0,
            role: 'assistant',
            content: "Hi! I'm your booking assistant. Tell me what you need - like \"Book a room for 5 people tomorrow at 2pm\" and I'll help you set it up."
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingBooking, setPendingBooking] = useState<BookingData | null>(null);
    const [bookingStatus, setBookingStatus] = useState<'idle' | 'confirming' | 'success' | 'error'>('idle');
    const [bookerName, setBookerName] = useState('');

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: input.trim()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            // Build history for API (exclude the welcome message and current message)
            const history: ConversationMessage[] = messages
                .slice(1) // Skip welcome message
                .map(m => ({ role: m.role, content: m.content }));

            const response: ConversationResponse = await converseWithAgent(userMessage.content, history);

            const aiMessage: Message = {
                id: Date.now() + 1,
                role: 'assistant',
                content: response.message
            };
            setMessages(prev => [...prev, aiMessage]);

            // Check if booking is ready - with extra validation
            // Only show confirmation if:
            // 1. AI says booking_ready is true
            // 2. All required fields are present
            // 3. AI message doesn't contain a question (safeguard)
            const hasRequiredFields = response.booking_data &&
                response.booking_data.room_name &&
                response.booking_data.date &&
                response.booking_data.start_time;

            const isAskingQuestion = response.message.includes('?');

            if (response.booking_ready && hasRequiredFields && !isAskingQuestion) {
                setPendingBooking(response.booking_data);
                setBookingStatus('confirming');
            }
        } catch (error) {
            console.error('Conversation error:', error);
            const errorMessage: Message = {
                id: Date.now() + 1,
                role: 'assistant',
                content: "Sorry, I'm having trouble connecting. Please try again."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!pendingBooking || !pendingBooking.room_id) {
            setBookingStatus('error');
            return;
        }

        setLoading(true);
        try {
            await submitBooking({
                room_id: pendingBooking.room_id,
                booking_date: pendingBooking.date!,
                start_time: pendingBooking.start_time!,
                end_time: pendingBooking.end_time || calculateEndTime(pendingBooking.start_time!),
                title: pendingBooking.title || 'Meeting',
                booked_by: bookerName || pendingBooking.booked_by || 'Anonymous'
            });

            setBookingStatus('success');
            const successMessage: Message = {
                id: Date.now(),
                role: 'assistant',
                content: `Booking confirmed: ${pendingBooking.room_name} is reserved for ${formatDate(pendingBooking.date!)} at ${formatTime(pendingBooking.start_time!)}.`
            };
            setMessages(prev => [...prev, successMessage]);
            setPendingBooking(null);
            onBookingSuccess();

            // Reset after a moment
            setTimeout(() => setBookingStatus('idle'), 2000);
        } catch (error: any) {
            setBookingStatus('error');
            const errorMessage: Message = {
                id: Date.now(),
                role: 'assistant',
                content: `Booking failed: ${error.response?.data?.detail || 'Please try again.'}`
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = () => {
        setPendingBooking(null);
        setBookingStatus('idle');
        const cancelMessage: Message = {
            id: Date.now(),
            role: 'assistant',
            content: "No problem! Let me know if you'd like to book something else."
        };
        setMessages(prev => [...prev, cancelMessage]);
    };

    const calculateEndTime = (startTime: string): string => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const endHours = (hours + 1) % 24;
        return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const formatTime = (timeStr: string): string => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    return (
        <Card className="glass-card border-white/10 h-full flex flex-col">
            <CardHeader className="border-b border-white/10 flex-shrink-0 py-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Chat with BookingAI
                </CardTitle>
            </CardHeader>

            <CardContent className="p-0 flex flex-col flex-1 min-h-0">
                {/* Messages Area - takes remaining space */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'bg-purple-500/20 text-purple-400'
                                    }`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>

                                {/* Message Bubble */}
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${msg.role === 'user'
                                    ? 'bg-blue-500/20 text-blue-50 rounded-tr-sm'
                                    : 'bg-white/5 text-gray-200 rounded-tl-sm'
                                    }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Loading indicator */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex gap-3"
                        >
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                            </div>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Confirmation Card */}
                <AnimatePresence>
                    {bookingStatus === 'confirming' && pendingBooking && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="mx-4 mb-4"
                        >
                            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Check className="w-5 h-5 text-green-400" />
                                    <span className="font-medium text-green-300">Ready to Book!</span>
                                </div>

                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span>{pendingBooking.room_name || 'Room TBD'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span>{pendingBooking.date ? formatDate(pendingBooking.date) : 'Date TBD'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span>
                                            {pendingBooking.start_time ? formatTime(pendingBooking.start_time) : 'Time TBD'}
                                            {pendingBooking.end_time && ` - ${formatTime(pendingBooking.end_time)}`}
                                        </span>
                                    </div>
                                    {pendingBooking.title && (
                                        <div className="text-gray-400 italic">"{pendingBooking.title}"</div>
                                    )}
                                </div>

                                {/* Booker name input */}
                                <div className="mb-4">
                                    <Input
                                        placeholder="Your name (optional)"
                                        value={bookerName}
                                        onChange={(e) => setBookerName(e.target.value)}
                                        className="bg-white/5 border-white/10 text-sm"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCancelBooking}
                                        className="flex-1 border-white/20"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleConfirmBooking}
                                        disabled={loading || !pendingBooking.room_id}
                                        className="flex-1 bg-green-500 hover:bg-green-600"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4 mr-1" />
                                                Confirm
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input Area */}
                <div className="border-t border-white/10 p-4">
                    <form
                        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                        className="flex gap-2"
                    >
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            disabled={loading || bookingStatus === 'confirming'}
                            className="flex-1 bg-white/5 border-white/10"
                        />
                        <Button
                            type="submit"
                            disabled={!input.trim() || loading || bookingStatus === 'confirming'}
                            className="bg-purple-500 hover:bg-purple-600"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
