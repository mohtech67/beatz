import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GalleryAlbum, GalleryImage } from '../types';
import { Image as ImageIcon, Plus, Eye, X } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const { token, user, showToast } = useAuth();
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryData();
  }, []);

  const fetchGalleryData = async () => {
    setLoading(true);
    try {
      const [resA, resI] = await Promise.all([
        fetch('/api/gallery/albums', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/gallery/images', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (resA.ok) setAlbums(await resA.json());
      if (resI.ok) setImages(await resI.json());
    } catch (err) {
      showToast('Error loading church gallery', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-[#003366]">Bidii SDA Church Photo Gallery</h2>
          <p className="text-xs text-slate-500">
            Sabbath choir performances, baptismal services, and community Dorcas outreaches.
          </p>
        </div>
      </div>

      {/* Albums Grid */}
      <div className="space-y-8">
        {albums.map((album) => {
          const albumImgs = images.filter((img) => img.albumId === album.id);
          return (
            <div key={album.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-900">{album.title}</h3>
                <p className="text-xs text-slate-500">{album.description}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {albumImgs.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(img.imageUrl)}
                    className="group relative h-48 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer shadow-sm hover:shadow-md transition-all"
                  >
                    <img
                      src={img.imageUrl}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white p-4">
                      <div className="text-center">
                        <Eye className="w-6 h-6 mx-auto mb-1 text-amber-400" />
                        <p className="text-xs font-bold">{img.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Gallery Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-slate-700 shadow-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-amber-400 p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
