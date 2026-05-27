export enum Moneda {
  USD = 1,
  PEN = 2,
  EUR = 3
}

export const MONEDA_OPTIONS = [
  { label: 'USD — Dólar americano', value: Moneda.USD },
  { label: 'PEN — Sol peruano',     value: Moneda.PEN },
  { label: 'EUR — Euro',            value: Moneda.EUR },
];

export const MONEDA_SYM: Record<Moneda, string> = {
  [Moneda.USD]: '$',
  [Moneda.PEN]: 'S/',
  [Moneda.EUR]: '€',
};

export interface ActividadDto {
  id: string;
  codigo: string;
  nombre: string;
  orden: number;
  activo: boolean;
}

export interface CrearActividadCommand {
  nombre: string;
}

export interface ActualizarActividadCommand {
  nombre: string;
  orden: number;
}

export interface ItemCatalogoDto {
  id: string;
  actividadId: string;
  actividadNombre: string;
  codigo: string;
  descripcion: string;
  unidad: string;
  precioBase: number;
  moneda: Moneda;
  activo: boolean;
}

export interface CrearItemCatalogoCommand {
  actividadId: string;
  codigo: string;
  descripcion: string;
  unidad: string;
  precioBase: number;
  moneda: Moneda;
}

export interface ActualizarItemCatalogoCommand {
  actividadId: string;
  descripcion: string;
  unidad: string;
  precioBase: number;
  moneda: Moneda;
}
