import type { LineItem } from "@/services/invoice.service";

export interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  due_date: string;
  description: string;
}

export interface LineItemRow extends LineItem {
  id: number;
}

export function emptyItem(id: number): LineItemRow {
  return { id, description: "", quantity: 1, unit_price: 0, amount: 0 };
}

export const INITIAL_CUSTOMER: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  due_date: "",
  description: "",
};
