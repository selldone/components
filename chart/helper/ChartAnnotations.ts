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

import { DateConverter } from "../../../../core/helper/date/DateConverter";
import { TimeSeries } from "../../../../core/timeserie/TimeSeries";

export class ChartAnnotations {
  static CreateMaxPoints(
    timeSeries: TimeSeries,
    keys: string[],
    labelsData: string[],
    colors: string[]
  ) {
    const maxPoints = [];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const maxItem = timeSeries.maxItemByKey(key, true);

      if (maxItem && maxItem[key]) {
        const _date = DateConverter.convertToLocalTime(
          maxItem.created_at,
          true
        );

        // Prevent show zero!
        if (_date)
          maxPoints.push({
            x: _date.getTime(),
            y: maxItem[key],
            marker: {
              size: 4,
              fillColor: "#fff",
              strokeColor: colors[i],
              radius: 2,
            },
            label: {
              borderColor: colors[i],
              offsetY: 0,
              align: "center",
              style: {
                color: "#fff",
                background: colors[i],
              },

              text: `${labelsData[i]}: ${maxItem[key]}`,
            },
          });
      }
    }

    return maxPoints;
  }
}
