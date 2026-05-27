export interface ActividadDto {
  id: string;
  codigo: string;
  nombre: string;
  orden: number;
  activo: boolean;
}

export interface CrearActividadCommand {
  codigo: string;
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
  activo: boolean;
}

export interface CrearItemCatalogoCommand {
  actividadId: string;
  codigo: string;
  descripcion: string;
  unidad: string;
  precioBase: number;
}
