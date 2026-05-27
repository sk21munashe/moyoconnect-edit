import { useEffect, useRef, useState, useId } from "react";
import { Search, MapPin, Phone, Hospital, RefreshCw, Compass } from "lucide-react";

interface Clinic {
  id: string;
  name: string;
  lat: number;
  lng: number;
  city: string;
  type: string;
  contacts: string;
}

const ZIMBABWE_CLINICS: Clinic[] = [
  { id: "c-seke-north", name: "Seke North Clinic", lat: -18.0069, lng: 31.0772, city: "Chitungwiza", type: "District Clinic", contacts: "+263 270 31055" },
  { id: "c-seke-south", name: "Seke South Clinic", lat: -18.0264, lng: 31.0601, city: "Chitungwiza", type: "District Clinic", contacts: "+263 270 30012" },
  { id: "c-chitungwiza-central", name: "Chitungwiza Central Hospital", lat: -17.9945, lng: 31.0531, city: "Chitungwiza", type: "Provincial Hospital", contacts: "+263 270 22114" },
  { id: "c-parirenyatwa", name: "Parirenyatwa Group of Hospitals", lat: -17.8134, lng: 31.0422, city: "Harare", type: "National Referral Hospital", contacts: "+263 242 701555" },
  { id: "c-harare-central", name: "Sally Mugabe Central Hospital", lat: -17.8488, lng: 31.0189, city: "Harare", type: "National Referral Hospital", contacts: "+263 242 621111" },
  { id: "c-mpilo-central", name: "Mpilo Central Hospital", lat: -20.1264, lng: 28.5684, city: "Bulawayo", type: "National Referral Hospital", contacts: "+263 292 212011" },
  { id: "c-bulawayo-united", name: "United Bulawayo Hospitals (UBH)", lat: -20.1705, lng: 28.6111, city: "Bulawayo", type: "National Referral Hospital", contacts: "+263 292 252111" },
  { id: "c-gweru-provincial", name: "Gweru Provincial Hospital", lat: -19.4533, lng: 29.8222, city: "Gweru", type: "Provincial Hospital", contacts: "+263 542 22121" },
  { id: "c-mutare-provincial", name: "Mutare Provincial Hospital", lat: -18.9712, lng: 32.6583, city: "Mutare", type: "Provincial Hospital", contacts: "+263 202 064312" },
  { id: "c-masvingo-provincial", name: "Masvingo Provincial Hospital", lat: -20.0682, lng: 30.8258, city: "Masvingo", type: "Provincial Hospital", contacts: "+263 392 262112" }
];

interface ZimbabweMapProps {
  heightClass?: string;
  className?: string;
  onSelectClinic?: (clinic: Clinic) => void;
  singleClinicFocus?: Clinic | null;
}

export default function ZimbabweMap({ 
  heightClass = "h-96", 
  className = "", 
  onSelectClinic,
  singleClinicFocus = null
}: ZimbabweMapProps) {
  const mapElementId = "leaflet-zimbabwe-map-" + useId().replace(/:/g, "");
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Dynamically load Leaflet assets if they aren't pre-loaded
  useEffect(() => {
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // Load styles
    const alreadyStyle = document.querySelector('link[href*="leaflet.css"]');
    if (!alreadyStyle) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.id = "leaflet-cdn-css";
      document.head.appendChild(link);
    }

    // Load scripts
    const alreadyScript = document.querySelector('script[src*="leaflet.js"]');
    if (alreadyScript) {
      const checkLoaded = setInterval(() => {
        if ((window as any).L) {
          clearInterval(checkLoaded);
          setLeafletLoaded(true);
        }
      }, 100);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    script.onerror = () => {
      setMapError("Unable to load interactive map libraries from CDN.");
    };
    document.body.appendChild(script);
  }, []);

  // Initialize and update the map centered on Zimbabwe or focused clinic
  useEffect(() => {
    if (!leafletLoaded) return;
    const L = (window as any).L;
    if (!L) return;

    // Retrieve container node to verify it exists
    const mapContainer = document.getElementById(mapElementId);
    if (!mapContainer) return;

    // Destroy existing map if it already exists to prevent rendering crashes
    if (mapRef.current) {
      try {
        mapRef.current.remove();
      } catch (e) {
        console.error("Leaflet cleanup error:", e);
      }
      mapRef.current = null;
    }

    // Compute coordinates and zoom
    const destCoords: [number, number] = singleClinicFocus 
      ? [singleClinicFocus.lat, singleClinicFocus.lng]
      : [-18.9154, 29.8549]; // Center center of Zimbabwe coordinates
    
    const initialZoom = singleClinicFocus ? 13 : 6.5;

    // Create Map
    const mapInstance = L.map(mapElementId, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(destCoords, initialZoom);

    mapRef.current = mapInstance;

    // Add beautiful OSM tile coordinates template
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(mapInstance);

    // Filter clinics list depending on focus state
    const clinicsToPlot = singleClinicFocus ? [singleClinicFocus] : ZIMBABWE_CLINICS;

    // Plot Clinic Pins
    markersRef.current = [];
    clinicsToPlot.forEach((clinic) => {
      const isFocused = singleClinicFocus?.id === clinic.id || selectedClinic?.id === clinic.id;
      
      const customIconHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-emerald-500 animate-ping opacity-25"></div>
          <div class="w-7 h-7 rounded-full ${isFocused ? 'bg-red-600' : 'bg-[#386934]'} border-2 border-white flex items-center justify-center text-white shadow-lg transform transition select-none">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
            </svg>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-leaflet-pin-container",
        html: customIconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14]
      });

      const popupContent = `
        <div class="p-2.5 font-sans min-w-[200px]">
          <span class="inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${isFocused ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} mb-1">${clinic.type}</span>
          <h4 class="font-extrabold text-[#002434] text-xs leading-tight mb-1">${clinic.name}</h4>
          <p class="text-[10px] text-[#42474b] flex items-center gap-1 mb-1 font-semibold"><svg class="w-3 h-3 text-[#72787c]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> ${clinic.city}, Zimbabwe</p>
          <p class="text-[10px] text-[#42474b] flex items-center gap-1 font-bold"><svg class="w-2.5 h-2.5 text-[#386934]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg> ${clinic.contacts}</p>
        </div>
      `;

      const marker = L.marker([clinic.lat, clinic.lng], { icon: customIcon })
        .addTo(mapInstance)
        .bindPopup(popupContent);
      
      marker.on("click", () => {
        handleClinicSelect(clinic, false);
      });

      markersRef.current.push({ id: clinic.id, marker });
    });

    // Handle ResizeObserver to maintain precise dimensions fluidly
    const resizeObserver = new ResizeObserver(() => {
      try {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      } catch (e) {
        console.error(e);
      }
    });

    resizeObserver.observe(mapContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [leafletLoaded, singleClinicFocus]);

  const handleClinicSelect = (clinic: Clinic, shouldCenterMap: boolean = true) => {
    setSelectedClinic(clinic);
    if (onSelectClinic) {
      onSelectClinic(clinic);
    }

    if (shouldCenterMap && mapRef.current) {
      const L = (window as any).L;
      if (L) {
        mapRef.current.setView([clinic.lat, clinic.lng], 13);
        const refObj = markersRef.current.find(m => m.id === clinic.id);
        if (refObj) {
          refObj.marker.openPopup();
        }
      }
    }
  };

  const filteredClinics = ZIMBABWE_CLINICS.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`flex flex-col border border-[#c2c7cc] rounded-2xl bg-white overflow-hidden shadow-xs hover:shadow-md transition ${className}`}>
      
      {/* Search Header only when not single clinic focus */}
      {!singleClinicFocus && (
        <div className="p-3 bg-[#f8f9fa] border-b border-[#c2c7cc]/50 flex flex-col sm:flex-row gap-2 justify-between items-center">
          <div className="relative w-full sm:max-w-xs shrink-0">
            <Search className="w-4 h-4 text-[#72787c] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Zimbabwe Clinics / Cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs w-full pl-8.5 pr-3 py-1.5 bg-white border border-[#c2c7cc] rounded-lg outline-none text-[#191c1d] placeholder-[#72787c]"
            />
          </div>
          <p className="text-[10px] text-[#72787c] font-bold flex items-center gap-1">
            <RefreshCw className="w-3 h-3 text-[#386934] animate-spin" />
            Showing {filteredClinics.length} Health centers live pinned
          </p>
        </div>
      )}

      {/* Main Map Split UI layout */}
      <div className="flex flex-col md:flex-row">
        
        {/* Map Stage container */}
        <div className="flex-1 relative">
          {!leafletLoaded && (
            <div className="absolute inset-0 bg-[#f3f4f5] flex flex-col gap-2 items-center justify-center text-xs text-[#72787c]">
              <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting live GIS telemetry layers...</span>
            </div>
          )}
          {mapError && (
            <div className="absolute inset-0 bg-[#fee2e2] text-red-800 flex items-center justify-center p-4 text-xs font-bold text-center">
              {mapError}
            </div>
          )}
          <div 
            id={mapElementId} 
            className={`${heightClass} w-full`}
            style={{ zIndex: 1 }}
          />
        </div>

        {/* Selected / Search sidebar only when not single clinic focused */}
        {!singleClinicFocus && (
          <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-[#c2c7cc]/60 flex flex-col bg-white">
            <div className="p-3 bg-[#f8f9fa] border-b border-[#c2c7cc]/50">
              <span className="text-[10px] font-black uppercase text-[#72787c] tracking-widest">Zimbabwe Care Node List</span>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[280px] md:max-h-[320px] divide-y divide-[#c2c7cc]/30">
              {filteredClinics.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#72787c]">No registered clinics match filters.</div>
              ) : (
                filteredClinics.map((clinic) => {
                  const isSelected = selectedClinic?.id === clinic.id;
                  return (
                    <button
                      key={clinic.id}
                      onClick={() => handleClinicSelect(clinic, true)}
                      className={`w-full p-2.5 text-left transition text-xs relative flex flex-col gap-1 cursor-pointer outline-none border-l-3 ${
                        isSelected 
                          ? "bg-[#386934]/5 border-l-[#386934] font-bold" 
                          : "hover:bg-[#f8f9fa] border-l-transparent text-[#42474b]"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <span className={`font-black tracking-tight ${isSelected ? "text-emerald-700" : "text-[#002434]"}`}>
                          {clinic.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#72787c]">
                        <Hospital className="w-3 h-3 text-[#386934]/70" />
                        <span>{clinic.type} • {clinic.city}</span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {selectedClinic && (
              <div className="p-3.5 bg-neutral-50 border-t border-[#c2c7cc]/60 text-xs">
                <span className="inline-block text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded mb-1.5">
                  Selected Center
                </span>
                <p className="font-extrabold text-[#002434] leading-tight text-xs mb-1">
                  {selectedClinic.name}
                </p>
                <div className="space-y-1 text-[#42474b] text-[10px] mt-2 font-semibold">
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-[#386934]" />
                    <span>{selectedClinic.city}, Zimbabwe</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-[#386934]" />
                    <span>{selectedClinic.contacts}</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
