"use client";
import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface Props {
  onAddressSelect: (coords: { latitude: number; longitude: number }) => void;
  initialAddress?: { latitude?: number; longitude?: number };
}

interface DeliveryZone {
  name: string;
  center: [number, number];
  deliveryTime: string;
  deliveryFee: number;
  description: string;
}

export default function AddressMapSelector({ onAddressSelect, initialAddress }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);
  const [clickedLocation, setClickedLocation] = useState<string>("");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string>("");
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showMap, setShowMap] = useState(false);

  // Points de livraison couvrant toute la région de Sikasso
  const deliveryPoints: DeliveryZone[] = [
    {
      name: "Centre-ville Sikasso",
      center: [11.3167, -5.6667],
      deliveryTime: "30-45 minutes",
      deliveryFee: 500,
      description: "Zone centrale de Sikasso - Livraison rapide"
    },
    {
      name: "Quartier Hamdallaye",
      center: [11.3200, -5.6700],
      deliveryTime: "45-60 minutes",
      deliveryFee: 750,
      description: "Zone résidentielle - Livraison standard"
    },
    {
      name: "Zone Industrielle",
      center: [11.3100, -5.6800],
      deliveryTime: "60-90 minutes",
      deliveryFee: 1000,
      description: "Zone industrielle - Livraison étendue"
    },
    {
      name: "Quartier Missirikoro",
      center: [11.3250, -5.6600],
      deliveryTime: "45-75 minutes",
      deliveryFee: 800,
      description: "Zone résidentielle - Service de livraison disponible"
    },
    {
      name: "Marché Central",
      center: [11.3180, -5.6680],
      deliveryTime: "30-60 minutes",
      deliveryFee: 600,
      description: "Zone commerciale - Livraison rapide"
    },
    {
      name: "Gare Routière",
      center: [11.3220, -5.6750],
      deliveryTime: "45-75 minutes",
      deliveryFee: 900,
      description: "Zone de transport - Service disponible"
    },
    // Points couvrant la région élargie de Sikasso
    {
      name: "Sikasso Nord",
      center: [11.3500, -5.6667],
      deliveryTime: "60-90 minutes",
      deliveryFee: 1200,
      description: "Zone nord de Sikasso - Service de livraison"
    },
    {
      name: "Sikasso Sud",
      center: [11.2800, -5.6667],
      deliveryTime: "60-90 minutes",
      deliveryFee: 1200,
      description: "Zone sud de Sikasso - Service de livraison"
    },
    {
      name: "Sikasso Est",
      center: [11.3167, -5.6200],
      deliveryTime: "75-105 minutes",
      deliveryFee: 1500,
      description: "Zone est de Sikasso - Livraison étendue"
    },
    {
      name: "Sikasso Ouest",
      center: [11.3167, -5.7200],
      deliveryTime: "75-105 minutes",
      deliveryFee: 1500,
      description: "Zone ouest de Sikasso - Livraison étendue"
    },
    {
      name: "Périphérie Nord-Est",
      center: [11.3400, -5.6400],
      deliveryTime: "90-120 minutes",
      deliveryFee: 1800,
      description: "Périphérie nord-est - Service disponible"
    },
    {
      name: "Périphérie Sud-Ouest",
      center: [11.2900, -5.6900],
      deliveryTime: "90-120 minutes",
      deliveryFee: 1800,
      description: "Périphérie sud-ouest - Service disponible"
    }
  ];

  const getNearestPoint = (lat: number, lng: number): DeliveryZone | null => {
    let nearestPoint: DeliveryZone | null = null;
    let minDistance = Infinity;

    for (const point of deliveryPoints) {
      const distance = Math.sqrt(
        Math.pow(lat - point.center[0], 2) + Math.pow(lng - point.center[1], 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = point;
      }
    }

    // Zone de couverture étendue pour toute la région de Sikasso (0.15 degrés)
    return minDistance <= 0.15 ? nearestPoint : null;
  };

  const getLocationName = (lat: number, lng: number): string => {
    const point = getNearestPoint(lat, lng);
    if (point) {
      return `${point.name} (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    }
    return `Point sélectionné (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  };

  const handleGeolocation = () => {
    setIsLocating(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("La géolocalisation n'est pas supportée par votre navigateur.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Vérifier si la position est dans la région de Sikasso
        const nearestPoint = getNearestPoint(latitude, longitude);
        
        if (nearestPoint) {
          // Mettre à jour la carte et les informations
          onAddressSelect({ latitude, longitude });
          setSelectedZone(nearestPoint);
          setClickedLocation(getLocationName(latitude, longitude));
          
          // Centrer la carte sur la position
          if (mapRef.current && window.L) {
            // @ts-ignore
            const L = window.L;
            const map = L.map.getMap(mapRef.current);
            if (map) {
              map.setView([latitude, longitude], 13);
            }
          }
        } else {
          setLocationError("Votre position actuelle est en dehors de la région de Sikasso. Veuillez sélectionner manuellement un point sur la carte.");
        }
        
        setIsLocating(false);
      },
      (error) => {
        let errorMessage = "Impossible de déterminer votre position.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "L'accès à la géolocalisation a été refusé. Veuillez autoriser l'accès à votre position.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Les informations de position ne sont pas disponibles.";
            break;
          case error.TIMEOUT:
            errorMessage = "La demande de géolocalisation a expiré.";
            break;
        }
        
        setLocationError(errorMessage);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    // @ts-ignore
    if (!window.L) return; // Leaflet pas encore chargé

    // @ts-ignore
    const L = window.L;
    // Coordonnées de Sikasso, Mali - vue élargie pour toute la région
    const sikassoCoords = [11.3167, -5.6667];
    const defaultPos = [initialAddress?.latitude || sikassoCoords[0], initialAddress?.longitude || sikassoCoords[1]];
    const map = L.map(mapRef.current).setView(defaultPos, 11); // Zoom plus large pour voir toute la région

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    const marker = L.marker(defaultPos).addTo(map);

    // Ajouter les points de livraison
    deliveryPoints.forEach((point) => {
      const pointMarker = L.marker(point.center, {
        icon: L.divIcon({
          className: 'custom-div-icon',
          html: `<div style='background-color: #3B82F6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); cursor: pointer;'></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        })
      }).addTo(map);

      // Popup pour chaque point
      pointMarker.bindPopup(`
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #3B82F6; font-weight: bold;">${point.name}</h4>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Temps:</strong> ${point.deliveryTime}</p>
          <p style="margin: 4px 0; font-size: 14px;"><strong>Frais:</strong> ${point.deliveryFee} FCFA</p>
          <p style="margin: 4px 0; font-size: 12px; color: #666;">${point.description}</p>
          <p style="margin: 4px 0; font-size: 11px; color: #999;">Coordonnées: ${point.center[0].toFixed(4)}, ${point.center[1].toFixed(4)}</p>
        </div>
      `);
    });

    map.on("click", function (e) {
      const clickedLat = e.latlng.lat;
      const clickedLng = e.latlng.lng;
      
      marker.setLatLng(e.latlng);
      onAddressSelect({ latitude: clickedLat, longitude: clickedLng });
      
      // Déterminer le point le plus proche et mettre à jour les informations
      const nearestPoint = getNearestPoint(clickedLat, clickedLng);
      setSelectedZone(nearestPoint);
      setClickedLocation(getLocationName(clickedLat, clickedLng));
    });

    return () => {
      map.remove();
    };
  }, [onAddressSelect, initialAddress]);

  return (
    <div>
      {/* Bouton de géolocalisation */}
      <div className="mb-4">
        <button
          onClick={handleGeolocation}
          disabled={isLocating}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Navigation className="w-4 h-4" />
          <span>
            {isLocating ? "Localisation en cours..." : "Me localiser automatiquement"}
          </span>
        </button>
        
        {locationError && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{locationError}</p>
          </div>
        )}
      </div>

      {/* Sur mobile, bouton pour afficher la carte */}
      {isMobile && !showMap && (
        <button
          onClick={() => setShowMap(true)}
          className="w-full mb-4 px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold shadow hover:bg-amber-600 transition"
        >
          Choisir ma position sur la carte
        </button>
      )}

      {/* Sur mobile, si showMap, n'affiche QUE la carte et un bouton fermer */}
      {isMobile && showMap ? (
        <div className="mt-4">
          <div ref={mapRef} style={{ height: 300, width: "100%", position: 'static' }} />
          <button
            onClick={() => setShowMap(false)}
            className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold shadow hover:bg-gray-300 transition"
          >
            Fermer la carte
          </button>
        </div>
      ) : null}
      {/* Desktop : carte toujours visible */}
      {!isMobile && (
        <div className="mt-4">
          <div ref={mapRef} style={{ height: 300, width: "100%", position: 'static' }} />
        </div>
      )}
      
      {/* Affiche les infos de localisation seulement si la carte est visible */}
      {(!isMobile || showMap) && (
        <div className="mt-4 p-4 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-2">Localisation sélectionnée</h4>
          {clickedLocation ? (
            <div className="space-y-2">
              <div className="text-sm">
                <span className="text-gray-600">Position:</span>
                <span className="ml-2 font-medium text-gray-900">{clickedLocation}</span>
              </div>
              {selectedZone ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium text-green-900">{selectedZone.name}</span>
                  </div>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Temps de livraison:</strong> {selectedZone.deliveryTime}</p>
                    <p><strong>Frais de livraison:</strong> {selectedZone.deliveryFee} FCFA</p>
                    <p className="text-xs">{selectedZone.description}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                  <p className="text-sm text-orange-800">
                    <strong>Note:</strong> Ce point est en dehors de la région de Sikasso. 
                    Veuillez sélectionner un point dans la région de Sikasso pour la livraison.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <p>Cliquez sur la carte ou utilisez le bouton de géolocalisation pour sélectionner votre adresse</p>
              <p className="mt-2 text-blue-600">
                <strong>Conseil:</strong> Cliquez sur les points bleus pour des informations de livraison précises
              </p>
              <p className="mt-1 text-sm text-gray-500">
                <strong>Couverture:</strong> Toute la région de Sikasso
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-2 text-sm text-gray-600">
        {/* Liste des points de livraison supprimée */}
      </div>
    </div>
  );
} 