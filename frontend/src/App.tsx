import { useState } from 'react';
import { AIBookingChat } from './components/AIBookingChat';
import { BookingForm } from './components/BookingForm';
import { RoomList } from './components/RoomList';
import { LandingPage } from './components/LandingPage';
import { Calendar, LayoutGrid, History, ChevronLeft } from 'lucide-react';
import { Button } from './components/ui/button';

export default function App() {
  const [view, setView] = useState<'landing' | 'ai' | 'manual' | 'rooms' | 'history'>('landing');

  const goToHome = () => setView('landing');

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
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">AI Assistant</h2>
              <Button variant="outline" size="sm" onClick={() => setView('manual')}>Switch to Manual</Button>
            </div>
            <AIBookingChat onBookingSuccess={() => setView('history')} />
          </div>
        )}

        {view === 'manual' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Manual Booking</h2>
              <Button variant="outline" size="sm" onClick={() => setView('ai')}>Switch to AI</Button>
            </div>
            <BookingForm onBookingSuccess={() => setView('history')} />
          </div>
        )}

        {view === 'rooms' && (
          <RoomList />
        )}

        {view === 'history' && (
          <div className="text-center py-20 text-muted-foreground">
            <Calendar className="mx-auto h-12 w-12 opacity-20 mb-4" />
            <h3 className="text-lg font-medium">Coming Soon</h3>
            <p>Booking history and management module.</p>
            <Button variant="outline" className="mt-4" onClick={goToHome}>Back to Home</Button>
          </div>
        )}

      </main>

    </div>
  )
}
