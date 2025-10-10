import { toPng, toSvg } from 'html-to-image';

export const exportToPNG = async (elementId: string, filename: string = 'diagram.png') => {
  const element = document.querySelector(`.${elementId}`) as HTMLElement;
  if (!element) return;

  try {
    const dataUrl = await toPng(element, {
      cacheBust: true,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error exporting to PNG:', error);
  }
};

export const exportToSVG = async (elementId: string, filename: string = 'diagram.svg') => {
  const element = document.querySelector(`.${elementId}`) as HTMLElement;
  if (!element) return;

  try {
    const dataUrl = await toSvg(element, {
      cacheBust: true,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error exporting to SVG:', error);
  }
};

export const exportToJSON = (data: any, filename: string = 'diagram.json') => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
