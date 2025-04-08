export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Sender {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email?: string;
}

export interface Recipient {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email?: string;
}

export interface ServiceType {
  id: string;
  code: string;
  name: string;
  description: string;
  estimatedTime: string;
  pricePerKg: number;
}

export interface Shipment {
  id: string;
  receiptNumber: string;
  senderId: string;
  sender?: Sender;
  recipientId: string;
  recipient?: Recipient;
  serviceTypeId: string;
  serviceType?: ServiceType;
  weight: number;
  price: number;
  status: 'pending' | 'processing' | 'in_transit' | 'delivered' | 'returned' | 'cancelled';
  description?: string;
  items: ShipmentItem[];
  courierId?: string;
  courier?: User;
  trackingHistory: TrackingEvent[];
  pickupDate: Date;
  estimatedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentItem {
  id: string;
  shipmentId: string;
  name: string;
  quantity: number;
  weight: number;
  description?: string;
}

export interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: string;
  location: string;
  description: string;
  timestamp: Date;
  latitude?: number;
  longitude?: number;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  type: 'warehouse' | 'distribution_center' | 'pickup_point';
  isActive: boolean;
}

export interface DashboardStats {
  totalShipments: number;
  pendingShipments: number;
  inTransitShipments: number;
  deliveredShipments: number;
  returnedShipments: number;
  totalRevenue: number;
  recentShipments: Shipment[];
} 