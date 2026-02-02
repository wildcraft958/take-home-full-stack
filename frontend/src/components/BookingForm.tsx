import { useState, useEffect } from 'react';
import { Room, BookingCreate } from '@/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { submitBooking, fetchRooms } from '@/api/client';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface BookingFormProps {
    onBookingSuccess: () => void;
    preselectedRoom?: Room | null;
}

export function BookingForm({ onBookingSuccess, preselectedRoom }: BookingFormProps) {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [formData, setFormData] = useState<BookingCreate>({
        room_id: preselectedRoom?.id || 1,
        booked_by: '',
        booking_date: '',
        start_time: '',
        end_time: '',
        title: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRooms().then(setRooms).catch(console.error);
    }, []);

    // Update room_id when preselectedRoom changes
    useEffect(() => {
        if (preselectedRoom) {
            setFormData(prev => ({ ...prev, room_id: preselectedRoom.id }));
        }
    }, [preselectedRoom]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        try {
            await submitBooking({
                ...formData,
                room_id: Number(formData.room_id)
            });
            setSuccess(true);
            setFormData({ ...formData, title: '', start_time: '', end_time: '' }); // Clear some fields
            onBookingSuccess();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to create booking');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="glass-card w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Manual Booking</CardTitle>
                <CardDescription>Reserve a room for your meeting.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500/15 text-green-500 text-sm p-3 rounded-md flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            Booking successfully created!
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="room">Room</Label>
                        <select
                            id="room"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.room_id}
                            onChange={(e) => setFormData({ ...formData, room_id: Number(e.target.value) })}
                            required
                        >
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>
                                    {room.name} (Cap: {room.capacity})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="booked_by">Your Name / Email</Label>
                        <Input
                            id="booked_by"
                            value={formData.booked_by}
                            onChange={(e) => setFormData({ ...formData, booked_by: e.target.value })}
                            placeholder="alice@example.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Meeting Title (Optional)</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Team Sync"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={formData.booking_date}
                            onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="start">Start Time</Label>
                            <Input
                                id="start"
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="end">End Time</Label>
                            <Input
                                id="end"
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full glass-button" disabled={loading}>
                        {loading ? 'Booking...' : 'Confirm Booking'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
