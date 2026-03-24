import {z} from "zod";


export const registerSchema = z.object({
  email: z.email({
    message: "Please provide a valid email address",
  }).transform(val => val.trim().toLowerCase()),
});

export const registerUserSchema = z.object({
  name: z.string().trim().nonempty({
    message: "Name must not be empty",
  }),
  email: z.email({
    message: "Please provide a valid email address",
  })
  .nonempty({
    message: "Email must not be empty"
  })
  .transform(val => val.trim().toLowerCase()),
  password: z.string().trim().nonempty({
    message: "Password must not be empty",
  }),
});

export const loginUserSchema = z.object({
  email: z.email({
    message: "Please provide a valid email address",
  }),
  password: z.string().trim().nonempty({
    message: "Password must not be empty",
  }),
})

export const resetUserSchema = z.object({
  password: z.string().trim().nonempty({
    message: "Password must not be empty",
  })
});

export const tokenSchema = z.object({
  token: z.string().trim().nonempty({
    message: "Token must not be empty",
  }),
})
