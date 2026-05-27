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
import { ActividadDto, ItemCatalogoDto } from '../../../../core/models/catalogo.model';
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

  showActDialog = signal(false);
  showItemDialog = signal(false);
  savingAct = signal(false);
  savingItem = signal(false);

  actividadOptions = signal<SelectOption[]>([]);

  readonly formAct = this.fb.group({
    codigo: ['', [Validators.required]],
    nombre: ['', [Validators.required]],
    orden:  [1, [Validators.required, Validators.min(1)]],
  });

  readonly formItem = this.fb.group({
    actividadId: ['', [Validators.required]],
    codigo:      ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    unidad:      ['', [Validators.required]],
    precioBase:  [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.loadActividades();
    this.loadItems();
  }

  loadActividades(): void {
    this.loadingAct.set(true);
    this.cataloService.getActividades().subscribe({
      next: data => {
        this.actividades.set(data);
        this.actividadOptions.set([
          { label: 'Todas las actividades', value: null },
          ...data.map(a => ({ label: `[${a.codigo}] ${a.nombre}`, value: a.id }))
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

  saveActividad(): void {
    if (this.formAct.invalid) { this.formAct.markAllAsTouched(); return; }
    this.savingAct.set(true);
    const v = this.formAct.getRawValue();
    this.cataloService.createActividad({ codigo: v.codigo!, nombre: v.nombre!, orden: v.orden! }).subscribe({
      next: () => {
        this.showActDialog.set(false);
        this.savingAct.set(false);
        this.loadActividades();
        this.toast.add({ severity: 'success', summary: 'Actividad creada', life: 3000 });
      },
      error: () => this.savingAct.set(false)
    });
  }

  saveItem(): void {
    if (this.formItem.invalid) { this.formItem.markAllAsTouched(); return; }
    this.savingItem.set(true);
    const v = this.formItem.getRawValue();
    this.cataloService.createItem({
      actividadId: v.actividadId!,
      codigo:      v.codigo!,
      descripcion: v.descripcion!,
      unidad:      v.unidad!,
      precioBase:  v.precioBase!,
    }).subscribe({
      next: () => {
        this.showItemDialog.set(false);
        this.savingItem.set(false);
        this.loadItems();
        this.toast.add({ severity: 'success', summary: 'Item creado', life: 3000 });
      },
      error: () => this.savingItem.set(false)
    });
  }

  get filteredItems(): ItemCatalogoDto[] {
    if (!this.searchItems.trim()) return this.items();
    const q = this.searchItems.toLowerCase();
    return this.items().filter(i =>
      i.codigo.toLowerCase().includes(q) ||
      i.descripcion.toLowerCase().includes(q) ||
      i.actividadNombre.toLowerCase().includes(q)
    );
  }

  hasErrorAct(f: string): boolean { const c = this.formAct.get(f); return !!(c?.invalid && c.touched); }
  hasErrorItem(f: string): boolean { const c = this.formItem.get(f); return !!(c?.invalid && c.touched); }
}
