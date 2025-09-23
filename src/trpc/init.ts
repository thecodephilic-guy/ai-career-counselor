import { initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson"
import { drizzle } from 'drizzle-orm/neon-http';

export const createTRPCContext = cache( async () => {
    //Initializing Drizzle as context:
    const db = drizzle(process.env.DATABASE_URL!);

    return {db};
})

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t= initTRPC.context<Context>().create({
    transformer: superjson
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;