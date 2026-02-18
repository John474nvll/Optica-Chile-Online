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
  FRAME: "armazón",
  LENS: "cristal",
  CONTACT_LENS: "lente_contacto",
  ACCESSORY: "accesorio",
  SERVICE: "servicio",
} as const;

export const APPOINTMENT_STATUS = {
  SCHEDULED: "programada",
  CONFIRMED: "confirmada",
  COMPLETED: "completada",
  CANCELLED: "cancelada",
  NO_SHOW: "no_asiste",
} as const;

export const ORDER_STATUS = {
  PENDING: "pendiente",
  PROCESSING: "en_proceso",
  READY: "listo",
  DELIVERED: "entregado",
  CANCELLED: "cancelado",
} as const;

// === TABLES ===

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
  category: text("category").notNull(), // armazón, cristal, etc.
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
  doctorName: text("doctor_name"),
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
  
  // Ojo Derecho (OD) - Cerca/Lejos
  sphereOdLejos: text("sphere_od_lejos"),
  cylinderOdLejos: text("cylinder_od_lejos"),
  axisOdLejos: text("axis_od_lejos"),
  sphereOdCerca: text("sphere_od_cerca"),
  cylinderOdCerca: text("cylinder_od_cerca"),
  axisOdCerca: text("axis_od_cerca"),
  
  // Ojo Izquierdo (OS) - Cerca/Lejos
  sphereOsLejos: text("sphere_os_lejos"),
  cylinderOsLejos: text("cylinder_os_lejos"),
  axisOsLejos: text("axis_os_lejos"),
  sphereOsCerca: text("sphere_os_cerca"),
  cylinderOsCerca: text("cylinder_os_cerca"),
  axisOsCerca: text("axis_os_cerca"),
  
  add: text("addition"),
  pupillaryDistance: text("pupillary_distance"),
  diagnosis: text("diagnosis"),
  notes: text("notes"),
  
  // Transcription / Digital Copy
  isTranscription: boolean("is_transcription").default(false),
  originalImageUrl: text("original_image_url"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  patientId: text("patient_id").notNull().references(() => users.id),
  prescriptionId: integer("prescription_id").references(() => prescriptions.id),
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
  prescription: one(prescriptions, {
    fields: [orders.prescriptionId],
    references: [prescriptions.id],
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
