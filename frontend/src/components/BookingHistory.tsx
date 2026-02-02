import { useState, useEffect } from 'react';
import { Booking } from '@/types';
import { fetchBookings, cancelBooking } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar, Clock, MapPin, User, Trash2, Loader2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingHistoryProps {
    onBookNow?: () => void;
}

export function BookingHistory({ onBookNow }: BookingHistoryProps) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
    const [roomFilter, setRoomFilter] = useState<string>('');
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const data = await fetchBookings();
            setBookings(data);
        } catch (error) {
            console.error('Failed to load bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    const handleCancel = async (id: number) => {
        if (!confirm('Are you sure you want to cancel this booking?')) return;

        setDeletingId(id);
        try {
            await cancelBooking(id);
            await loadBookings();
        } catch (error) {
            console.error('Failed to cancel booking:', error);
            alert('Failed to cancel booking. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (timeStr: string): string => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    const isUpcoming = (dateStr: string, timeStr: string): boolean => {
        const bookingDateTime = new Date(`${dateStr}T${timeStr}`);
        return bookingDateTime > new Date();
    };

    // Get unique room names for filter dropdown
    const uniqueRooms = Array.from(new Set(bookings.map(b => b.room_name).filter(Boolean))) as string[];

    const filteredBookings = bookings.filter(booking => {
        // Time filter
        if (filter !== 'all') {
            const upcoming = isUpcoming(booking.booking_date, booking.start_time);
            if (filter === 'upcoming' && !upcoming) return false;
            if (filter === 'past' && upcoming) return false;
        }
        // Room filter
        if (roomFilter && booking.room_name !== roomFilter) return false;
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center py-20">
                <Calendar className="mx-auto h-16 w-16 opacity-20 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Bookings Yet</h3>
                <p className="text-muted-foreground mb-6">Start by booking your first meeting room.</p>
                {onBookNow && (
                    <Button onClick={onBookNow} className="bg-primary hover:bg-primary/90">
                        Book Now
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Section */}
            <div className="flex flex-wrap items-center gap-4">
                {/* Time Filter */}
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Status:</span>
                </div>
                <div className="flex gap-1 bg-secondary/30 p-1 rounded-lg">
                    {(['upcoming', 'past', 'all'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${filter === f
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-white/5 text-muted-foreground'
                                }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Room Filter */}
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <select
                        value={roomFilter}
                        onChange={(e) => setRoomFilter(e.target.value)}
                        className="bg-secondary/30 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="">All Rooms</option>
                        {uniqueRooms.map(room => (
                            <option key={room} value={room}>{room}</option>
                        ))}
                    </select>
                </div>

                <span className="text-sm text-muted-foreground ml-auto">
                    {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                </span>
            </div>

            {/* Bookings List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                    {filteredBookings.map((booking) => {
                        const upcoming = isUpcoming(booking.booking_date, booking.start_time);
                        return (
                            <motion.div
                                key={booking.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Card className={`glass-card ${upcoming ? 'border-primary/30' : 'border-white/10'}`}>
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="font-semibold">{booking.title || 'Meeting'}</div>
                                                <div className="text-xs text-muted-foreground font-normal mt-1">
                                                    {upcoming ? (
                                                        <span className="text-green-400">Upcoming</span>
                                                    ) : (
                                                        <span className="text-gray-500">Past</span>
                                                    )}
                                                </div>
                                            </div>
                                            {upcoming && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleCancel(booking.id)}
                                                    disabled={deletingId === booking.id}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 -mt-1"
                                                >
                                                    {deletingId === booking.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <MapPin className="w-4 h-4 text-gray-500" />
                                            <span>{booking.room_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span>{formatDate(booking.booking_date)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span>
                                                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span>{booking.booked_by}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {filteredBookings.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No {filter} bookings found.</p>
                </div>
            )}
        </div>
    );
}
