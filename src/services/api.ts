// Mock API service for AnnSetu platform

export interface Donation {
  id: string;
  foodType: string;
  quantity: string;
  expiryTime: string;
  pickupLocation: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';
  pickupOTP?: string;
  dropOTP?: string;
  donorId: string;
  volunteerId?: string;
  receiverId?: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  userId: string;
  category: string;
  description: string;
  imageUrl?: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface DeliveryTask {
  id: string;
  donationId: string;
  pickupLocation: string;
  dropLocation: string;
  pickupOTP: string;
  dropOTP: string;
  status: 'assigned' | 'picked_up' | 'delivered';
  foodDetails: string;
}

export interface FoodInventory {
  id: string;
  foodType: string;
  quantity: string;
  receivedAt: string;
  expiryTime: string;
  status: 'pending' | 'accepted' | 'rejected' | 'dispatched';
  source: string;
}

// Mock data generator
const generateMockDonations = (): Donation[] => [
  {
    id: '1',
    foodType: 'Rice & Curry',
    quantity: '50 plates',
    expiryTime: '6 hours',
    pickupLocation: '123 Main St, City Center',
    status: 'pending',
    pickupOTP: '1234',
    dropOTP: '5678',
    donorId: 'donor1',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    foodType: 'Sandwiches',
    quantity: '30 packs',
    expiryTime: '4 hours',
    pickupLocation: '456 Park Ave',
    status: 'assigned',
    pickupOTP: '2345',
    dropOTP: '6789',
    donorId: 'donor1',
    volunteerId: 'vol1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const generateMockTasks = (): DeliveryTask[] => [
  {
    id: 't1',
    donationId: '2',
    pickupLocation: '456 Park Ave',
    dropLocation: '789 Community Center',
    pickupOTP: '2345',
    dropOTP: '6789',
    status: 'assigned',
    foodDetails: 'Sandwiches - 30 packs',
  },
];

const generateMockInventory = (): FoodInventory[] => [
  {
    id: 'inv1',
    foodType: 'Fresh Vegetables',
    quantity: '100 kg',
    receivedAt: new Date().toISOString(),
    expiryTime: '48 hours',
    status: 'pending',
    source: 'City Market Donation',
  },
  {
    id: 'inv2',
    foodType: 'Packaged Meals',
    quantity: '200 units',
    receivedAt: new Date(Date.now() - 7200000).toISOString(),
    expiryTime: '24 hours',
    status: 'accepted',
    source: 'Restaurant Chain',
  },
];

// API functions
export const api = {
  // Donations
  createDonation: async (data: Omit<Donation, 'id' | 'status' | 'createdAt' | 'pickupOTP' | 'dropOTP'>): Promise<Donation> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newDonation: Donation = {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          status: 'pending',
          pickupOTP: Math.floor(1000 + Math.random() * 9000).toString(),
          dropOTP: Math.floor(1000 + Math.random() * 9000).toString(),
          createdAt: new Date().toISOString(),
        };
        resolve(newDonation);
      }, 1000);
    });
  },

  getDonations: async (userId?: string): Promise<Donation[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockDonations());
      }, 500);
    });
  },

  // Delivery tasks
  getDeliveryTasks: async (volunteerId: string): Promise<DeliveryTask[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockTasks());
      }, 500);
    });
  },

  verifyPickupOTP: async (taskId: string, otp: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(otp === '2345'); // Mock verification
      }, 1000);
    });
  },

  verifyDropOTP: async (taskId: string, otp: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(otp === '6789'); // Mock verification
      }, 1000);
    });
  },

  // Warehouse
  getInventory: async (): Promise<FoodInventory[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockInventory());
      }, 500);
    });
  },

  updateInventoryStatus: async (id: string, status: FoodInventory['status']): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 800);
    });
  },

  // Issues
  createIssue: async (data: Omit<Issue, 'id' | 'status' | 'createdAt'>): Promise<Issue> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newIssue: Issue = {
          ...data,
          id: Math.random().toString(36).substr(2, 9),
          status: 'open',
          createdAt: new Date().toISOString(),
        };
        resolve(newIssue);
      }, 1000);
    });
  },

  getIssues: async (): Promise<Issue[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'iss1',
            userId: 'user1',
            category: 'Delivery Delay',
            description: 'Food delivery was delayed by 2 hours',
            status: 'open',
            createdAt: new Date().toISOString(),
          },
        ]);
      }, 500);
    });
  },

  // Admin stats
  getAdminStats: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalFoodSaved: '12,450 kg',
          activeUsers: 1247,
          ongoingDeliveries: 18,
          totalDonations: 856,
        });
      }, 500);
    });
  },

  // Available food for receivers
  getAvailableFood: async (): Promise<Donation[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          generateMockDonations().filter((d) => d.status === 'pending' || d.status === 'assigned')
        );
      }, 500);
    });
  },

  requestFood: async (donationId: string, receiverId: string): Promise<{ dropOTP: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ dropOTP: '6789' });
      }, 1000);
    });
  },
};
