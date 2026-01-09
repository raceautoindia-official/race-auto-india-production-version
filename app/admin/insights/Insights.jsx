'use client';
import React, { useEffect, useState } from 'react';
import { Table, Button, Container, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function AdminInsightList() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchInsights() {
      try {
        const res = await fetch('/api/admin/insights');
        const data = await res.json();
        if (data.success) {
          setInsights(data.insights);
        } else {
          toast.error('Failed to load insights');
        }
      } catch (err) {
        console.error(err);
        toast.error('Server error');
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, []);

  const handleEdit = (id) => {
    router.push(`/admin/insights/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this insight?')) return;

    try {
      const res = await axios.delete(`/api/admin/insights/${id}`);
      if (res.data.success) {
        toast.success('Insight deleted');
        setInsights(prev => prev.filter(item => item.id !== id));
      } else {
        toast.error('Delete failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server error while deleting');
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h3>Admin Insights</h3>
      <Link href='/admin/insights/create'><button className='btn btn-primary mb-3'>Create</button></Link>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th style={{ width: '160px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {insights.map(insight => (
            <tr key={insight.id}>
              <td>{insight.id}</td>
              <Link href={`/insights/${insight.title_slug}?id=${insight.id}`}><td dangerouslySetInnerHTML={{ __html: insight.title }} /></Link>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEdit(insight.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(insight.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}
