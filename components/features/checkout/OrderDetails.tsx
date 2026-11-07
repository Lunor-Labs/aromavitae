import Image from "next/image";
import { countryName } from "@/lib/shop/countries";
import type { OrderView } from "@/lib/shop/orderView";
import { formatPrice } from "@/lib/utils";

const row = "flex justify-between gap-3 text-sm";
const heading = "text-xs font-medium tracking-[0.2em] text-charcoal uppercase mb-2";

/** An order as the customer sees it, on the confirmation and tracking pages. */
export function OrderDetails({ order }: { order: OrderView }) {
  const { address, tracking } = order;
  return (
    <div className="border border-border rounded-lg divide-y divide-border text-left">
      <ul className="p-5 space-y-4">
        {order.lines.map((line, index) => (
          <li key={index} className="flex gap-3 items-center">
            <div className="relative w-14 h-16 shrink-0 bg-cream rounded overflow-hidden">
              {line.image && <Image src={line.image} alt="" fill sizes="56px" className="object-cover" />}
            </div>
            <div className="flex-1 min-w-0 text-sm">
              <p className="text-charcoal">{line.name}</p>
              <p className="text-xs text-muted">
                {line.sizeLabel && `${line.sizeLabel} · `}Qty {line.quantity}
              </p>
            </div>
            <p className="text-sm font-medium text-charcoal shrink-0">{formatPrice(order.currency, line.lineTotal)}</p>
          </li>
        ))}
      </ul>

      <dl className="p-5 space-y-2">
        <div className={row}>
          <dt className="text-muted">Subtotal</dt>
          <dd>{formatPrice(order.currency, order.subtotal)}</dd>
        </div>
        <div className={row}>
          <dt className="text-muted">Shipping ({order.shippingMethod})</dt>
          <dd>{order.shippingAmount === 0 ? "Free" : formatPrice(order.currency, order.shippingAmount)}</dd>
        </div>
        <div className={`${row} text-base font-bold text-charcoal`}>
          <dt>Total</dt>
          <dd>{formatPrice(order.currency, order.total)}</dd>
        </div>
      </dl>

      <div className="p-5 grid sm:grid-cols-2 gap-5 text-sm text-muted">
        <div>
          <h3 className={heading}>Ship to</h3>
          <p>{address.fullName}</p>
          <p>{[address.line1, address.line2, address.city, address.region, address.postalCode].filter(Boolean).join(", ")}</p>
          <p>{countryName(address.country)}</p>
          <p>{address.phone}</p>
        </div>
        <div>
          <h3 className={heading}>Delivery</h3>
          <p>{order.shippingMethod}</p>
          {order.shippingEstimate && <p>{order.shippingEstimate}</p>}
          {tracking && (
            <div className="mt-2">
              {tracking.carrier && <p>{tracking.carrier}</p>}
              {tracking.number && <p>Tracking number: {tracking.number}</p>}
              {tracking.url && /^https?:\/\//.test(tracking.url) && (
                <a
                  href={tracking.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-forest underline underline-offset-2"
                >
                  Track this parcel
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
