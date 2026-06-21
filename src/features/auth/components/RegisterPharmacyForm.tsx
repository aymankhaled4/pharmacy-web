import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Mail, Lock, Building2, Phone, FileText, MapPin, ArrowRight, ArrowLeft, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRegisterPharmacy } from '../hooks/useRegisterPharmacy';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { cn } from '../../../lib/utils';

// Fix leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const step1Schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  pharmacy_name: z.string().min(2, 'Pharmacy name is required'),
  phone: z.string().min(7, 'Valid phone number is required'),
  license_number: z.string().min(2, 'License number is required'),
  address: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
});

type Step1Values = z.infer<typeof step1Schema>;

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface MapPickerProps {
  position: [number, number] | null;
  onChange: (lat: number, lng: number) => void;
}

function MapPicker({ position, onChange }: MapPickerProps) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return position ? <Marker position={position} /> : null;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 15);
  return null;
}

export default function RegisterPharmacyForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);
  const [mapError, setMapError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const { mutate: register, isPending, error } = useRegisterPharmacy();

  const {
    register: reg,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
  });

  const onStep1Submit = (values: Step1Values) => {
    setStep1Data(values);
    setStep(2);
  };

  const onStep2Submit = () => {
    if (!markerPos) {
      setMapError('Please select your pharmacy location on the map.');
      return;
    }
    if (!step1Data) return;
    setMapError('');
    register({
      ...step1Data,
      latitude: markerPos[0],
      longitude: markerPos[1],
    });
  };

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimeout) clearTimeout(searchTimeout);

    if (value.length < 3) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(value)}&format=json&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data: NominatimResult[] = await res.json();
        setSearchResults(data);
      } catch {
        setSearchResults([]);
      }
    }, 600);

    setSearchTimeout(timeout);
  }, [searchTimeout]);

  const selectResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setMarkerPos([lat, lng]);
    setSearchQuery(result.display_name);
    setSearchResults([]);
  };

  return (
    <div className="w-full rounded-2xl border bg-white p-8 shadow-sm">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Partner with Dawak</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Register your pharmacy to manage inventory and digital reservations.
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-3">
        <div className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
          step >= 1 ? 'bg-[#014AB3] text-white' : 'bg-muted text-muted-foreground'
        )}>
          1
        </div>
        <div className={cn('h-px flex-1', step >= 2 ? 'bg-[#014AB3]' : 'bg-muted')} />
        <div className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold',
          step >= 2 ? 'bg-[#014AB3] text-white' : 'bg-muted text-muted-foreground'
        )}>
          2
        </div>
      </div>

      {/* Step 1 — Info */}
      {step === 1 && (
        <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-6">

          {/* Account Credentials */}
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#014AB3]">
              <Lock className="h-3.5 w-3.5" />
              Account Credentials
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    {...reg('email')}
                    type="email"
                    placeholder="pharmacy@example.com"
                    className={cn('pl-9', errors.email && 'border-destructive')}
                  />
                </div>
                {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <Lock className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    {...reg('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={cn('pl-9 pr-9', errors.password && 'border-destructive')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs"
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
                {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
              </div>
            </div>
          </div>

          {/* Pharmacy Information */}
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#014AB3]">
              <Building2 className="h-3.5 w-3.5" />
              Pharmacy Information
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Official Pharmacy Name</label>
                <div className="relative">
                  <Building2 className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    {...reg('pharmacy_name')}
                    placeholder="e.g. Central Health Pharmacy"
                    className={cn('pl-9', errors.pharmacy_name && 'border-destructive')}
                  />
                </div>
                {errors.pharmacy_name && <p className="text-destructive text-xs">{errors.pharmacy_name.message}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Contact Phone</label>
                  <div className="relative">
                    <Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      {...reg('phone')}
                      placeholder="+20 (100) 000-0000"
                      className={cn('pl-9', errors.phone && 'border-destructive')}
                    />
                  </div>
                  {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Business License Number</label>
                  <div className="relative">
                    <FileText className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      {...reg('license_number')}
                      placeholder="PH-12345-ABC"
                      className={cn('pl-9', errors.license_number && 'border-destructive')}
                    />
                  </div>
                  {errors.license_number && <p className="text-destructive text-xs">{errors.license_number.message}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#014AB3]">
              <MapPin className="h-3.5 w-3.5" />
              Location
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Street Address</label>
                <Input
                  {...reg('address')}
                  placeholder="123 Medical Plaza, Suite 400"
                  className={cn(errors.address && 'border-destructive')}
                />
                {errors.address && <p className="text-destructive text-xs">{errors.address.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">City</label>
                <Input
                  {...reg('city')}
                  placeholder="Cairo"
                  className={cn(errors.city && 'border-destructive')}
                />
                {errors.city && <p className="text-destructive text-xs">{errors.city.message}</p>}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#014AB3] hover:bg-[#0140a0]">
            Next — Pin Location on Map <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      )}

      {/* Step 2 — Map */}
      {step === 2 && (
        <div className="space-y-5">

          {/* Search */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Search for your pharmacy location</label>
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="e.g. El Ezaby Pharmacy, Fayoum"
                className="w-full rounded-md border px-3 py-2 pl-9 text-sm outline-none focus:border-[#014AB3] focus:ring-1 focus:ring-[#014AB3]"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="rounded-md border bg-white shadow-md overflow-hidden">
                {searchResults.map((result) => (
                  <button
                    key={result.place_id}
                    type="button"
                    onClick={() => selectResult(result)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 border-b last:border-0"
                  >
                    {result.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-muted-foreground text-xs">
            Or click directly on the map to pin the exact location.
          </p>

          {/* Map */}
          <div className="overflow-hidden rounded-xl border" style={{ height: 350 }}>
            <MapContainer
              center={markerPos ?? [26.0667, 30.8333]}
              zoom={markerPos ? 15 : 6}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {markerPos && <MapController center={markerPos} />}
              <MapPicker
                position={markerPos}
                onChange={(lat, lng) => setMarkerPos([lat, lng])}
              />
            </MapContainer>
          </div>

          {markerPos && (
            <p className="text-muted-foreground text-xs">
              📍 {markerPos[0].toFixed(5)}, {markerPos[1].toFixed(5)}
            </p>
          )}

          {mapError && <p className="text-destructive text-sm">{mapError}</p>}

          {error && (
            <p className="text-destructive rounded-md bg-red-50 px-3 py-2 text-sm">
              {typeof error === 'string' ? error : 'Registration failed. Please try again.'}
            </p>
          )}

          <p className="text-muted-foreground text-center text-xs">
            By submitting this form, you certify that all provided information is accurate and that
            you hold the legal authority to represent this pharmacy. Dawak performs rigorous
            background verification.
          </p>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setStep(1)}
              disabled={isPending}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button
              type="button"
              className="flex-1 bg-[#014AB3] hover:bg-[#0140a0]"
              onClick={onStep2Submit}
              disabled={isPending}
            >
              {isPending ? 'Submitting...' : (
                <>Submit for Verification <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </div>

          <p className="text-muted-foreground text-center text-sm">
            Already a partner?{' '}
            <Link to="/login" className="text-[#014AB3] font-medium hover:underline">
              Login here
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}