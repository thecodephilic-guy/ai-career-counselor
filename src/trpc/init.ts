import { initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson"

export const createTRPCContext = cache( async () => {
    const userSession = {active: true};

    return userSession;
})

const t= initTRPC.create({
    transformer: superjson
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;