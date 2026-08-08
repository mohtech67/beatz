import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Member, Department } from '../types';
import {
  Users,
  Search,
  Plus,
  Filter,
  Download,
  Edit,
  Eye,
  UserCheck,
  UserX,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
} from 'lucide-react';

export const MembersPage: React.FC = () => {
  const { token, user, showToast } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editMember, setEditMember] = useState<Member | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    dob: '1990-01-01',
    gender: 'Male',
    nationalId: '',
    phone: '',
    email: '',
    currentLocation: 'Kitale',
    address: 'P.O. Box 100, Kitale',
    departmentId: 'dept-1',
    baptismStatus: 'Baptized',
    baptismDate: '2010-01-01',
    maritalStatus: 'Single',
    nextOfKin: '',
    nextOfKinPhone: '',
    notes: '',
  });

  const canEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'MEMBER_ADMIN';

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/members', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch (err) {
      showToast('Error loading members list', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create member');

      showToast(`Member ${data.fullName} registered successfully`, 'success');
      setShowAddModal(false);
      fetchMembers();
    } catch (err: any) {
      showToast(err.message || 'Error registering member', 'error');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Member No,Full Name,Gender,Phone,National ID,Department,Baptism Status,Status\n'];
    const rows = filteredMembers.map(
      (m) =>
        `"${m.memberNo}","${m.fullName}","${m.gender}","${m.phone}","${m.nationalId}","${m.departmentName || ''}","${m.baptismStatus}","${m.status}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bidii_sda_members_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Exported member directory to CSV', 'info');
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.nationalId.includes(searchTerm);

    const matchesDept = deptFilter ? m.departmentId === deptFilter : true;
    const matchesStatus = statusFilter ? m.status === statusFilter : true;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#003366]">Church Members Registry</h2>
          <p className="text-xs text-slate-500">
            Manage membership records, baptism records, and personal profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Name, Member No, Phone, ID..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#003366]"
          />
        </div>

        <div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#003366]"
          >
            <option value="">All Departments</option>
            <option value="dept-1">Sabbath School</option>
            <option value="dept-2">Adventist Youth (AY)</option>
            <option value="dept-3">Church Choir & Music</option>
            <option value="dept-4">Personal Ministries</option>
            <option value="dept-5">Dorcas & Welfare</option>
            <option value="dept-6">Stewardship & Treasury</option>
            <option value="dept-7">Womens Ministries</option>
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#003366]"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Transferred">Transferred</option>
          </select>
        </div>
      </div>

      {/* Members Grid / Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-start gap-3">
              <img
                src={
                  m.photoUrl ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80'
                }
                alt={m.fullName}
                className="w-14 h-14 rounded-full object-cover border-2 border-amber-400 shrink-0 shadow-sm"
              />
              <div className="overflow-hidden min-w-0">
                <span className="font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mb-1">
                  {m.memberNo}
                </span>
                <h3 className="font-bold text-sm text-slate-900 truncate">{m.fullName}</h3>
                <p className="text-xs text-slate-500 truncate">{m.departmentName || 'Sabbath School'}</p>
              </div>
            </div>

            <div className="my-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono">{m.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{m.currentLocation}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    m.baptismStatus === 'Baptized'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {m.baptismStatus}
                </span>
                <span className="text-[10px] font-bold text-slate-400">ID: {m.nationalId}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setSelectedMember(m)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-[#003366] text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Full Profile</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-base text-[#003366]">Register New Church Member</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">National ID Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  >
                    <option value="dept-1">Sabbath School</option>
                    <option value="dept-2">Adventist Youth (AY)</option>
                    <option value="dept-3">Church Choir & Music</option>
                    <option value="dept-4">Personal Ministries</option>
                    <option value="dept-5">Dorcas & Welfare</option>
                    <option value="dept-6">Stewardship & Treasury</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Baptism Status</label>
                  <select
                    value={formData.baptismStatus}
                    onChange={(e) => setFormData({ ...formData, baptismStatus: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  >
                    <option value="Baptized">Baptized</option>
                    <option value="Not Baptized">Not Baptized</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Physical Location</label>
                  <input
                    type="text"
                    value={formData.currentLocation}
                    onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                    className="w-full p-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#003366] text-white font-bold rounded-xl shadow-md"
                >
                  Save Member Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Member Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMember.photoUrl}
                  alt={selectedMember.fullName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md"
                />
                <div>
                  <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {selectedMember.memberNo}
                  </span>
                  <h3 className="font-bold text-base text-slate-900">{selectedMember.fullName}</h3>
                  <p className="text-xs text-slate-500">{selectedMember.departmentName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="p-1 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">National ID:</span>
                <span className="font-mono font-bold text-slate-900">{selectedMember.nationalId}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Phone Number:</span>
                <span className="font-mono font-bold text-slate-900">{selectedMember.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Baptism Status:</span>
                <span className="font-bold text-emerald-700">{selectedMember.baptismStatus}</span>
              </div>
              <div className="flex justify-between py-1 border-b">
                <span className="text-slate-500">Next of Kin:</span>
                <span className="font-semibold text-slate-900">{selectedMember.nextOfKin || 'N/A'} ({selectedMember.nextOfKinPhone || 'N/A'})</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedMember(null)}
              className="w-full py-2.5 bg-[#003366] text-white font-bold text-xs rounded-xl"
            >
              Close Member Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
