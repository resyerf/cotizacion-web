import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="page-header">
      <div class="page-header__text">
        <h1 class="page-header__title">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="page-header__subtitle">{{ subtitle() }}</p>
        }
      </div>
      <div class="page-header__actions">
        <ng-content />
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 24px;

      &__title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--color-text-primary);
        letter-spacing: -0.02em;
      }

      &__subtitle {
        font-size: 13px;
        color: var(--color-text-secondary);
        margin-top: 2px;
      }

      &__actions {
        display: flex;
        gap: 8px;
        align-items: center;
        flex-shrink: 0;
      }
    }
  `]
})
export class PageHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>();
}
