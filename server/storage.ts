import { db } from "./db";
import { 
  products, 
  appointments, 
  prescriptions, 
  orders, 
  orderItems, 
  userRoles,
  type Product, 
  type InsertProduct,
  type Appointment,
  type InsertAppointment,
  type Prescription,
  type InsertPrescription,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type UserRole,
  type InsertUserRole,
  ROLES
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // PRODUCTS
  getProducts(activeOnly?: boolean): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  // APPOINTMENTS
  getAppointments(patientId?: string): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment | undefined>;

  // PRESCRIPTIONS
  getPrescriptions(patientId?: string): Promise<Prescription[]>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;

  // ORDERS
  getOrders(patientId?: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder, items: { productId: number; quantity: number }[]): Promise<Order>;
  getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]>;

  // USER ROLES
  getUserRole(userId: string): Promise<UserRole | undefined>;
  setUserRole(userId: string, roleData: InsertUserRole): Promise<UserRole>;
}

export class DatabaseStorage implements IStorage {
  // PRODUCTS
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

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products).set(updates).where(eq(products.id, id)).returning();
    return product;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // APPOINTMENTS
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

  async updateAppointment(id: number, updates: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [appointment] = await db.update(appointments).set(updates).where(eq(appointments.id, id)).returning();
    return appointment;
  }

  // PRESCRIPTIONS
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

  // ORDERS
  async getOrders(patientId?: string): Promise<Order[]> {
    if (patientId) {
      return await db.select().from(orders).where(eq(orders.patientId, patientId)).orderBy(desc(orders.date));
    }
    return await db.select().from(orders).orderBy(desc(orders.date));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(insertOrder: InsertOrder, items: { productId: number; quantity: number }[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values(insertOrder).returning();
      
      for (const item of items) {
        const [product] = await tx.select().from(products).where(eq(products.id, item.productId));
        if (!product) throw new Error(`Product ${item.productId} not found`);
        
        await tx.insert(orderItems).values({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
        });

        // Update stock
        // await tx.update(products).set({ stock: product.stock - item.quantity }).where(eq(products.id, item.productId));
      }
      
      return order;
    });
  }

  async getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]> {
    const items = await db.select({
      id: orderItems.id,
      orderId: orderItems.orderId,
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      price: orderItems.price,
      product: products
    })
    .from(orderItems)
    .innerJoin(products, eq(orderItems.productId, products.id))
    .where(eq(orderItems.orderId, orderId));
    
    return items as (OrderItem & { product: Product })[];
  }

  // USER ROLES
  async getUserRole(userId: string): Promise<UserRole | undefined> {
    const [role] = await db.select().from(userRoles).where(eq(userRoles.userId, userId));
    return role;
  }

  async setUserRole(userId: string, roleData: InsertUserRole): Promise<UserRole> {
    const [role] = await db.insert(userRoles)
      .values(roleData)
      .onConflictDoUpdate({
        target: userRoles.userId,
        set: roleData
      })
      .returning();
    return role;
  }
}

export const storage = new DatabaseStorage();
