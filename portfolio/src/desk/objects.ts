import type { PanelId } from '../router';

export type Placement = { x: number; y: number; width: number };
export type DeskObject = {
  id: PanelId;
  label: string;
  art: string;
  x: number;
  y: number;
  rotate: number;
  width: number;
  mobile?: Placement;
};

// x, y, width は机の幅に対する %。rotate は deg。
export const DESK_OBJECTS: readonly DeskObject[] = [
  { id: 'projects', label: '制作実績ノート', art: 'notebook.svg', x: 18, y: 22, rotate: -6, width: 26, mobile: { x: 8, y: 6, width: 52 } },
  { id: 'about', label: 'マグカップ（自己紹介）', art: 'mug.svg', x: 62, y: 14, rotate: 0, width: 12, mobile: { x: 68, y: 10, width: 26 } },
  { id: 'skills', label: '工具箱（スキル）', art: 'toolbox.svg', x: 70, y: 55, rotate: 4, width: 22, mobile: { x: 46, y: 46, width: 46 } },
  { id: 'stories', label: 'やらかし帳', art: 'sticky-notes.svg', x: 40, y: 62, rotate: -12, width: 16, mobile: { x: 12, y: 60, width: 34 } },
  { id: 'contact', label: 'スマホ（連絡先）', art: 'phone.svg', x: 12, y: 66, rotate: 9, width: 11, mobile: { x: 64, y: 72, width: 24 } },
  { id: 'bughunt', label: '虫眼鏡（バグ探し）', art: 'magnifier.svg', x: 47, y: 30, rotate: 22, width: 12, mobile: { x: 36, y: 28, width: 28 } },
];
