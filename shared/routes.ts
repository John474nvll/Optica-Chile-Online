import { z } from 'zod';
import { 
  insertProductSchema, 
  products, 
  insertAppointmentSchema, 
  appointments, 
  insertPrescriptionSchema, 
  prescriptions, 
  insertOrderSchema, 
  orders, 
  orderItems, 
  insertUserRoleSchema, 
  userRoles 
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products' as const,
      input: z.object({
        active: z.string().optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof products.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/products/:id' as const,
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products' as const,
      input: insertProductSchema,
      responses: {
        201: z.custom<typeof products.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id' as const,
      input: insertProductSchema.partial(),
      responses: {
        200: z.custom<typeof products.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  appointments: {
    list: {
      method: 'GET' as const,
      path: '/api/appointments' as const,
      input: z.object({
        patientId: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof appointments.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/appointments' as const,
      input: insertAppointmentSchema,
      responses: {
        201: z.custom<typeof appointments.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/appointments/:id' as const,
      input: insertAppointmentSchema.partial(),
      responses: {
        200: z.custom<typeof appointments.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  prescriptions: {
    list: {
      method: 'GET' as const,
      path: '/api/prescriptions' as const,
      input: z.object({
        patientId: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof prescriptions.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/prescriptions/:id' as const,
      responses: {
        200: z.custom<typeof prescriptions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/prescriptions' as const,
      input: insertPrescriptionSchema,
      responses: {
        201: z.custom<typeof prescriptions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    print: {
      method: 'GET' as const,
      path: '/api/prescriptions/:id/print' as const,
      responses: {
        200: z.object({ html: z.string() }),
        404: errorSchemas.notFound,
      },
    },
  },
  orders: {
    list: {
      method: 'GET' as const,
      path: '/api/orders' as const,
      input: z.object({
        patientId: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: insertOrderSchema.extend({
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
        })),
      }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    getOrderItems: {
      method: 'GET' as const,
      path: '/api/orders/:id/items' as const,
      responses: {
        200: z.array(z.custom<typeof orderItems.$inferSelect>()),
        404: errorSchemas.notFound,
      },
    },
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/admin/users' as const,
      responses: {
        200: z.array(z.object({
          id: z.string(),
          email: z.string().nullable(),
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
          role: z.string().optional(),
        })),
      },
    },
    getRole: {
      method: 'GET' as const,
      path: '/api/users/:id/role' as const,
      responses: {
        200: z.custom<typeof userRoles.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    updateRole: {
      method: 'POST' as const,
      path: '/api/users/role' as const,
      input: insertUserRoleSchema,
      responses: {
        200: z.custom<typeof userRoles.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
