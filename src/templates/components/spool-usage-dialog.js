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
    const tabBar = dialog.querySelector('mwc-tab-bar');
    const activeIndex = tabBar?.activeIndex ?? 0;

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

  const handleTab = (e) => {
    const dialog = e.target.closest('ha-dialog');
    if (!dialog) return;
    const index = e.detail.index;
    const contents = dialog.querySelectorAll('.tab-content');
    contents.forEach((c, i) => {
      c.style.display = i === index ? 'block' : 'none';
    });
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
      <mwc-tab-bar @MDCTabBar:activated=${handleTab}>
        ${dialogConfig.spoolId
          ? html`
              <mwc-tab label="${localize.t('dialogs.use_filament.title')}"></mwc-tab>
              <mwc-tab label="${localize.t('materials.set_tray')}"></mwc-tab>
            `
          : html`<mwc-tab label="${localize.t('materials.select_spool')}"></mwc-tab>`}
      </mwc-tab-bar>
      <div class="dialog-content">
        ${dialogConfig.spoolId
          ? html`
              <div class="tab-content">
                <ha-textfield
                  label=${localize.t('materials.enter_weight')}
                  type="number"
                  class="temp-input"
                ></ha-textfield>
              </div>
              <div class="tab-content" style="display:none">
                <div class="current-tray">${localize.t('materials.current_tray')}: ${currentTray}</div>
                <ha-select id="tray-select" .value="${currentTray}">
                  ${[1, 2, 3, 4].map(i => html`<mwc-list-item .value=${i}>${i}</mwc-list-item>`)}
                </ha-select>
              </div>
            `
          : html`
              <div class="tab-content">
                <ha-select id="spool-select">
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
