import { GoogleGenAI, Type } from "@google/genai";
import { TransportMode, ComparisonResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getRideEstimates = async (
  pickup: string,
  dropoff: string,
  mode: TransportMode
): Promise<ComparisonResult> => {
  
  const model = "gemini-2.5-flash";
  
  // Capture current time to simulate live conditions
  const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dayOfWeek = new Date().toLocaleDateString('en-IN', { weekday: 'long' });

  // Schema for structured JSON output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      estimates: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            provider: { type: Type.STRING, description: "one of: uber, ola, rapido" },
            price: { type: Type.NUMBER },
            currency: { type: Type.STRING, description: "Currency symbol, use ₹" },
            eta: { type: Type.STRING, description: "Time to arrival, e.g. '3 mins'" },
            tripDuration: { type: Type.STRING, description: "Duration of trip, e.g. '45 mins'" },
            surgeMultiplier: { type: Type.NUMBER, description: "1.0 for normal, >1.0 for surge" },
            description: { type: Type.STRING, description: "Specific service name, e.g. 'Uber Go', 'Ola Auto', 'Rapido Bike'" }
          },
          required: ["provider", "price", "eta", "tripDuration", "description"]
        }
      },
      analysis: {
        type: Type.STRING,
        description: "A short analysis identifying the cheapest option and the best value option."
      }
    },
    required: ["estimates", "analysis"]
  };

  // Strictly defined price ranges to ensure visual difference in UI
  let modePrompt = "";
  if (mode === 'bike') {
    modePrompt = `
      CRITICAL: You are estimating BIKE/MOTO prices.
      Prices MUST be very low: between ₹30 and ₹120 depending on distance.
      Service Names: Uber Moto, Rapido Bike, Ola Bike.
      If prices are above ₹150, they are wrong for bikes unless the trip is very long.
    `;
  } else if (mode === 'auto') {
    modePrompt = `
      CRITICAL: You are estimating AUTO RICKSHAW prices.
      Prices MUST be moderate: between ₹60 and ₹250.
      Service Names: Uber Auto, Rapido Auto, Ola Auto.
      Prices should be roughly 1.5x - 2x of Bike prices.
    `;
  } else {
    modePrompt = `
      CRITICAL: You are estimating CAB/CAR prices.
      Prices MUST be higher: between ₹150 and ₹800.
      Service Names: Uber Go, Ola Mini, Rapido Cab.
      Prices should be roughly 2.5x - 4x of Bike prices.
    `;
  }

  const prompt = `
    Act as a real-time ride aggregator API for Indian cities.
    
    CONTEXT:
    - Current Time: ${currentTime} on ${dayOfWeek}
    - Trip: From "${pickup}" to "${dropoff}".
    - Traffic Condition: Estimate based on time of day (e.g., Rush hour at 9am/6pm implies 1.5x duration and surge prices).
    
    ${modePrompt}
    
    TASK:
    1. Generate 3 distinct estimates (one for Uber, one for Ola, one for Rapido).
    2. VARY the prices. They should not be identical. 
    3. Apply a "surge" (high demand) factor to ONE provider only if it is currently rush hour (${currentTime}), making it 1.2x - 1.5x more expensive than usual.
    4. In the 'analysis' field, recommend the absolute cheapest option and mention how much cheaper it is than the most expensive one.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a precise pricing engine. You use real-time logic to estimate prices. Bikes are always cheapest. Cabs are most expensive."
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as ComparisonResult;

  } catch (error) {
    console.error("Error fetching ride estimates:", error);
    
    // Fallback data logic if API fails
    const baseRate = mode === 'bike' ? 40 : mode === 'auto' ? 80 : 180;
    
    return {
      estimates: [
        { 
          provider: 'uber', 
          price: Math.round(baseRate * 1.15), 
          currency: '₹', 
          eta: '5 mins', 
          tripDuration: '32 mins', 
          surgeMultiplier: 1.0, 
          description: mode === 'bike' ? 'Uber Moto' : mode === 'auto' ? 'Uber Auto' : 'Uber Go' 
        },
        { 
          provider: 'ola', 
          price: Math.round(baseRate * 1.0), 
          currency: '₹', 
          eta: '8 mins', 
          tripDuration: '35 mins', 
          surgeMultiplier: 1.0, 
          description: mode === 'bike' ? 'Ola Bike' : mode === 'auto' ? 'Ola Auto' : 'Ola Mini' 
        },
        { 
          provider: 'rapido', 
          price: Math.round(baseRate * 0.85), 
          currency: '₹', 
          eta: '3 mins', 
          tripDuration: '30 mins', 
          surgeMultiplier: 1.0, 
          description: mode === 'bike' ? 'Rapido Bike' : mode === 'auto' ? 'Rapido Auto' : 'Rapido Cab' 
        },
      ],
      analysis: "Offline Mode: Showing estimated standard rates. Check internet connection for live AI pricing."
    };
  }
};