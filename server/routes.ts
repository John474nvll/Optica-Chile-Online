import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replit_integrations/auth";
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

  app.post(api.products.create.path, isAuthenticated, async (req, res) => {
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

  app.put(api.products.update.path, isAuthenticated, async (req, res) => {
    const input = insertProductSchema.partial().parse(req.body);
    const product = await storage.updateProduct(Number(req.params.id), input);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });

  app.delete(api.products.delete.path, isAuthenticated, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
    res.status(204).send();
  });

  // === APPOINTMENTS ===
  app.get(api.appointments.list.path, isAuthenticated, async (req, res) => {
    const appointments = await storage.getAppointments(req.query.patientId as string);
    res.json(appointments);
  });

  app.post(api.appointments.create.path, isAuthenticated, async (req, res) => {
    const input = insertAppointmentSchema.parse(req.body);
    const appointment = await storage.createAppointment(input);
    res.status(201).json(appointment);
  });

  app.put(api.appointments.update.path, isAuthenticated, async (req, res) => {
    const input = insertAppointmentSchema.partial().parse(req.body);
    const appointment = await storage.updateAppointment(Number(req.params.id), input);
    res.json(appointment);
  });

  // === PRESCRIPTIONS ===
  app.get(api.prescriptions.list.path, isAuthenticated, async (req, res) => {
    const prescriptions = await storage.getPrescriptions(req.query.patientId as string);
    res.json(prescriptions);
  });

  app.get(api.prescriptions.get.path, isAuthenticated, async (req, res) => {
    const prescription = await storage.getPrescription(Number(req.params.id));
    if (!prescription) return res.status(404).json({ message: "Receta no encontrada" });
    res.json(prescription);
  });

  app.post(api.prescriptions.create.path, isAuthenticated, async (req, res) => {
    const input = insertPrescriptionSchema.parse(req.body);
    const prescription = await storage.createPrescription(input);
    res.status(201).json(prescription);
  });

  app.get(api.prescriptions.print.path, isAuthenticated, async (req, res) => {
    const prescription = await storage.getPrescription(Number(req.params.id));
    if (!prescription) return res.status(404).json({ message: "Receta no encontrada" });
    
    // Simple HTML template for printing
    const html = `
      <html>
        <head><title>Receta Óptica - ${prescription.id}</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1>Óptica Chile Online</h1>
          <hr/>
          <h2>Receta de Oftalmología</h2>
          <p><strong>Paciente ID:</strong> ${prescription.patientId}</p>
          <p><strong>Doctor:</strong> ${prescription.doctorName || 'No especificado'}</p>
          <p><strong>Fecha:</strong> ${prescription.date ? new Date(prescription.date).toLocaleDateString() : 'N/A'}</p>
          <table border="1" style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr>
              <th>Ojo</th><th>Esfera</th><th>Cilindro</th><th>Eje</th><th>Tipo</th>
            </tr>
            <tr>
              <td>OD</td><td>${prescription.sphereOdLejos || '-'}</td><td>${prescription.cylinderOdLejos || '-'}</td><td>${prescription.axisOdLejos || '-'}</td><td>Lejos</td>
            </tr>
            <tr>
              <td>OD</td><td>${prescription.sphereOdCerca || '-'}</td><td>${prescription.cylinderOdCerca || '-'}</td><td>${prescription.axisOdCerca || '-'}</td><td>Cerca</td>
            </tr>
            <tr>
              <td>OS</td><td>${prescription.sphereOsLejos || '-'}</td><td>${prescription.cylinderOsLejos || '-'}</td><td>${prescription.axisOsLejos || '-'}</td><td>Lejos</td>
            </tr>
            <tr>
              <td>OS</td><td>${prescription.sphereOsCerca || '-'}</td><td>${prescription.cylinderOsCerca || '-'}</td><td>${prescription.axisOsCerca || '-'}</td><td>Cerca</td>
            </tr>
          </table>
          <p><strong>Adición:</strong> ${prescription.add || '-'}</p>
          <p><strong>Distancia Pupilar:</strong> ${prescription.pupillaryDistance || '-'}</p>
          <p><strong>Diagnóstico:</strong> ${prescription.diagnosis || '-'}</p>
          <p><strong>Notas:</strong> ${prescription.notes || '-'}</p>
        </body>
      </html>
    `;
    res.json({ html });
  });

  // === ORDERS ===
  app.get(api.orders.list.path, isAuthenticated, async (req, res) => {
    const orders = await storage.getOrders(req.query.patientId as string);
    res.json(orders);
  });

  app.post(api.orders.create.path, isAuthenticated, async (req, res) => {
    const { items, ...orderData } = req.body;
    const parsedOrder = insertOrderSchema.parse(orderData);
    const order = await storage.createOrder(parsedOrder, items);
    res.status(201).json(order);
  });
  
  app.get(api.orders.getOrderItems.path, isAuthenticated, async (req, res) => {
      const items = await storage.getOrderItems(Number(req.params.id));
      if (!items) return res.status(404).json({ message: "Pedido no encontrado" });
      res.json(items);
  });

  // === USERS/ROLES ===
  app.get(api.users.list.path, isAuthenticated, async (req, res) => {
    const usersList = await storage.getAllUsers();
    res.json(usersList);
  });

  app.get(api.users.getRole.path, isAuthenticated, async (req, res) => {
    const role = await storage.getUserRole(req.params.id);
    if (!role) return res.status(404).json({ message: "Rol no encontrado" });
    res.json(role);
  });

  app.post(api.users.updateRole.path, isAuthenticated, async (req, res) => {
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
  const productsList = await storage.getProducts();
  if (productsList.length === 0) {
    console.log("Seeding products...");
    await storage.createProduct({
      name: "Ray-Ban Aviator",
      description: "Armazón estilo piloto clásico",
      category: PRODUCT_CATEGORIES.FRAME,
      brand: "Ray-Ban",
      model: "RB3025",
      price: "150000",
      stock: 10,
      imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80",
      active: true,
    });
    await storage.createProduct({
      name: "Cristales Antireflejo",
      description: "Protege tus ojos del brillo de las pantallas",
      category: PRODUCT_CATEGORIES.LENS,
      brand: "OptiGuard",
      model: "BL-100",
      price: "50000",
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800&q=80",
      active: true,
    });
  }
}
