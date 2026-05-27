import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CotizacionesService } from '../../../../core/api/cotizaciones.service';
import { CatalogoService } from '../../../../core/api/catalogo.service';
import { ItemCatalogoDto } from '../../../../core/models/catalogo.model';
import {
  buildGruposActividad,
  CotizacionDetalleDto,
  ESTADO_BADGE,
  ESTADO_LABEL,
  EstadoCotizacion,
  GrupoActividad,
  MONEDA_SYMBOL,
  TRANSICIONES_VALIDAS
} from '../../../../core/models/cotizacion.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

interface SelectOption { label: string; value: unknown }

@Component({
  selector: 'app-cotizacion-detalle',
  imports: [
    RouterLink, FormsModule,
    TableModule, ButtonModule, DialogModule, SelectModule, InputNumberModule,
    TagModule, ConfirmDialogModule,
    PageHeaderComponent, EmptyStateComponent
  ],
  templateUrl: './cotizacion-detalle.component.html',
  styleUrl: './cotizacion-detalle.component.scss'
})
export class CotizacionDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cotizacionesService = inject(CotizacionesService);
  private readonly cataloService = inject(CatalogoService);
  private readonly confirm = inject(ConfirmationService);
  private readonly toast = inject(MessageService);

  cotizacion = signal<CotizacionDetalleDto | null>(null);
  loading = signal(true);
  grupos = computed<GrupoActividad[]>(() => {
    const c = this.cotizacion();
    return c ? buildGruposActividad(c.partidas) : [];
  });
  showAddPartida = signal(false);
  showChangeEstado = signal(false);

  items = signal<ItemCatalogoDto[]>([]);
  itemOptions = signal<SelectOption[]>([]);

  selectedItemId = '';
  precioUnitario = 0;
  cantidad: number | null = null;
  addingSaving = signal(false);

  nuevoEstado: EstadoCotizacion | null = null;
  estadoOptions = signal<SelectOption[]>([]);
  changingEstado = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadCotizacion(id);
    this.cataloService.getItems().subscribe(items => {
      this.items.set(items);
      this.itemOptions.set(
        items.filter(i => i.activo).map(i => ({
          label: `[${i.codigo}] ${i.descripcion} — ${i.unidad}`,
          value: i.id
        }))
      );
    });
  }

  loadCotizacion(id: string): void {
    this.loading.set(true);
    this.cotizacionesService.getById(id).subscribe({
      next: data => { this.cotizacion.set(data); this.loading.set(false); },
      error: () => { this.loading.set(false); this.router.navigate(['/cotizaciones']); }
    });
  }

  onItemSelected(itemId: string): void {
    const item = this.items().find(i => i.id === itemId);
    if (item) this.precioUnitario = item.precioBase;
  }

  openAddPartida(): void {
    this.selectedItemId = '';
    this.precioUnitario = 0;
    this.cantidad = null;
    this.showAddPartida.set(true);
  }

  addPartida(): void {
    if (!this.selectedItemId || this.precioUnitario <= 0) return;
    this.addingSaving.set(true);
    const c = this.cotizacion()!;
    this.cotizacionesService.agregarPartida(c.id, {
      itemCatalogoId: this.selectedItemId,
      precioUnitario: this.precioUnitario,
      cantidad: this.cantidad ?? undefined
    }).subscribe({
      next: () => {
        this.showAddPartida.set(false);
        this.addingSaving.set(false);
        this.loadCotizacion(c.id);
        this.toast.add({ severity: 'success', summary: 'Partida agregada', life: 3000 });
      },
      error: () => this.addingSaving.set(false)
    });
  }

  openChangeEstado(): void {
    const c = this.cotizacion()!;
    const next = TRANSICIONES_VALIDAS[c.estado];
    this.estadoOptions.set(
      next.map(e => ({ label: ESTADO_LABEL[e], value: e }))
    );
    this.nuevoEstado = next[0] ?? null;
    this.showChangeEstado.set(true);
  }

  changeEstado(): void {
    if (!this.nuevoEstado) return;
    this.changingEstado.set(true);
    const c = this.cotizacion()!;
    this.cotizacionesService.cambiarEstado(c.id, { nuevoEstado: this.nuevoEstado }).subscribe({
      next: () => {
        this.showChangeEstado.set(false);
        this.changingEstado.set(false);
        this.loadCotizacion(c.id);
        this.toast.add({ severity: 'success', summary: 'Estado actualizado', life: 3000 });
      },
      error: () => this.changingEstado.set(false)
    });
  }

  estadoBadge(estado: EstadoCotizacion): string { return ESTADO_BADGE[estado]; }
  estadoLabel(estado: EstadoCotizacion): string { return ESTADO_LABEL[estado]; }

  formatMoney(value: number): string {
    const c = this.cotizacion();
    if (!c) return '';
    const sym = MONEDA_SYMBOL[c.moneda];
    return `${sym} ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
  }

  get canEdit(): boolean {
    const c = this.cotizacion();
    if (!c) return false;
    return c.estado !== EstadoCotizacion.Aprobada && c.estado !== EstadoCotizacion.Cancelada;
  }

  get canChangeEstado(): boolean {
    const c = this.cotizacion();
    if (!c) return false;
    return TRANSICIONES_VALIDAS[c.estado].length > 0;
  }
}
