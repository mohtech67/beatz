import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChurchAsset } from '../types';
import { Package, Plus, Search, DollarSign, Wrench, ShieldAlert, X } from 'lucide-react';

export const AssetsPage: React.FC = () => {
  const { token, user, showToast } = useAuth();
  const [assets, setAssets] = useState<ChurchAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Audio & Visual');
  const [quantity, setQuantity] = useState('1');
  const [purchaseCost, setPurchaseCost] = useState('');
  const [supplier, setSupplier] = useState('');
  const [location, setLocation] = useState('Sanctuary Stage');
  const [serialNumber, setSerialNumber] = useState('');
  const [description, setDescription] = useState('');

  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'TREASURER';

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setAssets(await res.json());
    } catch (err) {
      showToast('Error loading church asset inventory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity || !purchaseCost) {
      showToast('Name, Quantity, and Cost are required', 'error');
      return;
    }

    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          category,
          quantity,
          purchaseCost,
          supplier,
          location,
          serialNumber,
          description,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed adding asset');

      showToast(`Asset ${data.assetNo} added successfully`, 'success');
      setShowAddModal(false);
      setName('');
      setPurchaseCost('');
      fetchAssets();
    } catch (err: any) {
      showToast(err.message || 'Error adding asset', 'error');
    }
  };

  const totalInventoryValue = assets.reduce((sum, a) => sum + a.totalValue, 0);

  const filteredAssets = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.assetNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#003366]">Church Asset Inventory</h2>
          <p className="text-xs text-slate-500">
            Registered equipment, musical instruments, furniture, and sanctuary physical assets.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Church Asset</span>
          </button>
        )}
      </div>

      {/* Stats Summary Card */}
      <div className="bg-gradient-to-r from-[#002244] to-[#003366] text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <span className="text-xs text-amber-300 font-semibold uppercase tracking-wider block">
            Total Valuation of Physical Assets
          </span>
          <span className="text-3xl font-black font-mono">
            KES {totalInventoryValue.toLocaleString('en-KE')}
          </span>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-300 block">{assets.length} Total Registered Items</span>
          <span className="text-xs text-emerald-400 font-bold">100% Audited</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Asset Name, Asset No, Category..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#003366]"
          />
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div>
              <img
                src={asset.imageUrl}
                alt={asset.name}
                className="w-full h-40 object-cover border-b"
              />
              <div className="p-5 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {asset.assetNo}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{asset.name}</h3>
                    <p className="text-xs text-slate-500">{asset.category}</p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                    {asset.condition}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{asset.description}</p>

                <div className="pt-2 text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Qty × Unit Cost:</span>
                    <span className="font-mono">{asset.quantity} × KES {asset.purchaseCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900 border-t pt-1">
                    <span>Total Valuation:</span>
                    <span className="font-mono text-[#003366]">KES {asset.totalValue.toLocaleString('en-KE')}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Location: {asset.location}</span>
                    <span>Serial: {asset.serialNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-[#003366]">Add Church Asset</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Yamaha Piano or Digital Sound Mixer"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  >
                    <option value="Audio & Visual">Audio & Visual</option>
                    <option value="Music Equipment">Music Equipment</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Vehicles & Transport">Vehicles & Transport</option>
                    <option value="IT & Computers">IT & Computers</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit Purchase Cost (KES) *</label>
                  <input
                    type="number"
                    required
                    value={purchaseCost}
                    onChange={(e) => setPurchaseCost(e.target.value)}
                    placeholder="e.g. 95000"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Sanctuary Stage"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Full weighted keys piano with stand"
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 bg-[#003366] text-white font-bold rounded-xl">
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
