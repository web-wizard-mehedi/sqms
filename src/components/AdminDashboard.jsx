import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ChevronRight, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { socket } from '../socket';
import { Navigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [queues, setQueues] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Redirect non-admin users
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    fetchQueues();
    socket.on('queueUpdate', handleQueueUpdate);

    return () => {
      socket.off('queueUpdate', handleQueueUpdate);
    };
  }, []);

  const fetchQueues = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://qms-19az.onrender.com/api/queue/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch queues');
      }

      const data = await response.json();
      
      // Group queues by service type
      const groupedQueues = data.reduce((acc, queue) => {
        if (!acc[queue.serviceType]) {
          acc[queue.serviceType] = [];
        }
        acc[queue.serviceType].push(queue);
        return acc;
      }, {});

      setQueues(groupedQueues);
    } catch (error) {
      toast.error('Failed to load queues');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQueueUpdate = (update) => {
    setQueues(prevQueues => {
      const newQueues = { ...prevQueues };
      const serviceType = update.serviceType;
      
      if (newQueues[serviceType]) {
        newQueues[serviceType] = newQueues[serviceType].map(queue => 
          queue._id === update.queueId 
            ? { ...queue, status: update.status }
            : queue
        );
      }

      return newQueues;
    });
  };

  const handleNextCustomer = async (serviceType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://qms-19az.onrender.com/api/queue/next', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ serviceType })
      });

      if (!response.ok) {
        throw new Error('Failed to call next customer');
      }

      toast.success('Next customer called');
    } catch (error) {
      toast.error('Failed to call next customer');
    }
  };

  const handleCompleteService = async (queueId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://qms-19az.onrender.com/api/queue/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ queueId })
      });

      if (!response.ok) {
        throw new Error('Failed to complete service');
      }

      toast.success('Service completed');
    } catch (error) {
      toast.error('Failed to complete service');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Queue Management</h2>

        {isLoading ? (
          <div className="text-center py-8">
            <Clock className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading queues...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(queues).map(([serviceType, queueList]) => (
              <div key={serviceType} className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{serviceType}</h3>
                
                <div className="space-y-4">
                  {queueList.filter(queue => queue.status !== 'completed').map((queue) => (
                    <div
                      key={queue._id}
                      className="border rounded-lg p-4 flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            Queue #{queue.queueNumber}
                          </span>
                          {queue.status === 'serving' && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Now Serving
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <span>{queue.timeSlot}</span>
                          <span className="mx-2">•</span>
                          <span>Position: #{queue.position}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {queue.status === 'pending' && (
                          <button
                            onClick={() => handleNextCustomer(serviceType)}
                            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            <ChevronRight className="w-4 h-4 mr-1" />
                            Call Next
                          </button>
                        )}
                        {queue.status === 'serving' && (
                          <button
                            onClick={() => handleCompleteService(queue._id)}
                            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {queueList.filter(queue => queue.status !== 'completed').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No active queues for this service
                    </div>
                  )}
                </div>
              </div>
            ))}

            {Object.keys(queues).length === 0 && (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active queues at the moment</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};