'use client';

import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function HeaderAdsAdmin() {
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState({
    id: '',
    link_url: '',
    sort_order: '',
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    const res = await fetch('/api/admin/adspace/sidebar-ads');
    const data = await res.json();
    setAds(data);
  };

  const resetForm = () => {
    setForm({ id: '', link_url: '', sort_order: '', image: null });
    setPreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Size restriction (still 500KB max)
    if (file.size > 500 * 1024) {
      toast.error("Image must be under 500 KB");
      return;
    }

    // Dimension check for 600×600
    const img = new Image();
    img.onload = function () {
      // if (img.width !== 600 || img.height !== 600) {
      //   toast.error("Image must be exactly 600×600 pixels");
      //   return;
      // }
      setForm(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    };
    img.onerror = () => toast.error("Invalid image file");
    img.src = URL.createObjectURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const method = form.id ? 'PUT' : 'POST';

    const formData = new FormData();
    if (form.id) formData.append("id", form.id);
    formData.append("link_url", form.link_url);
    formData.append("sort_order", form.sort_order);
    if (form.image) formData.append("image", form.image);

    const res = await fetch('/api/admin/adspace/sidebar-ads', {
      method,
      body: formData,
    });

    setLoading(false);

    if (res.ok) {
      toast.success(form.id ? "Ad updated" : "Ad created");
      resetForm();
      fetchAds();
    } else {
      toast.error("Failed to save ad");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    const res = await fetch(`/api/admin/adspace/sidebar-ads?id=${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      toast.success("Ad deleted");
      setAds(prev => prev.filter(ad => ad.id !== id));
    } else {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h4 className="mb-3">Sidebar Ad Manager</h4>

      <form
        onSubmit={handleSubmit}
        className="mb-4 border rounded p-3 shadow-sm bg-light"
      >
        {form.id && (
          <p className="text-muted">Editing ID: {form.id}</p>
        )}

        <label className="form-label">Ad Link URL</label>
        <input
          type="text"
          placeholder="https://example.com"
          className="form-control mb-2"
          value={form.link_url}
          onChange={e => setForm(prev => ({ ...prev, link_url: e.target.value }))}
          required
        />

        <label className="form-label">Sort Order</label>
        <input
          type="number"
          placeholder="Sort order (e.g., 1)"
          className="form-control mb-2"
          value={form.sort_order}
          onChange={e => setForm(prev => ({ ...prev, sort_order: e.target.value }))}
        />

        <label className="form-label">
          Upload Image (600 × 600, max 500 KB)
        </label>
        <input
          type="file"
          accept="image/*"
          className="form-control mb-2"
          onChange={handleImageChange}
        />

        {preview && (
          <div className="mb-2">
            <strong>Preview:</strong><br />
            <img
              src={preview}
              alt="Preview"
              style={{ width: 120, height: 120, borderRadius: 6, objectFit: 'cover' }}
            />
          </div>
        )}

        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? 'Saving...'
              : form.id
              ? 'Update Ad'
              : 'Create Ad'}
          </button>
          {form.id && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <table className="table table-hover table-bordered table-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Link</th>
            <th>Sort</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ads.map(ad => (
            <tr
              key={ad.id}
              className={form.id === ad.id ? 'table-warning' : ''}
            >
              <td>{ad.id}</td>
              <td>
                <img
                  src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${ad.image_url}`}
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: 'cover',
                    borderRadius: 4
                  }}
                  alt="Ad"
                />
              </td>
              <td>{ad.link_url}</td>
              <td>{ad.sort_order}</td>
              <td>
                <button
                  className="btn btn-sm btn-outline-primary me-2"
                  onClick={() => {
                    setForm({
                      id: ad.id,
                      link_url: ad.link_url,
                      sort_order: ad.sort_order,
                      image: null
                    });
                    setPreview(
                      `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${ad.image_url}`
                    );
                  }}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(ad.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
