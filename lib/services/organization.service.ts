import { prisma } from "@/lib/db";
import { ValidationError, NotFoundError } from "@/lib/api/errors";

export interface CreateOrganizationInput {
  name: string;
  type?: string;
}

export class OrganizationService {
  /**
   * List all registered organizations with problem count
   */
  static async listOrganizations() {
    return prisma.organization.findMany({
      include: {
        _count: {
          select: { problems: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get organization by ID
   */
  static async getOrganizationById(id: string) {
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: { problems: true },
        },
      },
    });

    if (!org) {
      throw new NotFoundError(`Organization with id "${id}" not found.`);
    }

    return org;
  }

  /**
   * Find existing or create fallback organization for quick submission
   */
  static async findOrCreateOrganization(input: CreateOrganizationInput) {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError("Organization name is required.");
    }

    return prisma.organization.create({
      data: {
        name: input.name.trim(),
        type: input.type || "COACHING_CENTER",
      },
    });
  }
}
