import { html } from 'lit';
import { localize } from '../../utils/localize';

export const spoolUsageDialogTemplate = (dialogConfig, hass) => {
  if (!dialogConfig?.open) return html``;

  const clearTray = (tray) => {
    Object.entries(hass.states).forEach(([entityId, stateObj]) => {
      if (!entityId.startsWith('sensor.spoolman_spool_')) return;
      const rawTray = stateObj.attributes?.extra_ams_tray;
      const trayNum = Number.isInteger(rawTray) ? rawTray : parseInt(rawTray, 10);
      if (trayNum === tray && stateObj.attributes?.id !== dialogConfig.spoolId) {
        hass.callService('spoolman', 'patch_spool', {
          id: stateObj.attributes.id,
          extra: { extra_ams_tray: 0 }
        });
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dialog = e.target.closest('ha-dialog');
    if (!dialog) return;
    const select = dialog.querySelector('#action-select');
    const activeIndex = parseInt(select?.value ?? '0', 10);

    if (dialogConfig.spoolId) {
      if (activeIndex === 0) {
        const input = dialog.querySelector('ha-textfield');
        const value = input ? parseFloat(input.value) : null;
        if (value === null || isNaN(value)) return;
        hass.callService('spoolman', 'use_spool_filament', {
          id: dialogConfig.spoolId,
          use_weight: value
        }).then(() => dialogConfig.onClose()).catch(err => {
          console.error('Error using filament:', err);
        });
      } else if (activeIndex === 1) {
        const select = dialog.querySelector('#tray-select');
        const tray = parseInt(select?.value, 10);
        if (!isNaN(tray)) {
          clearTray(tray);
          hass.callService('spoolman', 'patch_spool', {
            id: dialogConfig.spoolId,
            extra: { extra_ams_tray: tray }
          }).then(() => dialogConfig.onClose()).catch(err => {
            console.error('Error setting tray:', err);
          });
        }
      }
    } else {
      const select = dialog.querySelector('#spool-select');
      const spoolId = select?.value;
      if (!spoolId) return;
      const tray = dialogConfig.trayIndex + 1;
      clearTray(tray);
      hass.callService('spoolman', 'patch_spool', {
        id: spoolId,
        extra: { extra_ams_tray: tray }
      }).then(() => dialogConfig.onClose()).catch(err => {
        console.error('Error selecting spool:', err);
      });
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

  const spoolSensors = Object.entries(hass.states)
    .filter(([eid]) => eid.startsWith('sensor.spoolman_spool_'))
    .map(([, s]) => s);

  const spoolOptions = spoolSensors.map(s => ({
    id: s.attributes.id,
    name: s.attributes.name || s.attributes.display_name || `Spool ${s.attributes.id}`
  }));

  const currentTray = dialogConfig.trayIndex + 1;

  return html`
    <ha-dialog
      open
      id="spoolUsageDialog"
      @closed=${dialogConfig.onClose}
      .heading=${dialogConfig.title}
    >
      <div class="dialog-content">
        <ha-select
          id="action-select"
          .value="0"
          @selected=${handleSectionChange}
          @closed=${(e) => e.stopPropagation()}
        >
          ${dialogConfig.spoolId
            ? html`
                <mwc-list-item value="0">
                  ${localize.t('dialogs.use_filament.title')}
                </mwc-list-item>
                <mwc-list-item value="1">
                  ${localize.t('materials.set_tray')}
                </mwc-list-item>
              `
            : html`<mwc-list-item value="0">${localize.t('materials.select_spool')}</mwc-list-item>`}
        </ha-select>
        ${dialogConfig.spoolId
          ? html`
              <div class="section-content">
                <ha-textfield
                  label=${localize.t('materials.enter_weight')}
                  type="number"
                  class="temp-input"
                ></ha-textfield>
              </div>
              <div class="section-content" style="display:none">
                <div class="current-tray">${localize.t('materials.current_tray')}: ${currentTray}</div>
                <ha-select id="tray-select" .value="${currentTray}">
                  ${[1, 2, 3, 4].map(i => html`<mwc-list-item .value=${i}>${i}</mwc-list-item>`)}
                </ha-select>
              </div>
            `
          : html`
              <div class="section-content">
                <ha-select id="spool-select" .value=${spoolOptions[0]?.id ?? ''}>
                  ${spoolOptions.map(opt => html`<mwc-list-item .value=${opt.id}>${opt.name}</mwc-list-item>`)}
                </ha-select>
              </div>
            `}
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