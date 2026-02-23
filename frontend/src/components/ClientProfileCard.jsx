import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { User, Users, Globe, MapPin, Mail, Phone, Briefcase, Linkedin, Twitter, Facebook, Instagram, Link as LinkIcon } from 'lucide-react';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const ClientProfileCard = ({ personalDetails }) => {
    const [coords, setCoords] = useState([20.5937, 78.9629]); // Default to India center
    const [loadingMap, setLoadingMap] = useState(false);

    const {
        full_name = "Client Name",
        dob_or_age = "N/A",
        occupation = "N/A",
        contact_info = {},
        family_tree = [],
        digital_footprint = [],
        residential_address = {}
    } = personalDetails || {};

    // Geocoding effect
    useEffect(() => {
        if (residential_address?.city || residential_address?.full_address) {
            const query = residential_address.full_address || `${residential_address.city}, ${residential_address.country}`;
            setLoadingMap(true);
            fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) {
                        setCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                    }
                })
                .catch(err => console.error("Geocoding error:", err))
                .finally(() => setLoadingMap(false));
        }
    }, [residential_address]);

    const getSocialIcon = (platform) => {
        const p = platform.toLowerCase();
        if (p.includes('linkedin')) return <Linkedin className="w-4 h-4 text-[#0077b5]" />;
        if (p.includes('twitter') || p.includes('x.com')) return <Twitter className="w-4 h-4 text-[#1da1f2]" />;
        if (p.includes('facebook')) return <Facebook className="w-4 h-4 text-[#1877f2]" />;
        if (p.includes('instagram')) return <Instagram className="w-4 h-4 text-[#e1306c]" />;
        return <LinkIcon className="w-4 h-4 text-slate-500" />;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Main Profile Info */}
            <div className="glass-card p-0 lg:col-span-2 overflow-hidden flex flex-col md:flex-row">
                <div className="bg-slate-900 p-8 flex flex-col items-center justify-center text-center w-full md:w-1/3 min-h-[250px]">
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-xl border-4 border-slate-800">
                        <span className="text-4xl font-bold text-white">
                            {full_name.charAt(0)}
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-1">{full_name}</h2>
                    <p className="text-indigo-300 text-sm font-medium mb-4">{occupation}</p>

                    <div className="flex gap-4">
                        {contact_info.email && (
                            <a href={`mailto:${contact_info.email}`} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                                <Mail className="w-4 h-4" />
                            </a>
                        )}
                        {contact_info.phone && (
                            <a href={`tel:${contact_info.phone}`} className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all">
                                <Phone className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                </div>

                <div className="p-8 w-full md:w-2/3 bg-white">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-500" /> Personal Details
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Age / DOB</p>
                            <p className="font-semibold text-slate-900">{dob_or_age}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 uppercase font-bold mb-1">Occupation</p>
                            <p className="font-semibold text-slate-900 flex items-center gap-2">
                                <Briefcase className="w-3 h-3 text-slate-400" /> {occupation}
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <p className="text-xs text-slate-400 uppercase font-bold mb-2">Digital Footprint</p>
                            <div className="flex flex-wrap gap-2">
                                {digital_footprint?.length > 0 ? (
                                    digital_footprint.map((item, idx) => (
                                        <a
                                            key={idx}
                                            href={item.handle_or_link.startsWith('http') ? item.handle_or_link : `https://${item.handle_or_link}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all flex items-center gap-2"
                                        >
                                            {getSocialIcon(item.platform)}
                                            {item.platform}
                                        </a>
                                    ))
                                ) : (
                                    <span className="text-sm text-slate-400 italic">No social profiles found</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address & Map */}
            <div className="glass-card p-0 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-500" /> Residential Address
                    </h3>
                </div>
                <div className="relative h-48 w-full bg-slate-100">
                    <MapContainer center={coords} zoom={13} style={{ height: '100%', width: '100%' }} key={coords.join(',')}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={coords}>
                            <Popup>
                                {residential_address?.full_address || "Client Residence"}
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>
                <div className="p-5 bg-white flex-1">
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        {residential_address?.full_address || "No address details available."}
                    </p>
                    {residential_address?.city && (
                        <div className="mt-3 flex gap-2">
                            <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-500 font-bold">{residential_address.city}</span>
                            <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-500 font-bold">{residential_address.country}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Family Tree Section */}
            <div className="glass-card col-span-1 lg:col-span-3 p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-600" /> Family Structure
                </h3>

                {family_tree?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {family_tree.map((member, idx) => (
                            <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-center gap-4 hover:shadow-md transition-all">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-slate-400">
                                    {member.name ? member.name.charAt(0) : '?'}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{member.name || 'Unknown'}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-bold text-white bg-emerald-500 px-2 py-0.5 rounded-full uppercase">
                                            {member.relation}
                                        </span>
                                        <span className="text-xs text-slate-500">{member.age || 'Age N/A'}</span>
                                    </div>
                                    {member.occupation && (
                                        <p className="text-[10px] text-slate-400 mt-1 truncate max-w-[150px]">
                                            {member.occupation}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                        No family details detected in the provided documents.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientProfileCard;
