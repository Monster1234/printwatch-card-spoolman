import { html } from 'lit';
import { localize } from '../../utils/localize';

export const spoolmanButtonsTemplate = ({ hass, config }) => {
  if (!hass || !config) return html``;

  const refreshButton = config.refresh_printer_button_entity;
  const spoolmanScript = config.refresh_spoolman_script;
  const spoolmanUrl = config.spoolman_url;

  const pressButton = () => {
    if (refreshButton) {
      hass.callService('button', 'press', { entity_id: refreshButton });
    }
  };

  const runScript = () => {
    if (spoolmanScript) {
      hass.callService('script', 'turn_on', { entity_id: spoolmanScript });
    }
  };

  const openLink = () => {
    if (spoolmanUrl) {
      window.open(spoolmanUrl, '_blank');
    }
  };

  return html`
    <div class="spoolman-buttons">
      <div class="temp-item" @click=${pressButton}>
        ${localize.t('controls.refresh_printer')}
      </div>
      <div class="temp-item" @click=${runScript}>
        ${localize.t('controls.refresh_spoolman')}
      </div>
      <div class="temp-item" @click=${openLink}>
        ${localize.t('controls.go_to_spoolman')}
      </div>
    </div>
  `;
};
