// yeh sabse bada service file hai - order.service.js
// customer order creation se lekar agent assignment, status updates aur reschedule tak sab yahan hai

// prisma db/prisma.js se - orders, users, agents, trackingEvents sab tables
import { prisma } from "../db/prisma.js";

// AppError utils/app-error.js se - 400, 403, 404 throw karne ke liye
import { AppError } from "../utils/app-error.js";

// serializeOrder utils/decimal.js se - Prisma Decimal fields ko number mein convert karta hai
import { serializeOrder } from "../utils/decimal.js";

// calculateOrderQuote services/rate-calculation.service.js se - pricing engine
import { calculateOrderQuote } from "./rate-calculation.service.js";

// notifyCustomerStatusChange services/notification.service.js se - har status change pe customer ko notify
import { notifyCustomerStatusChange } from "./notification.service.js";

// findBestAvailableAgent services/agent-assignment.service.js se - nearest agent dhundhne ke liye
import { findBestAvailableAgent } from "./agent-assignment.service.js";

// yeh statuses sirf agent update kar sakta hai - customer aur admin restricted hain
const agentStatuses = ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED"];

// includeOrderDetails - Prisma include config - order ke saath related data bhi load karo
// customer info, assigned agent, zones, aur tracking events sab ek saath
function includeOrderDetails() {
  return {
    customer: {
      select: { id: true, name: true, email: true, phone: true, role: true }
    },
    createdBy: {
      select: { id: true, name: true, email: true, role: true }
    },
    pickupZone: true,
    dropZone: true,
    assignedAgent: {
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, role: true } },
        currentZone: true
      }
    },
    // tracking events hme chronological order mein chahiye - history dikhane ke liye
    trackingEvents: { orderBy: { createdAt: "asc" } }
  };
}

// getCustomerForOrder - order create karte waqt customer determine karo
// agar actor customer hai toh woh khud customer hai
// agar admin hai toh input.customerId dena hoga
async function getCustomerForOrder(input, actor) {
  const customerId = actor.role === "CUSTOMER" ? actor.id : input.customerId;

  if (!customerId) {
    throw new AppError("Admin order creation requires customerId", 400);
  }

  const customer = await prisma.user.findUnique({ where: { id: customerId } });

  // customer exist karna chahiye aur CUSTOMER role hona chahiye
  if (!customer || customer.role !== "CUSTOMER") {
    throw new AppError("Customer not found", 404);
  }

  return customer;
}

// ensureOrderAccess - check karo ki actor ko yeh order dekhne ka haq hai ya nahi
// ADMIN sab dekh sakta hai, CUSTOMER apna, AGENT assigned wala
function ensureOrderAccess(order, actor) {
  if (actor.role === "ADMIN") return;
  if (actor.role === "CUSTOMER" && order.customerId === actor.id) return;
  if (actor.role === "AGENT" && order.assignedAgent?.userId === actor.id) return;

  throw new AppError("You do not have permission to access this order", 403);
}

// createOrder - naya order create karo
// order.controller.js ka createOrder function yahan se call karta hai
export async function createOrder(input, actor) {
  // pehle customer determine karo - getCustomerForOrder upar define hai
  const customer = await getCustomerForOrder(input, actor);

  // rate-calculation.service.js se quote nikalo - zones detect honge, charges calculate honge
  const quote = await calculateOrderQuote(input);

  // transaction use karo - order create aur tracking event dono ek saath hone chahiye
  // agar ek fail ho toh dono rollback ho
  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        customerId: customer.id,
        createdByUserId: actor.id,
        pickupAddress: input.pickup.address,
        pickupArea: input.pickup.area,
        pickupPincode: input.pickup.pincode,
        pickupZoneId: quote.pickupZone.id,
        dropAddress: input.drop.address,
        dropArea: input.drop.area,
        dropPincode: input.drop.pincode,
        dropZoneId: quote.dropZone.id,
        length: quote.package.length,
        breadth: quote.package.breadth,
        height: quote.package.height,
        actualWeight: quote.package.actualWeight,
        volumetricWeight: quote.package.volumetricWeight,
        billableWeight: quote.package.billableWeight,
        orderType: input.orderType,
        paymentType: input.paymentType,
        baseCharge: quote.pricing.baseCharge,
        codCharge: quote.pricing.codCharge,
        finalCharge: quote.pricing.finalCharge,
        status: "CONFIRMED",
        scheduledDeliveryDate: input.scheduledDeliveryDate ? new Date(input.scheduledDeliveryDate) : null
      }
    });

    // order_tracking_events mein pehla event create karo - immutable history ka start
    await tx.orderTrackingEvent.create({
      data: {
        orderId: createdOrder.id,
        oldStatus: null,   // pehla event - koi previous status nahi
        newStatus: "CONFIRMED",
        actorUserId: actor.id,
        actorRole: actor.role,
        note: "Order confirmed after quote review"
      }
    });

    return createdOrder;
  });

  // transaction ke baad notification bhejo - notification.service.js ka function
  await notifyCustomerStatusChange(order, customer, "CONFIRMED");

  // full order details ke saath return karo
  return getOrderById(order.id, actor);
}

// listMyOrders - customer apne orders dekhe, agent assigned orders dekhe
export async function listMyOrders(actor) {
  const where =
    actor.role === "CUSTOMER"
      ? { customerId: actor.id }
      : { assignedAgent: { userId: actor.id } };  // agent ke assigned orders

  const orders = await prisma.order.findMany({
    where,
    include: includeOrderDetails(),
    orderBy: { createdAt: "desc" }  // latest pehle
  });

  // serializeOrder utils/decimal.js se - har order ke numbers convert karo
  return orders.map(serializeOrder);
}

// listAllOrders - admin ke liye - status, zone, agent se filter kar sakte hain
export async function listAllOrders(query) {
  const orders = await prisma.order.findMany({
    where: {
      status: query.status,
      assignedAgentId: query.agentId,
      // ek hi zoneId pickup ya drop dono mein check karo - OR condition
      OR: query.zoneId
        ? [{ pickupZoneId: query.zoneId }, { dropZoneId: query.zoneId }]
        : undefined
    },
    include: includeOrderDetails(),
    orderBy: { createdAt: "desc" }
  });

  return orders.map(serializeOrder);
}

// getOrderById - single order fetch karo - access check ke saath
export async function getOrderById(orderId, actor) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: includeOrderDetails()
  });

  if (!order) throw new AppError("Order not found", 404);

  // ensureOrderAccess upar define hai - role based access
  ensureOrderAccess(order, actor);
  return serializeOrder(order);
}

// getOrderTracking - order ke tracking events chronological order mein
export async function getOrderTracking(orderId, actor) {
  // pehle order access verify karo via getOrderById
  await getOrderById(orderId, actor);

  return prisma.orderTrackingEvent.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" }
  });
}

// assignAgentManually - admin manually agent select karta hai
export async function assignAgentManually(orderId, agentId, actor) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found", 404);

  if (order.status === "DELIVERED") {
    throw new AppError("Cannot assign agent to a delivered order", 400);
  }

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    include: { user: true }
  });

  if (!agent) throw new AppError("Agent not found", 404);
  if (!agent.isAvailable) throw new AppError("Agent is not available", 400);

  // assignAgentToOrder neeche define hai - common logic manual aur auto dono ke liye
  return assignAgentToOrder(order, agent, actor, "Agent assigned manually");
}

// autoAssignAgent - system khud best agent choose karta hai
// services/agent-assignment.service.js ka findBestAvailableAgent use hota hai
export async function autoAssignAgent(orderId, actor) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new AppError("Order not found", 404);

  if (order.status === "DELIVERED") {
    throw new AppError("Cannot assign agent to a delivered order", 400);
  }

  // findBestAvailableAgent agent-assignment.service.js se - zone + distance + workload
  const agent = await findBestAvailableAgent(order);
  if (!agent) throw new AppError("No available agent found in pickup zone", 400);

  return assignAgentToOrder(order, agent, actor, "Agent auto-assigned by pickup zone, distance, and workload");
}

// assignAgentToOrder - actual assignment logic - manual aur auto dono ke liye common
async function assignAgentToOrder(order, agent, actor, note) {
  const updatedOrder = await prisma.$transaction(async (tx) => {
    const previousStatus = order.status;

    // agar pehle koi agent tha aur ab naya assign ho raha hai toh pehle wale ka count ghata do
    if (order.assignedAgentId && order.assignedAgentId !== agent.id) {
      await tx.agent.update({
        where: { id: order.assignedAgentId },
        data: { activeOrderCount: { decrement: 1 } }
      });
    }

    // naye agent ka active order count badhao
    await tx.agent.update({
      where: { id: agent.id },
      data: {
        activeOrderCount: {
          // same agent dobara assign ho raha hai toh count mat badhao
          increment: order.assignedAgentId === agent.id ? 0 : 1
        }
      }
    });

    // order update karo - assigned agent aur status ASSIGNED
    const savedOrder = await tx.order.update({
      where: { id: order.id },
      data: { assignedAgentId: agent.id, status: "ASSIGNED" }
    });

    // tracking event create karo - immutable history ke liye
    await tx.orderTrackingEvent.create({
      data: {
        orderId: order.id,
        oldStatus: previousStatus,
        newStatus: "ASSIGNED",
        actorUserId: actor.id,
        actorRole: actor.role,
        note   // manual ya auto - note mein likha hoga
      }
    });

    return savedOrder;
  });

  // notification bhejo - notification.service.js se
  const customer = await prisma.user.findUnique({ where: { id: updatedOrder.customerId } });
  await notifyCustomerStatusChange(updatedOrder, customer, "ASSIGNED");

  return getOrderById(updatedOrder.id, actor);
}

// updateOrderStatus - agent order status update karta hai, admin override kar sakta hai
export async function updateOrderStatus(orderId, input, actor) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { assignedAgent: true, customer: true }
  });

  if (!order) throw new AppError("Order not found", 404);

  if (order.status === "DELIVERED") {
    throw new AppError("Cannot update status of a delivered order", 400);
  }

  // agent sirf apna assigned order update kar sakta hai
  if (actor.role === "AGENT") {
    if (order.assignedAgent?.userId !== actor.id) {
      throw new AppError("Only the assigned agent can update this order", 403);
    }
    // agent sirf allowed statuses set kar sakta hai - agentStatuses list upar hai
    if (!agentStatuses.includes(input.status)) {
      throw new AppError("Agent cannot set this status", 403);
    }
  }

  // customer kabhi bhi status update nahi kar sakta
  if (actor.role === "CUSTOMER") {
    throw new AppError("Customers cannot update order status", 403);
  }

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const savedOrder = await tx.order.update({
      where: { id: order.id },
      data: { status: input.status }
    });

    // har status change pe tracking event - delete ya update nahi hote yeh records
    await tx.orderTrackingEvent.create({
      data: {
        orderId: order.id,
        oldStatus: order.status,
        newStatus: input.status,
        actorUserId: actor.id,
        actorRole: actor.role,
        note: input.note
      }
    });

    // DELIVERED ya FAILED pe agent ka active count ghata do - order complete ho gaya
    if (
      (input.status === "DELIVERED" || input.status === "FAILED") &&
      order.status !== "DELIVERED" &&
      order.status !== "FAILED" &&
      order.assignedAgentId
    ) {
      await tx.agent.update({
        where: { id: order.assignedAgentId },
        data: { activeOrderCount: { decrement: 1 } }
      });
    }

    return savedOrder;
  });

  // notification.service.js se customer ko notify karo
  await notifyCustomerStatusChange(updatedOrder, order.customer, input.status);
  return getOrderById(order.id, actor);
}

// rescheduleFailedOrder - FAILED order ke baad customer naya date set karta hai
export async function rescheduleFailedOrder(orderId, input, actor) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true }
  });

  if (!order) throw new AppError("Order not found", 404);

  // sirf order ka customer hi reschedule kar sakta hai
  if (order.customerId !== actor.id) throw new AppError("You can only reschedule your own order", 403);

  // sirf FAILED orders reschedule ho sakte hain
  if (order.status !== "FAILED") throw new AppError("Only failed orders can be rescheduled", 400);

  const updatedOrder = await prisma.$transaction(async (tx) => {
    // reschedule_requests table mein record banao - history ke liye
    await tx.rescheduleRequest.create({
      data: {
        orderId: order.id,
        requestedByUserId: actor.id,
        oldDeliveryDate: order.scheduledDeliveryDate,
        newDeliveryDate: new Date(input.newDeliveryDate),
        reason: input.reason
      }
    });

    // order status RESCHEDULED karo, new date set karo, agent hata do
    const savedOrder = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "RESCHEDULED",
        scheduledDeliveryDate: new Date(input.newDeliveryDate),
        assignedAgentId: null  // agent null - auto-assign dobara karega
      }
    });

    await tx.orderTrackingEvent.create({
      data: {
        orderId: order.id,
        oldStatus: order.status,
        newStatus: "RESCHEDULED",
        actorUserId: actor.id,
        actorRole: actor.role,
        note: input.reason || "Customer requested a new delivery date"
      }
    });

    return savedOrder;
  });

  // customer ko RESCHEDULED notification bhejo
  await notifyCustomerStatusChange(updatedOrder, order.customer, "RESCHEDULED");

  // pehle pichle agent ko exclude karke naya agent dhundho
  // agar nahi mila toh sab mein se dhundho - agent-assignment.service.js ka findBestAvailableAgent
  const agent =
    (await findBestAvailableAgent(updatedOrder, order.assignedAgentId)) ||
    (await findBestAvailableAgent(updatedOrder));

  // agar agent mila toh seedha assign karo - assignAgentToOrder upar define hai
  if (agent) {
    return assignAgentToOrder(updatedOrder, agent, actor, "Agent reassigned after reschedule");
  }

  // koi agent nahi mila - order RESCHEDULED status pe return karo
  return getOrderById(updatedOrder.id, actor);
}
