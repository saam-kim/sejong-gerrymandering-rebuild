import { describe, expect, it, vi } from "vitest";
import { buildTeamRemovalUpdates, claimAvailablePin, isValidPin } from "./roomPaths";

describe("room PIN helpers", () => {
  it("accepts only a six digit PIN", () => {
    expect(isValidPin("123456")).toBe(true);
    expect(isValidPin(" 123456 ")).toBe(true);
    expect(isValidPin("12345")).toBe(false);
    expect(isValidPin("12345a")).toBe(false);
  });

  it("retries collisions without overwriting an existing room", async () => {
    const generate = vi.fn().mockReturnValueOnce("111111").mockReturnValueOnce("222222");
    const tryClaim = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);

    await expect(claimAvailablePin(tryClaim, generate)).resolves.toBe("222222");
    expect(tryClaim).toHaveBeenNthCalledWith(1, "111111");
    expect(tryClaim).toHaveBeenNthCalledWith(2, "222222");
  });

  it("fails clearly after repeated collisions", async () => {
    await expect(claimAvailablePin(() => false, () => "111111", 2)).rejects.toThrow("사용 가능한 방 PIN");
  });
});

describe("team cleanup", () => {
  it("removes the team and every round's drafts and submissions", () => {
    expect(buildTeamRemovalUpdates("team-example")).toEqual({
      "teams/team-example": null,
      "drafts/1/team-example": null,
      "submissions/1/team-example": null,
      "drafts/2/team-example": null,
      "submissions/2/team-example": null,
      "drafts/3/team-example": null,
      "submissions/3/team-example": null,
    });
  });
});
