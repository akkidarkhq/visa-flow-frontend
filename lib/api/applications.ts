import { apiClient } from "./client";
import {
  ApiResponse,
  CountryResponse,
  VisaTypeResponse,
  TravellerProfileRequest,
  TravellerResponseDto,
  CreateVisaApplicationRequest,
  CreateGroupVisaApplicationRequest,
  VisaApplicationResponse,
} from "./types";

/**
 * Fetch all enabled destination countries
 * Endpoint: GET /api/countries
 */
export async function getCountriesApi(): Promise<ApiResponse<CountryResponse[]>> {
  return apiClient.get<CountryResponse[]>("/countries");
}

/**
 * Fetch all visa categories for a specific country
 * Endpoint: GET /api/visa-types/country/{countryId}
 */
export async function getVisaTypesByCountryApi(
  countryId: number
): Promise<ApiResponse<VisaTypeResponse[]>> {
  return apiClient.get<VisaTypeResponse[]>(`/visa-types/country/${countryId}`);
}

/**
 * Fetch saved traveller profiles for a user account
 * Endpoint: GET /api/travellers/user/{userId}
 */
export async function getUserTravellersApi(
  userId: string
): Promise<ApiResponse<TravellerResponseDto[]>> {
  if (!userId) {
    throw new Error("User ID is required to fetch saved travellers.");
  }
  return apiClient.get<TravellerResponseDto[]>(`/travellers/user/${userId}`);
}

/**
 * Create a new persistent traveller profile
 * Endpoint: POST /api/travellers
 */
export async function createTravellerApi(
  payload: TravellerProfileRequest
): Promise<ApiResponse<TravellerResponseDto>> {
  return apiClient.post<TravellerResponseDto, TravellerProfileRequest>(
    "/travellers",
    payload
  );
}

/**
 * Create a single visa application for 1 traveller (Model B flow)
 * Endpoint: POST /api/applications
 */
export async function createSingleApplicationApi(
  payload: CreateVisaApplicationRequest
): Promise<ApiResponse<VisaApplicationResponse>> {
  return apiClient.post<VisaApplicationResponse, CreateVisaApplicationRequest>(
    "/applications",
    payload
  );
}

/**
 * Create visa applications for multiple travellers in a group upfront
 * All applications share the generated groupReference
 * Endpoint: POST /api/applications/group
 */
export async function createGroupApplicationApi(
  payload: CreateGroupVisaApplicationRequest
): Promise<ApiResponse<VisaApplicationResponse[]>> {
  return apiClient.post<VisaApplicationResponse[], CreateGroupVisaApplicationRequest>(
    "/applications/group",
    payload
  );
}
