export interface CustomJwtSessionClaims{
    metadata?:{
        role? : "admin" | "user";
    }
}