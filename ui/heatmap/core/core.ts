/**
 * Interface representing the configuration for the heatmap.
 */
interface HeatmapConfigOptions {
  radius?: number;
  renderer?: string;
  gradient?: { [key: number]: string };
  maxOpacity?: number;
  minOpacity?: number;
  blur?: number;
  xField?: string;
  yField?: string;
  valueField?: string;
  plugins?: { [key: string]: any };

  drawingMode?: 'dot' | 'line' | 'line-vertical'; // Updated to include 'line-vertical'

}


/**
 * Default configuration for the heatmap.
 */
class HeatmapConfig {
  static defaultRadius: number = 40;
  static defaultRenderer: string = "canvas2d";
  static defaultGradient: { [key: number]: string } = {
    0.25: "rgb(0,0,255)",
    0.55: "rgb(0,255,0)",
    0.85: "yellow",
    1.0: "rgb(255,0,0)",
  };
  static defaultMaxOpacity: number = 1;
  static defaultMinOpacity: number = 0;
  static defaultBlur: number = 0.85;
  static defaultXField: string = "x";
  static defaultYField: string = "y";
  static defaultValueField: string = "value";
  static plugins: { [key: string]: any } = {};
}

/**
 * Utility class providing helper methods.
 */
class Util {
  /**
   * Merges multiple objects into one.
   * @param args - The objects to merge.
   * @returns A new object with merged properties.
   */
  static merge<T>(...args: Partial<T>[]): T {
    return Object.assign({}, ...args);
  }
}

/**
 * Coordinator class for managing event listeners and emitting events.
 */
class Coordinator {
  private cStore: { [key: string]: ((data: any) => void)[] } = {};

  /**
   * Adds a listener for the specified event.
   * @param evtName - The name of the event.
   * @param callback - The callback function.
   * @param scope - The scope in which to invoke the callback.
   */
  on(evtName: string, callback: (data: any) => void, scope?: any): void {
    if (!this.cStore[evtName]) {
      this.cStore[evtName] = [];
    }
    this.cStore[evtName].push((data: any) => callback.call(scope, data));
  }

  /**
   * Emits an event to all listeners.
   * @param evtName - The name of the event.
   * @param data - The data to pass to the event handlers.
   */
  emit(evtName: string, data: any): void {
    if (this.cStore[evtName]) {
      this.cStore[evtName].forEach((callback) => callback(data));
    }
  }
}

/**
 * Interface representing a single data point in the heatmap.
 */
interface DataPoint {
  x: number;
  y: number;
  value?: number;
  radius?: number;
}

/**
 * Interface representing the organized data entry with min and max values.
 */
interface OrganizedEntry extends DataPoint {
  min: number;
  max: number;
}

/**
 * Store class for managing heatmap data.
 */
class Store {
  private _coordinator: Coordinator;
  private _data: number[][] = [];
  private _radi: number[][] = [];
  private _min: number = 10;
  private _max: number = 1;
  private _xField: string;
  private _yField: string;
  private _valueField: string;
  private _cfgRadius: number;

  constructor(config: HeatmapConfigOptions) {
    this._coordinator = new Coordinator();
    this._xField = config.xField || HeatmapConfig.defaultXField;
    this._yField = config.yField || HeatmapConfig.defaultYField;
    this._valueField = config.valueField || HeatmapConfig.defaultValueField;
    this._cfgRadius = config.radius || HeatmapConfig.defaultRadius;
  }

  /**
   * Organizes the data point and updates min/max values.
   * @param dataPoint - The data point to organize.
   * @param forceRender - Whether to force rendering.
   * @returns The organized data entry.
   */
  private _organiseData(
      dataPoint: DataPoint,
      forceRender: boolean
  ): OrganizedEntry {
    const x = dataPoint.x;
    const y = dataPoint.y;
    const value = dataPoint.value !== undefined ? dataPoint.value : 1;
    const radius = dataPoint.radius || this._cfgRadius;

    // Initialize _data and _radi arrays at each point
    this._data[x] = this._data[x] || [];
    this._radi[x] = this._radi[x] || [];

    // Add or update the value in _data and _radi
    if (typeof this._data[x][y] === "undefined") {
      this._data[x][y] = value;
      this._radi[x][y] = radius;
    } else {
      this._data[x][y] += value;
    }

    // Update min and max values
    const storedVal = this._data[x][y];
    if (storedVal > this._max) {
      if (!forceRender) {
        this._max = storedVal;
      } else {
        this.setDataMax(storedVal);
      }
    } else if (storedVal < this._min) {
      if (!forceRender) {
        this._min = storedVal;
      } else {
        this.setDataMin(storedVal);
      }
    }

    return {
      x,
      y,
      value: this._data[x][y],
      radius: this._radi[x][y],
      min: this._min,
      max: this._max,
    };
  }

  /**
   * Adds data points to the store.
   * @param data - The data point(s) to add.
   * @returns The store instance.
   */
  addData(data: DataPoint | DataPoint[]): this {
    if (Array.isArray(data)) {
      data.forEach((dataPoint) => this.addData(dataPoint));
    } else {
      const organisedEntry = this._organiseData(data, true);
      if (organisedEntry) {
        if (this._data.length === 0) {
          this._min = this._max = organisedEntry.value!;
        }
        this._coordinator.emit("renderpartial", {
          min: this._min,
          max: this._max,
          data: [organisedEntry],
        });
      }
    }
    return this;
  }

  /**
   * Sets the data for the heatmap.
   * @param dataPoints - The array of data points.
   * @returns The store instance.
   */
  setData(dataPoints: DataPoint[]): this {
    // Clear existing data
    this._data = [];
    this._radi = [];

    // Organize each data point
    dataPoints.forEach((point) => this._organiseData(point, false));

    this._coordinator.emit("renderall", this._getInternalData());
    return this;
  }

  /**
   * Sets the maximum data value.
   * @param max - The maximum value.
   * @returns The store instance.
   */
  setDataMax(max: number): this {
    this._max = max;
    this._coordinator.emit("renderall", this._getInternalData());
    return this;
  }

  /**
   * Sets the minimum data value.
   * @param min - The minimum value.
   * @returns The store instance.
   */
  setDataMin(min: number): this {
    this._min = min;
    this._coordinator.emit("renderall", this._getInternalData());
    return this;
  }

  /**
   * Sets the coordinator instance.
   * @param coordinator - The coordinator to set.
   */
  setCoordinator(coordinator: Coordinator): void {
    this._coordinator = coordinator;
  }

  /**
   * Retrieves the internal data structure.
   * @returns The internal data with min and max values.
   */
  _getInternalData(): {
    max: number;
    min: number;
    data: DataPoint[];
  } {
    const organisedData: DataPoint[] = [];
    for (let x = 0; x < this._data.length; x++) {
      if (this._data[x]) {
        for (let y = 0; y < this._data[x].length; y++) {
          if (typeof this._data[x][y] !== "undefined") {
            organisedData.push({
              x,
              y,
              value: this._data[x][y],
              radius: this._radi[x][y],
            });
          }
        }
      }
    }
    return {
      max: this._max,
      min: this._min,
      data: organisedData,
    };
  }

  /**
   * Retrieves the stored data.
   * @returns The data with min and max values.
   */
  getData(): { min: number; max: number; data: DataPoint[] } {
    const unorganizedData: DataPoint[] = [];
    for (const x in this._data) {
      for (const y in this._data[x]) {
        if (typeof this._data[x][y] !== "undefined") {
          unorganizedData.push({
            x: parseInt(x),
            y: parseInt(y),
            value: this._data[x][y],
            radius: this._radi[x][y],
          });
        }
      }
    }
    return {
      min: this._min,
      max: this._max,
      data: unorganizedData,
    };
  }

  /**
   * Gets the value at a specific point.
   * @param point - The point to retrieve the value from.
   * @returns The value at the point or null if not found.
   */
  getValueAt(point: { x: number; y: number }): number | null {
    const { x, y } = point;
    if (this._data[x] && this._data[x][y]) {
      return this._data[x][y];
    }
    return null;
  }
}

/**
 * Renderer class for drawing the heatmap using Canvas 2D.
 */
class Canvas2dRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private shadowCanvas: HTMLCanvasElement;
  private shadowCtx: CanvasRenderingContext2D;
  private _palette: Uint8ClampedArray;
  private _config: HeatmapConfigOptions;

  constructor(canvas: HTMLCanvasElement, config: HeatmapConfigOptions) {
    if (!canvas) {
      throw new Error("Canvas is required for rendering");
    }
    this.canvas = canvas;

    // Set the canvas size to match its displayed size
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("2D context not supported in canvas");
    }
    this.ctx = context;

    this.shadowCanvas = document.createElement("canvas");
    this.shadowCanvas.width = this.canvas.width;
    this.shadowCanvas.height = this.canvas.height;

    const shadowContext = this.shadowCanvas.getContext("2d");
    if (!shadowContext) {
      throw new Error("2D context not supported in shadow canvas");
    }
    this.shadowCtx = shadowContext;

    this._config = config;
    this._palette = this._getColorPalette(config);
  }


  /**
   * Generates the color palette based on the gradient configuration.
   * @param config - The heatmap configuration.
   * @returns The color palette.
   */
  private _getColorPalette(config: HeatmapConfigOptions): Uint8ClampedArray {
    const gradientConfig = config.gradient || HeatmapConfig.defaultGradient;
    const paletteCanvas = document.createElement("canvas");
    paletteCanvas.width = 256;
    paletteCanvas.height = 1;
    const paletteCtx = paletteCanvas.getContext("2d");
    if (!paletteCtx) {
      throw new Error("2D context not supported in palette canvas");
    }
    const gradient = paletteCtx.createLinearGradient(0, 0, 256, 1);
    Object.keys(gradientConfig).forEach((key) => {
      gradient.addColorStop(
          parseFloat(key),
          gradientConfig[parseFloat(key)]
      );
    });
    paletteCtx.fillStyle = gradient;
    paletteCtx.fillRect(0, 0, 256, 1);
    return paletteCtx.getImageData(0, 0, 256, 1).data;
  }

  /**
   * Renders partial data updates.
   * @param data - The data to render.
   */
  renderPartial(data: { min: number; max: number; data: DataPoint[] }): void {
    if (data.data.length > 0) {
      this._drawAlpha(data);
      this._colorize();
    }
  }

  /**
   * Renders all data.
   * @param data - The data to render.
   */
  renderAll(data: { min: number; max: number; data: DataPoint[] }): void {
    this._clear();
    if (data.data.length > 0) {
      this._drawAlpha(data);
      this._colorize();
    }
  }

  /**
   * Clears the canvas.
   */
  private _clear(): void {
    this.shadowCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draws the alpha values on the shadow canvas.
   * @param data - The data to draw.
   */
  private _drawAlpha(data: { min: number; max: number; data: DataPoint[] }): void {
    data.data.forEach((point) => {
      const { x, y, value, radius } = point;

      if (isNaN(x) || isNaN(y) || isNaN(radius!)) {
        console.error("Invalid point data:", point);
        return;
      }

      const tpl = this._getPointTemplate(radius!);
      const alpha = (value! - data.min) / (data.max - data.min);
      this.shadowCtx.globalAlpha = alpha;

      // Optional: Debugging output
      // console.log('Draw', point, alpha);

      if (this._config.drawingMode === 'line') {
        this.shadowCtx.drawImage(tpl, x - radius!, 0);
      } if (this._config.drawingMode === 'line-vertical') {
        this.shadowCtx.drawImage(tpl, 0, y - radius!);
      }


      else{
        this.shadowCtx.drawImage(tpl, x - radius!, y - radius!);
      }


    });
  }

  /**
   * Applies the color palette to the shadow canvas and renders on the main canvas.
   */
  private _colorize(): void {
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Optional: Debugging output
    // console.log('width', width, 'height', height);

    const img = this.shadowCtx.getImageData(0, 0, width, height);
    const imgData = img.data;
    for (let i = 3; i < imgData.length; i += 4) {
      const alpha = imgData[i];
      const offset = alpha * 4;
      if (alpha > 0) {
        imgData[i - 3] = this._palette[offset];
        imgData[i - 2] = this._palette[offset + 1];
        imgData[i - 1] = this._palette[offset + 2];
      }
    }
    this.ctx.putImageData(img, 0, 0);
  }

  /**
   * Creates a point template for rendering.
   * @param radius - The radius of the point.
   * @returns The canvas element representing the point.
   */
  private _getPointTemplate(radius: number): HTMLCanvasElement {
    const tplCanvas = document.createElement("canvas");
    tplCanvas.width = radius * 2;
    tplCanvas.height = radius * 2;
    const tplCtx = tplCanvas.getContext("2d");
    if (!tplCtx) {
      throw new Error("2D context not supported in point template canvas");
    }

    if (this._config.drawingMode === 'line') {
      tplCanvas.height = this.canvas.height;

      // Create a horizontal linear gradient
      const gradient = tplCtx.createLinearGradient(0, radius, tplCanvas.width, radius);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(0.5, "rgba(0,0,0,1)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      tplCtx.fillStyle = gradient;
      tplCtx.fillRect(0, 0, tplCanvas.width, tplCanvas.height);
    } else if (this._config.drawingMode === 'line-vertical') {

      // Full page width!
      tplCanvas.width = this.canvas.width;

      // Create a vertical linear gradient
      const gradient = tplCtx.createLinearGradient(radius, 0, radius, tplCanvas.height);
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(0.5, "rgba(0,0,0,1)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      tplCtx.fillStyle = gradient;
      tplCtx.fillRect(0, 0, tplCanvas.width, tplCanvas.height);
    } else {
      // Default behavior: create a radial gradient (dot)
      const gradient = tplCtx.createRadialGradient(
          radius,
          radius,
          radius * 0.1,
          radius,
          radius,
          radius
      );
      gradient.addColorStop(0, "rgba(0,0,0,1)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      tplCtx.fillStyle = gradient;
      tplCtx.fillRect(0, 0, tplCanvas.width, tplCanvas.height);
    }
    return tplCanvas;
  }


  /**
   * Retrieves the data URL of the canvas.
   * @returns The data URL string.
   */
  getDataURL(): string {
    return this.canvas.toDataURL();
  }

  /**
   * Sets styles based on configuration.
   * @param config - The heatmap configuration.
   */
  _setStyles(config: HeatmapConfigOptions): void {
    // Implement style setting based on configuration if needed
    this._config = config;
    this._palette = this._getColorPalette(config);
  }
}

/**
 * Main Heatmap class for creating and managing heatmaps.
 */
export class Heatmap {
  private _canvas: HTMLCanvasElement;
  private _config: HeatmapConfigOptions;
  private _coordinator: Coordinator;
  private _store: Store;
  private _renderer: Canvas2dRenderer;

  constructor(canvas: HTMLCanvasElement, config: HeatmapConfigOptions) {
    this._canvas = canvas;
    this._config = Util.merge(HeatmapConfig, config);
    this._coordinator = new Coordinator();
    this._store = new Store(this._config);
    this._renderer = new Canvas2dRenderer(canvas, this._config);
    this._connect();
  }

  /**
   * Connects the store and renderer through the coordinator.
   */
  private _connect(): void {
    this._coordinator.on(
        "renderpartial",
        this._renderer.renderPartial,
        this._renderer
    );
    this._coordinator.on(
        "renderall",
        this._renderer.renderAll,
        this._renderer
    );
    this._store.setCoordinator(this._coordinator);
  }

  /**
   * Adds data to the heatmap.
   * @param data - The data point(s) to add.
   * @returns The Heatmap instance.
   */
  addData(data: DataPoint | DataPoint[]): this {
    this._store.addData(data);
    return this;
  }

  /**
   * Sets the maximum data value.
   * @param max - The maximum value.
   * @returns The Heatmap instance.
   */
  setDataMax(max: number): this {
    this._store.setDataMax(max);
    return this;
  }

  /**
   * Sets the minimum data value.
   * @param min - The minimum value.
   * @returns The Heatmap instance.
   */
  setDataMin(min: number): this {
    this._store.setDataMin(min);
    return this;
  }

  /**
   * Sets the data for the heatmap.
   * @param data - The array of data points.
   * @returns The Heatmap instance.
   */
  setData(data: DataPoint[]): this {
    this._store.setData(data);
    return this;
  }

  /**
   * Gets the value at a specific point.
   * @param point - The point to retrieve the value from.
   * @returns The value at the point or null if not found.
   */
  getValueAt(point: { x: number; y: number }): number | null {
    return this._store.getValueAt(point);
  }

  /**
   * Retrieves the stored data.
   * @returns The data with min and max values.
   */
  getData(): { min: number; max: number; data: DataPoint[] } {
    return this._store.getData();
  }

  /**
   * Retrieves the data URL of the canvas.
   * @returns The data URL string.
   */
  getDataURL(): string {
    return this._renderer.getDataURL();
  }

  /**
   * Configures the heatmap with new settings.
   * @param config - The new configuration.
   * @returns The Heatmap instance.
   */
  configure(config: HeatmapConfigOptions): this {
    this._config = Util.merge(this._config, config);
    this._renderer._setStyles(this._config);
    this._coordinator.emit("renderall", this._store._getInternalData());
    return this;
  }

  /**
   * Repaints the heatmap.
   * @returns The Heatmap instance.
   */
  repaint(): this {
    this._coordinator.emit("renderall", this._store._getInternalData());
    return this;
  }
}

/**
 * Factory for creating heatmap instances.
 */
export const heatmapFactory = {
  /**
   * Creates a new heatmap instance.
   * @param canvas - The canvas element to render the heatmap on.
   * @param config - The heatmap configuration.
   * @returns The Heatmap instance.
   */
  create(canvas: HTMLCanvasElement, config: HeatmapConfigOptions): Heatmap {
    return new Heatmap(canvas, config);
  },
};
