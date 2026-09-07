import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Plus, Trash2, Edit2, Search, Upload } from 'lucide-react';
import { Listing } from '../types';

interface AdminPanelProps {
  listings: Listing[];
  onAddListing: (listing: Listing) => void;
  onEditListing: (listing: Listing) => void;
  onDeleteListing: (id: string) => void;
}

export function AdminPanel({ listings, onAddListing, onEditListing, onDeleteListing }: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newListing, setNewListing] = useState<Partial<Listing>>({
    title: '',
    price: 0,
    location: '',
    district: '',
    houseType: 'Apartment',
    bhk: 1,
    amenities: [],
    imageUrl: '',
    roomImages: [],
    description: ''
  });

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    setError(null);
    const titleVal = newListing.title?.trim() || '';
    const priceVal = Number(newListing.price);
    const locationVal = newListing.location?.trim() || '';
    const districtVal = newListing.district?.trim() || '';
    const descVal = newListing.description?.trim() || '';
    const imageVal = newListing.imageUrl?.trim() || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=800';

    if (!titleVal) {
      setError("Please fill in the Property Title.");
      return;
    }
    if (!priceVal || priceVal <= 0) {
      setError("Please fill in a valid Rent Price greater than 0.");
      return;
    }
    if (!locationVal) {
      setError("Please fill in the Location (e.g. Adyar).");
      return;
    }
    if (!districtVal) {
      setError("Please fill in the District (e.g. Chennai).");
      return;
    }

    const listing: Listing = {
      ...newListing as Listing,
      id: editingId || 'l_' + Date.now().toString(),
      title: titleVal,
      price: priceVal,
      location: locationVal,
      district: districtVal,
      description: descVal,
      imageUrl: imageVal,
      houseType: newListing.houseType || 'Apartment',
      bhk: Number(newListing.bhk) || 1,
      createdAt: editingId ? newListing.createdAt! : new Date(),
      amenities: typeof newListing.amenities === 'string' 
        ? (newListing.amenities as string).split(',').map(s => s.trim()) 
        : newListing.amenities || []
    };
    
    if (editingId) {
      onEditListing(listing);
    } else {
      onAddListing(listing);
    }

    setIsAdding(false);
    setEditingId(null);
    setError(null);
    setNewListing({
      title: '', price: 0, location: '', district: '', houseType: 'Apartment', bhk: 1, amenities: [], imageUrl: '', description: ''
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setError(null);
    setNewListing({
      title: '', price: 0, location: '', district: '', houseType: 'Apartment', bhk: 1, amenities: [], imageUrl: '', description: ''
    });
  };

  const startEdit = (listing: Listing) => {
    setNewListing({
      ...listing,
      amenities: listing.amenities?.join(', ') as any
    });
    setEditingId(listing.id);
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Admin Panel</h2>
          <p className="text-sm text-slate-500">Manage rental listings, add new properties, or remove old ones.</p>
        </div>
        <Button onClick={isAdding ? handleCancel : () => setIsAdding(true)} className="bg-slate-900 text-white rounded-full px-6">
          <Plus className="w-4 h-4 mr-2" /> {isAdding ? 'Cancel' : 'Add Property'}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-emerald-100 bg-emerald-50/30 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg">{editingId ? 'Edit Property' : 'Add New Property'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold leading-relaxed animate-fade-in">
                ⚠️ {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Property Title" value={newListing.title} onChange={e => setNewListing({...newListing, title: e.target.value})} />
              <Input type="number" placeholder="Rent Price (₹)" value={newListing.price || ''} onChange={e => setNewListing({...newListing, price: e.target.value})} />
              <Input placeholder="Location (e.g., Adyar)" value={newListing.location} onChange={e => setNewListing({...newListing, location: e.target.value})} />
              <Input placeholder="District (e.g., Chennai)" value={newListing.district} onChange={e => setNewListing({...newListing, district: e.target.value})} />
              <select className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={newListing.houseType} onChange={e => setNewListing({...newListing, houseType: e.target.value})}>
                <option value="Apartment">Apartment</option>
                <option value="Independent House">Independent House</option>
                <option value="Villa">Villa</option>
                <option value="Studio">Studio</option>
              </select>
              <Input type="number" placeholder="BHK" value={newListing.bhk || ''} onChange={e => setNewListing({...newListing, bhk: e.target.value})} />
              <div className="col-span-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Property Image</label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter Image URL" 
                    value={newListing.imageUrl} 
                    onChange={e => setNewListing({...newListing, imageUrl: e.target.value})}
                    className="flex-1"
                  />
                  <div className="relative flex items-center justify-center bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md px-4 cursor-pointer transition-colors w-32 shrink-0">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewListing({...newListing, imageUrl: reader.result as string});
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                    <Upload className="w-4 h-4 text-slate-600 mr-2" />
                    <span className="text-sm font-medium text-slate-600">Upload</span>
                  </div>
                </div>
              </div>
              <Input placeholder="Amenities (comma separated)" value={newListing.amenities?.toString()} onChange={e => setNewListing({...newListing, amenities: e.target.value})} />
            </div>
            <Input placeholder="Description" value={newListing.description} onChange={e => setNewListing({...newListing, description: e.target.value})} />
            <Button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">{editingId ? 'Update Property' : 'Save Property'}</Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 shadow-sm rounded-2xl bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-100 relative bg-slate-50">
          <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search listings by title or district..." 
            className="pl-10 bg-white border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="divide-y divide-slate-100">
          {filteredListings.map(listing => (
            <div key={listing.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <img src={listing.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover bg-slate-200" />
                <div>
                  <h4 className="font-medium text-slate-900">{listing.title}</h4>
                  <p className="text-xs text-slate-500">{listing.location}, {listing.district} • ₹{listing.price}/mo</p>
                  <div className="flex gap-1 mt-1">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{listing.houseType}</Badge>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-slate-200">{listing.bhk} BHK</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => startEdit(listing)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDeleteListing(listing.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {filteredListings.length === 0 && (
            <div className="p-8 text-center text-slate-500">No properties found.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
