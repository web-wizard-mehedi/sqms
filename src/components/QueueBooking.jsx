import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { socket } from '../socket';

const serviceTypes = [
  'Hospital',
  'Bank',
  'Government Office',
  'Post Office',
  'DMV'
];

const timeSlots = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM'
];

export const QueueBooking = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  useEffect(() => {
    socket.on('queueUpdate', (update) => {
      if (update.status === 'serving') {
        toast.success(`Now serving queue #${update.queueNumber}`);
      }
    });

    return () => {
      socket.off('queueUpdate');
    };
  }, []);

  const onSubmit = async (data) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login to book a queue');
        return;
      }

      const response = await fetch('https://qms-19az.onrender.com/api/queue/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      socket.emit('joinQueue', result.bookingId);
      toast.success(result.message);
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to book queue');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Your Queue</h2>
        <p className="text-gray-600">Select your service and preferred time slot</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Type
          </label>
          <div className="relative">
            <select
              {...register('serviceType', { required: 'Service type is required' })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a service</option>
              {serviceTypes.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
            {errors.serviceType && (
              <p className="mt-1 text-sm text-red-600">{errors.serviceType.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Time Slot
          </label>
          <div className="relative">
            <select
              {...register('timeSlot', { required: 'Time slot is required' })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a time slot</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            {errors.timeSlot && (
              <p className="mt-1 text-sm text-red-600">{errors.timeSlot.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Booking...' : 'Book Queue'}
        </button>
      </form>
    </div>
  );
};