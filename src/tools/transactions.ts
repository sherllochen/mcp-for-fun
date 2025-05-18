import { z } from "zod";
import { ApiClient, ListTransactionsParams, TransactionStatus } from "../api/client.js";

// Schema for the tool parameters
export const listTransactionsSchema = {
  pageSize: z.number().optional().describe("Number of records to return in each page"),
  filterStatus: z.enum(["HELD", "SETTLED"]).optional().describe("Filter transactions by status"),
  filterSince: z.string().optional().describe("Start date-time for filtering (RFC-3339 format)"),
  filterUntil: z.string().optional().describe("End date-time for filtering (RFC-3339 format)"),
  filterCategory: z.string().optional().describe("Category identifier for filtering"),
  filterTag: z.string().optional().describe("Transaction tag for filtering"),
};

// Helper function to format transaction data
function formatTransaction(transaction: any): string {
  const attrs = transaction.attributes;
  return [
    `ID: ${transaction.id}`,
    `Description: ${attrs.description}`,
    `Amount: ${attrs.amount.value} ${attrs.amount.currencyCode}`,
    `Status: ${attrs.status}`,
    `Date: ${attrs.settledAt}`,
    attrs.message ? `Message: ${attrs.message}` : null,
    attrs.note ? `Note: ${attrs.note}` : null,
    "---",
  ].filter(Boolean).join("\n");
}

// Create the transactions tool
export function createTransactionsTool(apiClient: ApiClient) {
  return {
    name: "list-transactions",
    description: "List transactions with optional filtering",
    schema: listTransactionsSchema,
    handler: async (params: ListTransactionsParams) => {
      try {
        const response = await apiClient.listTransactions(params);
        
        if (response.data.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: "No transactions found matching the specified criteria.",
              },
            ],
            structuredContent: {
              transactions: [],
              pagination: {
                hasNext: false,
                hasPrevious: false,
              },
            },
          };
        }

        const formattedTransactions = response.data.map(formatTransaction);
        const transactionsText = formattedTransactions.join("\n");

        // Add pagination info if available
        const paginationInfo = [];
        if (response.links.prev) paginationInfo.push("Previous page available");
        if (response.links.next) paginationInfo.push("Next page available");

        const fullText = [
          `Found ${response.data.length} transactions:`,
          "",
          transactionsText,
          paginationInfo.length > 0 ? `\nPagination: ${paginationInfo.join(", ")}` : "",
        ].join("\n");

        return {
          content: [
            {
              type: "text",
              text: fullText,
            },
          ],
          structuredContent: {
            transactions: response.data,
            pagination: {
              hasNext: !!response.links.next,
              hasPrevious: !!response.links.prev,
            },
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error retrieving transactions: ${error instanceof Error ? error.message : "Unknown error"}`,
            },
          ],
          structuredContent: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
          isError: true,
        };
      }
    },
  };
} 