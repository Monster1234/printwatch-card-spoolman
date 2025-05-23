import { html } from 'lit';
import { localize } from '../../utils/localize';
import { formatTemperature } from '../../utils/formatters';
import { temperatureDialogTemplate } from './temperature-controls';

export const temperatureDisplayTemplate = (entities, hass, dialogConfig = {}, setDialogConfig) => {
  const handleControlClick = (type, currentValue, entityId) => {
    let config = {
      open: true,
      type,
      currentValue,
      entityId,
      onClose: () => setDialogConfig({ open: false })
    };

    switch (type) {
      case 'bed':
        config = {
          ...config,
          title: localize.t('temperatures.bed_target'),
          min: 0,
          max: 120
        };
        break;
      case 'nozzle':
        config = {
          ...config,
          title: localize.t('temperatures.nozzle_target'),
          min: 0,
          max: 320
        };
        break;
      case 'speed':
        config = {
          ...config,
          title: localize.t('temperatures.speed_profile')
        };
        break;
    }

    setDialogConfig(config);
  };

  // Get temperature units from sensors
  const bedTempUnit = hass.states[entities.bed_temp_entity]?.attributes?.unit_of_measurement || '°C';
  const nozzleTempUnit = hass.states[entities.nozzle_temp_entity]?.attributes?.unit_of_measurement || '°C';

  return html`
    <div class="temperatures">
      <div 
        class="temp-item" 
        @click=${() => handleControlClick('bed', entities.bedTemp, entities.bed_target_temp_entity)}
      >
        <div class="temp-value">
          ${formatTemperature(entities.bedTemp, bedTempUnit)}
        </div>
        <div>${localize.t('temperatures.bed')}</div>
      </div>

      <div 
        class="temp-item"
        @click=${() => handleControlClick('nozzle', entities.nozzleTemp, entities.nozzle_target_temp_entity)}
      >
        <div class="temp-value">
          ${formatTemperature(entities.nozzleTemp, nozzleTempUnit)}
        </div>
        <div>${localize.t('temperatures.nozzle')}</div>
      </div>

      <div 
        class="temp-item"
        @click=${() => handleControlClick('speed', hass.states[entities.speed_profile_entity]?.state || 'standard', entities.speed_profile_entity)}
      >
        <div class="temp-value">
          ${(() => {
            const raw = hass.states[entities.speed_profile_entity]?.state ?? 'standard';
            if (raw.toLowerCase() === 'unavailable') {
              return '---';
            }
            const nice = raw.charAt(0).toUpperCase() + raw.slice(1);
            return nice;
          })()}
        </div>
        <div>${localize.t('temperatures.speed')}</div>
      </div>
    </div>

    ${temperatureDialogTemplate(dialogConfig, hass)}
  `;
};