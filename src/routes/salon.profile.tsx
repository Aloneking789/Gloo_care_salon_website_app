import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Star, 
  MapPin, 
  Navigation, 
  Locate, 
  Save, 
  X, 
  Edit, 
  CheckCircle,
  Mail,
  Phone,
  User,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import type { UpdateSalonProfileRequest } from '@/lib/types';

export const Route = createFileRoute('/salon/profile')({
  component: ProfilePage,
});

const INDIAN_STATE_CODES: Record<string, string> = {
  'andhra pradesh': 'AP',
  'arunachal pradesh': 'AR',
  'assam': 'AS',
  'bihar': 'BR',
  'chhattisgarh': 'CG',
  'goa': 'GA',
  'gujarat': 'GJ',
  'haryana': 'HR',
  'himachal pradesh': 'HP',
  'jharkhand': 'JH',
  'karnataka': 'KA',
  'kerala': 'KL',
  'madhya pradesh': 'MP',
  'maharashtra': 'MH',
  'manipur': 'MN',
  'meghalaya': 'ML',
  'mizoram': 'MZ',
  'nagaland': 'NL',
  'odisha': 'OD',
  'punjab': 'PB',
  'rajasthan': 'RJ',
  'sikkim': 'SK',
  'tamil nadu': 'TN',
  'telangana': 'TG',
  'tripura': 'TR',
  'uttar pradesh': 'UP',
  'uttarakhand': 'UK',
  'west bengal': 'WB',
  'andaman and nicobar islands': 'AN',
  'chandigarh': 'CH',
  'dadra and nagar haveli and daman and diu': 'DD',
  'delhi': 'DL',
  'jammu and kashmir': 'JK',
  'ladakh': 'LA',
  'lakshadweep': 'LD',
  'puducherry': 'PY'
};

function ProfilePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['profile'], queryFn: api.profile });

  const [isEditing, setIsEditing] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Editable fields
  const [salonName, setSalonName] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  useEffect(() => {
    if (data) {
      setSalonName(data.salonName || '');
      setStreet(data.address?.street || '');
      setCity(data.address?.city || '');
      setState(data.address?.state || '');
      setPincode(data.address?.pincode || '');
      setLatitude(data.location?.lat?.toString() || '');
      setLongitude(data.location?.lng?.toString() || '');
    }
  }, [data]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setLatitude(lat.toFixed(6));
        setLongitude(lng.toFixed(6));
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
            headers: {
              'Accept-Language': 'en'
            }
          });
          const result = await res.json();
          
          if (result && result.address) {
            const addr = result.address;
            
            const resolvedCity = addr.city || addr.town || addr.village || addr.subregion || '';
            const resolvedState = addr.state || '';
            const resolvedPincode = addr.postcode ? addr.postcode.replace(/\s+/g, '').substring(0, 6) : '';
            
            const streetParts = [];
            if (addr.road) streetParts.push(addr.road);
            if (addr.suburb) streetParts.push(addr.suburb);
            if (addr.neighbourhood) streetParts.push(addr.neighbourhood);
            
            const resolvedStreet = streetParts.join(', ') || addr.display_name || '';
            
            setStreet(resolvedStreet);
            setCity(resolvedCity);
            
            const stateClean = resolvedState.toLowerCase().trim();
            const stateCode = INDIAN_STATE_CODES[stateClean] || resolvedState.substring(0, 2).toUpperCase();
            setState(stateCode);
            setPincode(resolvedPincode);
            
            toast.success('Location coordinates & address details auto-filled!');
          } else {
            toast.success('Location coordinates set successfully.');
          }
        } catch (err) {
          console.error(err);
          toast.success('Location coordinates set successfully.');
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        setIsFetchingLocation(false);
        toast.error('Failed to get current location: ' + error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const validateForm = () => {
    if (!salonName.trim()) {
      toast.error('Please enter salon name');
      return false;
    }
    if (!street.trim()) {
      toast.error('Please enter street address');
      return false;
    }
    if (!city.trim()) {
      toast.error('Please enter city');
      return false;
    }
    if (!state.trim()) {
      toast.error('Please enter state');
      return false;
    }
    if (!pincode.trim() || pincode.length !== 6) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    if (!latitude.trim() || !longitude.trim()) {
      toast.error('Please set location coordinates');
      return false;
    }
    
    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (isNaN(latNum) || isNaN(lngNum)) {
      toast.error('Invalid latitude or longitude coordinates');
      return false;
    }
    if (latNum < -90 || latNum > 90) {
      toast.error('Latitude must be between -90 and 90');
      return false;
    }
    if (lngNum < -180 || lngNum > 180) {
      toast.error('Longitude must be between -180 and 180');
      return false;
    }

    return true;
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: UpdateSalonProfileRequest = {
        salonName: salonName.trim(),
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        },
        location: {
          lat: parseFloat(latitude),
          lng: parseFloat(longitude),
        }
      };
      return api.updateProfile(payload);
    },
    onSuccess: () => {
      toast.success('Salon profile updated successfully!');
      qc.invalidateQueries({ queryKey: ['profile'] });
      setIsEditing(false);
    },
    onError: (e: Error) => {
      if ((e as any)?.message?.toLowerCase?.().includes('session expired') || (e as any)?.status === 401) return;
      toast.error(e.message || 'Failed to update profile');
    }
  });

  const handleCancel = () => {
    if (data) {
      setSalonName(data.salonName || '');
      setStreet(data.address?.street || '');
      setCity(data.address?.city || '');
      setState(data.address?.state || '');
      setPincode(data.address?.pincode || '');
      setLatitude(data.location?.lat?.toString() || '');
      setLongitude(data.location?.lng?.toString() || '');
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Profile" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Profile" 
        description="Your salon details" 
        actions={
          !isEditing && data && (
            <Button onClick={() => setIsEditing(true)} className="gap-2 cursor-pointer">
              <Edit className="h-4 w-4" /> Edit Details
            </Button>
          )
        }
      />

      {data && (
        <Card className="overflow-hidden border group transition-all duration-300 hover:shadow-md">
          <CardContent className="flex flex-col sm:flex-row items-center gap-6 p-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-bold text-3xl border border-primary/20 shadow-inner select-none">
              {data.salonName?.[0]?.toUpperCase() ?? 'S'}
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1.5 min-w-0">
              <h3 className="font-extrabold text-2xl text-foreground truncate">{data.salonName}</h3>
              <p className="text-sm font-semibold text-muted-foreground flex items-center justify-center sm:justify-start gap-1">
                <User className="h-4 w-4 shrink-0 text-primary" />
                <span>Owner: {data.ownerName}</span>
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1.5 text-xs text-muted-foreground font-medium">
                <span className="flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full select-none font-bold">
                  <Star className="h-3 w-3 fill-current" />
                  {data.rating ?? 0} Rating
                </span>
                <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full select-none font-bold">
                  {data.barbersCount ?? 0} Staff Members
                </span>
                <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-2 py-0.5 rounded-full select-none font-bold capitalize">
                  {data.mode} Mode
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact Info (Always Read-only) */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
            <CardDescription>System values (cannot be updated)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <Label className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Email Address</Label>
              <div className="flex items-center gap-2 text-foreground font-semibold bg-muted/30 border p-3 rounded-lg">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span className="truncate">{data?.email || '—'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Mobile Number</Label>
              <div className="flex items-center gap-2 text-foreground font-semibold bg-muted/30 border p-3 rounded-lg">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>{data?.phone || '—'}</span>
              </div>
            </div>
            {isEditing && (
              <div className="flex items-start gap-2 bg-amber-500/5 text-amber-600 border border-amber-500/10 rounded-lg p-3 text-xs leading-normal">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Mobile and Email can only be changed by contacting customer support.</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address and Location Configuration */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg">Salon Details & Address</CardTitle>
              <CardDescription>Manage your public salon name and physical store location</CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Salon Name Input */}
              <div className="space-y-2">
                <Label htmlFor="salonName">Salon Name *</Label>
                {isEditing ? (
                  <Input 
                    id="salonName" 
                    value={salonName} 
                    onChange={(e) => setSalonName(e.target.value)} 
                    placeholder="e.g. Barber Pro Shop"
                  />
                ) : (
                  <div className="text-sm font-semibold text-foreground p-3 bg-muted/20 border rounded-lg">
                    {data?.salonName || '—'}
                  </div>
                )}
              </div>

              {/* Address details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground border-b pb-1">
                  <MapPin className="h-4 w-4 text-primary" />
                  Address Details
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="street">Street Address *</Label>
                      <Input 
                        id="street" 
                        value={street} 
                        onChange={(e) => setStreet(e.target.value)} 
                        placeholder="e.g. Suite 101, MG Road"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="city">City *</Label>
                        <Input 
                          id="city" 
                          value={city} 
                          onChange={(e) => setCity(e.target.value)} 
                          placeholder="e.g. Mumbai"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="state">State *</Label>
                        <Input 
                          id="state" 
                          value={state} 
                          onChange={(e) => setState(e.target.value)} 
                          placeholder="e.g. MH"
                          maxLength={2}
                          className="uppercase"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="pincode">Pincode *</Label>
                        <Input 
                          id="pincode" 
                          value={pincode} 
                          onChange={(e) => setPincode(e.target.value)} 
                          placeholder="e.g. 400001"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-foreground bg-muted/20 border p-4 rounded-lg space-y-1.5">
                    {data?.address?.street ? (
                      <>
                        <p>{data.address.street}</p>
                        <p className="text-muted-foreground text-xs font-semibold">
                          {[data.address.city, data.address.state, data.address.pincode].filter(Boolean).join(', ')}
                        </p>
                      </>
                    ) : (
                      <p className="text-muted-foreground text-xs italic">No address configured.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Coordinates details */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between gap-2 text-sm font-semibold text-muted-foreground border-b pb-1">
                  <span className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-primary" />
                    Location Coordinates
                  </span>
                  {isEditing && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleGetCurrentLocation}
                      disabled={isFetchingLocation}
                      className="h-7 text-[11px] gap-1 cursor-pointer font-bold"
                    >
                      <Locate className={`h-3 w-3 ${isFetchingLocation ? 'animate-spin' : ''}`} />
                      {isFetchingLocation ? 'Locating...' : 'Get Current Location'}
                    </Button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="latitude">Latitude *</Label>
                        <Input 
                          id="latitude" 
                          value={latitude} 
                          onChange={(e) => setLatitude(e.target.value)} 
                          placeholder="e.g. 19.0760"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="longitude">Longitude *</Label>
                        <Input 
                          id="longitude" 
                          value={longitude} 
                          onChange={(e) => setLongitude(e.target.value)} 
                          placeholder="e.g. 72.8777"
                        />
                      </div>
                    </div>
                    {latitude && longitude && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-lg font-semibold">
                        <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                        <span>Coordinates successfully captured: {parseFloat(latitude).toFixed(4)}°, {parseFloat(longitude).toFixed(4)}°</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm font-semibold text-foreground bg-muted/20 border p-3.5 rounded-lg flex items-center gap-2 justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Coordinates</span>
                    <span className="font-mono text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded select-all">
                      {data?.location?.lat !== undefined && data?.location?.lng !== undefined 
                        ? `${data.location.lat.toFixed(6)}, ${data.location.lng.toFixed(6)}` 
                        : 'Not set'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions in Edit Mode */}
            {isEditing && (
              <div className="flex gap-2 pt-4 border-t border-border/50">
                <Button 
                  variant="outline" 
                  onClick={handleCancel} 
                  disabled={saveMutation.isPending}
                  className="flex-1 cursor-pointer"
                >
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
                <Button 
                  onClick={() => validateForm() && saveMutation.mutate()} 
                  disabled={saveMutation.isPending}
                  className="flex-1 cursor-pointer"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({
  label, id, value, onChange, type = 'text',
}: { label: string; id: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
