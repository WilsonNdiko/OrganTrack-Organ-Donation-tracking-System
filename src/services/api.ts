// API service for backend connection

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://orgflow-backend-t55x.onrender.com';

export interface CreateOrganRequest {
  donor: string;
  organType: string;
  bloodType: string;
  tokenURI?: string;
  hospital?: string;
}

export interface TransferRequest {
  tokenId: number;
  hospital: string;
}

export interface TransplantRequest {
  tokenId: number;
  recipient: string;
}

export interface Organ {
  tokenId: number;
  organType: string;
  bloodType: string;
  status: string;
  donor?: string;
  hospital?: string;
  recipient?: string;
  createdAt: string;
  tokenURI?: string;
}

export interface AnalyticsData {
  totalOrgans: number;
  transplanted?: number;
  inTransit?: number;
  activeTransactions?: number;
  recentActivity: any[];
  timestamp: string;
}

export interface OrganRequest {
  id?: number;
  request_id: string;
  organ_id: number;
  requesting_hospital: string;
  owning_hospital: string;
  status: 'pending' | 'accepted' | 'rejected';
  requester_address?: string;
  created_at: string;
  updated_at?: string;
  // Frontend compatibility aliases
  organId?: string;
  requestingHospital?: string;
  owningHospital?: string;
  timestamp?: string;
}

export const api = {
  // Organ management
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

  // Data fetching
  getOrgans: async (): Promise<Organ[]> => {
    const response = await fetch(`${API_BASE_URL}/organs`);
    return response.json();
  },

  getAnalytics: async (): Promise<AnalyticsData> => {
    const response = await fetch(`${API_BASE_URL}/analytics`);
    return response.json();
  },

  // Organ requests management
  createOrganRequest: async (data: {
    organId: number;
    requestingHospital: string;
    owningHospital?: string;
    requesterAddress?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/createOrganRequest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  getOrganRequests: async (): Promise<OrganRequest[]> => {
    const response = await fetch(`${API_BASE_URL}/organRequests`);
    return response.json();
  },

  updateOrganRequest: async (data: {
    requestId: string;
    status: 'accepted' | 'rejected';
    organId?: number;
  }) => {
    const response = await fetch(`${API_BASE_URL}/updateOrganRequest`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Development/Testing utilities
  clearOrgans: async () => {
    const response = await fetch(`${API_BASE_URL}/clearOrgans`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
