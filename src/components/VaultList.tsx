"use client";

import { useState, useEffect, useCallback } from 'react';
import { VaultItemData, encryptData, decryptData, generateKey, generateSalt } from '@/lib/encryption';
import { Search, Plus, Edit, Trash2, Copy, Eye, EyeOff, ExternalLink } from 'lucide-react';
import VaultItemForm from './VaultItemForm';

interface VaultItem {
  _id: string;
  encryptedData: string;
  createdAt: string;
  updatedAt: string;
}

interface DecryptedVaultItem extends VaultItemData {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export default function VaultList() {
  const [vaultItems, setVaultItems] = useState<DecryptedVaultItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<DecryptedVaultItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<DecryptedVaultItem | null>(null);
  const [masterPassword, setMasterPassword] = useState('');
  const [showMasterPasswordPrompt, setShowMasterPasswordPrompt] = useState(true);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());

  const fetchVaultItems = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vault');
      if (response.ok) {
        const data = await response.json();
        const decryptedItems = data.data
          .map((item: VaultItem) => {
            const decryptedData = decryptData(item.encryptedData, encryptionKey);
            if (!decryptedData) {
              console.error('Failed to decrypt vault item:', item._id);
              return null;
            }
            return {
              ...decryptedData,
              id: item._id,
              createdAt: item.createdAt,
              updatedAt: item.updatedAt,
            };
          })
          .filter(Boolean);
        
        setVaultItems(decryptedItems);
      }
    } catch (error) {
      console.error('Failed to fetch vault items:', error);
    } finally {
      setLoading(false);
    }
  }, [encryptionKey]);

  useEffect(() => {
    if (encryptionKey) {
      fetchVaultItems();
    }
  }, [encryptionKey, fetchVaultItems]);

  useEffect(() => {
    // Filter items based on search term
    const filtered = vaultItems.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [vaultItems, searchTerm]);

  const handleMasterPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPassword.length < 8) {
      alert('Master password must be at least 8 characters long');
      return;
    }
    
    // Generate encryption key from master password
    // In a real app, you'd store the salt securely per user
    const salt = localStorage.getItem('userSalt') || generateSalt();
    if (!localStorage.getItem('userSalt')) {
      localStorage.setItem('userSalt', salt);
    }
    
    const key = generateKey(masterPassword, salt);
    setEncryptionKey(key);
    setShowMasterPasswordPrompt(false);
  };

  

  const handleSaveItem = async (data: VaultItemData) => {
    try {
      const encryptedData = encryptData(data, encryptionKey);
      
      if (editingItem) {
        // Update existing item
        const response = await fetch(`/api/vault/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ encryptedData }),
        });
        
        if (response.ok) {
          fetchVaultItems();
        }
      } else {
        // Create new item
        const response = await fetch('/api/vault', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ encryptedData }),
        });
        
        if (response.ok) {
          fetchVaultItems();
        }
      }
      
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Failed to save vault item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch(`/api/vault/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchVaultItems();
        }
      } catch (error) {
        console.error('Failed to delete vault item:', error);
      }
    }
  };

  const togglePasswordVisibility = (id: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisiblePasswords(newVisible);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      const newCopied = new Set(copiedItems);
      newCopied.add(id);
      setCopiedItems(newCopied);
      
      // Auto-clear after 15 seconds
      setTimeout(() => {
        setCopiedItems(prev => {
          const updated = new Set(prev);
          updated.delete(id);
          return updated;
        });
      }, 15000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  if (showMasterPasswordPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div>
            <h2 className="text-center text-2xl font-bold text-gray-900">
              Enter Master Password
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your master password is used to encrypt/decrypt your vault items
            </p>
          </div>
          
          <form onSubmit={handleMasterPasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                required
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your master password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Unlock Vault
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Password Vault</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Plus size={20} />
          <span>Add Item</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search vault items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Vault Items */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No items found matching your search.' : 'No vault items yet. Add your first password!'}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  {item.username && (
                    <p className="text-gray-600 text-sm">{item.username}</p>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                    >
                      <span>{item.url}</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setShowForm(true);
                    }}
                    className="text-gray-600 hover:text-blue-600"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-gray-600 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {item.password && (
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type={visiblePasswords.has(item.id) ? 'text' : 'password'}
                    value={item.password}
                    readOnly
                    className="flex-1 px-3 py-1 border border-gray-300 rounded bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={() => togglePasswordVisibility(item.id)}
                    className="text-gray-600 hover:text-blue-600"
                    title="Toggle visibility"
                  >
                    {visiblePasswords.has(item.id) ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(item.password, item.id)}
                    className="text-gray-600 hover:text-blue-600"
                    title="Copy password"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              )}

              {copiedItems.has(item.id) && (
                <p className="text-sm text-green-600">Copied! Will auto-clear in 15 seconds.</p>
              )}

              {item.notes && (
                <p className="text-gray-600 text-sm mt-2">{item.notes}</p>
              )}
              
              <p className="text-xs text-gray-400 mt-2">
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <VaultItemForm
          item={editingItem ?? undefined}
          onSave={handleSaveItem}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}
