export interface ClienteDto {
  id: string;
  nombre: string;
  ruc?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  activo: boolean;
}

export interface CrearClienteCommand {
  nombre: string;
  ruc?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface ActualizarClienteCommand {
  nombre: string;
  ruc?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
}
