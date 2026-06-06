/**
 * Invoice Editing Service
 * 
 * Service to communicate with the backend invoice editing API
 * Based on the backend API structure documented in INVOICE_EDITING_AGENT_README.md
 */

// Backend API base URL
const API_BASE_URL = "http://localhost:8000";

export interface CellMapping {
    [sheetName: string]: {
        [fieldName: string]: any;
    };
}

export interface EditSessionRequest {
    session_id?: string;
    prompt: string;
    cell_mappings: CellMapping;
    current_values?: { [cellAddress: string]: string };
    invoice_image?: string; // base64 encoded image
}

export interface EditChatRequest {
    session_id: string;
    prompt: string;
    cell_mappings?: CellMapping | null;
    current_values?: { [cellAddress: string]: string };
    invoice_image?: string;
}

export interface EditResponse {
    session_id: string;
    message: string;
    cell_updates: { [cellAddress: string]: string };
    token_count: number;
    timestamp: string;
}

export interface SessionInfo {
    session_id: string;
    created_at: string;
    last_activity: string;
    token_count: number;
    message_count: number;
}

/**
 * Create a new editing session
 */
export async function createEditingSession(
    request: EditSessionRequest
): Promise<EditResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/edit-invoice/session`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.detail || `HTTP error! status: ${response.status}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error creating editing session:", error);
        throw error;
    }
}

/**
 * Continue editing in an existing session
 */
export async function continueEditing(
    request: EditChatRequest
): Promise<EditResponse> {
    try {
        const response = await fetch(`${API_BASE_URL}/api/edit-invoice/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.detail || `HTTP error! status: ${response.status}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error continuing editing session:", error);
        throw error;
    }
}

/**
 * Get session information
 */
export async function getSessionInfo(
    sessionId: string
): Promise<SessionInfo> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/edit-invoice/session/${sessionId}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.detail || `HTTP error! status: ${response.status}`
            );
        }

        return await response.json();
    } catch (error) {
        console.error("Error getting session info:", error);
        throw error;
    }
}

/**
 * Delete an editing session
 */
export async function deleteSession(sessionId: string): Promise<void> {
    try {
        const response = await fetch(
            `${API_BASE_URL}/api/edit-invoice/session/${sessionId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
                errorData.detail || `HTTP error! status: ${response.status}`
            );
        }
    } catch (error) {
        console.error("Error deleting session:", error);
        throw error;
    }
}

/**
 * Convert image file to base64 string
 */
export async function imageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): {
    valid: boolean;
    error?: string;
} {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: "Invalid file type. Please upload JPG, PNG, or WebP images.",
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: "File size exceeds 5MB limit.",
        };
    }

    return { valid: true };
}
