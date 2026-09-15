const test = require('node:test');
const assert = require('node:assert/strict');
const {HyprlandDisplayBackend, parseMonitors} = require('../app/platform/hyprland');

const physical = {name: 'HDMI-A-1', width: 3440, height: 1440};
const virtual = {name: 'VIRTUAL-1', width: 1920, height: 1080};

test('parses Hyprland monitor JSON', () => {
  assert.deepEqual(parseMonitors(JSON.stringify([physical])), [physical]);
});

test('reports a configured virtual output on Hyprland', async () => {
  const backend = new HyprlandDisplayBackend({
    run: async () => ({stdout: JSON.stringify([physical, virtual])}),
  });
  assert.deepEqual(await backend.getStatus(), {
    platform: 'hyprland',
    supported: true,
    configured: true,
    virtualConnector: 'VIRTUAL-1',
    physicalConnector: 'HDMI-A-1',
    monitors: ['HDMI-A-1', 'VIRTUAL-1'],
    enabled: true,
  });
});

test('creates and positions a headless output', async () => {
  let monitors = [physical];
  const commands = [];
  const backend = new HyprlandDisplayBackend({
    run: async (command, args) => {
      commands.push([command, args]);
      if (args[0] === 'monitors')
        return {stdout: JSON.stringify(monitors)};
      if (args[0] === 'output' && args[1] === 'create')
        monitors = [physical, virtual];
      return {stdout: ''};
    },
  });

  const status = await backend.setEnabled(true);
  assert.equal(status.enabled, true);
  assert.deepEqual(commands, [
    ['hyprctl', ['monitors', '-j']],
    ['hyprctl', ['output', 'create', 'headless', 'VIRTUAL-1']],
    ['hyprctl', ['keyword', 'monitor', 'VIRTUAL-1,1920x1080@60,3440x0,1']],
    ['hyprctl', ['monitors', '-j']],
  ]);
});
