import request from 'supertest';
import express from 'express';
import apiRoute from './api-route';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const app = express();
app.use(express.json());
app.use(apiRoute);

describe('api-route', () => {
  beforeEach(() => {
    mockedAxios.mockClear();
  });

  it('should proxy request to the correct service when path matches', async () => {
    mockedAxios.mockResolvedValue({
      status: 200,
      data: { message: 'Success' },
    });

    const res = await request(app).get('/users/123');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ message: 'Success' });
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'get',
        url: expect.stringContaining('http://localhost:3000/users/123'), // Assuming users service is on 3000
      })
    );
  });

  it('should return 404 when service path does not match', async () => {
    const res = await request(app).get('/nonexistent/path');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toEqual({ message: 'Service not found' });
    expect(mockedAxios).not.toHaveBeenCalled();
  });

  it('should return backend service success response', async () => {
    mockedAxios.mockResolvedValue({
      status: 201,
      data: { id: 'abc', name: 'Test' },
    });

    const res = await request(app).post('/payment/process').send({ amount: 100 });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({ id: 'abc', name: 'Test' });
    expect(mockedAxios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post',
        url: expect.stringContaining('http://localhost:3001/payment/process'), // Assuming payment service is on 3001
        data: { amount: 100 },
      })
    );
  });

  it('should return backend service error response', async () => {
    mockedAxios.mockRejectedValue({
      response: {
        status: 400,
        data: { error: 'Invalid input' },
      },
    });

    const res = await request(app).put('/funding/update').send({ status: 'completed' });
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ error: 'Invalid input' });
    expect(mockedAxios).toHaveBeenCalled();
  });

  it('should pass error to next middleware if axios call fails without response', async () => {
    const mockError = new Error('Network error');
    mockedAxios.mockRejectedValue(mockError);

    const res = await request(app).get('/users/123');
    expect(res.statusCode).toEqual(500); // Default error handler in supertest
    expect(res.text).toContain('Network error');
    expect(mockedAxios).toHaveBeenCalled();
  });
});
