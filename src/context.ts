import { createContext, useContext } from "react";
import type { State, User } from "./model";
export type Ctx = {
  s: State;
  u: User;
  mutate: (fn: (s: State) => void, msg?: string) => void;
  open: (p: string) => void;
  notify: (m: string) => void;
  view: string;
  setView: (v: string) => void;
  neighborhood: string;
};
export const Context = createContext<Ctx>(null!);
export const useApp = () => useContext(Context);
