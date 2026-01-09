'use client'
import React from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

const ConnectForm = () => {
  return (
    <div style={{ backgroundColor: '#e6e1df', padding: '40px 0' }}>
      <Container>
        <Row className="align-items-center" >
          <Col md={6}>
            <h2 className="mb-3" style={{ color: '#5f504d', fontWeight: 'bold' }}>Connect with us</h2>
            <p style={{ color: '#5f504d' }}>
              Explore the latest in automotive innovation with expert reviews, news, and top car deals.
              Drive your passion with our comprehensive guides and automotive insights!
            </p>
          </Col>
          <Col md={6}>
            <Form>
              <Form.Group controlId="formName" className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Enter your Name"
                  style={{ borderColor: '#5f504d', borderRadius: '10px' }}
                />
              </Form.Group>
              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Control
                  type="email"
                  placeholder="Enter your Email"
                  style={{ borderColor: '#5f504d', borderRadius: '10px' }}
                />
              </Form.Group>
              <Form.Group controlId="formMobile" className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Enter your Mobile Number"
                  style={{ borderColor: '#5f504d', borderRadius: '10px' }}
                />
              </Form.Group>
              <div className='text-center'>
              <Button
                variant="light"
                type="submit"
                style={{ borderRadius: '10px', padding: '10px 30px', fontWeight: 'bold', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}
              >
                Subscribe Now
              </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ConnectForm;
