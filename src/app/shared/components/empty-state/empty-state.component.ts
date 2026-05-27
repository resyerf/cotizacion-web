import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <div class="empty-state__icon">
        <i [class]="icon()"></i>
      </div>
      <h3 class="empty-state__title">{{ title() }}</h3>
      @if (description()) {
        <p class="empty-state__desc">{{ description() }}</p>
      }
      <ng-content />
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;

      &__icon {
        width: 48px;
        height: 48px;
        background: var(--color-brand-light);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;

        i {
          font-size: 20px;
          color: var(--color-brand);
        }
      }

      &__title {
        font-size: 15px;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 6px;
      }

      &__desc {
        font-size: 13.5px;
        color: var(--color-text-secondary);
        max-width: 320px;
        margin-bottom: 20px;
      }
    }
  `]
})
export class EmptyStateComponent {
  icon = input<string>('pi pi-inbox');
  title = input.required<string>();
  description = input<string>();
}
