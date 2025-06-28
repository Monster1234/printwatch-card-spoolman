# PrintWatch Card - Spoolman

PrintWatch Card is a custom Lovelace card for Home Assistant that displays the state of your 3D printer. This fork integrates with [Spoolman](https://github.com/Donkie/Spoolman) and allows toggling between an internal and external camera feed.

![Screenshot](assets/printwatch-spoolman2.png)
![Screenshot](assets/printwatch-spoolman3.png)
![Screenshot](assets/printwatch-spoolman4.png)

## Features

- Show detailed printing status and progress.
- Display spool information from Spoolman including remaining filament weight.
- Use or set filament amounts and assign trays directly from the card.
- Switch between the printer's built‑in camera and an external camera.
- Quick links to refresh printer information, refresh Spoolman data and open the Spoolman UI.

Spoolman needs an extra field `ams_tray` on each spool where `0` means the spool is not in the AMS and numbers starting from `1` correspond to the AMS slot.

## Installation

1. Install dependencies and build the card:

   ```bash
   npm install
   npm run build
   ```

   The compiled file will be available as `dist/printwatch-card.js`.

2. Copy the file to your Home Assistant `www` folder and add it as a resource:

   ```yaml
   resources:
     - url: /local/printwatch-card.js
       type: module
   ```

## Configuration

Add the card to your Lovelace dashboard. At minimum set `printer_name` and `spoolman_url`.

```yaml
type: custom:printwatch-card
printer_name: My 3D Printer
print_status_entity: sensor.p1s_01p00a382500072_print_status
current_stage_entity: sensor.p1s_01p00a382500072_current_stage
task_name_entity: sensor.p1s_01p00a382500072_task_name
progress_entity: sensor.p1s_01p00a382500072_print_progress
current_layer_entity: sensor.p1s_01p00a382500072_current_layer
total_layers_entity: sensor.p1s_01p00a382500072_total_layer_count
remaining_time_entity: sensor.p1s_01p00a382500072_remaining_time
bed_temp_entity: sensor.p1s_01p00a382500072_bed_temperature
nozzle_temp_entity: sensor.p1s_01p00a382500072_nozzle_temperature
bed_target_temp_entity: number.p1s_01p00a382500072_bed_target_temperature
nozzle_target_temp_entity: number.p1s_01p00a382500072_nozzle_target_temperature
speed_profile_entity: select.p1s_01p00a382500072_printing_speed
active_tray_index_entity: sensor.p1s_01p00a382500072_active_tray_index
ams_slot1_entity: sensor.p1s_01p00a382500072_ams_1_tray_1
ams_slot2_entity: sensor.p1s_01p00a382500072_ams_1_tray_2
ams_slot3_entity: sensor.p1s_01p00a382500072_ams_1_tray_3
ams_slot4_entity: sensor.p1s_01p00a382500072_ams_1_tray_4
camera_entity: image.p1s_camera
camera_entity_external: ''
cover_image_entity: image.p1s_cover_image
pause_button_entity: button.p1s_01p00a382500072_pause_printing
resume_button_entity: button.p1s_01p00a382500072_resume_printing
stop_button_entity: button.p1s_01p00a382500072_stop_printing
chamber_light_entity: light.p1s_01p00a382500072_chamber_light
online_entity: binary_sensor.p1s_01p00a382500072_online
print_weight_entity: sensor.p1s_print_weight
print_length_entity: sensor.p1s_print_length
refresh_printer_button_entity: button.a1_force_refresh_data
refresh_spoolman_script: script.reload_spoolman
spoolman_url: http://localhost:7912/
camera_refresh_rate: 1000
external_camera_refresh_rate: 300
```

### Options

| Option | Description |
|-------|-------------|
| `printer_name` | Name displayed on the card. |
| `print_status_entity` | Sensor providing the overall print status. |
| `current_stage_entity` | Current stage of the print. |
| `task_name_entity` | Name of the active job. |
| `progress_entity` | Percentage progress of the print. |
| `current_layer_entity` | Currently printed layer number. |
| `total_layers_entity` | Total number of layers. |
| `remaining_time_entity` | Estimated time remaining. |
| `bed_temp_entity` | Bed temperature sensor. |
| `nozzle_temp_entity` | Nozzle temperature sensor. |
| `bed_target_temp_entity` | Number entity for setting the bed temperature. |
| `nozzle_target_temp_entity` | Number entity for setting the nozzle temperature. |
| `speed_profile_entity` | Select entity for the printing speed profile. |
| `active_tray_index_entity` | Sensor indicating the active AMS tray. |
| `ams_slot1_entity` | Sensor for AMS slot 1. |
| `ams_slot2_entity` | Sensor for AMS slot 2. |
| `ams_slot3_entity` | Sensor for AMS slot 3. |
| `ams_slot4_entity` | Sensor for AMS slot 4. |
| `camera_entity` | Camera entity for the printer. |
| `camera_entity_external` | Optional external camera entity. |
| `cover_image_entity` | Preview image entity for completed prints. |
| `pause_button_entity` | Button to pause the print. |
| `resume_button_entity` | Button to resume printing. |
| `stop_button_entity` | Button to stop the print. |
| `chamber_light_entity` | Toggle for the chamber light. |
| `online_entity` | Indicates if the printer is online. |
| `print_weight_entity` | Sensor with filament weight used. |
| `print_length_entity` | Sensor with filament length used. |
| `refresh_printer_button_entity` | Button to refresh printer state. |
| `refresh_spoolman_script` | Script that reloads Spoolman data. |
| `spoolman_url` | URL of your Spoolman instance. **Must be changed**. |
| `camera_refresh_rate` | Internal camera refresh interval in ms. |
| `external_camera_refresh_rate` | External camera refresh interval in ms. |

The defaults match the values from the sample configuration in `src/constants/config.js`. Override any of them in your YAML as required.

## License

See [LICENSE](LICENSE) for license information. Contributions are welcome—see [CONTRIBUTING.md](CONTRIBUTING.md) for details.
