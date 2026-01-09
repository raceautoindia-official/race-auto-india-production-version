'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';


export default function AdSpaceEditor() {
  // 1) Grab the `?id=` from the URL
  const searchParams = useSearchParams();
  const spaceId = searchParams.get('id');

  const [items, setItems] = useState([]);
  const [rows, setRows] = useState([
    { device: 'desktop', link_url: '', position: 0, file: null },
  ]);
  const [error, setError] = useState('');

  // 2) Fetch existing when we have an ID
  useEffect(() => {
    if (!spaceId) return;
    fetch(`/api/ad-spaces/${spaceId}/items`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load items');
        return res.json();
      })
      .then(setItems)
      .catch((err) => {
        console.error(err);
        setError('Could not load existing images');
      });
  }, [spaceId]);

  // 3) Form helpers
  const addRow = () =>
    setRows((prev) => [
      ...prev,
      { device: 'desktop', link_url: '', position: prev.length, file: null },
    ]);

  const updateRow = (idx, key, value) =>
    setRows((prev) => {
      const next = [...prev];
      next[idx][key] = value;
      return next;
    });

  const removeRow = (idx) =>
    setRows((prev) => prev.filter((_, i) => i !== idx));

  // 4) Submit new uploads
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!spaceId) {
      setError('Missing ad-space ID');
      return;
    }

    const formData = new FormData();
    rows.forEach((r) => {
      if (!r.file) return;
      formData.append('image', r.file);
      formData.append('link_url', r.link_url);
      formData.append('device', r.device);
      formData.append('position', r.position);
    });

    try {
      const res = await fetch(`/api/ad-spaces/${spaceId}/items`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Upload failed');
      }
      const updated = await res.json();
      setItems(updated);
      setRows([{ device: 'desktop', link_url: '', position: 0, file: null }]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Upload error');
    }
  };

  // 5) Delete an existing item
  const deleteItem = async (itemId) => {
    if (!confirm('Delete this image?')) return;
    try {
      const res = await fetch(
        `/api/ad-spaces/${spaceId}/items/${itemId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Delete failed');
      setItems((prev) => prev.filter((it) => it.id !== itemId));
    } catch (err) {
      console.error(err);
      setError('Could not delete item');
    }
  };

  // 6) Simple guard if no ID yet
  if (!spaceId) {
    return (
      <div className="container py-4">
        <h1>Loading Ad-Space…</h1>
        {error && <div className="alert alert-danger">{error}</div>}
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h1>Ad-Space #{spaceId} Images</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Upload Form */}
      <form onSubmit={handleSubmit} className="mb-5">
        {rows.map((row, idx) => (
          <div className="row g-2 align-items-end mb-3" key={idx}>
            {/* Device */}
            <div className="col-md-2">
              <label className="form-label">Device</label>
              <select
                className="form-select"
                value={row.device}
                onChange={(e) => updateRow(idx, 'device', e.target.value)}
                required
              >
                <option value="desktop">desktop</option>
                <option value="tablet">tablet</option>
                <option value="mobile">mobile</option>
              </select>
            </div>

            {/* File */}
            <div className="col-md-3">
              <label className="form-label">Image</label>
              <input
                type="file"
                className="form-control"
                onChange={(e) =>
                  updateRow(idx, 'file', e.target.files[0] || null)
                }
                required
              />
            </div>

            {/* Link URL */}
            <div className="col-md-4">
              <label className="form-label">Link URL</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://example.com"
                value={row.link_url}
                onChange={(e) =>
                  updateRow(idx, 'link_url', e.target.value)
                }
                required
              />
            </div>

            {/* Position */}
            <div className="col-md-1">
              <label className="form-label">Pos.</label>
              <input
                type="number"
                className="form-control"
                value={row.position}
                onChange={(e) =>
                  updateRow(idx, 'position', Number(e.target.value))
                }
              />
            </div>

            {/* Remove Row */}
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => removeRow(idx)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-secondary"
            onClick={addRow}
          >
            + Add another
          </button>
          <button type="submit" className="btn btn-primary">
            Upload All
          </button>
        </div>
      </form>

      {/* Existing Items */}
      <h3>Existing Images</h3>
      <div className="row">
        {items.length > 0 ? (
          items.map((item) => (
            <div className="col-md-4 mb-4" key={item.id}>
              <div className="card h-100">
                <img
                  src={`https://${process.env.AWS_S3_BUCKET_NAME}.s3.amazonaws.com/${item.image_url}`}
                  className="card-img-top"
                  alt={item.device}
                />
                <div className="card-body d-flex flex-column">
                  <p className="card-text mb-2">
                    <strong>Device:</strong> {item.device}
                    <br />
                    <strong>Pos:</strong> {item.position}
                  </p>
                  <div className="mt-auto">
                    <a
                      href={item.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary me-2"
                    >
                      Visit link
                    </a>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteItem(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-muted">No images uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
