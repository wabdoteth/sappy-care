import { z } from "zod";

export const moodSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const checkinSchema = z.object({
  mood: moodSchema,
  note: z.string().max(280).optional(),
});
