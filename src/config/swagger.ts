import swaggerJsdoc from "swagger-jsdoc";
import { Options } from "swagger-jsdoc";

const options: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Admin and Payment API",
      version: "1.0.0",
      description: "API documentation for Admin and PG / Subscription system",
    },
    servers: [
      {
        url: "https://stacia-asterismal-annita.ngrok-free.dev",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    "./src/routes/*.ts",
    "./src/docs/*.ts",
  ], // Important for TS
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
