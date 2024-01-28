import utils, { defaultOptions } from "./utils";
import STelInput from "./components/s-tel-input.vue";

export { STelInput };

export default {
  install(app, customOptions = {}) {
    const {
      dropdownOptions: customDropdownOptions,
      inputOptions: customInputOptions,
      ...otherCustomOptions
    } = customOptions;
    const {
      dropdownOptions: defaultDropdownOptions,
      inputOptions: defaultInputOptions,
      ...otherDefaultOptions
    } = defaultOptions;

    utils.options = {
      inputOptions: {
        ...defaultInputOptions,
        ...customInputOptions,
      },
      dropdownOptions: {
        ...defaultDropdownOptions,
        ...customDropdownOptions,
      },
      ...otherDefaultOptions,
      ...otherCustomOptions,
    };

    app.component("s-tel-input", STelInput);
  },
};
