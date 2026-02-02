import { useState } from 'react';
import { AIBookingChat } from './components/AIBookingChat';
import { BookingForm } from './components/BookingForm';
import { RoomList } from './components/RoomList';
import { LandingPage } from './components/LandingPage';
import { BookingHistory } from './components/BookingHistory';
import { LayoutGrid, History, ChevronLeft } from 'lucide-react';
import { Button } from './components/ui/button';
import { Room } from './types';

export default function App() {
  const [view, setView] = useState<'landing' | 'ai' | 'manual' | 'rooms' | 'history'>('landing');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const goToHome = () => setView('landing');

  const handleBookRoom = (room: Room) => {
    setSelectedRoom(room);
    setView('manual');
  };

  const handleBookingSuccess = () => {
    setSelectedRoom(null);
    setView('history');
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black">

      {/* Header */}
      <header className={`max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700 ${view === 'landing' ? 'mb-8' : ''}`}>
        <div
          onClick={goToHome}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
            Booking<span className="text-foreground">AI</span>
          </h1>
        </div>

        {view !== 'landing' && (
          <div className="flex gap-2 bg-secondary/30 p-1 rounded-lg backdrop-blur-md border border-white/5">
            <Button
              variant="ghost"
              onClick={goToHome}
              className="gap-2"
            >
              <ChevronLeft size={16} /> Home
            </Button>
            <div className="w-px bg-white/10 mx-1" />
            <Button
              variant={view === 'rooms' ? 'default' : 'ghost'}
              onClick={() => setView('rooms')}
              className="gap-2"
            >
              <LayoutGrid size={16} /> Rooms
            </Button>
            <Button
              variant={view === 'history' ? 'default' : 'ghost'}
              onClick={() => setView('history')}
              className="gap-2"
            >
              <History size={16} /> History
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">

        {view === 'landing' && (
          <LandingPage onNavigate={(v) => setView(v)} />
        )}

        {view === 'ai' && (
          <div className="flex flex-col h-[calc(100vh-160px)]">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h2 className="text-xl font-semibold text-muted-foreground">AI Booking Assistant</h2>
              <Button variant="outline" size="sm" onClick={() => setView('manual')}>Switch to Manual</Button>
            </div>
            <div className="flex-1 min-h-0">
              <AIBookingChat onBookingSuccess={handleBookingSuccess} />
            </div>
          </div>
        )}

        {view === 'manual' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Manual Booking</h2>
              <Button variant="outline" size="sm" onClick={() => setView('ai')}>Switch to AI</Button>
            </div>
            <BookingForm
              onBookingSuccess={handleBookingSuccess}
              preselectedRoom={selectedRoom}
            />
          </div>
        )}

        {view === 'rooms' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Available Rooms</h2>
            </div>
            <RoomList onBookRoom={handleBookRoom} />
          </div>
        )}

        {view === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Booking History</h2>
              <Button variant="outline" onClick={() => setView('ai')}>New Booking</Button>
            </div>
            <BookingHistory onBookNow={() => setView('ai')} />
          </div>
        )}

      </main>

    </div>
  )
}

