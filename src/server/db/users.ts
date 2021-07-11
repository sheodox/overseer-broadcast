import {Prisma} from "@prisma/client";
import {prisma} from "./prisma";

export async function findUserNoSensitiveData(where: Prisma.UserWhereUniqueInput) {
    return await prisma.user.findUnique({
        where,
        // only select fields that isn't going to leak a password
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            permitted: true
        }
    });
}
