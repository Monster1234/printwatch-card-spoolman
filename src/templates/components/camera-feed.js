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
            <button @click=${_switchToInternalCam} class="btn btn-internal">
              <ha-icon icon="mdi:camera-document"></ha-icon>
            </button>
            <button @click=${_switchToExternalCam} class="btn btn-external">
              <ha-icon icon="mdi:cctv"></ha-icon>
            </button>
          </div>`
        : ''}

      <img
        src="https://dummyimage.com/640x480/121212/8c8c8c&text=+"
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