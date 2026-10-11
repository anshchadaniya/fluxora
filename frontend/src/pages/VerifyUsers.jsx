import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FaCheck, FaTimes, FaBan, FaBuilding, FaUser } from 'react-icons/fa';

const VerifyUsers = () => {
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users', {
        params: { status: statusFilter === 'all' ? undefined : statusFilter },
      });
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
    try {
      const res = await API.put(`/admin/users/${userId}/${action}`);
      if (res.data?.success) {
        toast.success(`User ${action}ed successfully`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(`Action ${action} failed`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            User Verification & Moderation
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Approve industrial sellers and certified recyclers to maintain platform trust.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-1.5 bg-gray-100 p-1.5 rounded-2xl border border-gray-200">
          {['pending', 'verified', 'rejected', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs px-3.5 py-1.5 rounded-xl font-bold capitalize transition-all duration-200 cursor-pointer ${
                statusFilter === st
                  ? 'bg-btn-primary text-white shadow-sm ring-2 ring-primary/20'
                  : 'text-gray-600 hover:text-teal-700 hover:bg-gray-200/60'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-gray-400">Loading participants...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-200 p-8 shadow-xs">
          <p className="text-gray-500 text-sm">No users found with status: {statusFilter}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th className="p-4">Contact Name</th>
                  <th className="p-4">Company Name</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">City</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4">Blocked</th>
                  <th className="p-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-teal-50/20 transition">
                    <td className="p-4 font-bold text-gray-900">{u.name}</td>
                    <td className="p-4 text-gray-600 font-medium">{u.companyName || '—'}</td>
                    <td className="p-4">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{u.city}</td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                          u.verificationStatus === 'verified'
                            ? 'bg-emerald-100 text-emerald-800'
                            : u.verificationStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {u.verificationStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      {u.isBlocked ? (
                        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                          BLOCKED
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400">Active</span>
                      )}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {u.verificationStatus !== 'verified' && (
                        <button
                          onClick={() => handleAction(u._id, 'verify')}
                          className="bg-btn-primary hover:opacity-95 text-white font-bold px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer shadow-sm"
                        >
                          <FaCheck className="inline mr-1" /> Verify
                        </button>
                      )}

                      {u.verificationStatus !== 'rejected' && (
                        <button
                          onClick={() => handleAction(u._id, 'reject')}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer"
                        >
                          <FaTimes className="inline mr-1" /> Reject
                        </button>
                      )}

                      <button
                        onClick={() => handleAction(u._id, 'block')}
                        className={`font-bold px-2.5 py-1 rounded-lg text-[11px] transition cursor-pointer ${
                          u.isBlocked
                            ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        <FaBan className="inline mr-1" /> {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyUsers;
