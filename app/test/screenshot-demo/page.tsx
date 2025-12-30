// app/test/screenshot-demo/page.tsx
"use client";

import { useState } from 'react';
import { useScreenProtection } from '@/hooks/useScreenProtection';
import BlackScreenOverlay from '@/components/protection/BlackScreenOverlay';

export default function ScreenshotDemoPage() {
  const [testMode, setTestMode] = useState(false);
  
  const {
    showBlackScreen,
    blackScreenReason,
    blackScreenMerk,
    attemptCount,
    isViolation,
  } = useScreenProtection({
    enableWatermark: true,
    enableBlurOnFocusLoss: true,
    enableKeyboardBlock: true,
    onScreenshotAttempt: () => {
      console.log('Screenshot attempt detected!');
    },
  });

  const simulateViolation = (type: string) => {
    // Simulate triggering black screen
    const event = new KeyboardEvent('keydown', {
      key: 'PrintScreen',
      bubbles: true
    });
    document.dispatchEvent(event);
  };

  const detectDevice = () => {
    const ua = navigator.userAgent;
    alert(`Device Info:\n${ua}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">📱 Mobile Screenshot Protection Demo</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Status Panel */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Black Screen Active:</span>
                <span className={showBlackScreen ? 'text-red-400' : 'text-green-400'}>
                  {showBlackScreen ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Violation Count:</span>
                <span className="text-yellow-400">{attemptCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Reason:</span>
                <span className="text-blue-400">{blackScreenReason || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span>Device Type:</span>
                <span className="text-purple-400">{blackScreenMerk || 'Not detected'}</span>
              </div>
            </div>
          </div>

          {/* Test Controls */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            <div className="space-y-3">
              <button
                onClick={() => simulateViolation('keyboard')}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
              >
                Simulate Screenshot (PrintScreen)
              </button>
              
              <button
                onClick={detectDevice}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
              >
                Detect My Device
              </button>
              
              <button
                onClick={() => setTestMode(!testMode)}
                className={`w-full py-3 rounded-lg ${testMode ? 'bg-green-600' : 'bg-gray-700'}`}
              >
                {testMode ? 'Test Mode: ON' : 'Test Mode: OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* Protection Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📋 Detected Protection Methods</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[ 
              { name: 'Samsung', methods: ['Power + Vol Down', '3-finger swipe', 'Palm swipe'] },
              { name: 'Xiaomi', methods: ['3-finger swipe', 'Quick ball'] },
              { name: 'iOS', methods: ['Side + Vol Up', '3-finger up'] },
              { name: 'Google', methods: ['Power + Vol Down', '3-finger'] },
            ].map((device) => (
              <div key={device.name} className="bg-gray-700 p-4 rounded">
                <h3 className="font-bold mb-2">{device.name}</h3>
                <ul className="text-sm space-y-1">
                  {device.methods.map((method) => (
                    <li key={method} className="text-gray-300">• {method}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Test Content */}
        <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Try to Screenshot This!</h2>
          <p className="text-lg mb-6 opacity-90">
            This content is protected. Try using screenshot shortcuts on your device.
          </p>
          <div className="inline-block bg-black bg-opacity-50 p-4 rounded-lg">
            <div className="text-sm text-gray-400">Protected Video Preview</div>
            <div className="w-64 h-36 bg-gradient-to-br from-red-500 to-yellow-500 rounded mt-2 mx-auto flex items-center justify-center">
              <span className="text-white font-bold">🎬 PROTECTED CONTENT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Black Screen Overlay */}
      <BlackScreenOverlay 
        isActive={showBlackScreen}
        duration={10000}
        watermark={`ALFAJR - ${blackScreenMerk} - ${new Date().toLocaleDateString()}`}
        onComplete={() => console.log('Black screen completed')}
      />
    </div>
  );
}
