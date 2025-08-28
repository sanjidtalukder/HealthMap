import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import { motion } from 'framer-motion';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default markers
delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface HealthData {
  lat: number;
  lng: number;
  temperature: number;
  uvIndex: number;
  pollutant: string;
  pollutantValue: number;
  hri: number;
  advice: string;
  runWindow?: string;
}

interface HealthMapProps {
  onLocationSelect: (data: HealthData) => void;
}

// Mock data generator for demonstration
const generateMockHealthData = (lat: number, lng: number): HealthData => {
  const temperature = Math.random() * 40 + 5; // 5-45°C
  const uvIndex = Math.random() * 12; // 0-12
  const pollutantValue = Math.random() * 150; // 0-150 μg/m³
  
  // Calculate HRI based on normalized values
  const tempNorm = temperature / 30;
  const uvNorm = uvIndex / 12;
  const pollutantNorm = pollutantValue / 100;
  const hri = Math.round(((tempNorm + uvNorm + pollutantNorm) / 3) * 100);
  
  // Generate advice based on HRI
  let advice = "Low risk area. Enjoy outdoor activities!";
  if (hri >= 80) advice = "Severe risk! Avoid outdoor activities. Stay indoors with air filtration.";
  else if (hri >= 70) advice = "High risk. Limit outdoor exposure. Use protective equipment.";
  else if (hri >= 50) advice = "Moderate risk. Take precautions during outdoor activities.";
  else if (hri >= 30) advice = "Low-moderate risk. Normal outdoor activities with basic sun protection.";
  
  // Generate optimal run window
  const hour = Math.floor(Math.random() * 24);
  const runWindow = ${hour}:00 - ${(hour + 2) % 24}:00 (optimal for outdoor exercise);
  
  return {
    lat,
    lng,
    temperature: Math.round(temperature * 10) / 10,
    uvIndex: Math.round(uvIndex * 10) / 10,
    pollutant: "PM2.5",
    pollutantValue: Math.round(pollutantValue),
    hri,
    advice,
    runWindow
  };
};

const MapClickHandler: React.FC<{ onLocationSelect: (data: HealthData) => void }> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      const healthData = generateMockHealthData(lat, lng);
      onLocationSelect(healthData);
    },
  });
  return null;
};

const HealthMap: React.FC<HealthMapProps> = ({ onLocationSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState<HealthData | null>(null);

  const handleLocationSelect = (data: HealthData) => {
    setSelectedLocation(data);
    onLocationSelect(data);
  };

  const getRiskColor = (hri: number) => {
    if (hri >= 80) return '#8e44ad'; // severe (purple)
    if (hri >= 70) return '#e74c3c'; // critical (red)
    if (hri >= 50) return '#f39c12'; // high (orange)
    if (hri >= 30) return '#f1c40f'; // moderate (yellow)
    return '#27ae60'; // low (green)
  };

  const createHealthIcon = (hri: number) => {
    const color = getRiskColor(hri);
    return new Icon({
      iconUrl: data:image/svg+xml;base64,${btoa(
        <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
          <path fill="${color}" stroke="#fff" stroke-width="2" d="M12.5 0C5.6 0 0 5.6 0 12.5C0 19.4 12.5 41 12.5 41S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0Z"/>
          <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
          <text x="12.5" y="17" text-anchor="middle" font-size="8" font-weight="bold" fill="${color}">${hri}</text>
        </svg>
      )},
      iconSize: [25, 41],
      iconAnchor: [12.5, 41],
      popupAnchor: [0, -41],
    });
  };




  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[40.7128, -74.0060]} // NYC
        zoom={3}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapClickHandler onLocationSelect={handleLocationSelect} />
        {selectedLocation && (
          <Marker 
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={createHealthIcon(selectedLocation.hri)}
          >
            <Popup>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center p-2"
              >
                <h3 className="font-bold text-lg mb-2">Health Risk Index</h3>
                <div 
                  className="text-2xl font-bold mb-2"
                  style={{ color: getRiskColor(selectedLocation.hri) }}
                >
                  {selectedLocation.hri}/100
                </div>
                <div className="text-sm space-y-1">
                  <div>🌡 {selectedLocation.temperature}°C</div>
                  <div>☀ UV: {selectedLocation.uvIndex}</div>
                  <div>💨 {selectedLocation.pollutant}: {selectedLocation.pollutantValue} μg/m³</div>
                </div>
              </motion.div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Map overlay instructions */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 text-sm max-w-xs"
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
          <span className="font-medium">Orbit-Health Navigator</span>
        </div>
        <p className="text-muted-foreground">
          Click anywhere on the map to analyze health risks for that location
        </p>
      </motion.div>
    </div>
  );
};

export default HealthMap;