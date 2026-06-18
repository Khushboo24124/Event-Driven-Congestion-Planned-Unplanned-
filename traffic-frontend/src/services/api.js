import dashboardMock from './mocks/dashboard.json';
import predictMock from './mocks/predict.json';
import routeMock from './mocks/route.json';

const USE_MOCK = true; 
const BASE_URL = 'https://payal-12-astram-traffic-api.hf.space'; 

export const getDashboard = async () => {
  if (USE_MOCK) return dashboardMock;
  const res = await fetch(`${BASE_URL}/api/v1/dashboard`);
  return res.json();
};

export const getRoute = async () => {
  if (USE_MOCK) return routeMock;
  const res = await fetch(`${BASE_URL}/api/v1/route`);
  return res.json();
};

export const getPredict = async (payload) => {
  if (USE_MOCK) return predictMock;
  const res = await fetch(`${BASE_URL}/api/v1/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  return res.json();
};