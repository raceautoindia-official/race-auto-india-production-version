'use client';
import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, Form } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-quill/dist/quill.snow.css';
import ImageResize from 'quill-image-resize-module-react';
import Quill from 'quill';

Quill.register('modules/imageResize', ImageResize);

import {
  ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, Tooltip, Legend
} from 'recharts';

const Font = ReactQuill.Quill.import('formats/font');
Font.whitelist = ['arial', 'comic-sans', 'courier-new', 'georgia', 'helvetica', 'lucida'];
ReactQuill.Quill.register(Font, true);

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#00c49f'];
const defaultChartData = [{ name: 'Jan', value: 30 }, { name: 'Feb', value: 50 }];

const quillModules = {
  toolbar: [
    [{ font: Font.whitelist }],
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link'],
    ['clean']
  ],
  imageResize: {
    parchment: Quill.import('parchment')
  }
};

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_');
};

export default function AdminInsightForm() {
  const [title, setTitle] = useState('');
  const [titleSlug, setTitleSlug] = useState('');
  const [content, setContent] = useState('');
  const [quotes, setQuotes] = useState('');
  const [notes, setNotes] = useState('');
  const [keywords, setKeywords] = useState('');
  const [useChart1, setUseChart1] = useState(true);
  const [useChart2, setUseChart2] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);

  const [charts, setCharts] = useState([
    { type: 'bar', heading: '', data: defaultChartData.map(d => ({ ...d })) },
    { type: 'line', heading: '', data: defaultChartData.map(d => ({ ...d })) }
  ]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/admin/insights-categories');
        if (res.data.success) setCategories(res.data.categories);
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    };
    fetchCategories();
  }, []);

  const toggleCategory = (id) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleChartChange = (index, key, value) => {
    const updated = [...charts];
    updated[index][key] = value;
    setCharts(updated);
  };

  const handleDataInput = (chartIndex, dataIndex, key, value) => {
    const updated = [...charts];
    updated[chartIndex].data[dataIndex][key] = key === 'value' ? Number(value) : value;
    setCharts(updated);
  };

  const addRowToChart = (chartIndex) => {
    const updated = [...charts];
    updated[chartIndex].data.push({ name: '', value: 0 });
    setCharts(updated);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newValidFiles = [], newPreviews = [];

    for (let file of files) {
      if (file.size <= 4000 * 1024) {
        newValidFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      } else {
        toast.warn(`File ${file.name} exceeds 4MB`);
      }
    }

    setUploadedImages(prev => [...prev, ...newValidFiles]);
    setImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedCharts = [];
    if (useChart1) selectedCharts.push(charts[0]);
    if (useChart2) selectedCharts.push(charts[1]);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('title_slug', titleSlug);
    formData.append('content', content);
    formData.append('quotes', quotes);
    formData.append('notes', notes);
    formData.append('keywords', keywords);
    formData.append('charts', JSON.stringify(selectedCharts));
    formData.append('categories', JSON.stringify(selectedCategoryIds));
    uploadedImages.forEach(img => formData.append('images', img));

    try {
      const res = await axios.post('/api/admin/insights', formData);
      if (res.data.success) {
        toast.success('Insight submitted!');
        setTitle(''); setTitleSlug(''); setContent(''); setQuotes(''); setNotes(''); setKeywords('');
        setCharts([
          { type: 'bar', heading: '', data: defaultChartData.map(d => ({ ...d })) },
          { type: 'line', heading: '', data: defaultChartData.map(d => ({ ...d })) }
        ]);
        setUploadedImages([]); setImagePreviews([]); setSelectedCategoryIds([]);
      } else {
        toast.error('Submission failed');
      }
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Server error while submitting');
    }
  };

  const renderChartDataInputs = (chartIndex) => (
    <>
      {charts[chartIndex].data.map((point, idx) => (
        <Row key={idx} className="mb-2">
          <Col>
            <Form.Control
              type="text"
              value={point.name}
              onChange={e => handleDataInput(chartIndex, idx, 'name', e.target.value)}
              placeholder="Label"
            />
          </Col>
          <Col>
            <Form.Control
              type="number"
              value={point.value}
              onChange={e => handleDataInput(chartIndex, idx, 'value', e.target.value)}
              placeholder="Value"
            />
          </Col>
        </Row>
      ))}
      <Button size="sm" variant="outline-primary" onClick={() => addRowToChart(chartIndex)}>
        + Add Row
      </Button>
    </>
  );

  const renderGraph = (index) => {
    const { type, data } = charts[index];
    if (!data || !Array.isArray(data)) return null;

    switch (type) {
      case 'bar':
        return <ResponsiveContainer width="100%" height={300}><BarChart data={data}><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="value" fill="#8884d8" /></BarChart></ResponsiveContainer>;
      case 'line':
        return <ResponsiveContainer width="100%" height={300}><LineChart data={data}><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="value" stroke="#8884d8" /></LineChart></ResponsiveContainer>;
      case 'pie':
        return <ResponsiveContainer width="100%" height={300}><PieChart><Pie data={data} dataKey="value" nameKey="name" outerRadius={100} label>{data.map((entry, idx) => (<Cell key={idx} fill={COLORS[idx % COLORS.length]} />))}</Pie><Tooltip /></PieChart></ResponsiveContainer>;
      default:
        return null;
    }
  };

  return (
    <Container className="mt-4">
      <h3>Create Insight</h3>
      <form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={e => {
              const val = e.target.value;
              setTitle(val);
              setTitleSlug(generateSlug(val));
            }}
            placeholder="Enter title"
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Slug (auto-generated)</Form.Label>
          <Form.Control type="text" value={titleSlug} readOnly plaintext />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Keywords</Form.Label>
          <Form.Control
            type="text"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
            placeholder="e.g. EV, SUV, market"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Main Content</Form.Label>
          <ReactQuill value={content} onChange={setContent} theme="snow" modules={quillModules} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Select Categories</Form.Label>
          <div className="d-flex flex-wrap gap-2">
            {categories.map(cat => (
              <Form.Check
                inline
                key={cat.id}
                label={cat.name}
                type="checkbox"
                id={`cat-${cat.id}`}
                checked={selectedCategoryIds.includes(cat.id)}
                onChange={() => toggleCategory(cat.id)}
              />
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Upload Media (Images/Videos, Max 4MB)</Form.Label>
          <Form.Control type="file" accept="image/*" multiple onChange={handleImageUpload} />
          <div className="mt-2 d-flex flex-wrap gap-2">
            {imagePreviews.map((url, i) => (
              <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={url}
                  alt={`preview-${i}`}
                  style={{ height: 80, borderRadius: 6, border: '1px solid #ccc' }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    background: '#dc3545',
                    border: 'none',
                    color: 'white',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    fontSize: 12,
                    lineHeight: '20px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  aria-label="Remove image"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </Form.Group>

        <Form.Group className="mb-4 p-3 border rounded bg-light">
          <strong>Chart Options</strong>
          <Form.Check type="checkbox" label="Use Chart 1" checked={useChart1} onChange={e => setUseChart1(e.target.checked)} />
          <Form.Check type="checkbox" label="Use Chart 2" checked={useChart2} onChange={e => setUseChart2(e.target.checked)} />
        </Form.Group>

        <Row>
          {useChart1 && (
            <Col md={6}>
              <div className="border p-3 mb-3 rounded">
                <h6>Chart 1 Settings</h6>
                <Form.Select value={charts[0].type} onChange={e => handleChartChange(0, 'type', e.target.value)} className="mb-2">
                  <option value="bar">Bar</option>
                  <option value="line">Line</option>
                  <option value="pie">Pie</option>
                </Form.Select>
                <Form.Control className="mb-2" value={charts[0].heading} onChange={e => handleChartChange(0, 'heading', e.target.value)} placeholder="Chart heading" />
                {renderChartDataInputs(0)}
                {renderGraph(0)}
              </div>
            </Col>
          )}
          {useChart2 && (
            <Col md={6}>
              <div className="border p-3 mb-3 rounded">
                <h6>Chart 2 Settings</h6>
                <Form.Select value={charts[1].type} onChange={e => handleChartChange(1, 'type', e.target.value)} className="mb-2">
                  <option value="bar">Bar</option>
                  <option value="line">Line</option>
                  <option value="pie">Pie</option>
                </Form.Select>
                <Form.Control className="mb-2" value={charts[1].heading} onChange={e => handleChartChange(1, 'heading', e.target.value)} placeholder="Chart heading" />
                {renderChartDataInputs(1)}
                {renderGraph(1)}
              </div>
            </Col>
          )}
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Quotes</Form.Label>
          <ReactQuill value={quotes} onChange={setQuotes} theme="snow" modules={quillModules} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Final Notes</Form.Label>
          <ReactQuill value={notes} onChange={setNotes} theme="snow" modules={quillModules} />
        </Form.Group>

        <Button type="submit" variant="primary">Submit Insight</Button>
      </form>
    </Container>
  );
}
