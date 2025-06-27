// src/components/printwatch-card.js
import { LitElement, html } from 'lit';
import { cardTemplate } from '../templates/card-template';
import { cardStyles } from '../styles/card-styles';
import { formatDuration, formatEndTime } from '../utils/formatters';
import { isPrinting, isPaused, getAmsSlots, getEntityStates } from '../utils/state-helpers';
import { DEFAULT_CONFIG, DEFAULT_CAMERA_REFRESH_RATE, DEFAULT_EX_CAMERA_REFRESH_RATE } from '../constants/config';
import { localize } from '../utils/localize';
import { CameraManager } from '../utils/camera-manager';

class PrintWatchCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _cameraUpdateInterval: { type: Number },
      _dialogConfig: { state: true },
      _confirmDialog: { state: true },
      _spoolDialog: { state: true }
    };
  }

  static get styles() {
    return cardStyles;
  }

  constructor() {
    super();
    this._cameraManager = null;
    this._cameraUpdateInterval = DEFAULT_CAMERA_REFRESH_RATE;
    this._ext_cameraUpdateInterval = DEFAULT_EX_CAMERA_REFRESH_RATE;
    this._dialogConfig = { open: false };
    this._confirmDialog = { open: false };
    this._spoolDialog = { open: false };
    this.formatters = {
      formatDuration,
      formatEndTime
    };
  }

  setConfig(config) {
    if (!config.printer_name) {
      throw new Error('Please define printer_name');
    }
    this.config = { ...DEFAULT_CONFIG, ...config };
    this._cameraUpdateInterval = config.camera_refresh_rate || DEFAULT_CAMERA_REFRESH_RATE;
    this._ext_cameraUpdateInterval = config.external_camera_refresh_rate || DEFAULT_EX_CAMERA_REFRESH_RATE;
  }

  updated(changedProps) {
    super.updated(changedProps);
    if (changedProps.has('hass')) {
      this._updateCoverImage();

      if (!this._cameraManager && this.shadowRoot) {
        this._cameraManager = new CameraManager(
          this.hass,
          this.config,
          this._cameraUpdateInterval,
          this._ext_cameraUpdateInterval,
          this.shadowRoot,
          () => this.isOnline()
        );
        this._cameraManager.addEventListener('camera-source-changed', () => {
          this.requestUpdate();
        });
        this._cameraManager.start(1);
        this.requestUpdate();
      }
    }
  }

  _updateCoverImage() {
    const coverImg = this.shadowRoot?.querySelector('.preview-image img');
    if (coverImg) {
      const coverEntity = this.hass.states[this.config.cover_image_entity];
      if (coverEntity?.attributes?.entity_picture) {
        coverImg.src = `${coverEntity.attributes.entity_picture}`;
      }
    }
  }

  isOnline() {
    const onlineEntity = this.hass?.states[this.config.online_entity];
    return onlineEntity?.state === 'on';
  }

  // Control functions
  _toggleLight() {
    const lightEntity = this.hass.states[this.config.chamber_light_entity];
    if (!lightEntity) return;

    const service = lightEntity.state === 'on' ? 'turn_off' : 'turn_on';
    this.hass.callService('light', service, {
      entity_id: this.config.chamber_light_entity,
    });
  }

  _toggleFan() {
    const fanEntity = this.hass.states[this.config.aux_fan_entity];
    if (!fanEntity) return;

    const service = fanEntity.state === 'on' ? 'turn_off' : 'turn_on';
    this.hass.callService('fan', service, {
      entity_id: this.config.aux_fan_entity,
    });
  }

  handlePauseDialog() {
    this._confirmDialog = {
      open: true,
      type: 'pause',
      title: localize.t('dialogs.pause.title'),
      message: localize.t('dialogs.pause.message'),
      onConfirm: () => {
        const entity = isPaused(this.hass, this.config) 
          ? this.config.resume_button_entity 
          : this.config.pause_button_entity;
        
        this.hass.callService('button', 'press', {
          entity_id: entity
        });
        this._confirmDialog = { open: false };
      },
      onCancel: () => {
        this._confirmDialog = { open: false };
      }
    };
    this.requestUpdate();
  }

  handleStopDialog() {
    this._confirmDialog = {
      open: true,
      type: 'stop',
      title: localize.t('dialogs.stop.title'),
      message: localize.t('dialogs.stop.message'),
      onConfirm: () => {
        this.hass.callService('button', 'press', {
          entity_id: this.config.stop_button_entity
        });
        this._confirmDialog = { open: false };
      },
      onCancel: () => {
        this._confirmDialog = { open: false };
      }
    };
    this.requestUpdate();
  }

  handleSpoolUsageDialog(slot, index) {
    if (!slot) return;

    const trayIndex = index ?? 0;

    this._spoolDialog = {
      open: true,
      spoolId: slot.spool_id,
      trayIndex,
      onClose: () => {
        this._spoolDialog = { open: false };
        this.requestUpdate();
      }
    };
    this.requestUpdate();
  }

  render() {
    if (!this.hass || !this.config) {
      return html``;
    }

    const entities = getEntityStates(this.hass, this.config);
    const amsSlots = getAmsSlots(this.hass, this.config);
    
    const setDialogConfig = (config) => {
      this._dialogConfig = config;
      this.requestUpdate();
    };

    const cameraProps = {
      isOnline: this.isOnline(),
      isInit: this._cameraManager?.initialized ?? false,
      _cameraError: this._cameraManager?.error ?? false,
      _switchToExternalCam: () => this._cameraManager?.switchToExternal(),
      _switchToInternalCam: () => this._cameraManager?.switchToInternal(),
      _activeCameraIndex: this._cameraManager?.activeIndex ?? -1,
      _hasAnyCam: () => this._cameraManager?.hasAnyCam() ?? false,
      _hasBothCam: () => this._cameraManager?.hasBothCam() ?? false,
      currentStage: entities.currentStage,
      onError: () => this._cameraManager?.handleError(),
      onLoad: () => this._cameraManager?.handleLoad()
    };

    return cardTemplate({
      entities,
      hass: this.hass,
      amsSlots,
      formatters: this.formatters,
      _toggleLight: () => this._toggleLight(),
      _toggleFan: () => this._toggleFan(),
      cameraProps,
      dialogConfig: this._dialogConfig,
      confirmDialog: this._confirmDialog,
      spoolDialog: this._spoolDialog,
      setDialogConfig,
      handlePauseDialog: () => this.handlePauseDialog(),
      handleStopDialog: () => this.handleStopDialog(),
      handleSpoolDialog: (slot, idx) => this.handleSpoolUsageDialog(slot, idx)
    });
  }

  // This is used by Home Assistant for card size calculation
  getCardSize() {
    return 6;
  }
}

customElements.define('printwatch-card', PrintWatchCard);

export default PrintWatchCard;