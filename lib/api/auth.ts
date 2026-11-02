import {apiClient} from "./client";
import {
    setAuthToken,
    setRefreshToken,
    setStoredUser,
    clearAuth,
    getAuthToken,
    getStoredUser,
    isTokenValid,
} from "./token";
import {
    ApiResponse,
    AuthData,
    LoginRequest,
    SignupRequest,
    User,
    VisaApplicationSummary,
    VisaApplicationResponse,
    GroupApplicationResponse,
} from "./types";

/**
 * Perform login against backend API and persist JWT tokens in browser cookies/storage
 */
export async function loginApi(credentials: LoginRequest): Promise<ApiResponse<AuthData>> {
    const response = await apiClient.post<AuthData, LoginRequest>(
        "/auth/signin",
        credentials,
        {requiresAuth: false}
    );

    // If login succeeded, persist JWT tokens & user info in standard browser cookies / storage
    if (response.success && response.data) {
        const {token, refreshToken, user} = response.data;

        if (token) {
            setAuthToken(token);
        }
        if (refreshToken) {
            setRefreshToken(refreshToken);
        }
        if (user) {
            setStoredUser(user);
        }
    }

    return response;
}

/**
 * Register a new user account with default CLIENT role
 */
export async function registerApi(data: SignupRequest): Promise<ApiResponse<User>> {
    const response = await apiClient.post<User, SignupRequest>(
        "/auth/signup",
        data,
        {requiresAuth: false}
    );
    return response;
}

/**
 * Fetch profile details for the currently authenticated client
 */
export async function getUserProfileApi(): Promise<ApiResponse<User>> {
    const response = await apiClient.get<User>("/users/me");

    // Keep locally cached user profile in sync
    if (response.success && response.data) {
        setStoredUser(response.data);
    }

    return response;
}

/**
 * Fetch standalone solo / individual visa applications for the authenticated client.
 * Corresponds to backend API: GET /applications/solo/user/{userId} (or GET /applications/solo?userId={userId})
 * Guarantee: No group members will ever show up here.
 */
export async function getUserSoloApplicationsApi(
    userId?: string
): Promise<ApiResponse<VisaApplicationSummary[]>> {
    const targetUserId = userId || getCurrentUser()?.id;

    if (targetUserId) {
        return apiClient.get<VisaApplicationSummary[]>(
            `/applications/solo/user/${targetUserId}`
        );
    }
    return apiClient.get<VisaApplicationSummary[]>("/applications/solo");
}

// Backward-compatibility alias
export const getUserApplicationsApi = getUserSoloApplicationsApi;

/**
 * Fetch multi-person group visa applications for the authenticated client.
 * Corresponds to backend API: GET /applications/groups/user/{userId} (or GET /applications/groups?userId={userId})
 * Guarantee: Solo travelers will never show up here.
 */
export async function getUserGroupApplicationsApi(
    userId?: string
): Promise<ApiResponse<GroupApplicationResponse[] | GroupApplicationResponse>> {
    const targetUserId = userId || getCurrentUser()?.id;

    if (targetUserId) {
        return apiClient.get<GroupApplicationResponse[] | GroupApplicationResponse>(
            `/applications/groups/user/${targetUserId}`
        );
    }
    return apiClient.get<GroupApplicationResponse[] | GroupApplicationResponse>(
        "/applications/groups"
    );
}

/**
 * Fetch full details of a specific visa application by ID
 * Corresponds to backend API: GET /applications/{id}
 */
export async function getApplicationByIdApi(
    id: string
): Promise<ApiResponse<VisaApplicationResponse>> {
    if (!id) {
        throw new Error("Application ID is required to fetch details.");
    }
    return apiClient.get<VisaApplicationResponse>(`/applications/${id}`);
}

/**
 * Standard logout: clears tokens from cookies & storage, and notifies the backend
 */
export async function logoutApi(): Promise<void> {
    try {
        await apiClient.post("/auth/logout");
    } catch {
        // Suppress API logout errors so client-side state is always cleared
    } finally {
        clearAuth();
    }
}

/**
 * Retrieve authenticated user from browser storage
 */
export function getCurrentUser(): User | null {
    return getStoredUser<User>();
}

/**
 * Check if the user is currently authenticated with a valid non-expired token
 */
export function isAuthenticated(): boolean {
    return isTokenValid();
}

// Re-export token management utilities for convenience
export {getAuthToken, clearAuth, isTokenValid, getStoredUser} from "./token";
