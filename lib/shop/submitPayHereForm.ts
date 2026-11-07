import type { PayHereForm } from "@/lib/shop/orderView";

/** Sends the browser to PayHere's hosted page. It has to be a real form post, not a fetch. */
export function submitPayHereForm({ action, fields }: PayHereForm): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.className = "hidden";
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}
