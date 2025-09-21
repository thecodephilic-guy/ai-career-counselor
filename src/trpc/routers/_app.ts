import z from "zod";
import { createTRPCRouter, baseProcedure } from "../init";

export const appRouter = createTRPCRouter({
  //this is like a hanlder for route in express.js context
  hello: baseProcedure.input(z.object({ text: z.string() })).query((opts) => {
    return {
      greeting: `hello ${opts.input.text}`,
    };
  }),
});


export type appRouter = typeof appRouter;