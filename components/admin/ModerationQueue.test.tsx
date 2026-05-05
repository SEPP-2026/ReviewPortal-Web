import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, jest, beforeEach } from "@jest/globals";

import { ModerationQueue } from "@/components/admin/ModerationQueue";

describe("ModerationQueue", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it("renders pending reviews with their details", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          items: [
            {
              id: 11,
              toolId: 4,
              toolName: "Mini Excavator",
              reviewerName: "Alex Carter",
              reviewText: "Arrived on time and performed well on site.",
              equipmentRating: 5,
              customerServiceRating: 4,
              technicalSupportRating: 4,
              afterSalesRating: 5,
              valueForMoneyRating: 4,
              overallRating: 4.4,
              status: "Pending",
              rejectionReason: null,
              createdDate: "2026-05-01T12:00:00.000Z",
              comments: [],
              companyResponse: null,
            },
          ],
          page: 1,
          pageSize: 20,
          totalCount: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        }),
      } as Response);

    Object.defineProperty(globalThis, "fetch", {
      value: fetchMock,
      writable: true,
      configurable: true,
    });

    render(<ModerationQueue />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());

    expect(await screen.findByText(/pending review/i)).toBeInTheDocument();
    expect(screen.getByText("Alex Carter")).toBeInTheDocument();
    expect(screen.getByText("Mini Excavator")).toBeInTheDocument();
    expect(screen.getByText(/arrived on time/i)).toBeInTheDocument();
    expect(screen.getAllByText("4.4").length).toBeGreaterThan(0);
  });
});