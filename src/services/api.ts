// API service for backend connection

const API_BASE_URL = 'http://localhost:3002';

export interface CreateOrganRequest {
  donor: string;
  organType: string;
  bloodType: string;
  tokenURI: string;
}

export interface TransferRequest {
  tokenId: number;
  hospital: string;
}

export interface TransplantRequest {
  tokenId: number;
  recipient: string;
}

export const api = {
  createOrgan: async (data: CreateOrganRequest) => {
    const response = await fetch(`${API_BASE_URL}/createOrgan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  transferOrgan: async (data: TransferRequest) => {
    const response = await fetch(`${API_BASE_URL}/transferOrgan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  transplantOrgan: async (data: TransplantRequest) => {
    const response = await fetch(`${API_BASE_URL}/transplantOrgan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
