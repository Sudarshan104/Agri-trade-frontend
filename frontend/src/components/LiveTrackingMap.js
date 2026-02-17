import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API from '../Services/api';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom Icons
const agentIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png', // Courier Icon
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

const homeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png', // House Icon
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

const storeIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1055/1055646.png', // Shop Icon
    iconSize: [30, 30],
    iconAnchor: [15, 30]
});

// Component to recenter map
const RecenterAutomatically = ({ lat, lng }) => {
    const map = useMap();
    useEffect(() => {
        if (lat && lng) map.setView([lat, lng]);
    }, [lat, lng, map]);
    return null;
};

const LiveTrackingMap = ({ agentId, pickupLocation = "Bangalore", deliveryLocation = "Mysore" }) => {
    const [agentPos, setAgentPos] = useState(null);
    const [pickupPos, setPickupPos] = useState(null);
    const [deliveryPos, setDeliveryPos] = useState(null);
    const [error, setError] = useState(null);

    // Geocode address to coords (Mock/Simple Logic or Nominatim)
    const geocode = async (address) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
        } catch (err) {
            console.error("Geocoding error:", err);
        }
        return null;
    };

    useEffect(() => {
        // Initial Geocoding for static points
        const loadStaticPoints = async () => {
            const p = await geocode(pickupLocation);
            const d = await geocode(deliveryLocation);
            if (p) setPickupPos(p);
            if (d) setDeliveryPos(d);
        };
        loadStaticPoints();
    }, [pickupLocation, deliveryLocation]);

    useEffect(() => {
        if (!agentId) return;

        const fetchAgentLocation = async () => {
            try {
                const res = await API.get(`/delivery-agents/${agentId}/location`);
                if (res.data && res.data.latitude && res.data.longitude) {
                    if (res.data.latitude !== 0 && res.data.longitude !== 0) {
                        setAgentPos([res.data.latitude, res.data.longitude]);
                    }
                }
            } catch (err) {
                console.error("Error fetching agent location:", err);
            }
        };

        fetchAgentLocation(); // Immediate
        const interval = setInterval(fetchAgentLocation, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, [agentId]);

    // Default center (Bangalore) if nothing else
    const center = agentPos || pickupPos || [12.9716, 77.5946];

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '10px', overflow: 'hidden', border: '1px solid #ddd' }}>
            <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Update center when agent moves */}
                {agentPos && <RecenterAutomatically lat={agentPos[0]} lng={agentPos[1]} />}

                {agentPos && (
                    <Marker position={agentPos} icon={agentIcon}>
                        <Popup>Delivery Agent (Live)</Popup>
                    </Marker>
                )}

                {pickupPos && (
                    <Marker position={pickupPos} icon={storeIcon}>
                        <Popup>Pickup: {pickupLocation}</Popup>
                    </Marker>
                )}

                {deliveryPos && (
                    <Marker position={deliveryPos} icon={homeIcon}>
                        <Popup>Delivery: {deliveryLocation}</Popup>
                    </Marker>
                )}

                {/* Route Line (Straight line for simplicity in V1) */}
                {agentPos && deliveryPos && (
                    <Polyline positions={[agentPos, deliveryPos]} color="blue" dashArray="5, 10" />
                )}
            </MapContainer>
        </div>
    );
};

export default LiveTrackingMap;
