import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BackgroundParticles from '../components/BackgroundParticles';

export default function ViewPlan(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    fetch(`/plans/${id}`).then(r=>r.json()).then(j=>{ if (j.plan) setPlan(j.plan); else setPlan(null); }).catch(()=>setPlan(null)).finally(()=>setLoading(false));
  }, [id]);

  if (loading) return <div className="page-root"><BackgroundParticles /><div style={{padding:24}}>Loading...</div></div>;
  if (!plan) return <div className="page-root"><BackgroundParticles /><div style={{padding:24}}>Plan not found</div></div>;

  return (
    <div className="page-root page-plan" style={{ position: 'relative', minHeight: '100vh' }}>
      <BackgroundParticles />
      <div style={{ position: 'relative', zIndex: 1, maxWidth: 980, margin: '0 auto', padding: '40px 24px' }}>
        <button className="find-badge" onClick={() => navigate(-1)}>← Back</button>
        <h2>Shared Plan for {plan.event?.name || 'Event'}</h2>
        <div className="muted">Saved: {new Date(plan.createdAt || plan.id || Date.now()).toLocaleString()}</div>
        <pre style={{ marginTop: 12, background:'rgba(0,0,0,0.3)', padding:12, borderRadius:8 }}>{JSON.stringify(plan, null, 2)}</pre>
      </div>
    </div>
  );
}
