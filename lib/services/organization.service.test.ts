import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrganizationService } from "@/lib/services/organization.service";
import { NotFoundError, ValidationError } from "@/lib/api/errors";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    organization: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
  },
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

describe("OrganizationService", () => {
  beforeEach(() => {
    prismaMock.organization.findMany.mockReset();
    prismaMock.organization.findUnique.mockReset();
    prismaMock.organization.create.mockReset();
  });

  it("lists organizations with problem counts", async () => {
    prismaMock.organization.findMany.mockResolvedValue([{ id: "o1" }]);
    await expect(OrganizationService.listOrganizations()).resolves.toEqual([{ id: "o1" }]);
    expect(prismaMock.organization.findMany).toHaveBeenCalledWith({
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
        _count: { select: { problems: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns an organization by id", async () => {
    prismaMock.organization.findUnique.mockResolvedValue({ id: "o1" });
    await expect(OrganizationService.getOrganizationById("o1")).resolves.toEqual({ id: "o1" });
  });

  it("throws NotFoundError for a missing organization", async () => {
    prismaMock.organization.findUnique.mockResolvedValue(null);
    await expect(OrganizationService.getOrganizationById("nope")).rejects.toBeInstanceOf(NotFoundError);
  });

  it("throws ValidationError for an empty name", async () => {
    await expect(OrganizationService.findOrCreateOrganization({ name: "  " })).rejects.toBeInstanceOf(
      ValidationError
    );
  });

  it("creates an organization with trimmed name and default type", async () => {
    prismaMock.organization.create.mockResolvedValue({ id: "o2" });
    await expect(
      OrganizationService.findOrCreateOrganization({ name: " Acme " })
    ).resolves.toEqual({ id: "o2" });
    expect(prismaMock.organization.create).toHaveBeenCalledWith({
      data: { name: "Acme", type: "COACHING_CENTER" },
    });
  });

  it("creates an organization with an explicit type", async () => {
    prismaMock.organization.create.mockResolvedValue({ id: "o3" });
    await expect(
      OrganizationService.findOrCreateOrganization({ name: "Acme", type: "COLLEGE_DEPT" })
    ).resolves.toEqual({ id: "o3" });
    expect(prismaMock.organization.create).toHaveBeenCalledWith({
      data: { name: "Acme", type: "COLLEGE_DEPT" },
    });
  });
});