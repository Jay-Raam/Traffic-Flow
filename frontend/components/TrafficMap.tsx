"use client";

import { Circle, MapContainer, TileLayer, Tooltip } from "react-leaflet";

import { TrafficDatum } from "@/types/traffic";

const coords: Record<string, [number, number]> = {
    "Anna Salai": [13.0604, 80.2662],
    "T Nagar": [13.0418, 80.2337],
    Guindy: [13.0104, 80.2207],
    OMR: [12.9177, 80.2295],
    Velachery: [12.9791, 80.2186],
    Tambaram: [12.9249, 80.1275],
};

const colorByLevel = {
    low: "#16a34a",
    medium: "#eab308",
    high: "#dc2626",
};

export default function TrafficMap({ data }: { data: TrafficDatum[] }) {
    return (
        <div className="panel h-[520px] overflow-hidden p-0">
            <MapContainer center={[13.025, 80.22]} zoom={11} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' />
                {data.map((point) => {
                    const center = coords[point.area] || [13.025, 80.22];
                    const radius = 250 + point.vehicles * 6;
                    return (
                        <Circle
                            key={point.area}
                            center={center}
                            radius={radius}
                            pathOptions={{
                                color: colorByLevel[point.congestion_level],
                                fillColor: colorByLevel[point.congestion_level],
                                fillOpacity: 0.28,
                            }}
                        >
                            <Tooltip>
                                <div className="text-sm">
                                    <p className="font-semibold">{point.area}</p>
                                    <p>Vehicles: {point.vehicles}</p>
                                    <p>Congestion: {point.congestion_level}</p>
                                </div>
                            </Tooltip>
                        </Circle>
                    );
                })}
            </MapContainer>
        </div>
    );
}
