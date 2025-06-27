import { html } from 'lit';
import { localize } from '../../utils/localize';

export const spoolUsageDialogTemplate = (dialogConfig, hass) => {
  if (!dialogConfig?.open || !dialogConfig?.spoolId) return html``;

  const refreshScript = dialogConfig.refreshScript;
  const runRefreshScript = () => {
    if (refreshScript) {
      hass.callService('script', 'turn_on', { entity_id: refreshScript });
    }
  };

  const clearTray = (tray) => {
    Object.entries(hass.states).forEach(([entityId, stateObj]) => {
      if (!entityId.startsWith('sensor.spoolman_spool_')) return;
      console.log('running clear tray', tray);
      const rawTray = stateObj.attributes?.extra_ams_tray;
      const trayNum = Number.isInteger(rawTray) ? rawTray : parseInt(rawTray, 10);
      if (trayNum === tray && stateObj.attributes?.id !== dialogConfig.spoolId) {
        console.log('clear tray', tray);
        hass.callService('spoolman', 'patch_spool', {
          id: stateObj.attributes.id,
          extra: { ams_tray: String(0) }
        }).then(runRefreshScript);
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dialog = e.target.closest('ha-dialog');
    if (!dialog) return;
    const select = dialog.querySelector('#action-select');
    const activeIndex = parseInt(select?.value ?? '0', 10);
    console.log('running submit', activeIndex);

    if (activeIndex === 0) {
      const input = dialog.querySelector('ha-textfield');
      const value = input ? parseFloat(input.value) : null;
      if (value === null || isNaN(value)) return;
      hass.callService('spoolman', 'use_spool_filament', {
        id: dialogConfig.spoolId,
        use_weight: value
      }).then(() => {
        runRefreshScript();
        dialogConfig.onClose();
      }).catch(err => {
        console.error('Error using filament:', err);
      });
    } else if (activeIndex === 1) {
      const select = dialog.querySelector('#tray-select');
      const tray = parseInt(select?.value, 10);
      if (!isNaN(tray)) {
        clearTray(tray);
        hass.callService('spoolman', 'patch_spool', {
          id: dialogConfig.spoolId,
          extra: { ams_tray: String(tray) }
        }).then(() => {
          runRefreshScript();
          dialogConfig.onClose();
        }).catch(err => {
          console.error('Error setting tray:', err);
        });
      }
    }
  };

  const handleSectionChange = (e) => {
    const dialog = e.target.closest('ha-dialog');
    if (!dialog) return;
    const index = parseInt(e.target.value, 10);
    const contents = dialog.querySelectorAll('.section-content');
    contents.forEach((c, i) => {
      c.style.display = i === index ? 'block' : 'none';
    });
    e.stopPropagation();
  };

  const currentTray = dialogConfig.trayIndex + 1;

  return html`
    <ha-dialog
      open
      id="spoolUsageDialog"
      @closed=${dialogConfig.onClose}
      .heading=${localize.t('dialogs.spoolman_dialog.title')}
    >
      <div class="dialog-content">
        <ha-select
          id="action-select"
          .value="0"
          @selected=${handleSectionChange}
          @closed=${(e) => e.stopPropagation()}
        >
          <mwc-list-item value="0">
            ${localize.t('materials.use_filament')}
          </mwc-list-item>
          <mwc-list-item value="1">
            ${localize.t('materials.set_tray')}
          </mwc-list-item>
        </ha-select>
        <div class="section-content">
          <ha-textfield
            label=${localize.t('materials.enter_weight')}
            type="number"
            class="temp-input"
          ></ha-textfield>
        </div>
        <div class="section-content" style="display:none">
          <div class="current-tray">${localize.t('materials.current_tray')}: ${currentTray}</div>
          <ha-select
            id="tray-select"
            .value="${currentTray}"
            @closed=${(e) => e.stopPropagation()}
          >
            ${[1, 2, 3, 4].map(i => html`<mwc-list-item .value=${i}>${i}</mwc-list-item>`)}
          </ha-select>
        </div>
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