import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Badge, Button, Text, clx } from "@medusajs/ui"
import { DetailWidgetProps, AdminOrder } from "@medusajs/framework/types"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

/**
 * Order Status Widget
 *
 * Displays the current custom operational status and allows the owner to
 * advance or change the status with a single click.
 * Registered at zone "order.details.before" so it's the first thing visible.
 */

type CustomOrderStatus =
  | "new"
  | "payment_pending"
  | "payment_confirmed"
  | "in_preparation"
  | "ready_for_pickup"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"

const STATUS_LABELS: Record<CustomOrderStatus, string> = {
  new: "Nuevo",
  payment_pending: "Pago pendiente",
  payment_confirmed: "Pago confirmado",
  in_preparation: "En preparación",
  ready_for_pickup: "Listo para retiro",
  out_for_delivery: "En reparto",
  delivered: "Entregado",
  cancelled: "Cancelado",
}

// Color mapping for badges
const STATUS_COLORS: Record<
  CustomOrderStatus,
  "grey" | "green" | "blue" | "orange" | "red" | "purple"
> = {
  new: "grey",
  payment_pending: "orange",
  payment_confirmed: "blue",
  in_preparation: "purple",
  ready_for_pickup: "blue",
  out_for_delivery: "orange",
  delivered: "green",
  cancelled: "red",
}

// Logical "next" status in the main flow
const NEXT_STATUS: Partial<Record<CustomOrderStatus, CustomOrderStatus>> = {
  new: "payment_confirmed",
  payment_pending: "payment_confirmed",
  payment_confirmed: "in_preparation",
  in_preparation: "ready_for_pickup",
  ready_for_pickup: "delivered",
  out_for_delivery: "delivered",
}

// All statuses available in the dropdown (excluding current)
const ALL_STATUSES: CustomOrderStatus[] = [
  "new",
  "payment_pending",
  "payment_confirmed",
  "in_preparation",
  "ready_for_pickup",
  "out_for_delivery",
  "delivered",
  "cancelled",
]

async function updateOrderStatus(orderId: string, status: CustomOrderStatus) {
  const res = await fetch(`/admin/orders/${orderId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || "Failed to update status")
  }
  return res.json()
}

const OrderStatusWidget = ({ data: order }: DetailWidgetProps<AdminOrder>) => {
  const queryClient = useQueryClient()
  const [showDropdown, setShowDropdown] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const orderMeta = (order.metadata || {}) as Record<string, any>
  const currentStatus = (orderMeta.custom_status as CustomOrderStatus) || "new"
  const updatedAt = orderMeta.custom_status_updated_at as string | undefined

  const mutation = useMutation({
    mutationFn: (status: CustomOrderStatus) =>
      updateOrderStatus(order.id, status),
    onSuccess: () => {
      setError(null)
      setShowDropdown(false)
      // Invalidate any order queries so the page refreshes
      queryClient.invalidateQueries({ queryKey: ["order", order.id] })
      // Hard reload to reflect metadata change in all widgets
      window.location.reload()
    },
    onError: (err: Error) => {
      setError(err.message)
    },
  })

  const nextStatus = NEXT_STATUS[currentStatus]
  const isTerminal = currentStatus === "delivered" || currentStatus === "cancelled"

  return (
    <Container className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <Heading level="h2">Estado del pedido</Heading>
        {updatedAt && (
          <Text size="small" className="text-ui-fg-muted">
            Actualizado: {new Date(updatedAt).toLocaleString("es-CL")}
          </Text>
        )}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Current status badge */}
        <Badge
          color={STATUS_COLORS[currentStatus]}
          size="base"
          className="text-sm px-3 py-1"
        >
          {STATUS_LABELS[currentStatus]}
        </Badge>

        {/* Advance to next status — main CTA */}
        {nextStatus && (
          <Button
            variant="primary"
            size="small"
            isLoading={mutation.isPending && mutation.variables === nextStatus}
            onClick={() => mutation.mutate(nextStatus)}
            disabled={mutation.isPending}
          >
            → {STATUS_LABELS[nextStatus]}
          </Button>
        )}

        {/* Mark as "En reparto" if in_preparation (alternative flow) */}
        {currentStatus === "in_preparation" && (
          <Button
            variant="secondary"
            size="small"
            isLoading={mutation.isPending && mutation.variables === "out_for_delivery"}
            onClick={() => mutation.mutate("out_for_delivery")}
            disabled={mutation.isPending}
          >
            → En reparto
          </Button>
        )}

        {/* Cancel button — available from most states */}
        {!isTerminal && (
          <Button
            variant="danger"
            size="small"
            isLoading={mutation.isPending && mutation.variables === "cancelled"}
            onClick={() => mutation.mutate("cancelled")}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
        )}

        {/* Change to any status dropdown */}
        <div className="relative">
          <Button
            variant="transparent"
            size="small"
            onClick={() => setShowDropdown((v) => !v)}
            disabled={mutation.isPending}
          >
            Cambiar estado ▾
          </Button>

          {showDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-ui-bg-base border border-ui-border-base rounded-lg shadow-elevation-flyout z-50 min-w-[200px]">
              {ALL_STATUSES.filter((s) => s !== currentStatus).map((s) => (
                <button
                  key={s}
                  className={clx(
                    "w-full text-left px-4 py-2 text-sm hover:bg-ui-bg-hover transition-colors first:rounded-t-lg last:rounded-b-lg",
                    s === "cancelled" ? "text-ui-fg-error" : "text-ui-fg-base"
                  )}
                  onClick={() => mutation.mutate(s)}
                  disabled={mutation.isPending}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status flow hint */}
      <div className="mt-3 flex items-center gap-1 flex-wrap">
        {ALL_STATUSES.filter((s) => s !== "cancelled").map((s, i, arr) => (
          <span key={s} className="flex items-center gap-1">
            <span
              className={clx(
                "text-xs px-2 py-0.5 rounded-full",
                s === currentStatus
                  ? "bg-ui-tag-blue-bg text-ui-tag-blue-text font-semibold"
                  : "text-ui-fg-muted"
              )}
            >
              {STATUS_LABELS[s]}
            </span>
            {i < arr.length - 1 && (
              <span className="text-ui-fg-muted text-xs">→</span>
            )}
          </span>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <Text size="small" className="text-ui-fg-error mt-2">
          ⚠️ {error}
        </Text>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default OrderStatusWidget
