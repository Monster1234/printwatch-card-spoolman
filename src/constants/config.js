/**
 * Default configuration for the PrintWatch card
 */
export const DEFAULT_CONFIG = {
  printer_name: 'My 3D Printer',
  print_status_entity: 'sensor.p1s_01p00a382500072_print_status',
  current_stage_entity: 'sensor.p1s_01p00a382500072_current_stage',
  task_name_entity: 'sensor.p1s_01p00a382500072_task_name',
  progress_entity: 'sensor.p1s_01p00a382500072_print_progress',
  current_layer_entity: 'sensor.p1s_01p00a382500072_current_layer',
  total_layers_entity: 'sensor.p1s_01p00a382500072_total_layer_count',
  remaining_time_entity: 'sensor.p1s_01p00a382500072_remaining_time',
  bed_temp_entity: 'sensor.p1s_01p00a382500072_bed_temperature',
  nozzle_temp_entity: 'sensor.p1s_01p00a382500072_nozzle_temperature',
  bed_target_temp_entity: 'number.p1s_01p00a382500072_bed_target_temperature',
  nozzle_target_temp_entity: 'number.p1s_01p00a382500072_nozzle_target_temperature',
  speed_profile_entity: 'select.p1s_01p00a382500072_printing_speed',
  active_tray_index_entity: 'sensor.p1s_01p00a382500072_active_tray_index',
  ams_slot1_entity: 'sensor.p1s_01p00a382500072_ams_1_tray_1',
  ams_slot2_entity: 'sensor.p1s_01p00a382500072_ams_1_tray_2',
  ams_slot3_entity: 'sensor.p1s_01p00a382500072_ams_1_tray_3',
  ams_slot4_entity: 'sensor.p1s_01p00a382500072_ams_1_tray_4',
  camera_entity: 'image.p1s_camera',
  camera_entity_external: '',
  cover_image_entity: 'image.p1s_cover_image',
  pause_button_entity: 'button.p1s_01p00a382500072_pause_printing',
  resume_button_entity: 'button.p1s_01p00a382500072_resume_printing',
  stop_button_entity: 'button.p1s_01p00a382500072_stop_printing',
  chamber_light_entity: 'light.p1s_01p00a382500072_chamber_light',
  online_entity: 'binary_sensor.p1s_01p00a382500072_online',
  print_weight_entity: 'sensor.p1s_print_weight',
  print_length_entity: 'sensor.p1s_print_length',
  refresh_printer_button_entity: 'button.a1_force_refresh_data',
  refresh_spoolman_script: 'script.reload_spoolman',
  spoolman_url: 'http://192.168.129.70:7912/'
};

/**
 * Default camera update interval in milliseconds
 */
export const DEFAULT_CAMERA_REFRESH_RATE = 1000;
export const DEFAULT_EX_CAMERA_REFRESH_RATE = 300;