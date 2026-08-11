import z from "zod";

export interface CustomJwtSessionClaims{
    metadata?:{
        role? : "admin" | "user";
    }
}


export const userFormSchema = z.object({
  firstName: z
    .string({message: "first name is required"})
    .min(2, { message: "First name must be at least 2 characters!" })
    .max(50),
  lastName: z
    .string({message: "last name is required"})
    .min(2, { message: "last name must be at least 2 characters!" })
    .max(50),
  userName: z
    .string({message: "Username is required"})
    .min(2, { message: "Username must be at least 2 characters!" })
    .max(50),
  emailAddress:z.array(z.string({message:" email address is required "})),
  password: z
    .string({message: "password is required"})
    .min(8, { message: "password must be at least 8 characters!" })
    .max(50),
});