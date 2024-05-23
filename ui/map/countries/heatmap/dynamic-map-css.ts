/*
 * Copyright (c) 2023. Selldone® Business OS™
 *
 * Author: M.Pajuhaan
 * Web: https://selldone.com
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * All rights reserved. In the weave of time, where traditions and innovations intermingle, this content was crafted.
 * From the essence of thought, through the corridors of creativity, each word, and sentiment has been molded.
 * Not just to exist, but to inspire. Like an artist's stroke or a sculptor's chisel, every nuance is deliberate.
 * Our journey is not just about reaching a destination, but about creating a masterpiece.
 * Tread carefully, for you're treading on dreams.
 */

// We multiply this unit by the (value of a country - min) to get the
// decimal value to provide to the Chroma scale instance.
import type {Scale} from "chroma-js";

const getColorScaleUnit = (min: number, max: number) => 1 / (max - min);

const getMaxAndMinCountryDataValues = (countryData: {
  [key: string]: number;
}) => {
  let min: number,
    max: number = 0;

  Object.keys(countryData).forEach((key) => {
    if (key === "unknown") return;

    const value = countryData[key];

    if (value < min || min === undefined) min = value;
    if (value > max || max === undefined) max = value;
    //if (max > min * 10) max = min * 10; // Prevent over values to hideout other countries.
    if (max < 100) max = 100;
  });

  return { min: 0, max: max ? Math.log(max) : 1 };
};

export const getBaseCss = (
  map_id: string,
  { defaultCountryFillColor, countryStrokeColor }: { [key: string]: string },
) =>
  `.map_svg_${map_id} .land{fill:${defaultCountryFillColor};stroke:${countryStrokeColor};}`;

export const getDynamicMapCss = (
  map_id: string,
  countryData: { [key: string]: number },
  chromaScale: Scale,
) => {
  const { min, max } = getMaxAndMinCountryDataValues(countryData);
  const colorScaleUnit = getColorScaleUnit(min, max);
  const css: string[] = [];

  Object.keys(countryData).forEach((key) => {
    if (key === "unknown") return;

    const value = Math.log(countryData[key]);
    const scaleValue = colorScaleUnit * (value - min);
    const hex = chromaScale(scaleValue).hex();

    css.push(`.map_svg_${map_id} #${key} { fill: ${hex}; }`);
  });

  return css;
};

export const getCombinedCssString = (baseCss: string, dynamicCss: [string]) => {
  dynamicCss.push(baseCss);

  return dynamicCss.join(" ");
};
