import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { MessageService } from 'primeng/api';
import { CatalogoService } from '../../../../core/api/catalogo.service';
import { ActividadDto, ItemCatalogoDto, Moneda, MONEDA_OPTIONS, MONEDA_SYM } from '../../../../core/models/catalogo.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';

interface SelectOption { label: string; value: unknown }

@Component({
  selector: 'app-catalogo-list',
  imports: [
    FormsModule, ReactiveFormsModule,
    DecimalPipe,
    TableModule, ButtonModule, DialogModule, InputTextModule, InputNumberModule,
    SelectModule, TabsModule, IconFieldModule, InputIconModule,
    PageHeaderComponent, EmptyStateComponent
  ],
  templateUrl: './catalogo-list.component.html',
  styleUrl: './catalogo-list.component.scss'
})
export class CatalogoListComponent implements OnInit {
  private readonly cataloService = inject(CatalogoService);
  private readonly toast = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  actividades = signal<ActividadDto[]>([]);
  items = signal<ItemCatalogoDto[]>([]);
  loadingAct = signal(true);
  loadingItems = signal(true);
  searchItems = '';
  filterActividadId: string | null = null;

  // Dialog state
  showActDialog = signal(false);
  showItemDialog = signal(false);
  savingAct = signal(false);
  savingItem = signal(false);
  editingActId: string | null = null;
  editingItemId: string | null = null;

  actividadOptions = signal<SelectOption[]>([]);
  readonly monedaOptions = MONEDA_OPTIONS;
  readonly Moneda = Moneda;

  readonly formAct = this.fb.group({
    nombre: ['', [Validators.required]],
    orden:  [1,  [Validators.required, Validators.min(1)]],
  });

  readonly formItem = this.fb.group({
    actividadId: ['', [Validators.required]],
    codigo:      ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    unidad:      ['', [Validators.required]],
    precioBase:  [0,  [Validators.required, Validators.min(0)]],
    moneda:      [Moneda.USD, [Validators.required]],
  });

  ngOnInit(): void {
    this.loadActividades();
    this.loadItems();
  }

  // ── Load ────────────────────────────────────────────────────

  loadActividades(): void {
    this.loadingAct.set(true);
    this.cataloService.getActividades().subscribe({
      next: data => {
        this.actividades.set(data);
        this.actividadOptions.set([
          { label: 'Todas las actividades', value: null },
          ...data.filter(a => a.activo).map(a => ({ label: a.nombre, value: a.id }))
        ]);
        this.loadingAct.set(false);
      },
      error: () => this.loadingAct.set(false)
    });
  }

  loadItems(): void {
    this.loadingItems.set(true);
    this.cataloService.getItems(this.filterActividadId ?? undefined).subscribe({
      next: data => { this.items.set(data); this.loadingItems.set(false); },
      error: () => this.loadingItems.set(false)
    });
  }

  // ── Actividad CRUD ──────────────────────────────────────────

  openNewAct(): void {
    this.editingActId = null;
    this.formAct.reset({ orden: this.actividades().length + 1 });
    this.showActDialog.set(true);
  }

  openEditAct(a: ActividadDto): void {
    this.editingActId = a.id;
    this.formAct.setValue({ nombre: a.nombre, orden: a.orden });
    this.showActDialog.set(true);
  }

  saveActividad(): void {
    if (this.formAct.invalid) { this.formAct.markAllAsTouched(); return; }
    this.savingAct.set(true);
    const v = this.formAct.getRawValue();

    const obs = this.editingActId
      ? this.cataloService.updateActividad(this.editingActId, { nombre: v.nombre!, orden: v.orden! })
      : this.cataloService.createActividad({ nombre: v.nombre! });

    obs.subscribe({
      next: () => {
        this.showActDialog.set(false);
        this.savingAct.set(false);
        this.loadActividades();
        this.toast.add({ severity: 'success', summary: this.editingActId ? 'Actividad actualizada' : 'Actividad creada', life: 3000 });
        this.editingActId = null;
      },
      error: () => this.savingAct.set(false)
    });
  }

  deactivateActividad(a: ActividadDto): void {
    if (!confirm(`¿Desactivar la actividad "${a.nombre}"?`)) return;
    this.cataloService.deactivateActividad(a.id).subscribe({
      next: () => {
        this.loadActividades();
        this.toast.add({ severity: 'warn', summary: 'Actividad desactivada', life: 3000 });
      }
    });
  }

  // ── Item CRUD ───────────────────────────────────────────────

  openNewItem(): void {
    this.editingItemId = null;
    this.formItem.reset({ precioBase: 0, moneda: Moneda.USD });
    this.formItem.get('codigo')!.enable();
    this.showItemDialog.set(true);
  }

  openEditItem(i: ItemCatalogoDto): void {
    this.editingItemId = i.id;
    this.formItem.setValue({
      actividadId: i.actividadId,
      codigo:      i.codigo,
      descripcion: i.descripcion,
      unidad:      i.unidad,
      precioBase:  i.precioBase,
      moneda:      i.moneda,
    });
    this.formItem.get('codigo')!.disable();
    this.showItemDialog.set(true);
  }

  saveItem(): void {
    if (this.formItem.invalid) { this.formItem.markAllAsTouched(); return; }
    this.savingItem.set(true);
    const v = this.formItem.getRawValue();

    const obs = this.editingItemId
      ? this.cataloService.updateItem(this.editingItemId, {
          actividadId: v.actividadId!,
          descripcion: v.descripcion!,
          unidad:      v.unidad!,
          precioBase:  v.precioBase!,
          moneda:      v.moneda!,
        })
      : this.cataloService.createItem({
          actividadId: v.actividadId!,
          codigo:      v.codigo!,
          descripcion: v.descripcion!,
          unidad:      v.unidad!,
          precioBase:  v.precioBase!,
          moneda:      v.moneda!,
        });

    obs.subscribe({
      next: () => {
        this.showItemDialog.set(false);
        this.savingItem.set(false);
        this.loadItems();
        this.toast.add({ severity: 'success', summary: this.editingItemId ? 'Item actualizado' : 'Item creado', life: 3000 });
        this.editingItemId = null;
      },
      error: () => this.savingItem.set(false)
    });
  }

  deactivateItem(i: ItemCatalogoDto): void {
    if (!confirm(`¿Desactivar el item "${i.descripcion}"?`)) return;
    this.cataloService.deactivateItem(i.id).subscribe({
      next: () => {
        this.loadItems();
        this.toast.add({ severity: 'warn', summary: 'Item desactivado', life: 3000 });
      }
    });
  }

  // ── Helpers ─────────────────────────────────────────────────

  monedaSym(m: Moneda): string { return MONEDA_SYM[m] ?? ''; }

  get filteredItems(): ItemCatalogoDto[] {
    if (!this.searchItems.trim()) return this.items();
    const q = this.searchItems.toLowerCase();
    return this.items().filter(i =>
      i.codigo.toLowerCase().includes(q) ||
      i.descripcion.toLowerCase().includes(q) ||
      i.actividadNombre.toLowerCase().includes(q)
    );
  }

  get actividadFormOptions(): SelectOption[] {
    return this.actividades().filter(a => a.activo).map(a => ({ label: a.nombre, value: a.id }));
  }

  hasErrorAct(f: string): boolean { const c = this.formAct.get(f);  return !!(c?.invalid && c.touched); }
  hasErrorItem(f: string): boolean { const c = this.formItem.get(f); return !!(c?.invalid && c.touched); }
  get isEditingItem(): boolean { return !!this.editingItemId; }
  get isEditingAct(): boolean  { return !!this.editingActId; }
}
