// src/utils/camera-manager.js
export class CameraManager {
/**
 * @param {() => boolean} isOnlineFn – callback that returns online state
 */
  constructor(hass, config, refreshInterval, ext_refreshInterval, shadowRoot, isOnlineFn) {
    this.hass = hass;
    this.config = config;
    this.refreshInterval = refreshInterval;
    this.ext_refreshInterval = ext_refreshInterval;
    this.shadowRoot = shadowRoot;
    this.isOnline = isOnlineFn;
    this.error = false;
    this.activeIndex = -1;
    this.initialized = false;
    this._intervalId = null;
  }

  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  hasInternalCam() {
    return Boolean(
      this.config.camera_entity &&
      this.hass?.states?.[this.config.camera_entity] &&
      this.isOnline()
    );
  }

  hasExternalCam() {
    return Boolean(
      this.config.camera_entity_external &&
      this.hass?.states?.[this.config.camera_entity_external]
    );
  }

  hasAnyCam() {
    return this.hasInternalCam() || this.hasExternalCam();
  }

  hasBothCam() {
    return this.hasInternalCam() && this.hasExternalCam();
  }

  getCamEntity() {
    if (this.activeIndex === 1) {
      return this.config.camera_entity_external;
    }
    if (this.activeIndex === 0) {
      return this.config.camera_entity;
    }
    return undefined;
  }

  resolveActiveCam(desiredCam = 1) {
    desiredCam = this.clamp(desiredCam, 0, 1);

    if (desiredCam === 1) {
      if (this.hasExternalCam()) {
        this.activeIndex = 1;
      } else if (this.hasInternalCam()) {
        this.activeIndex = 0;
      } else {
        this.activeIndex = -1;
      }
    }

    if (desiredCam === 0) {
      if (this.hasInternalCam()) {
        this.activeIndex = 0;
      } else if (this.hasExternalCam()) {
        this.activeIndex = 1;
      } else {
        this.activeIndex = -1;
      }
    }
    this.initialized = true;
  }

  switchToExternal() {
    this.error = false;
    this.toggle(1);
  }

  switchToInternal() {
    this.error = false;
    this.toggle(0);
  }

  canUpdate() {
    this.resolveActiveCam(this.activeIndex)
    return this.activeIndex !== -1;
  }

  handleError() {
    this.error = true;
  }

  handleLoad() {
    this.error = false;
  }

  updateFeed() {
    if (!this.canUpdate()) {
      return;
    }

    const img = this.shadowRoot.querySelector('.camera-feed img');
    const entityId = this.getCamEntity();
    if (img && entityId) {
      const entity = this.hass.states[entityId];
      if (entity?.attributes?.entity_picture) {
        img.src = `${entity.attributes.entity_picture}`;
      }
    }
  }

  start(desiredCam = 1) {
    if (this._intervalId) return;
    // Initial update
    this.resolveActiveCam(desiredCam);
    this.updateFeed();

    let refresh = this.refreshInterval;
    if (this.activeIndex === 1) {
      refresh = this.ext_refreshInterval;
    }

    // Schedule subsequent updates
    this._intervalId = setInterval(
      () => this.updateFeed(),
      refresh
    );
  }

  stop() {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  toggle(desiredCam = 1){
    this.stop();
    this.start(desiredCam);
  }

  restart(){
    this.toggle(this.activeIndex);
  }
}
