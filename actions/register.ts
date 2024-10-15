"use server";

import * as z from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getUserByEmail } from '@/data/user';
import { RegisterSchema } from "@/schemas"; 


export const register = async( values: z.infer<typeof RegisterSchema> ) =>{
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return{error: "Invalid Fields"};
    }

    const { email, password, name } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const exsistingUser = await getUserByEmail(email);  

    if (exsistingUser) {
        return { error: "そのメールアドレスはすでに使用されています" }
    }

    await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });


    //TODO: send varification token Email

    return { success: "新規登録完了！"};
    
}

