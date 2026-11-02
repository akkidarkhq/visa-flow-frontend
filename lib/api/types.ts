/**
 * Standard API response and error contracts matching the backend:
 * com.akkidarkhq.visaflow.dto.ApiResponse<T> and ApiError
 */

export interface ApiError {
  code?: string;
  message: string;
  details?: unknown;
  validationErrors?: Record<string, string>;
  status?: number;
  timestamp?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: ApiError;
  timestamp?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  email: string;
  fullName: string;
  password: string;
  phoneNumber: string;
  role?: string;
}

export type RegisterRequest = SignupRequest;

export type UserRole = "CLIENT" | "ADMIN";

/**
 * Backend User entity:
 * com.akkidarkhq.visaflow.entity.User
 */
export interface User {
  id: string; // UUID
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string; // OffsetDateTime ISO string
  updatedAt: string; // OffsetDateTime ISO string
}

export interface AuthData {
  token?: string;
  refreshToken?: string;
  user?: User;
  [key: string]: unknown;
}

export type ApplicationStatus =
  | "APPLICATION_STARTED"
  | "DOCUMENTS_PENDING"
  | "DOCUMENTS_UNDER_REVIEW"
  | "DOCUMENTS_COMPLETE"
  | "SUBMITTED"
  | "EMBASSY_CONSULATE_PROCESSING"
  | "PASSPORT_DECISION_RECEIVED"
  | "COMPLETED";

export interface VisaApplicationSummary {
  id: string;
  orderReference?: string;
  referenceNumber?: string;
  countryName: string;
  countryCode?: string;
  visaType: string;
  visaTypeName?: string;
  travellerFullName: string;
  status: ApplicationStatus;
  submittedAt?: string;
  updatedAt: string;
  groupReference?: string;
}

export interface VisaApplicationDocument {
  id?: string;
  name?: string;
  documentType?: string;
  fileName?: string;
  status?: string;
  fileUrl?: string;
  uploadedAt?: string;
}

export interface DocumentsSummary {
  totalMandatoryRequired?: number;
  totalUploaded?: number;
  totalApproved?: number;
  totalUnderReview?: number;
  totalCorrectionRequested?: number;
  totalRejected?: number;
}

/**
 * Individual Traveller representation inside a group application
 */
export interface GroupTraveller {
  applicationId: string;
  referenceNumber: string;
  status: ApplicationStatus;
  createdAt: string;
  travellerId: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  passportNumber?: string;
  passportExpiry?: string;
  dateOfBirth?: string;
  nationality?: string;
  gender?: string;
  orderItemId?: string | null;
  orderReference?: string | null;
  documentsSummary?: DocumentsSummary;
  paid?: boolean;
}

/**
 * Group Application structure returned by GET /applications/groups/user/{userId}
 */
export interface GroupApplicationResponse {
  groupReference: string;
  visaTypeId?: number;
  visaTypeName: string;
  countryName: string;
  countryCode?: string;
  serviceFee?: number;
  embassyFee?: number;
  feePerPerson?: number;
  totalEstimatedCost?: number;
  currency?: string;
  totalTravellers: number;
  travellers: GroupTraveller[];
  readyForCheckout?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Complete Visa Application Response matching the backend DTO:
 * com.akkidarkhq.visaflow.dto.VisaApplicationResponse
 */
export interface VisaApplicationResponse {
  id: string;
  userId?: string;
  orderReference?: string;
  referenceNumber?: string;
  groupReference?: string;
  countryName?: string;
  countryCode?: string;
  visaType?: string;
  visaTypeName?: string;
  travellerId?: string;
  travellerFullName?: string;
  applicantName?: string;
  visaTypeId?: number;
  status: ApplicationStatus;
  travellers?: GroupTraveller[];
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
  dateOfBirth?: string;
  gender?: string;
  travelDate?: string;
  returnDate?: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  totalAmount?: number | string;
  fee?: number | string;
  currency?: string;
  notes?: string;
  remarks?: string;
  documents?: VisaApplicationDocument[];
  documentsSummary?: DocumentsSummary;
  paid?: boolean;
}

export interface CountryResponse {
  id: number;
  isoCode: string;
  name: string;
  flagIconUrl?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface VisaTypeResponse {
  id: number;
  countryId: number;
  countryName?: string;
  countryIsoCode?: string;
  name: string;
  processingTimeDays?: number;
  serviceFee: number;
  embassyFee: number;
  totalFee: number;
  currency?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface TravellerProfileRequest {
  userId: string;
  firstName: string;
  lastName: string;
  passportNumber: string;
  passportExpiry: string;
  dateOfBirth: string;
  nationality: string;
  gender?: string;
}

export interface TravellerResponseDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  passportNumber: string;
  passportExpiry: string;
  dateOfBirth: string;
  nationality: string;
  gender?: string;
  createdAt?: string;
}

export interface CreateVisaApplicationRequest {
  travellerId: string;
  visaTypeId: number;
}

export interface CreateGroupVisaApplicationRequest {
  visaTypeId: number;
  travellerIds: string[];
}

