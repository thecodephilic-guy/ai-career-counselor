import z from "zod";
import { createTRPCRouter, baseProcedure } from "../init";
import { chatMessageSchema } from "@/lib/types";
import { generateAIResponse } from "../gemini";

export const appRouter = createTRPCRouter({
  //this is like a hanlder for route in express.js context
  hello: baseProcedure.input(z.object({ text: z.string() })).query((opts) => {
    return {
      greeting: `hello ${opts.input.text}`,
    };
  }),
                                                                //all things those can be destructed are: ctx, input, path signal
  sendMessage: baseProcedure.input(chatMessageSchema).mutation(async ({input}) => {
    const prompt = input.content;

    const aiContent = await generateAIResponse(prompt);

    return aiContent;
  }),
});

export type appRouter = typeof appRouter;
