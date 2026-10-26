import React, { useState } from 'react';
import AdminLayout from '../components/layout/AdminLayout';

export default function SettingsPage({ activeTab, setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState({
    systemName: 'PayFlex Operations Engine',
    supportEmail: 'support@payflex.ng',
    webhookUrl: 'https://api.payflex.ng/v1/webhooks/payment',
    environment: 'production',
    emailAlerts: true,
    smsAlerts: false,
  });

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0 }}>System Settings</h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--payflex-text-secondary)', margin: '0.25rem 0 0 0' }}>
          Configure API integrations, webhooks, administrative alerts, and system parameters.
        </p>
      </div>

      <div style={{ backgroundColor: 'var(--payflex-surface)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--payflex-border)', maxWidth: '700px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.25rem' }}>General Operations</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--payflex-text-secondary)' }}>
              System Title
            </label>
            <input
              type="text"
              value={settings.systemName}
              onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--payflex-border)', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--payflex-text-secondary)' }}>
              Support Email Address
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--payflex-border)', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem', color: 'var(--payflex-text-secondary)' }}>
              Primary Webhook Endpoint
            </label>
            <input
              type="text"
              value={settings.webhookUrl}
              onChange={(e) => setSettings({ ...settings, webhookUrl: e.target.value })}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--payflex-border)', fontSize: '0.85rem' }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--payflex-border)', paddingTop: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.75rem' }}>Notifications & Audit Alerts</h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.emailAlerts}
                  onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                />
                Email alerts on critical loan flags
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.smsAlerts}
                  onChange={(e) => setSettings({ ...settings, smsAlerts: e.target.checked })}
                />
                SMS alerts for high-value auto-disbursements
              </label>
            </div>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <button
              onClick={() => alert('System Settings Saved!')}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--payflex-primary)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}