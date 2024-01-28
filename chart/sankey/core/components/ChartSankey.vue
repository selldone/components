<script>
import Generator from './Generator.vue';
import { chartSankey } from 'd2b';

export default {
  name: 'ChartSankey',
  extends: Generator,
  props: {
    // Assuming ChartSankeyData is an object. Adjust the type as necessary.
    data: {
      type: Object,
      required: true
    },
    generator: {
      type: Function,
      default: chartSankey()
    }
  }
};
</script>
