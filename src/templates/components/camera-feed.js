// src/templates/components/camera-feed.js
import { html } from 'lit';
import { localize } from '../../utils/localize';

export const cameraFeedTemplate = (cameraProps) => {
  const {
    isOnline,
    isInit,
    _cameraError,
    _hasAnyCam,
    _hasBothCam,
    _activeCameraIndex,
    currentStage,
    onError,
    onLoad,
    _switchToInternalCam,
    _switchToExternalCam
  } = cameraProps;

  const showControls = _hasBothCam();

  // Determine error message if any
  let errorMessage = '';
  const showError = !_hasAnyCam() || _cameraError;
  if (!isInit) {
    errorMessage = localize.t('camera_init');
  } else if (!_hasAnyCam()) {
    errorMessage = localize.t('no_camera_found');
  } else if (_cameraError && _activeCameraIndex === 0) {
    errorMessage = localize.t('camera_unavailable');
  } else if (_cameraError && _activeCameraIndex === 1) {
    errorMessage = localize.t('camera_external_unavailable');
  }

  return html`
    <div class="camera-feed">
      <div class="camera-label">${currentStage}</div>
      ${showControls
        ? html`<div class="camera-controls">
            <button @click=${_switchToInternalCam} class="icon-button camera ${_activeCameraIndex === 0 ? 'active' : ''}" >
              <ha-icon icon="mdi:camera-document"></ha-icon>
            </button>
            <button @click=${_switchToExternalCam} class="icon-button camera ${_activeCameraIndex === 1 ? 'active' : ''}">
              <ha-icon icon="mdi:cctv"></ha-icon>
            </button>
          </div>`
        : ''}

      <img
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480'%3E%3Crect width='640' height='480' fill='%23121212'/%3E%3C/svg%3E"
        style="width:100%; height:100%; object-fit:cover; border-radius:12px;"
        alt="Camera Feed"
        @error=${onError}
        @load=${onLoad}
      />

      ${showError
        ? html`<div class="offline-message" style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.6);
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
          ">
            <ha-icon icon="mdi:printer-off"></ha-icon>
            <span>${errorMessage}</span>
          </div>`
        : ''}
    </div>
  `;
};
//@error=${onError}