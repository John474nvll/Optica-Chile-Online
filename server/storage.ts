import { db } from "./db";
import { 
  products, appointments, prescriptions, orders, orderItems, userRoles,
  type Product, type InsertProduct,
  type Appointment, type InsertAppointment,
  type Prescription, type InsertPrescription,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type UserRole, type InsertUserRole,
  ROLES
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(activeOnly?: boolean): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Appointments
  getAppointments(patientId?: string): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment>;

  // Prescriptions
  getPrescriptions(patientId?: string): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;

  // Orders
  getOrders(patientId?: string): Promise<Order[]>;
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]>;

  // User Roles
  getUserRole(userId: string): Promise<UserRole | undefined>;
  setUserRole(userId: string, roleData: InsertUserRole): Promise<UserRole>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(activeOnly?: boolean): Promise<Product[]> {
    if (activeOnly) {
      return await db.select().from(products).where(eq(products.active, true));
    }
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Appointments
  async getAppointments(patientId?: string): Promise<Appointment[]> {
    if (patientId) {
      return await db.select().from(appointments).where(eq(appointments.patientId, patientId)).orderBy(desc(appointments.date));
    }
    return await db.select().from(appointments).orderBy(desc(appointments.date));
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment> {
    const [updated] = await db.update(appointments).set(updates).where(eq(appointments.id, id)).returning();
    return updated;
  }

  // Prescriptions
  async getPrescriptions(patientId?: string): Promise<Prescription[]> {
    if (patientId) {
      return await db.select().from(prescriptions).where(eq(prescriptions.patientId, patientId)).orderBy(desc(prescriptions.date));
    }
    return await db.select().from(prescriptions).orderBy(desc(prescriptions.date));
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const [prescription] = await db.insert(prescriptions).values(insertPrescription).returning();
    return prescription;
  }

  // Orders
  async getOrders(patientId?: string): Promise<Order[]> {
    if (patientId) {
      return await db.select().from(orders).where(eq(orders.patientId, patientId)).orderBy(desc(orders.date));
    }
    return await db.select().from(orders).orderBy(desc(orders.date));
  }

  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values(insertOrder).returning();
      
      for (const item of items) {
        await tx.insert(orderItems).values({ ...item, orderId: order.id });
      }
      
      return order;
    });
  }

  async getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]> {
    return await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        product: products,
      })
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId))
      .innerJoin(products, eq(orderItems.productId, products.id));
  }

  // User Roles
  async getUserRole(userId: string): Promise<UserRole | undefined> {
    const [role] = await db.select().from(userRoles).where(eq(userRoles.userId, userId));
    return role;
  }

  async setUserRole(userId: string, roleData: InsertUserRole): Promise<UserRole> {
    const [role] = await db
      .insert(userRoles)
      .values(roleData)
      .onConflictDoUpdate({
        target: userRoles.userId,
        set: roleData,
      })
      .returning();
    return role;
  }
}

export const storage = new DatabaseStorage();
