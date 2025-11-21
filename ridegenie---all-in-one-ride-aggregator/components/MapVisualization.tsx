import React from 'react';

interface MapVisualizationProps {
  pickup: string;
  dropoff: string;
}

const MapVisualization: React.FC<MapVisualizationProps> = ({ pickup, dropoff }) => {
  // Construct the Google Maps Embed URL logic
  let mapSrc = "";
  
  if (pickup && dropoff) {
    // If both exist, show directions/route
    const origin = encodeURIComponent(pickup);
    const destination = encodeURIComponent(dropoff);
    mapSrc = `https://maps.google.com/maps?saddr=${origin}&daddr=${destination}&output=embed`;
  } else if (pickup) {
    // If only pickup exists, show that location
    const location = encodeURIComponent(pickup);
    mapSrc = `https://maps.google.com/maps?q=${location}&output=embed`;
  } else {
    // Default view (e.g., India or a major city)
    mapSrc = `https://maps.google.com/maps?q=India&output=embed`;
  }

  return (
    <div className="w-full h-full bg-[#e5e7eb] relative overflow-hidden">
        <iframe 
          width="100%" 
          height="100%" 
          src={mapSrc}
          frameBorder="0" 
          scrolling="no" 
          marginHeight={0} 
          marginWidth={0}
          title="Live Map"
          className="filter grayscale-[20%] contrast-[1.1] opacity-90 hover:opacity-100 transition-opacity"
        ></iframe>

        {/* Floating Overlay for Status */}
        <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur px-5 py-4 rounded-xl shadow-xl border border-white/50 max-w-xs z-10">
            <div className="text-[10px] font-bold text-blue-600 uppercase mb-2 tracking-wider">
              {pickup && dropoff ? "Route Visualizer" : "Live Traffic Data"}
            </div>
            <div className="flex items-center justify-between gap-6">
                <div>
                    <div className="text-xl font-bold text-gray-800">
                      {pickup && dropoff ? "Routing" : "Active"}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      {pickup && dropoff ? "Calculating Path" : "Map Region"}
                    </div>
                </div>
                <div className="h-8 w-[1px] bg-gray-200"></div>
                <div>
                    <div className="text-xl font-bold text-gray-800">GPS</div>
                    <div className="text-xs text-gray-500 font-medium">Connected</div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default MapVisualization;