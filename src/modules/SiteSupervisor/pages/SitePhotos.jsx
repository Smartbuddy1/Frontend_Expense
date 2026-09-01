import React, { useState, useEffect } from 'react';
import { Camera, UploadCloud, X, Loader2, ArrowLeft } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SitePhotos = () => {
  const { project } = useWallet();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (project) {
      fetchPhotos();
    } else {
      setLoading(false);
    }
  }, [project]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const res = await axios.get(`${baseURL}/projects/${project.id}/photos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'x-user-id': userId
        }
      });
      setPhotos(res.data.photos || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !project) return;
    
    try {
      setUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('description', description);
      
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      await axios.post(`${baseURL}/projects/${project.id}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
          'x-user-id': userId
        }
      });
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setDescription('');
      
      // Refresh list
      fetchPhotos();
    } catch (err) {
      console.error(err);
      setError('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  if (!project) {
    return (
      <div className="p-4 sm:p-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </button>
        <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500">No active project assigned.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 mr-4 transition-colors shadow-sm border border-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Photos</h1>
          <p className="text-sm text-gray-500">{project.name}</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Camera className="w-5 h-5 mr-2 text-blue-500" />
          Upload New Photo
        </h2>
        
        <form onSubmit={handleUpload}>
          <div className="mb-4">
            {!previewUrl ? (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <UploadCloud className="w-10 h-10 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-500 font-medium">Click to capture or upload photo</p>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="E.g., Foundation work progress"
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            type="submit"
            disabled={!selectedFile || uploading}
            className={`w-full py-3 px-4 rounded-xl font-medium text-white flex items-center justify-center transition-colors ${
              !selectedFile || uploading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud className="w-5 h-5 mr-2" />
                Upload Photo
              </>
            )}
          </button>
        </form>
      </div>

      {/* Gallery Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Photos</h2>
        
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : photos.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
            <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No photos uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <img 
                  src={photo.imageUrl} 
                  alt={photo.description || 'Site photo'} 
                  className="w-full h-32 object-cover"
                />
                <div className="p-3 flex-1 flex flex-col">
                  {photo.description && (
                    <p className="text-sm text-gray-800 line-clamp-2 mb-1">{photo.description}</p>
                  )}
                  <div className="mt-auto pt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(photo.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SitePhotos;
