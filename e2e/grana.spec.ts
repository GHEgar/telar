import { acentoRgb, datosRgb, type Rgb } from '../packages/grana/src/index.js';
import { expect, test } from './fixtures.js';

test('converts the data ramp and the accent like the browser paints the CSS', async ({ page }) => {
    await page.goto('/#abanico');
    const nombres = ['--grana-datos-1', '--grana-datos-2', '--grana-datos-3', '--grana-datos-4', '--grana-acento', '--grana-acento-fuerte', '--grana-acento-tinta'];
    const pintados = await page.evaluate((variables) => {
        const lienzo = document.createElement('canvas');
        lienzo.width = 1;
        lienzo.height = 1;
        const contexto = lienzo.getContext('2d', { willReadFrequently: true });
        const muestra = document.createElement('span');
        document.body.append(muestra);
        const colores = variables.map((nombre) => {
            muestra.style.color = `var(${nombre})`;
            const css = getComputedStyle(muestra).color;
            if (!contexto) return [0, 0, 0];
            contexto.clearRect(0, 0, 1, 1);
            contexto.fillStyle = css;
            contexto.fillRect(0, 0, 1, 1);
            return [...contexto.getImageData(0, 0, 1, 1).data.slice(0, 3)];
        });
        muestra.remove();
        return colores;
    }, nombres);
    const esperados: Rgb[] = [...datosRgb, acentoRgb.base, acentoRgb.fuerte, acentoRgb.tinta];
    pintados.forEach((color, indice) => {
        const esperado = esperados[indice] ?? [0, 0, 0];
        color.forEach((valor, canal) => expect(Math.abs(valor - (esperado[canal] ?? 0)), `${nombres[indice]} ${color.join(',')}`).toBeLessThanOrEqual(1));
    });
});
