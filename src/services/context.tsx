import { createContext, useContext } from "react";
import type { AppState, BookingKind, User } from "./model";
export type View =
  | "Home"
  | "Rooms"
  | "Classes"
  | "Transportation"
  | "Home Care"
  | "Donations"
  | "Packages"
  | "Mock Admin";
export type Action =
  | { type: "booking"; kind: BookingKind; itemId?: string; date?: string }
  | { type: "offering"; kind: "class" | "driver" | "care" }
  | { type: "donation"; anonymous: boolean };
export interface ServicesContext {
  state: AppState;
  user: User | undefined;
  view: View;
  setView: (v: View) => void;
  update: (fn: (s: AppState) => AppState) => void;
  act: (a: Action) => void;
  notify: (s: string) => void;
}
export const ServiceContext = createContext<ServicesContext>(null!);
export const useServices = () => useContext(ServiceContext);
