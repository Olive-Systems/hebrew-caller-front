import React from 'react';
import { useSettings } from '../context/SettingsContext';

const Admin = () => {
  const { settings, setSettings } = useSettings();

  const handleSettingChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Admin Settings</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Main Prompt Settings</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label>Instructions:</label>
            <textarea
              value={settings.mainPrompt.instructions}
              onChange={(e) => handleSettingChange('mainPrompt', 'instructions', e.target.value)}
              style={{ width: '100%', minHeight: '100px' }}
            />
          </div>
          <div>
            <label>Voice:</label>
            <select
              value={settings.mainPrompt.voice}
              onChange={(e) => handleSettingChange('mainPrompt', 'voice', e.target.value)}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            >
              <option value="alloy">Alloy</option>
              <option value="ash">Ash</option>
              <option value="ballad">Ballad</option>
              <option value="coral">Coral</option>
              <option value="echo">Echo</option>
              <option value="sage">Sage</option>
              <option value="shimmer">Shimmer</option>
              <option value="verse">Verse</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h2>Immediate Response Settings</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label>Instructions:</label>
            <textarea
              value={settings.immediateResponse.instructions}
              onChange={(e) => handleSettingChange('immediateResponse', 'instructions', e.target.value)}
              style={{ width: '100%', minHeight: '100px' }}
            />
          </div>
          {/* <div>
            <label>Max Output Tokens:</label>
            <input
              type="number"
              value={settings.immediateResponse.max_output_tokens}
              onChange={(e) => handleSettingChange('immediateResponse', 'max_output_tokens', parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Admin; 