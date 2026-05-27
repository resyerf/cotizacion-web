import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { CotizacionesService } from '../../../../core/api/cotizaciones.service';
import { ClientesService } from '../../../../core/api/clientes.service';
import { ExportService } from '../../../../core/services/pdf-export.service';
import {
  CotizacionDetalleDto,
  CotizacionResumenDto,
  ESTADO_BADGE,
  ESTADO_LABEL,
  EstadoCotizacion,
  MONEDA_LABEL,
  MONEDA_SYMBOL,
  Moneda
} from '../../../../core/models/cotizacion.model';
import { ClienteDto } from '../../../../core/models/cliente.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

interface EstadoOption { label: string; value: EstadoCotizacion | null }
interface ClienteOption { label: string; value: string | null }

@Component({
  selector: 'app-cotizaciones-list',
  imports: [
    RouterLink, FormsModule,
    TableModule, ButtonModule, SelectModule, TagModule,
    IconFieldModule, InputIconModule, InputTextModule,
    DialogModule,
    PageHeaderComponent, EmptyStateComponent
  ],
  templateUrl: './cotizaciones-list.component.html',
  styleUrl: './cotizaciones-list.component.scss'
})
export class CotizacionesListComponent implements OnInit {
  private readonly cotizacionesService = inject(CotizacionesService);
  private readonly clientesService = inject(ClientesService);
  private readonly exportService = inject(ExportService);

  cotizaciones = signal<CotizacionResumenDto[]>([]);
  clientes = signal<ClienteDto[]>([]);
  loading = signal(true);

  // Detalle dialog
  showDetalle = signal(false);
  cotizacionDetalle = signal<CotizacionDetalleDto | null>(null);
  loadingDetalle = signal(false);

  // Export state: tracks which id is being exported + type
  exportingId = signal<string | null>(null);
  exportingType = signal<'pdf' | 'excel' | null>(null);

  searchText = '';
  selectedEstado: EstadoCotizacion | null = null;
  selectedClienteId: string | null = null;

  readonly estadoOptions: EstadoOption[] = [
    { label: 'Todos los estados', value: null },
    { label: ESTADO_LABEL[EstadoCotizacion.Borrador],   value: EstadoCotizacion.Borrador },
    { label: ESTADO_LABEL[EstadoCotizacion.Enviada],    value: EstadoCotizacion.Enviada },
    { label: ESTADO_LABEL[EstadoCotizacion.EnRevision], value: EstadoCotizacion.EnRevision },
    { label: ESTADO_LABEL[EstadoCotizacion.Aprobada],   value: EstadoCotizacion.Aprobada },
    { label: ESTADO_LABEL[EstadoCotizacion.Rechazada],  value: EstadoCotizacion.Rechazada },
    { label: ESTADO_LABEL[EstadoCotizacion.Cancelada],  value: EstadoCotizacion.Cancelada },
  ];

  clienteOptions = signal<ClienteOption[]>([{ label: 'Todos los clientes', value: null }]);

  ngOnInit(): void {
    this.loadClientes();
    this.loadCotizaciones();
  }

  private loadClientes(): void {
    this.clientesService.getAll().subscribe(clientes => {
      this.clientes.set(clientes);
      this.clienteOptions.set([
        { label: 'Todos los clientes', value: null },
        ...clientes.map(c => ({ label: c.nombre, value: c.id }))
      ]);
    });
  }

  loadCotizaciones(): void {
    this.loading.set(true);
    this.cotizacionesService
      .getAll(this.selectedClienteId ?? undefined, this.selectedEstado ?? undefined)
      .subscribe({
        next: data => { this.cotizaciones.set(data); this.loading.set(false); },
        error: () => this.loading.set(false)
      });
  }

  openDetalle(id: string): void {
    this.cotizacionDetalle.set(null);
    this.loadingDetalle.set(true);
    this.showDetalle.set(true);
    this.cotizacionesService.getById(id).subscribe({
      next: data => { this.cotizacionDetalle.set(data); this.loadingDetalle.set(false); },
      error: () => { this.loadingDetalle.set(false); this.showDetalle.set(false); }
    });
  }

  exportPdf(id: string): void {
    this.exportingId.set(id);
    this.exportingType.set('pdf');
    this.exportService.exportPdf(id).subscribe({
      next: () => { this.exportingId.set(null); this.exportingType.set(null); },
      error: () => { this.exportingId.set(null); this.exportingType.set(null); }
    });
  }

  exportExcel(id: string): void {
    this.exportingId.set(id);
    this.exportingType.set('excel');
    this.exportService.exportExcel(id).subscribe({
      next: () => { this.exportingId.set(null); this.exportingType.set(null); },
      error: () => { this.exportingId.set(null); this.exportingType.set(null); }
    });
  }

  isExporting(id: string, type: 'pdf' | 'excel'): boolean {
    return this.exportingId() === id && this.exportingType() === type;
  }

  formatMoney(value: number, moneda: Moneda): string {
    const symbol = MONEDA_SYMBOL[moneda];
    return `${symbol} ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  }

  formatMoneyDetalle(value: number): string {
    const c = this.cotizacionDetalle();
    if (!c) return '';
    const sym = MONEDA_SYMBOL[c.moneda];
    return `${sym} ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  }

  estadoBadge(estado: EstadoCotizacion): string { return ESTADO_BADGE[estado]; }
  estadoLabel(estado: EstadoCotizacion): string  { return ESTADO_LABEL[estado]; }
  monedaLabel(moneda: Moneda): string            { return MONEDA_LABEL[moneda]; }

  get filteredCotizaciones(): CotizacionResumenDto[] {
    if (!this.searchText.trim()) return this.cotizaciones();
    const q = this.searchText.toLowerCase();
    return this.cotizaciones().filter(c =>
      c.numero.toLowerCase().includes(q) ||
      c.proyecto.toLowerCase().includes(q) ||
      c.cliente.toLowerCase().includes(q)
    );
  }
}
