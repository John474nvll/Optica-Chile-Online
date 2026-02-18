import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replit_integrations/auth";
import { registerAuthRoutes } from "./replit_integrations/auth";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertProductSchema, insertAppointmentSchema, insertPrescriptionSchema, insertOrderSchema, insertUserRoleSchema, ROLES, PRODUCT_CATEGORIES } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // === PRODUCTS ===
  app.get(api.products.list.path, async (req, res) => {
    const activeOnly = req.query.active === 'true';
    const products = await storage.getProducts(activeOnly);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }
  });

  app.put(api.products.update.path, async (req, res) => {
    const input = insertProductSchema.partial().parse(req.body);
    const product = await storage.updateProduct(Number(req.params.id), input);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.delete(api.products.delete.path, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).send();
  });

  // === APPOINTMENTS ===
  app.get(api.appointments.list.path, async (req, res) => {
    // In a real app, check user role here.
    // Admin/Staff: see all (or filter by patientId)
    // Patient: see only own (force patientId = req.user.id)
    const appointments = await storage.getAppointments(req.query.patientId as string);
    res.json(appointments);
  });

  app.post(api.appointments.create.path, async (req, res) => {
    const input = insertAppointmentSchema.parse(req.body);
    const appointment = await storage.createAppointment(input);
    res.status(201).json(appointment);
  });

  app.put(api.appointments.update.path, async (req, res) => {
    const input = insertAppointmentSchema.partial().parse(req.body);
    const appointment = await storage.updateAppointment(Number(req.params.id), input);
    res.json(appointment);
  });

  // === PRESCRIPTIONS ===
  app.get(api.prescriptions.list.path, async (req, res) => {
    const prescriptions = await storage.getPrescriptions(req.query.patientId as string);
    res.json(prescriptions);
  });

  app.post(api.prescriptions.create.path, async (req, res) => {
    const input = insertPrescriptionSchema.parse(req.body);
    const prescription = await storage.createPrescription(input);
    res.status(201).json(prescription);
  });

  // === ORDERS ===
  app.get(api.orders.list.path, async (req, res) => {
    const orders = await storage.getOrders(req.query.patientId as string);
    res.json(orders);
  });

  app.post(api.orders.create.path, async (req, res) => {
    // Transactional creation of order + items
    // We expect the body to have { ...orderData, items: [...] }
    // But our route definition splits them or expects a specific shape. 
    // Let's simplify and assume the body has `items` which we strip out before validating order schema.
    const { items, ...orderData } = req.body;
    
    const parsedOrder = insertOrderSchema.parse(orderData);
    // Validate items
    // const parsedItems = z.array(insertOrderItemSchema).parse(items); 
    // Actually, simple array check for now
    
    const order = await storage.createOrder(parsedOrder, items);
    res.status(201).json(order);
  });
  
  app.get(api.orders.getOrderItems.path, async (req, res) => {
      const items = await storage.getOrderItems(Number(req.params.id));
      if (!items) return res.status(404).json({ message: "Order not found" });
      res.json(items);
  });

  // === USERS/ROLES ===
  app.get(api.users.getRole.path, async (req, res) => {
    const role = await storage.getUserRole(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  });

  app.post(api.users.updateRole.path, async (req, res) => {
    const input = insertUserRoleSchema.parse(req.body);
    const role = await storage.setUserRole(input.userId, input);
    res.json(role);
  });

  // Seed Data
  if (process.env.NODE_ENV !== "production") {
    await seedDatabase();
  }

  return httpServer;
}

async function seedDatabase() {
  const products = await storage.getProducts();
  if (products.length === 0) {
    console.log("Seeding products...");
    await storage.createProduct({
      name: "Ray-Ban Aviator",
      description: "Classic pilot style frames",
      category: PRODUCT_CATEGORIES.FRAME,
      brand: "Ray-Ban",
      model: "RB3025",
      price: "150.00",
      stock: 10,
      imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
      active: true,
    });
    await storage.createProduct({
      name: "Blue Light Blockers",
      description: "Protect your eyes from screen glare",
      category: PRODUCT_CATEGORIES.LENS,
      brand: "OptiGuard",
      model: "BL-100",
      price: "50.00",
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80",
      active: true,
    });
    await storage.createProduct({
      name: "Contact Lens Solution",
      description: "All-in-one cleaning solution",
      category: PRODUCT_CATEGORIES.ACCESSORY,
      brand: "BioTrue",
      model: "BT-300",
      price: "15.00",
      stock: 100,
      imageUrl: "https://images.unsplash.com/photo-1588643542263-23963286b976?w=800&q=80",
      active: true,
    });
  }
}
