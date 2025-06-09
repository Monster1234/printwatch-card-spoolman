import { html } from 'lit';
import { localize } from '../../utils/localize';

export const materialSlotsTemplate = (slots, onClick) => html`
  <div class="materials">
    ${slots.map((slot, index) => {
      const percent = 100 * (1 - (slot.remaining_percent ?? 0));
      const baseColor = slot.color || '#E0E0E0';
      // Clip top 'percent%' of the fill only
      const clipInset = `inset(${percent}% 0 0 0)`;
      return html`
        <div class="material-slot" @click=${() => onClick?.(slot)}>
          <div class="material-circle-wrapper">
            <!-- Border layer: full circle -->
            <div
              class="material-circle-border${slot.active ? ' active' : ''}"
              style="border-color: ${baseColor};"
            ></div>
            <!-- Fill layer: smaller, clipped -->
            <div
              class="material-circle-fill"
              style="
                background-color: ${baseColor};
                clip-path: ${clipInset};
                -webkit-clip-path: ${clipInset};
              "
            ></div>
          </div>
          <div class="material-type">
            ${slot.type || localize.t('materials.empty')}
          </div>
          ${slot.weight
            ? html`<div class="material-weight">${slot.weight} g</div>`
            : ''}
        </div>
      `;
    })}
  </div>
`;