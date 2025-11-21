import React, { useState } from 'react';
import { TransportMode, RideOption, ComparisonResult } from './types';
import { getRideEstimates } from './services/geminiService';
import RideCard from './components/RideCard';
import MapVisualization from './components/MapVisualization';
import { Navigation, Car, Bike, Zap, Search, Loader2, Sparkles, MapPin } from 'lucide-react';

const App: React.FC = () => {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [mode, setMode] = useState<TransportMode>('cab');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  
  // State to drive the map visualization (Only updates on search for stable routing)
  const [mapPickup, setMapPickup] = useState('');
  const [mapDropoff, setMapDropoff] = useState('');

  const performSearch = async (p: string, d: string, m: TransportMode) => {
    if (!p || !d) return;
    
    setLoading(true);
    setResult(null);
    
    // Update map coordinates ONLY when search is performed to draw the route
    setMapPickup(p);
    setMapDropoff(d);

    try {
      const data = await getRideEstimates(p, d, m);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(pickup, dropoff, mode);
  };

  const handleModeChange = (newMode: TransportMode) => {
    setMode(newMode);
    if (pickup && dropoff && result) {
      // If we already have a result, refresh it with the new mode
      performSearch(pickup, dropoff, newMode);
    }
  };

  const handleBook = (option: RideOption) => {
    let url = '';
    const p = encodeURIComponent(pickup);
    const d = encodeURIComponent(dropoff);
    
    switch (option.provider) {
        case 'uber':
            // Uber Universal Link - attempts to open app, falls back to web
            url = `https://m.uber.com/ul/?action=setPickup&pickup[formatted_address]=${p}&dropoff[formatted_address]=${d}`;
            break;
        case 'ola':
            // Ola Web Booker
            url = 'https://book.olacabs.com/';
            break;
        case 'rapido':
            // Rapido currently focuses on App, redirect to main site
            url = 'https://www.rapido.bike/';
            break;
        default:
            url = `https://www.google.com/maps/dir/?api=1&origin=${p}&destination=${d}`;
    }

    window.open(url, '_blank');
  };

  const handleGeolocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        // Simulate reverse geocoding (in a real app, you'd use Google Maps Geocoding API)
        await new Promise(r => setTimeout(r, 800));
        
        const detectedLocation = "Connaught Place, New Delhi"; 
        setPickup(detectedLocation);
        setLoading(false);
      }, (err) => {
        console.error(err);
        alert("Could not access location. Please enter manually.");
        setLoading(false);
      });
    } else {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-gray-800 font-sans">
      {/* Left Panel: Input & Results */}
      <div className="w-full md:w-[450px] bg-white shadow-xl z-20 flex flex-col h-screen sticky top-0 border-r border-gray-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-black text-white rounded-xl flex items-center justify-center font-bold shadow-lg text-lg">
                R
            </div>
            <div>
                <h1 className="text-xl font-extrabold tracking-tight text-gray-900">RideGenie</h1>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Live Price Aggregator</p>
            </div>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
          
          {/* Mode Selector */}
          <div className="bg-gray-100 p-1.5 rounded-xl mb-6 grid grid-cols-3 gap-1">
            {(['cab', 'auto', 'bike'] as TransportMode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={`py-2.5 text-sm font-bold rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                  mode === m 
                    ? 'bg-white text-black shadow-md scale-[1.02]' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                {m === 'cab' && <Car size={20} />}
                {m === 'auto' && <Zap size={20} />}
                {m === 'bike' && <Bike size={20} />}
                <span className="text-[10px] uppercase">{m}</span>
              </button>
            ))}
          </div>

          {/* Search Inputs */}
          <form onSubmit={handleSearch} className="space-y-4 mb-6 relative">
            {/* Connector Line */}
            <div className="absolute left-[22px] top-[45px] bottom-[100px] w-0.5 bg-gray-200 z-0 border-l-2 border-dotted border-gray-300"></div>

            <div className="relative z-10 group">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600 bg-white">
                    <div className="w-3 h-3 rounded-full border-[3px] border-green-600"></div>
               </div>
               <input 
                type="text" 
                placeholder="Pickup Location"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                className="w-full pl-10 pr-10 py-3.5 bg-gray-50 border-2 border-transparent hover:bg-gray-100 focus:bg-white focus:border-black rounded-xl outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
               />
               <button 
                type="button" 
                onClick={handleGeolocation}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-black hover:bg-gray-200 rounded-lg transition-colors"
                title="Use Current Location"
               >
                   <Navigation size={18} />
               </button>
            </div>

            <div className="relative z-10 group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 bg-white">
                    <div className="w-3 h-3 rounded-sm border-[3px] border-red-600"></div>
                </div>
               <input 
                type="text" 
                placeholder="Dropoff Location"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border-2 border-transparent hover:bg-gray-100 focus:bg-white focus:border-black rounded-xl outline-none transition-all font-medium text-gray-700 placeholder-gray-400"
               />
            </div>

            <button 
                type="submit" 
                disabled={loading || !pickup || !dropoff}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2.5 text-base ${
                    loading || !pickup || !dropoff 
                    ? 'bg-gray-300 cursor-not-allowed shadow-none' 
                    : 'bg-black hover:bg-gray-800 active:scale-[0.98] hover:shadow-2xl'
                }`}
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} strokeWidth={2.5} />}
                {loading ? 'Checking Live Rates...' : 'Compare Prices'}
            </button>
          </form>

          {/* AI Analysis Section */}
          {result && (
             <div className="mb-6 bg-white border border-green-100 shadow-[0_4px_20px_-4px_rgba(0,200,100,0.2)] p-5 rounded-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-100/50 to-transparent rounded-bl-full -mr-4 -mt-4"></div>
                 <div className="flex items-start gap-3 relative z-10">
                     <div className="bg-green-100 p-2 rounded-lg text-green-700">
                        <Sparkles size={18} />
                     </div>
                     <div>
                         <h3 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1.5">Smart Recommendation</h3>
                         <p className="text-sm text-gray-700 leading-relaxed font-medium">{result.analysis}</p>
                     </div>
                 </div>
             </div>
          )}

          {/* Results List */}
          <div className="space-y-3 pb-6">
            {result ? (
                <>
                    <div className="flex justify-between items-end px-1 mb-2">
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Live Estimates</h2>
                        <span className="text-xs text-gray-400 font-medium">Real-time data simulated</span>
                    </div>
                    {result.estimates.map((option, idx) => (
                        <RideCard key={idx} option={option} onBook={handleBook} />
                    ))}
                </>
            ) : (
                !loading && (
                    <div className="text-center py-16 opacity-40">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-1">Plan your route</h3>
                        <p className="text-sm text-gray-500 max-w-[200px] mx-auto">Enter pickup and dropoff to see the route and live prices.</p>
                    </div>
                )
            )}
          </div>
        </div>
      </div>

      {/* Right Panel: Map Visualization */}
      <div className="hidden md:block flex-1 bg-gray-200 relative">
         {/* Use state variables here to ensure map only updates on valid search */}
         <MapVisualization pickup={mapPickup} dropoff={mapDropoff} />
         
         {/* Floating Backend Status */}
         <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-2 z-10">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-gray-700 tracking-wide">LIVE TRAFFIC</span>
         </div>
      </div>
    </div>
  );
};

export default App;