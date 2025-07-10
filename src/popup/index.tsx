import React from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';

const Popup: React.FC = () => {
  return (
    <div className="w-80 h-96 p-4 bg-gray-50">
      <h1 className="text-2xl font-bold text-center mb-4">LeetSync</h1>
      <div className="space-y-3">
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          Connect GitHub
        </button>
        <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded">
          Sync Now
        </button>
        <div className="text-sm text-gray-600 text-center">
          Status: Not connected
        </div>
      </div>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<Popup />);