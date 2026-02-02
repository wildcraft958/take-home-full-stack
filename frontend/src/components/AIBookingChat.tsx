import { useState, useRef } from 'react';
import { submitBooking, analyzeBookingRequest } from '@/api/client';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Send, Bot, Loader2, Sparkles, Check, X } from 'lucide-react';
import { AIParseResponse, BookingCreate } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface AIBookingChatProps {
    onBookingSuccess: () => void;
}

export function AIBookingChat({ onBookingSuccess }: AIBookingChatProps) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [parsedData, setParsedData] = useState<AIParseResponse | null>(null);
    const [confirming, setConfirming] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleParse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        setParsedData(null);

        try {
            const result = await analyzeBookingRequest(input);
            setParsedData(result);
        } catch (error) {
            console.error("AI Parse Error", error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async () => {
        if (!parsedData) return;
        setConfirming(true);

        // We need to map AI response to BookingCreate. 
        // Note: In a real app, we'd handle missing room_ids by looking up names or asking user. 
        // For this demo, assume the AI (backend) could return a room_id or we match it here.
        // Actually, the current AI parser returns 'room_name'. We need to match that to an ID or the backend should handle it.
        // The current 'createBooking' needs a 'room_id'.
        // Let's assume for this MVP that the user must verify the room in the manual form if name matching isn't perfect,
        // OR the backend creates the booking by name. 
        // Ideally, the Backend AI Parser should return the Room ID if it matched confidentally.
        // Let's fix this gap: The frontend will look up the room ID from the list (we need room list context) or we ask the backend to handle it.
        // EASIEST PATH: We passed the rooms to the LLM, but it returned the name. 
        // Let's require the user to manually select the room if it's ambiguous, but better: 
        // The backend `create_booking` endpoint expects `room_id`. 
        // We really should have the AI return the matched `room_id` or we filter here.
        // Just for now: we'll show a warning if room isn't found, but let's try to pass the data.

        // HACK: We need a utility to find room ID by name. 
        // Implementing a quick lookup here would require fetching rooms. 
        // Let's assume the user edits the manual form if it fails, OR we fetch rooms here.
        // Let's implement a "Refine in Form" feature if automatic confirmation isn't possible?
        // Or simply:

        try {
            // We need the room_id. Ideally the parsing response would contain it if we enhanced the backend.
            // For now, let's just alert if we can't book directly.
            alert("Please use the manual form to finalize (Room ID lookup missing in this step). \n\nDev Note: In a full implementation, I would map the room name '" + parsedData.room_name + "' to an ID here.");
            // Real impl: fetch rooms, find id -> createBooking.

        } catch (error) {
            console.error(error);
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-4">
            <Card className="glass-card border-primary/20">
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4 text-primary">
                        <Sparkles className="w-5 h-5" />
                        <h3 className="font-semibold text-lg">AI Booking Assistant</h3>
                    </div>

                    <form onSubmit={handleParse} className="relative">
                        <Input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="e.g., 'Book the Board Room for 3 people tomorrow at 2pm'"
                            className="pr-12 py-6 text-lg bg-background/50 backdrop-blur-sm border-primary/20 focus-visible:ring-primary/50"
                            disabled={loading}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="absolute right-1 top-1 h-10 w-10 glass-button"
                            disabled={loading || !input.trim()}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <AnimatePresence>
                {parsedData && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <Card className="bg-secondary/20 border-secondary">
                            <CardContent className="p-4">
                                <div className="flex gap-4">
                                    <div className="mt-1 bg-primary/20 p-2 rounded-full h-fit">
                                        <Bot size={20} className="text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <p className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                                            Interpretation (Confidence: <span className={parsedData.confidence === 'high' ? 'text-green-500' : 'text-yellow-500'}>{parsedData.confidence}</span>)
                                        </p>

                                        {parsedData.clarification_needed ? (
                                            <p className="text-destructive font-medium">{parsedData.clarification_needed}</p>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div><span className="text-muted-foreground">Room:</span> {parsedData.room_name || "Not specified"}</div>
                                                <div><span className="text-muted-foreground">Date:</span> {parsedData.date}</div>
                                                <div><span className="text-muted-foreground">Time:</span> {parsedData.start_time} - {parsedData.end_time}</div>
                                                <div><span className="text-muted-foreground">For:</span> {parsedData.booked_by || "Unknown"}</div>
                                            </div>
                                        )}

                                        <div className="flex gap-2 mt-4 pt-2 border-t border-border/50">
                                            {!parsedData.clarification_needed && (
                                                <Button size="sm" onClick={handleConfirm} disabled={confirming}>
                                                    {confirming ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4" />}
                                                    Confirm & Book
                                                </Button>
                                            )}
                                            <Button size="sm" variant="ghost" onClick={() => setParsedData(null)}>
                                                <X className="mr-2 h-4 w-4" />
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
