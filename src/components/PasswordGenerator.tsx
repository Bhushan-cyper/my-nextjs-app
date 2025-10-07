"use client";

import { useState, useEffect } from 'react';
import { generatePassword, calculatePasswordStrength, PasswordOptions } from '@/lib/passwordGenerator';
import { Copy, RefreshCw } from 'lucide-react';

interface PasswordGeneratorProps {
  onPasswordGenerated?: (password: string) => void;
}

export default function PasswordGenerator({ onPasswordGenerated }: PasswordGeneratorProps) {
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
  });
  
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState({ score: 0, feedback: '' });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateNewPassword();
  }, [options]);

  const generateNewPassword = () => {
    try {
      const newPassword = generatePassword(options);
      setPassword(newPassword);
      setStrength(calculatePasswordStrength(newPassword));
      if (onPasswordGenerated) {
        onPasswordGenerated(newPassword);
      }
    } catch (error) {
      console.error('Password generation failed:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      
      // Auto-clear after 15 seconds
      setTimeout(() => {
        setCopied(false);
      }, 15000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const getStrengthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getStrengthText = (score: number) => {
    if (score >= 80) return 'Strong';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Weak';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Password Generator</h2>
      
      {/* Generated Password */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={password}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Copy to clipboard"
          >
            <Copy size={20} />
          </button>
          <button
            onClick={generateNewPassword}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Generate new password"
          >
            <RefreshCw size={20} />
          </button>
        </div>
        
        {copied && (
          <p className="text-sm text-green-600">Copied! Will auto-clear in 15 seconds.</p>
        )}
        
        {/* Password Strength */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>Strength: {getStrengthText(strength.score)}</span>
            <span>{strength.score}/100</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getStrengthColor(strength.score)}`}
              style={{ width: `${strength.score}%` }}
            ></div>
          </div>
          {strength.feedback !== 'Strong password!' && (
            <p className="text-xs text-gray-600 mt-1">{strength.feedback}</p>
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        {/* Length Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Length: {options.length}
          </label>
          <input
            type="range"
            min="8"
            max="64"
            value={options.length}
            onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Character Type Checkboxes */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeUppercase}
              onChange={(e) => setOptions({ ...options, includeUppercase: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm">Uppercase (A-Z)</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeLowercase}
              onChange={(e) => setOptions({ ...options, includeLowercase: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm">Lowercase (a-z)</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm">Numbers (0-9)</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={options.includeSymbols}
              onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm">Symbols (!@#$)</span>
          </label>
        </div>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={options.excludeSimilar}
            onChange={(e) => setOptions({ ...options, excludeSimilar: e.target.checked })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm">Exclude similar characters (0, O, l, I, 1)</span>
        </label>
      </div>
    </div>
  );
}
