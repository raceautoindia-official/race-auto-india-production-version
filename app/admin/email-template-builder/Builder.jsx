'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function EmailListPage() {
  const [designs, setDesigns] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/email-template-builder`
        );
        setDesigns(response.data);
      } catch (error) {
        toast.error('Failed to load designs.', {
          position: 'top-right',
          autoClose: 4000,
          theme: 'light',
        });
        console.error('Fetch error:', error);
      }
    };

    fetchDesigns();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this design?')) {
      try {
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/email-template-builder/${id}`);
        setDesigns((prev) => prev.filter((d) => d.id !== id));
        toast.success('Design deleted successfully.', {
          position: 'top-right',
          autoClose: 4000,
          theme: 'light',
        });
      } catch (error) {
        toast.error('Failed to delete design.', {
          position: 'top-right',
          autoClose: 4000,
          theme: 'light',
        });
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Saved Email Designs</h2>
      <button className="btn btn-success mb-3" onClick={() => router.push('/admin/email-template-builder/create')}>
        Create New Design
      </button>
      <ul className="list-group">
        {designs.map((design) => (
          <li
            key={design.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>{design.name}</span>
            <div>
              <button
                className="btn btn-sm btn-primary me-2"
                onClick={() => router.push(`/admin/email-template-builder/edit?id=${design.id}`)}
              >
                Edit
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => handleDelete(design.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
