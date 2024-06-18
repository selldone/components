
export const getShiftedTransform = (originalTransform, labelsWidth, labelsPadding, d3) => {
  const fullLabelWidth = labelsWidth + labelsPadding;

  const { x, y, k } = originalTransform;

  return d3.zoomIdentity
      .translate(-fullLabelWidth, 0) // Move origin for labels
      .translate(x, y) // Apply zoom panning
      .scale(k) // Apply zoom scaling
      .translate(labelsWidth + labelsPadding, 0); // Restore origin position
};



export default (d3, svg, config, xScale, draw) => {
  const {
    label: { width: labelsWidth, padding: labelsPadding },
    zoom: { onZoomStart, onZoom, onZoomEnd, minimumScale, maximumScale },
  } = config;

  const zoom = d3.zoom().scaleExtent([minimumScale, maximumScale]);

  zoom.on("zoom.start", onZoomStart).on("zoom.end", onZoomEnd);

  zoom.on("zoom", (event) => { // Use event argument instead of getEvent()
    const transform = getShiftedTransform(event.transform, labelsWidth, labelsPadding, d3);

    const newScale = transform.rescaleX(xScale);

    svg.call(draw(config, newScale));

    if (onZoom) {
      onZoom(event); // Pass the event object to the callback
    }
  });

  return zoom;
};
