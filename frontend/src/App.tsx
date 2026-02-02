import { useState } from 'react';
import { AIBookingChat } from './components/AIBookingChat';
import { BookingForm } from './components/BookingForm';
import { RoomList } from './components/RoomList';
import { Calendar, LayoutGrid, Plus, History } from 'lucide-react';
import { Button } from './components/ui/button';

// Note: I haven't created Tabs component yet, let me use simple state for navigation or create Tabs.
// Let's implement a simple Tabs-like UI for now to save time or use Shadcn Tabs if I create them.
// I'll create the Shadcn Tabs component next, it's standard.

export default function App() {
  const [view, setView] = useState<'rooms' | 'book' | 'history'>('book');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black">

      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
            Booking<span className="text-foreground">AI</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Intelligent Meeting Room Orchestration
          </p>
        </div>

        <div className="flex gap-2 bg-secondary/30 p-1 rounded-lg backdrop-blur-md border border-white/5">
          <Button
            variant={view === 'book' ? 'default' : 'ghost'}
            onClick={() => setView('book')}
            className="gap-2"
          >
            <Plus size={16} /> Book
          </Button>
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
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">

        {view === 'book' && (
          <div className="space-y-8">
            <section>
              <AIBookingChat onBookingSuccess={() => setView('history')} />
            </section>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or book manually</span>
              </div>
            </div>

            <section>
              <BookingForm onBookingSuccess={() => setView('history')} />
            </section>
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
          </div>
        )}

      </main>

    </div>
  )
}
