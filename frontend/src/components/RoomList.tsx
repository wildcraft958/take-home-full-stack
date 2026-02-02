import { useState, useEffect } from 'react';
import { Room } from '@/types';
import { getRooms } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, Wifi, Tv, Mic, Phone } from 'lucide-react';

const amenityIcons: Record<string, React.ReactNode> = {
    'projector': <Tv size={16} />,
    'tv_screen': <Tv size={16} />,
    'whiteboard': <span title="Whiteboard">⬜</span>,
    'video_conferencing': <Wifi size={16} />,
    'phone_conferencing': <Phone size={16} />,
    'microphone': <Mic size={16} />,
    'phone': <Phone size={16} />,
};

export function RoomList() {
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        getRooms().then(setRooms).catch(console.error);
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
                <Card key={room.id} className="glass-card hover:bg-white/5 transition-colors">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex justify-between items-center">
                            {room.name}
                            <span className="text-xs font-normal bg-primary/20 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                                <Users size={12} /> {room.capacity}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {room.amenities.map((amenity) => (
                                <div key={amenity} className="flex items-center gap-1 text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                                    {amenityIcons[amenity] || amenity}
                                    <span className="capitalize">{amenity.replace('_', ' ')}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
