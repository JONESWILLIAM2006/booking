import React from 'react';
import { RideOption } from '../types';
import { Car, Bike, Navigation, ArrowRight, Clock } from 'lucide-react';

interface RideCardProps {
  option: RideOption;
  onBook: (option: RideOption) => void;
}

const RideCard: React.FC<RideCardProps> = ({ option, onBook }) => {
  
  const getProviderStyle = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'uber': return 'border-l-4 border-black';
      case 'ola': return 'border-l-4 border-[#CDDC39]';
      case 'rapido': return 'border-l-4 border-[#F9C935]';
      default: return 'border-l-4 border-gray-300';
    }
  };

  const getLogo = (provider: string) => {
     switch (provider.toLowerCase()) {
      case 'uber': return <div className="bg-black text-white text-xs font-bold px-2 py-1 rounded">Uber</div>;
      case 'ola': return <div className="bg-[#CDDC39] text-black text-xs font-bold px-2 py-1 rounded">Ola</div>;
      case 'rapido': return <div className="bg-[#F9C935] text-black text-xs font-bold px-2 py-1 rounded">Rapido</div>;
      default: return <div className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded">{provider}</div>;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-4 mb-3 hover:shadow-md transition-shadow duration-200 relative overflow-hidden ${getProviderStyle(option.provider)}`}>
        {option.surgeMultiplier > 1.1 && (
            <div className="absolute top-0 right-0 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-bl">
                High Demand
            </div>
        )}
        
        <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
                {getLogo(option.provider)}
                <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{option.description}</h3>
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                         <span className="flex items-center"><Clock size={12} className="mr-1"/> {option.eta} away</span>
                         <span>•</span>
                         <span>{option.tripDuration} trip</span>
                    </div>
                </div>
            </div>
            
            <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{option.currency}{Math.round(option.price)}</div>
                {option.surgeMultiplier > 1.0 && (
                    <div className="text-[10px] text-red-500">↑ {option.surgeMultiplier}x surge</div>
                )}
            </div>
        </div>

        <button 
            onClick={() => onBook(option)}
            className="mt-3 w-full flex items-center justify-center bg-gray-900 text-white py-2 rounded-md text-sm font-medium active:scale-95 transition-transform hover:bg-gray-800"
        >
            Book Now <ArrowRight size={14} className="ml-1" />
        </button>
    </div>
  );
};

export default RideCard;