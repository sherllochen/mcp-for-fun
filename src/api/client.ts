import { z } from "zod";

// Types for query parameters
export const TransactionStatusEnum = z.enum(["HELD", "SETTLED"]);
export type TransactionStatus = z.infer<typeof TransactionStatusEnum>;

export interface ListTransactionsParams {
  pageSize?: number;
  filterStatus?: TransactionStatus;
  filterSince?: string;
  filterUntil?: string;
  filterCategory?: string;
  filterTag?: string;
}

// Response types
export interface Money {
  currencyCode: string;
  value: string;
  valueInBaseUnits: number;
}

export interface TransactionAttributes {
  status: TransactionStatus;
  rawText: string | null;
  description: string;
  message: string | null;
  isCategorizable: boolean;
  holdInfo: any | null;
  roundUp: any | null;
  cashback: any | null;
  amount: Money;
  foreignAmount: Money | null;
  cardPurchaseMethod: any | null;
  settledAt: string;
  createdAt: string;
  transactionType: string | null;
  note: string | null;
  performingCustomer?: {
    displayName: string;
  };
}

export interface Transaction {
  type: "transactions";
  id: string;
  attributes: TransactionAttributes;
  relationships: {
    account: {
      data: {
        type: "accounts";
        id: string;
      };
      links: {
        related: string;
      };
    };
    transferAccount: {
      data: null | {
        type: "accounts";
        id: string;
      };
    };
    category: {
      data: null | {
        type: "categories";
        id: string;
      };
      links: {
        self: string;
      };
    };
    parentCategory: {
      data: null | {
        type: "categories";
        id: string;
      };
    };
    tags: {
      data: Array<{
        type: "tags";
        id: string;
      }>;
      links: {
        self: string;
      };
    };
    attachment: {
      data: null | {
        type: "attachments";
        id: string;
      };
    };
  };
  links: {
    self: string;
  };
}

export interface ListTransactionsResponse {
  data: Transaction[];
  links: {
    prev: string | null;
    next: string | null;
  };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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
      throw new ApiError(
        response.status,
        `API request failed: ${response.statusText}`,
        await response.json().catch(() => null)
      );
    }

    return response.json();
  }

  private buildQueryString(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    }

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : "";
  }

  async listTransactions(params: ListTransactionsParams = {}): Promise<ListTransactionsResponse> {
    const queryParams: Record<string, any> = {};

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
    return this.request<ListTransactionsResponse>(`/transactions${queryString}`);
  }
} 