export enum UserRole {
  MOTORIST = 'motorist',
  GARAGE = 'garage',
  MECHANIC = 'mechanic',
  ADMIN = 'admin',
}

export enum BreakdownStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  MECHANIC_ASSIGNED = 'mechanic_assigned',
  MECHANIC_ON_WAY = 'mechanic_on_way',
  MECHANIC_ARRIVED = 'mechanic_arrived',
  DIAGNOSING = 'diagnosing',
  QUOTE_SENT = 'quote_sent',
  QUOTE_ACCEPTED = 'quote_accepted',
  REPAIRING = 'repairing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PaymentType {
  DIAGNOSTIC = 'diagnostic',
  REPAIR = 'repair',
}

export enum VehicleType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  TRUCK = 'truck',
  VAN = 'van',
  BUS = 'bus',
}

export enum GarageStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum MechanicStatus {
  AVAILABLE = 'available',
  ON_MISSION = 'on_mission',
  OFFLINE = 'offline',
}

export enum NotificationType {
  BREAKDOWN_CREATED = 'breakdown_created',
  BREAKDOWN_ACCEPTED = 'breakdown_accepted',
  MECHANIC_ASSIGNED = 'mechanic_assigned',
  MECHANIC_ON_WAY = 'mechanic_on_way',
  MECHANIC_ARRIVED = 'mechanic_arrived',
  DIAGNOSIS_COMPLETE = 'diagnosis_complete',
  QUOTE_RECEIVED = 'quote_received',
  QUOTE_ACCEPTED = 'quote_accepted',
  REPAIR_STARTED = 'repair_started',
  REPAIR_COMPLETED = 'repair_completed',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_FAILED = 'payment_failed',
  NEW_REVIEW = 'new_review',
  SYSTEM = 'system',
}
