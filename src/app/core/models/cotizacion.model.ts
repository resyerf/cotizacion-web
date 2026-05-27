import { ClienteDto } from './cliente.model';

export enum EstadoCotizacion {
  Borrador = 1,
  Enviada = 2,
  EnRevision = 3,
  Aprobada = 4,
  Rechazada = 5,
  Cancelada = 6
}

export enum Moneda {
  USD = 1,
  PEN = 2,
  EUR = 3
}

export interface CotizacionResumenDto {
  id: string;
  numero: string;
  proyecto: string;
  ubicacion?: string;
  cliente: string;
  fecha: string;
  fechaValidez?: string;
  estado: EstadoCotizacion;
  moneda: Moneda;
  total: number;
}

export interface CotizacionPartidaDto {
  id: string;
  itemCatalogoId: string;
  itemCodigo: string;
  itemDescripcion: string;
  itemUnidad: string;
  actividadNombre: string;
  actividadOrden: number;
  precioUnitario: number;
  cantidad?: number;
  subtotal: number;
}

export interface PartidaConCorrelativo extends CotizacionPartidaDto {
  correlativo: string;
}

export interface GrupoActividad {
  correlativo: string;
  nombre: string;
  subtotal: number;
  items: PartidaConCorrelativo[];
}

export function buildGruposActividad(partidas: CotizacionPartidaDto[]): GrupoActividad[] {
  const sorted = [...partidas].sort((a, b) => a.actividadOrden - b.actividadOrden);
  const map = new Map<number, { nombre: string; items: CotizacionPartidaDto[] }>();

  for (const p of sorted) {
    if (!map.has(p.actividadOrden)) {
      map.set(p.actividadOrden, { nombre: p.actividadNombre, items: [] });
    }
    map.get(p.actividadOrden)!.items.push(p);
  }

  let actIdx = 0;
  const result: GrupoActividad[] = [];
  for (const [, group] of map) {
    actIdx++;
    result.push({
      correlativo: `${actIdx}.0`,
      nombre: group.nombre,
      subtotal: group.items.reduce((s, p) => s + p.subtotal, 0),
      items: group.items.map((p, i) => ({ ...p, correlativo: `${actIdx}.${i + 1}` }))
    });
  }
  return result;
}

export interface CotizacionDetalleDto {
  id: string;
  numero: string;
  proyecto: string;
  ubicacion?: string;
  cliente: ClienteDto;
  fecha: string;
  fechaValidez?: string;
  estado: EstadoCotizacion;
  moneda: Moneda;
  notas?: string;
  total: number;
  partidas: CotizacionPartidaDto[];
}

export interface CrearCotizacionCommand {
  clienteId: string;
  proyecto: string;
  ubicacion?: string;
  fecha: string;
  fechaValidez?: string;
  moneda: Moneda;
  notas?: string;
}

export interface AgregarPartidaRequest {
  itemCatalogoId: string;
  precioUnitario: number;
  cantidad?: number;
}

export interface CambiarEstadoRequest {
  nuevoEstado: EstadoCotizacion;
}

export const ESTADO_LABEL: Record<EstadoCotizacion, string> = {
  [EstadoCotizacion.Borrador]:   'Borrador',
  [EstadoCotizacion.Enviada]:    'Enviada',
  [EstadoCotizacion.EnRevision]: 'En Revisión',
  [EstadoCotizacion.Aprobada]:   'Aprobada',
  [EstadoCotizacion.Rechazada]:  'Rechazada',
  [EstadoCotizacion.Cancelada]:  'Cancelada',
};

export const ESTADO_BADGE: Record<EstadoCotizacion, string> = {
  [EstadoCotizacion.Borrador]:   'badge--borrador',
  [EstadoCotizacion.Enviada]:    'badge--enviada',
  [EstadoCotizacion.EnRevision]: 'badge--revision',
  [EstadoCotizacion.Aprobada]:   'badge--aprobada',
  [EstadoCotizacion.Rechazada]:  'badge--rechazada',
  [EstadoCotizacion.Cancelada]:  'badge--cancelada',
};

export const MONEDA_LABEL: Record<Moneda, string> = {
  [Moneda.USD]: 'USD',
  [Moneda.PEN]: 'PEN',
  [Moneda.EUR]: 'EUR',
};

export const MONEDA_SYMBOL: Record<Moneda, string> = {
  [Moneda.USD]: '$',
  [Moneda.PEN]: 'S/',
  [Moneda.EUR]: '€',
};

export const TRANSICIONES_VALIDAS: Record<EstadoCotizacion, EstadoCotizacion[]> = {
  [EstadoCotizacion.Borrador]:   [EstadoCotizacion.Enviada, EstadoCotizacion.Cancelada],
  [EstadoCotizacion.Enviada]:    [EstadoCotizacion.EnRevision, EstadoCotizacion.Aprobada, EstadoCotizacion.Rechazada, EstadoCotizacion.Cancelada],
  [EstadoCotizacion.EnRevision]: [EstadoCotizacion.Aprobada, EstadoCotizacion.Rechazada, EstadoCotizacion.Cancelada],
  [EstadoCotizacion.Rechazada]:  [EstadoCotizacion.Borrador, EstadoCotizacion.Cancelada],
  [EstadoCotizacion.Aprobada]:   [],
  [EstadoCotizacion.Cancelada]:  [],
};
