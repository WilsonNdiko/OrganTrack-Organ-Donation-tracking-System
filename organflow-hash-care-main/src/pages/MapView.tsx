import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import HeartbeatDivider from "@/components/HeartbeatDivider";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapView = () => {
  // Kenya coordinates for major cities
  const locations = {
    "Nairobi Blood Bank": [-1.2864, 36.8172] as LatLngExpression,
    "Nairobi General Hospital": [-1.3000, 36.8000] as LatLngExpression,
    "Mombasa Medical Center": [-4.0435, 39.6682] as LatLngExpression,
    "Coast General Hospital": [-4.0600, 39.6700] as LatLngExpression,
    "Kisumu Regional Hospital": [-0.1022, 34.7617] as LatLngExpression,
    "Nakuru Level 5 Hospital": [-0.3031, 36.0800] as LatLngExpression,
  };

  const routes = [
    {
      from: "Nairobi Blood Bank",
      to: "Nairobi General Hospital",
      organ: "Heart",
      eta: "15 min",
      color: "#ef4444", // red-500
      positions: [locations["Nairobi Blood Bank"], locations["Nairobi General Hospital"]] as LatLngExpression[],
    },
    {
      from: "Mombasa Medical Center",
      to: "Coast General Hospital",
      organ: "Cornea",
      eta: "45 min",
      color: "#3b82f6", // blue-500
      positions: [locations["Mombasa Medical Center"], locations["Coast General Hospital"]] as LatLngExpression[],
    },
    {
      from: "Kisumu Regional Hospital",
      to: "Nakuru Level 5 Hospital",
      organ: "Kidney",
      eta: "1.5 hours",
      color: "#a855f7", // purple-500
      positions: [locations["Kisumu Regional Hospital"], locations["Nakuru Level 5 Hospital"]] as LatLngExpression[],
    },
  ];

  // Center map on Kenya
  const kenyaCenter: LatLngExpression = [-0.0236, 37.9062];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <h1 className="text-4xl font-display font-bold text-foreground mb-2">Live Tracking Map</h1>
          <p className="text-muted-foreground">
            Real-time visualization of organ transport across the network
          </p>
        </div>

        <HeartbeatDivider />

        {/* Map and Routes Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Container - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <Card className="glass-card glow-on-hover">
              <CardHeader>
                <CardTitle className="font-display">Live Organ Transport Map</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full h-[400px] rounded-b-lg overflow-hidden">
                  <MapContainer
                    center={kenyaCenter}
                    zoom={7}
                    style={{ height: '100%', width: '100%' }}
                    className="rounded-b-lg"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Add markers for all locations */}
                    {Object.entries(locations).map(([name, position]) => (
                      <Marker key={name} position={position}>
                        <Popup>
                          <div className="text-center p-2">
                            <strong className="text-sm">{name}</strong>
                            <br />
                            <small className="text-muted-foreground">Organ transport hub</small>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Add route polylines */}
                    {routes.map((route, index) => (
                      <Polyline
                        key={index}
                        positions={route.positions}
                        color={route.color}
                        weight={4}
                        opacity={0.8}
                      />
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Routes - Takes 1/3 of the space */}
          <div>
            <Card className="glass-card glow-on-hover">
              <CardHeader>
                <CardTitle className="font-display">Active Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routes.map((route, index) => (
                    <div
                      key={index}
                      className="p-4 bg-accent/30 rounded-lg animate-slide-up border border-border/50"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Navigation className={`w-4 h-4 ${route.color}`} />
                        <span className="font-medium text-sm">{route.organ} Transport</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">From</p>
                          <p className="font-medium truncate">{route.from}</p>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">ETA:</span>
                          <span className="font-medium text-primary">{route.eta}</span>
                        </div>
                        <div>
                          <p className="text-muted-foreground">To</p>
                          <p className="font-medium truncate">{route.to}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
