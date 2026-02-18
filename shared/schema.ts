import { pgTable, text, serial, integer, boolean, timestamp, numeric, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Import auth schema to extend it or relate to it
export * from "./models/auth";
import { users } from "./models/auth";

// === ENUMS ===
export const ROLES = {
  ADMIN: "admin",
  STAFF: "staff",
  PATIENT: "patient",
} as const;

export const PRODUCT_CATEGORIES = {
  FRAME: "frame",
  LENS: "lens",
  CONTACT_LENS: "contact_lens",
  ACCESSORY: "accessory",
  SERVICE: "service",
} as const;

export const APPOINTMENT_STATUS = {
  SCHEDULED: "scheduled",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

export const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  READY: "ready",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

// === TABLES ===

// Extend user with role (Note: we can't easily modify the auth table directly in this setup without migration issues if not careful, 
// so we'll create a profile table or just assume we can store role in metadata if supported, but simpler here to have a separate profiles table 
// OR just add columns if we were starting fresh. 
// For this blueprint, `users` is defined in models/auth.ts. 
// We will create a `user_roles` table to link roles to users, or just separate `staff` and `patients` tables linked to `users`.
// Let's go with `user_profiles` to add role and extra data.)

export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  role: text("role").notNull().default(ROLES.PATIENT), // admin, staff, patient
  rut: text("rut"), // Chilean ID
  phone: text("phone"),
  address: text("address"),
  birthDate: date("birth_date"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // frame, lens, etc.
  brand: text("brand"),
  model: text("model"),
  price: numeric("price").notNull(),
  stock: integer("stock").notNull().default(0),
  imageUrl: text("image_url"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().references(() => users.id),
  doctorName: text("doctor_name"), // or reference to a staff user
  date: timestamp("date").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default(APPOINTMENT_STATUS.SCHEDULED),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow(),
  doctorName: text("doctor_name"),
  
  // Right Eye (OD)
  sphereOd: text("sphere_od"),
  cylinderOd: text("cylinder_od"),
  axisOd: text("axis_od"),
  addOd: text("add_od"),
  
  // Left Eye (OS)
  sphereOs: text("sphere_os"),
  cylinderOs: text("cylinder_os"),
  axisOs: text("axis_os"),
  addOs: text("add_os"),
  
  pupillaryDistance: text("pupillary_distance"),
  diagnosis: text("diagnosis"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().references(() => users.id),
  date: timestamp("date").defaultNow(),
  status: text("status").notNull().default(ORDER_STATUS.PENDING),
  totalAmount: numeric("total_amount").notNull(),
  depositAmount: numeric("deposit_amount").default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  price: numeric("price").notNull(), // snapshot of price at time of order
});

// === RELATIONS ===
export const userRolesRelations = relations(userRoles, ({ one }) => ({
  user: one(users, {
    fields: [userRoles.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(userRoles, {
    fields: [users.id],
    references: [userRoles.userId],
  }),
  appointments: many(appointments),
  prescriptions: many(prescriptions),
  orders: many(orders),
}));

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  patient: one(users, {
    fields: [appointments.patientId],
    references: [users.id],
  }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one }) => ({
  patient: one(users, {
    fields: [prescriptions.patientId],
    references: [users.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  patient: one(users, {
    fields: [orders.patientId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// === INSERTS ===
export const insertUserRoleSchema = createInsertSchema(userRoles);
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true });
export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

// === TYPES ===
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
