import { describe, expect, test, vi } from 'vitest';
import { DESK_OBJECTS } from '../../src/desk/objects';
import { mountDesk } from '../../src/desk/scene';

describe('desk', () => {
  test('renders one button per object with accessible label', () => {
    const root = document.createElement('div');
    mountDesk(root, DESK_OBJECTS, () => {});
    const buttons = root.querySelectorAll('button.desk-object');
    expect(buttons).toHaveLength(6);
    expect(buttons[0].getAttribute('aria-label')).toBe('制作実績ノート');
  });
  test('click calls onOpen with id and trigger', () => {
    const root = document.createElement('div');
    const onOpen = vi.fn();
    mountDesk(root, DESK_OBJECTS, onOpen);
    const btn = root.querySelector<HTMLElement>('[data-panel="skills"]')!;
    btn.click();
    expect(onOpen).toHaveBeenCalledWith('skills', btn);
  });
  test('every button is reachable by keyboard', () => {
    const root = document.createElement('div');
    mountDesk(root, DESK_OBJECTS, () => {});
    root.querySelectorAll<HTMLElement>('button.desk-object').forEach((b) => expect(b.tabIndex).toBe(0));
  });
  test('mobile position is provided for every object', () => {
    DESK_OBJECTS.forEach((o) => expect(o.mobile).toBeDefined());
  });
});
