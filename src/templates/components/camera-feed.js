import { html } from 'lit';
import { localize } from '../../utils/localize';

export const cameraFeedTemplate = ({
  isOnline,
  hasError,
  _switchToExternalCam,
  _switchToInternalCam,
  _IsExternalCam,
  _HasExternalCam,
  currentStage,
  onError,
  onLoad
}) => {
  if (!isOnline || hasError) {
    return html`
      <div class="offline-message">
        <ha-icon icon="mdi:printer-off"></ha-icon>
        <span>
          ${isOnline
            ? localize.t('camera_unavailable')
            : localize.t('printer_offline')}
        </span>
      </div>
    `;
  }

  return html`
    <div class="camera-feed">
      <div class="camera-label">${currentStage}</div>
      ${!_HasExternalCam ? '' :
      html`<div class="camera-controls">
        <button
          class="btn btn-internal"
          @click=${() => {
            _switchToInternalCam();
          }}
        >
          ${localize.t('controls.internal')}
        </button>
        <button
          class="btn btn-external"
          @click=${() => {
            _switchToExternalCam();
          }}
        >
          ${localize.t('controls.external')}
        </button>
      </div>`}

      <img
        src=""
        style="width:100%; height:100%; object-fit:cover; border-radius:12px;"
        alt="Camera Feed"
        @error=${onError}
        @load=${onLoad}
      />
    </div>
  `;
};
