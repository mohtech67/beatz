import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChurchSettings } from '../types';
import { Settings, Download, Save, Church, ShieldCheck, Database } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { token, showToast } = useAuth();
  const [settings, setSettings] = useState<ChurchSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSettings(await res.json());
    } catch (err) {
      showToast('Error loading settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        showToast('System settings updated successfully', 'success');
      }
    } catch (err) {
      showToast('Error updating settings', 'error');
    }
  };

  const handleDownloadSqlScript = () => {
    window.open('/api/database/export-sql', '_blank');
    showToast('Downloading complete MySQL schema & seed SQL file...', 'info');
  };

  const handleDownloadPhpBackend = () => {
    window.open('/api/database/export-php', '_blank');
    showToast('Downloading PHP + MySQL PDO REST API script (api.php)...', 'info');
  };

  if (!settings) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#003366]">Administrative Settings & Database Exporter</h2>
          <p className="text-xs text-slate-500">
            Configure church identity, receipt numbering prefixes, security timeouts, and download MySQL SQL scripts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownloadSqlScript}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            <span>Export MySQL SQL</span>
          </button>

          <button
            onClick={handleDownloadPhpBackend}
            className="px-3.5 py-2 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export PHP API (api.php)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Church Profile Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Church className="w-4 h-4 text-[#003366]" />
            <span>Church Identity & Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Church Name</label>
              <input
                type="text"
                value={settings.churchName}
                onChange={(e) => setSettings({ ...settings, churchName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Motto</label>
              <input
                type="text"
                value={settings.motto}
                onChange={(e) => setSettings({ ...settings, motto: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl italic"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Physical Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Pastor Name</label>
              <input
                type="text"
                value={settings.pastorName}
                onChange={(e) => setSettings({ ...settings, pastorName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-semibold"
              />
            </div>
          </div>
        </div>

        {/* Operational & Financial Settings Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-600" />
            <span>Prefixes & Security Parameters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Receipt Number Prefix</label>
              <input
                type="text"
                value={settings.receiptPrefix}
                onChange={(e) => setSettings({ ...settings, receiptPrefix: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Membership ID Prefix</label>
              <input
                type="text"
                value={settings.membershipPrefix}
                onChange={(e) => setSettings({ ...settings, membershipPrefix: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Default Currency</label>
              <input
                type="text"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save System Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
