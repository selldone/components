export const tickFormat = (date, formats, d3) => {
  if (d3.timeSecond(date) < date) {
    return dateFormatterMinute.format(date);

    // return d3.timeFormat(formats.milliseconds)(date);
  }

  if (d3.timeMinute(date) < date) {
    return dateFormatterMinute.format(date);

    //return d3.timeFormat(formats.seconds)(date);
  }

  if (d3.timeHour(date) < date) {
    return dateFormatterHour.format(date);

    //return d3.timeFormat(formats.minutes)(date);
  }

  if (d3.timeDay(date) < date) {
    return dateFormatterDay.format(date);
    // return d3.timeFormat(formats.hours)(date);
  }

  if (d3.timeMonth(date) < date) {
    if (d3.timeWeek(date) < date) {
      return dateFormatterDays.format(date);
      // return d3.timeFormat(formats.days)(date);
    }
    return dateFormatterWeeks.format(date);
    //   return d3.timeFormat(formats.weeks)(date);
  }

  if (d3.timeYear(date) < date) {
    return dateFormatterMonth.format(date);
    // return d3.timeFormat(formats.months)(date);
  }

  return dateFormatterYear.format(date);
  // return d3.timeFormat(formats.year)(date);
};

const dateFormatterMinute = new Intl.DateTimeFormat(
  window.$language?.full_locale,
  {
    second: "2-digit",
  },
);

const dateFormatterHour = new Intl.DateTimeFormat(
  window.$language?.full_locale,
  {
    hour: "2-digit",
    minute: "2-digit",
  },
);

const dateFormatterDay = new Intl.DateTimeFormat(
  window.$language?.full_locale,
  {
    hour: "2-digit",
    hour12: true,
  },
);

const dateFormatterDays = new Intl.DateTimeFormat(
  window.$language?.full_locale,
  {
    month: "narrow",
    day: "2-digit",
  },
);
const dateFormatterWeeks = new Intl.DateTimeFormat(
  window.$language?.full_locale,
  {
    month: "short",
    day: "2-digit",
  },
);

const dateFormatterMonth = new Intl.DateTimeFormat(
  window.$language?.full_locale,
  {
    year: "numeric",
    month: "short",
  },
);
const dateFormatterYear = new Intl.DateTimeFormat(
  window.$language?.full_locale,
  {
    year: "numeric",
  },
);

export default (d3, config, xScale, breakpointLabel) => {
  const {
    label: { width: labelWidth },
    axis: { formats, verticalGrid, tickPadding },
    locale,
    numberDisplayedTicks,
    line: { height: lineHeight },
  } = config;
  d3.timeFormatDefaultLocale(locale);
  return (selection) => {
    const axis = selection.selectAll(".axis").data((d) => d);

    axis.exit().remove();

    const axisTop = d3
      .axisTop(xScale)
      .tickFormat((d) => tickFormat(d, formats, d3))
      .ticks(numberDisplayedTicks[breakpointLabel])
      .tickPadding(tickPadding);

    if (verticalGrid)
      axisTop.tickSizeInner(-(selection.data()[0].length * lineHeight));

    axis
      .enter()
      .filter((_, i) => !i)
      .append("g")
      .classed("axis", true)
      .attr("transform", `translate(${labelWidth},0)`)
      .call(axisTop);

    axis.call(axisTop);
  };
};
