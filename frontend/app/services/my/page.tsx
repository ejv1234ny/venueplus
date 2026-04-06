'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight,
  FiCheckCircle, FiXCircle, FiAlertCircle, FiBriefcase, FiTool,
} from 'react-icons/fi';
import { servicesAPI, bookingsAPI } from '@/lib/api';
import AuthGuard from '@/components/AuthGuard';
import LoadingSpinner from '@/components/LoadingSpinner';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';

function MyServicesContent() {
  const [services, setServices] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'jobs'>('services');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [servicesRes, jobsRes] = await Promise.all([
          servicesAPI.getMy(),
          bookingsAPI.getMyJobs(),
        ]);
        setServices(servicesRes.data);
        setJobs(jobsRes.data);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggleActive = async (service: any) => {
    try {
      await servicesAPI.update(service.id, { is_active: !service.is_active });
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, is_active: !s.is_active } : s))
      );
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update service.');
    }
  };

  const handleDelete = async (serviceId: number) => {
    try {
      await servicesAPI.delete(serviceId);
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
      setDeleteConfirm(null);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete service.');
    }
  };

  const handleAcceptJob = async (jobId: number) => {
    setActionLoading(jobId);
    try {
      await bookingsAPI.acceptJob(jobId);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: 'accepted' } : j))
      );
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to accept job.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineJob = async (jobId: number) => {
    setActionLoading(jobId);
    try {
      await bookingsAPI.declineJob(jobId);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: 'declined' } : j))
      );
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to decline job.');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your services..." />;

  const pendingJobs = jobs.filter((j) => j.status === 'pending');

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="section-title mb-0">My Services</h1>
          <Link href="/services/create" className="btn-primary flex items-center">
            <FiPlus className="mr-2" /> New Service
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
              activeTab === 'services'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <FiTool className="mr-2" size={14} /> Services ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
              activeTab === 'jobs'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <FiBriefcase className="mr-2" size={14} /> Jobs ({jobs.length})
            {pendingJobs.length > 0 && (
              <span className="ml-2 bg-accent-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {pendingJobs.length}
              </span>
            )}
          </button>
        </div>

        {/* Services Tab */}
        {activeTab === 'services' && (
          <>
            {services.length === 0 ? (
              <EmptyState
                icon={<FiTool size={48} />}
                title="No services created yet"
                description="Create your first service profile to start accepting event gigs!"
                actionLabel="Create Service"
                actionHref="/services/create"
              />
            ) : (
              <div className="space-y-4">
                {services.map((service) => (
                  <div key={service.id} className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg text-neutral-900">{service.service_name}</h3>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${
                            service.is_active ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'
                          }`}>
                            {service.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500">
                          <span className="capitalize">{service.service_category}</span> &middot;
                          ${service.hourly_rate}/hr &middot;
                          Min {service.minimum_hours}h
                        </p>
                        {service.service_area_cities && service.service_area_cities.length > 0 && (
                          <p className="text-xs text-neutral-400 mt-1">
                            Areas: {service.service_area_cities.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/services/create?edit=${service.id}`}
                          className="p-2 text-neutral-400 hover:text-primary-600 rounded-lg hover:bg-neutral-50"
                        >
                          <FiEdit2 size={16} />
                        </Link>
                        <button
                          onClick={() => handleToggleActive(service)}
                          className="p-2 text-neutral-400 hover:text-primary-600 rounded-lg hover:bg-neutral-50"
                        >
                          {service.is_active ? <FiToggleRight size={16} /> : <FiToggleLeft size={16} />}
                        </button>
                        {deleteConfirm === service.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(service.id)} className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                              Confirm
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="text-xs bg-neutral-200 text-neutral-700 px-2 py-1 rounded">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(service.id)}
                            className="p-2 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-neutral-50"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <>
            {jobs.length === 0 ? (
              <EmptyState
                icon={<FiBriefcase size={48} />}
                title="No jobs yet"
                description="You'll see booking requests here once renters book your services."
              />
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-neutral-900">Booking #{job.booking_id}</h3>
                          <StatusBadge status={job.status} />
                          {job.is_mandatory && (
                            <span className="text-xs text-red-600 font-semibold">Mandatory</span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500">
                          {job.hours} hours &middot; ${job.cost.toFixed(2)} total
                        </p>
                        {job.notes && (
                          <p className="text-xs text-neutral-400 mt-1">Notes: {job.notes}</p>
                        )}
                      </div>
                      {job.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptJob(job.id)}
                            disabled={actionLoading === job.id}
                            className="flex items-center text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg"
                          >
                            <FiCheckCircle className="mr-1" size={14} /> Accept
                          </button>
                          {!job.is_mandatory && (
                            <button
                              onClick={() => handleDeclineJob(job.id)}
                              disabled={actionLoading === job.id}
                              className="flex items-center text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg"
                            >
                              <FiXCircle className="mr-1" size={14} /> Decline
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function MyServicesPage() {
  return (
    <AuthGuard requiredRole="service_provider">
      <MyServicesContent />
    </AuthGuard>
  );
}
