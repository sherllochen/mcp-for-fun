import { z } from "zod";
// Types for query parameters
export const TransactionStatusEnum = z.enum(["HELD", "SETTLED"]);
export class ApiError extends Error {
    status;
    message;
    data;
    constructor(status, message, data) {
        super(message);
        this.status = status;
        this.message = message;
        this.data = data;
        this.name = "ApiError";
    }
}
export class ApiClient {
    baseUrl;
    token;
    constructor(baseUrl, token) {
        this.baseUrl = baseUrl;
        this.token = token;
    }
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            "Authorization": `Bearer ${this.token}`,
            "Content-Type": "application/json",
            ...options.headers,
        };
        const response = await fetch(url, {
            ...options,
            headers,
        });
        if (!response.ok) {
            throw new ApiError(response.status, `API request failed: ${response.statusText}`, await response.json().catch(() => null));
        }
        return response.json();
    }
    buildQueryString(params) {
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        }
        const queryString = queryParams.toString();
        return queryString ? `?${queryString}` : "";
    }
    async listTransactions(params = {}) {
        const queryParams = {};
        if (params.pageSize) {
            queryParams["page[size]"] = params.pageSize;
        }
        if (params.filterStatus) {
            queryParams["filter[status]"] = params.filterStatus;
        }
        if (params.filterSince) {
            queryParams["filter[since]"] = params.filterSince;
        }
        if (params.filterUntil) {
            queryParams["filter[until]"] = params.filterUntil;
        }
        if (params.filterCategory) {
            queryParams["filter[category]"] = params.filterCategory;
        }
        if (params.filterTag) {
            queryParams["filter[tag]"] = params.filterTag;
        }
        const queryString = this.buildQueryString(queryParams);
        return this.request(`/transactions${queryString}`);
    }
}
