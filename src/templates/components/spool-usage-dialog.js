import { html } from 'lit';
import { localize } from '../../utils/localize';

export const spoolUsageDialogTemplate = (dialogConfig, hass) => {
  if (!dialogConfig?.open) return html``;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Get the dialog element from the event path
    const dialog = e.target.closest('ha-dialog');
    if (!dialog) return;

    const input = dialog?.querySelector('ha-textfield');
    const value = input ? parseFloat(input.value) : null;
    if (!dialogConfig.spoolId || value === null || isNaN(value)) return;

    hass.callService('spoolman', 'use_spool_filament', {
      id: dialogConfig.spoolId,
      use_weight: value
    }).then(() => dialogConfig.onClose()).catch(err => {
      console.error('Error using filament:', err);
    });
  };

  return html`
    <ha-dialog
      open
      id="spoolUsageDialog"
      @closed=${dialogConfig.onClose}
      .heading=${dialogConfig.title}
    >
      <div class="dialog-content">
        <ha-textfield
          label=${localize.t('materials.enter_weight')}
          type="number"
          class="temp-input"
        ></ha-textfield>
      </div>
      <mwc-button
        slot="secondaryAction"
        dialogAction="close"
        class="cancel-button"
      >
        ${localize.t('controls.cancel')}
      </mwc-button>
      <mwc-button
        slot="primaryAction"
        @click=${handleSubmit}
        class="save-button"
      >
        ${localize.t('controls.submit')}
      </mwc-button>
    </ha-dialog>
  `;
};
