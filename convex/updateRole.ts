import { mutationGeneric as mutation } from "convex/server";
import { v } from "convex/values";

// Define the staff schema for validation
const staffSchema = v.object({
  name: v.string(),
  email: v.string(),
  department: v.string(),
  institutionRole: v.union(v.literal("Assistant Professor"), v.literal("Professor")),
  maxHours: v.number(),
  isActive: v.boolean(),
});

// Mutation to update the institutionRole field in a staff document
export const updateStaffInstitutionRole = mutation({
  args: {
    documentId: v.id("staff"),
    institutionRole: v.union(v.literal("Assistant Professor"), v.literal("Professor")),
  },
  handler: async (ctx: any, args: { documentId: string; institutionRole: "Assistant Professor" | "Professor" }) => {
    try {
      // Fetch the existing document
      const existingDoc = await ctx.db.get(args.documentId);

      if (!existingDoc) {
        throw new Error(`Document with ID ${args.documentId} does not exist in the staff table.`);
      }

      // Prepare the updated data (validation handled by Convex schema)
      const updatedData = {
        ...existingDoc,
        institutionRole: args.institutionRole,
      };

      // Update the document (Convex will validate against the staff table schema)
      await ctx.db.patch(args.documentId, { institutionRole: args.institutionRole });

      return {
        success: true,
        message: `Successfully updated document ${args.documentId} with institutionRole: ${args.institutionRole}`,
      };
    } catch (error) {
      console.error(`Error updating document ${args.documentId}:`, error);
      if (error instanceof Error) {
        throw new Error(`Failed to update document: ${error.message}`);
      } else {
        throw new Error(`Failed to update document: ${String(error)}`);
      }
    }
  },
});

// Example usage (can be called from a Convex action or client)
/*
async function runMutation(ctx: { db: DatabaseWriter }) {
  const documentId = "jx74dr6gbmafchd6jfcz0fmj557kc1v3";
  const institutionRole = "Assistant Professor"; // Or "Professor"

  await ctx.db.mutation("updateStaffInstitutionRole", {
    documentId,
    institutionRole,
  });
}
*/