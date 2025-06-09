// src/templates/card-template.js
import { html } from 'lit';
import { headerTemplate } from './components/header';
import { cameraFeedTemplate } from './components/camera-feed';
import { printStatusTemplate } from './components/print-status';
import { temperatureDisplayTemplate } from './components/temperature-display';
import { materialSlotsTemplate } from './components/material-slots';
import { temperatureDialogTemplate } from './components/temperature-controls';
import { confirmDialogTemplate } from './components/confirm-dialog';
import { spoolUsageDialogTemplate } from './components/spool-usage-dialog';

export const cardTemplate = (context) => {
  const { 
    entities, 
    hass, 
    amsSlots, 
    _toggleLight, 
    _toggleFan, 
    cameraProps,
    formatters,
    dialogConfig,
    confirmDialog,
    spoolDialog,
    setDialogConfig,
    handlePauseDialog,
    handleStopDialog,
    handleSpoolDialog
  } = context;

  if (!entities || !hass) return html``;

  const controls = {
    lightState: hass.states[entities.chamber_light_entity]?.state,
    fanState: hass.states[entities.aux_fan_entity]?.state,
    hasFan: !!entities.aux_fan_entity,
    onLightToggle: _toggleLight,
    onFanToggle: _toggleFan,
    hass
  };

  return html`
    <div class="card">
      ${headerTemplate(entities, controls)}
      ${cameraFeedTemplate(cameraProps)}
      ${printStatusTemplate(entities, {
        hass,
        onPause: handlePauseDialog,
        onStop: handleStopDialog,
        onImageError: context.handleImageError
      })}
      ${temperatureDisplayTemplate(entities, hass, dialogConfig, setDialogConfig)}
      ${materialSlotsTemplate(amsSlots, handleSpoolDialog)}
      ${temperatureDialogTemplate(dialogConfig, hass)}
      ${spoolUsageDialogTemplate(spoolDialog, hass)}
      ${confirmDialogTemplate(confirmDialog)}
    </div>
  `;
};