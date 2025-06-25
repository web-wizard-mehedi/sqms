import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { User, Clock, Calendar, CheckCircle2, XCircle, AlertCircle, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { socket } from '../socket';

export const UserDashboard = () => {
  const { user, updateUserProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || ''
    }
  });

  useEffect(() => {
    fetchBookings();
    socket.on('queueUpdate', handleQueueUpdate);
    return () => socket.off('queueUpdate');
  }, []);

  const handleQueueUpdate = (update) => {
    setBookings(prev => prev.map(b => b._id === update.queueId ? { ...b, status: update.status } : b));
    if (update.status === 'serving') toast.success(`It's your turn! Queue #${update.queueNumber} is now being served.`);
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://qms-19az.onrender.com/api/user/bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBookings(data);
      data.forEach(b => b.status !== 'completed' && socket.emit('joinQueue', b._id));
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await updateUserProfile(data.name, data.phone);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      completed: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      canceled: <XCircle className="w-5 h-5 text-red-500" />,
      serving: <Clock className="w-5 h-5 text-blue-500" />,
      pending: <AlertCircle className="w-5 h-5 text-yellow-500" />
    };
    return icons[status] || <AlertCircle className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-teal-50 py-8 px-4 md:px-12">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Profile */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-teal-600">My Profile</h2>
            <button onClick={() => { setIsEditing(!isEditing); reset(user); }} className="text-teal-500 hover:text-teal-700 flex items-center gap-1">
              <Pencil className="w-4 h-4" /> {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input {...register('name', { required: 'Name is required' })} className="input-field" />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input {...register('phone', { required: 'Phone is required' })} className="input-field" />
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
              <button type="submit" className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">Save Changes</button>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-800"><User className="w-5 h-5" /> {user?.name}</div>
              <div className="flex items-center gap-2 text-gray-800"><Clock className="w-5 h-5" /> {user?.phone}</div>
              <div className="flex items-center gap-2 text-gray-800"><Calendar className="w-5 h-5" /> {user?.email}</div>
            </div>
          )}
        </div>

        {/* Bookings */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-bold text-teal-600 mb-6">My Bookings</h2>
          {isLoading ? (
            <div className="text-center text-gray-500">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="text-center text-gray-500">No bookings found</div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div key={b._id} className="border rounded-lg p-4 bg-gray-50 hover:bg-white transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{b.serviceType}</h3>
                      <p className="text-sm text-gray-500">Queue Number: #{b.queueNumber}</p>
                      <div className="text-sm text-gray-500 mt-2">{new Date(b.date).toLocaleDateString()} | {b.timeSlot}</div>
                      {b.status === 'pending' && <p className="text-sm text-gray-500 mt-1">Current Position: #{b.position}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(b.status)}
                      <span className="capitalize text-sm text-gray-700">{b.status === 'serving' ? 'Now Serving' : b.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
