import { ApiClient, TransactionStatus } from "./client.js";

async function main() {
  // Initialize the API client
  const client = new ApiClient(
    "https://api.up.com.au/api/v1",
    "your-api-token-here"
  );

  try {
    // Example 1: Get all transactions
    const allTransactions = await client.listTransactions();
    console.log("All transactions:", allTransactions);

    // Example 2: Get transactions with filters
    const filteredTransactions = await client.listTransactions({
      pageSize: 30,
      filterStatus: "SETTLED" as TransactionStatus,
      filterSince: "2024-01-01T00:00:00+10:00",
      filterUntil: "2024-03-01T00:00:00+10:00",
      filterTag: "Pizza Night",
    });
    console.log("Filtered transactions:", filteredTransactions);

    // Example 3: Pagination handling
    let nextPageUrl = null;
    do {
      const response = await client.listTransactions({
        pageSize: 10,
      });
      
      // Process the transactions
      for (const transaction of response.data) {
        console.log(`Transaction ${transaction.id}: ${transaction.attributes.description}`);
      }

      // Check if there's a next page
      nextPageUrl = response.links.next;
    } while (nextPageUrl);

  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    } else {
      console.error("Unknown error occurred");
    }
  }
}

main().catch(console.error); 