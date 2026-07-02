import { calculateOrderQuote } from "../services/rate-calculation.service.js";
import {
  assignAgentManually,
  autoAssignAgent,
  createOrder,
  getOrderById,
  getOrderTracking,
  listAllOrders,
  listMyOrders,
  rescheduleFailedOrder,
  updateOrderStatus
} from "../services/order.service.js";
import { asyncHandler } from "../utils/async-handler.js";

export const quoteOrderHandler = asyncHandler(async (request, response) => {
  const quote = await calculateOrderQuote(request.validated.body);

  response.json({
    success: true,
    message: "Order quote calculated",
    data: { quote }
  });
});

export const createOrderHandler = asyncHandler(async (request, response) => {
  const order = await createOrder(request.validated.body, request.user);

  response.status(201).json({
    success: true,
    message: "Order created",
    data: { order }
  });
});

export const listMyOrdersHandler = asyncHandler(async (request, response) => {
  const orders = await listMyOrders(request.user);

  response.json({
    success: true,
    data: { orders }
  });
});

export const listAllOrdersHandler = asyncHandler(async (request, response) => {
  const orders = await listAllOrders(request.validated.query);

  response.json({
    success: true,
    data: { orders }
  });
});

export const getOrderHandler = asyncHandler(async (request, response) => {
  const order = await getOrderById(request.validated.params.id, request.user);

  response.json({
    success: true,
    data: { order }
  });
});

export const getOrderTrackingHandler = asyncHandler(async (request, response) => {
  const trackingEvents = await getOrderTracking(request.validated.params.id, request.user);

  response.json({
    success: true,
    data: { trackingEvents }
  });
});

export const assignAgentHandler = asyncHandler(async (request, response) => {
  const order = await assignAgentManually(
    request.validated.params.id,
    request.validated.body.agentId,
    request.user
  );

  response.json({
    success: true,
    message: "Agent assigned",
    data: { order }
  });
});

export const autoAssignAgentHandler = asyncHandler(async (request, response) => {
  const order = await autoAssignAgent(request.validated.params.id, request.user);

  response.json({
    success: true,
    message: "Agent auto-assigned",
    data: { order }
  });
});

export const updateOrderStatusHandler = asyncHandler(async (request, response) => {
  const order = await updateOrderStatus(request.validated.params.id, request.validated.body, request.user);

  response.json({
    success: true,
    message: "Order status updated",
    data: { order }
  });
});

export const rescheduleOrderHandler = asyncHandler(async (request, response) => {
  const order = await rescheduleFailedOrder(request.validated.params.id, request.validated.body, request.user);

  response.json({
    success: true,
    message: "Order rescheduled",
    data: { order }
  });
});
