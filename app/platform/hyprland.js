const {execFile} = require('node:child_process');
const {promisify} = require('node:util');

const execFileAsync = promisify(execFile);
const VIRTUAL_OUTPUT = 'VIRTUAL-1';
const runCommand = (command, args) => execFileAsync(command, args, {timeout: 10000});

function parseMonitors(output) {
  return JSON.parse(output);
}

class HyprlandDisplayBackend {
  constructor({run = runCommand, virtualOutput = VIRTUAL_OUTPUT} = {}) {
    this.run = run;
    this.virtualOutput = virtualOutput;
  }

  async getMonitors() {
    const {stdout} = await this.run('hyprctl', ['monitors', '-j']);
    const monitors = parseMonitors(stdout);
    if (!Array.isArray(monitors))
      throw new Error('Hyprland returned an invalid monitor list.');
    return monitors;
  }

  async getStatus() {
    try {
      const monitors = await this.getMonitors();
      const virtual = monitors.find(monitor => monitor.name === this.virtualOutput);
      const physical = monitors.filter(monitor => monitor.name !== this.virtualOutput);
      if (physical.length === 0)
        throw new Error('No physical monitor is available to position the virtual display.');
      if (physical.length > 1)
        throw new Error('Multiple active physical monitors are not supported yet; no layout was changed.');
      return {
        platform: 'hyprland',
        supported: true,
        configured: true,
        virtualConnector: virtual?.name ?? this.virtualOutput,
        physicalConnector: physical[0].name,
        monitors: monitors.map(monitor => monitor.name),
        enabled: Boolean(virtual),
      };
    } catch (error) {
      return {
        platform: 'hyprland',
        supported: true,
        configured: false,
        enabled: false,
        error: error.message,
      };
    }
  }

  async setEnabled(enabled) {
    const monitors = await this.getMonitors();
    const physical = monitors.filter(monitor => monitor.name !== this.virtualOutput);
    if (physical.length === 0)
      throw new Error('No physical monitor is available to position the virtual display.');
    if (physical.length > 1)
      throw new Error('Multiple active physical monitors are not supported yet; no layout was changed.');

    const primary = physical[0];
    const existing = monitors.some(monitor => monitor.name === this.virtualOutput);
    if (enabled && !existing) {
      await this.run('hyprctl', ['output', 'create', 'headless', this.virtualOutput]);
      await this.run('hyprctl', [
        'keyword', 'monitor',
        `${this.virtualOutput},1920x1080@60,${primary.width}x0,1`,
      ]);
    } else if (!enabled && existing) {
      await this.run('hyprctl', ['output', 'destroy', this.virtualOutput]);
    }

    const result = await this.getStatus();
    if (result.enabled !== enabled)
      throw new Error(`Hyprland did not ${enabled ? 'create' : 'destroy'} the virtual display.`);
    return result;
  }
}

module.exports = {HyprlandDisplayBackend, parseMonitors, VIRTUAL_OUTPUT};
