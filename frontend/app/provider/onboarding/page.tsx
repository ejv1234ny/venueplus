'use client';
import { useState } from 'react';
import { providersAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function ProviderOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [data, setData] = useState<any>({
    business_name: '', category: 'cleaning', bio: '', years_experience: 0,
    service_area_cities: '', travel_radius_miles: 25,
    hourly_rate: 75, minimum_hours: 2,
    weekly_availability: 'mon-fri 09:00-22:00',
  });

  const next = async () => {
    if (step === 1) {
      const r = await providersAPI.onboardStart({
        business_name: data.business_name, category: data.category,
        bio: data.bio, years_experience: Number(data.years_experience),
      });
      setProviderId(r.data.provider_id); setStep(2);
    } else if (step === 2 && providerId) {
      await providersAPI.onboardArea(providerId, {
        service_area_cities: data.service_area_cities.split(',').map((s: string) => s.trim()),
        travel_radius_miles: Number(data.travel_radius_miles),
      });
      setStep(3);
    } else if (step === 3 && providerId) {
      await providersAPI.onboardPricing(providerId, {
        hourly_rate: Number(data.hourly_rate),
        minimum_hours: Number(data.minimum_hours),
      });
      setStep(4);
    } else if (step === 4 && providerId) {
      await providersAPI.onboardAvailability(providerId, {
        weekly_availability: { schedule: data.weekly_availability },
      });
      setStep(5);
    } else if (step === 5 && providerId) {
      await providersAPI.onboardPublish(providerId);
      router.push('/profile');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Provider onboarding — step {step} of 5</h1>
      <div className="bg-white border rounded-lg p-6 space-y-4">
        {step === 1 && <>
          <input className="input-field" placeholder="Business name"
            value={data.business_name} onChange={(e) => setData({...data, business_name: e.target.value})} />
          <select className="input-field" value={data.category}
            onChange={(e) => setData({...data, category: e.target.value})}>
            {['cleaning','security','catering','bartending','dj','photography','decoration','equipment','staff'].map(c =>
              <option key={c}>{c}</option>)}
          </select>
          <textarea className="input-field" placeholder="Bio / description"
            value={data.bio} onChange={(e) => setData({...data, bio: e.target.value})} />
          <input className="input-field" type="number" placeholder="Years experience"
            value={data.years_experience} onChange={(e) => setData({...data, years_experience: e.target.value})} />
        </>}
        {step === 2 && <>
          <input className="input-field" placeholder="Service cities (comma-separated)"
            value={data.service_area_cities} onChange={(e) => setData({...data, service_area_cities: e.target.value})} />
          <input className="input-field" type="number" placeholder="Travel radius (miles)"
            value={data.travel_radius_miles} onChange={(e) => setData({...data, travel_radius_miles: e.target.value})} />
        </>}
        {step === 3 && <>
          <input className="input-field" type="number" placeholder="Hourly rate ($)"
            value={data.hourly_rate} onChange={(e) => setData({...data, hourly_rate: e.target.value})} />
          <input className="input-field" type="number" placeholder="Minimum hours"
            value={data.minimum_hours} onChange={(e) => setData({...data, minimum_hours: e.target.value})} />
        </>}
        {step === 4 && <>
          <input className="input-field" placeholder="Weekly availability"
            value={data.weekly_availability} onChange={(e) => setData({...data, weekly_availability: e.target.value})} />
        </>}
        {step === 5 && <p>Ready to publish your listing!</p>}
        <button onClick={next} className="btn-primary w-full">
          {step === 5 ? 'Publish' : 'Next'}
        </button>
      </div>
    </div>
  );
}
