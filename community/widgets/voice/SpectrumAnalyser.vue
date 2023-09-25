<template>
  <canvas :width="width" :height="height"
          v-if="points" v-render="points"></canvas>
</template>

<script>
export default {
  name: 'spectrum-analyser',
  props: {
    width: {
      type: Number,
      default: 512,
    },
    height: {
      type: Number,
      default: 128,
    },
    fillStyle: {
      type: String,
      default: '#000',
    },
    play:{
type:Boolean,
      default:false
    }
  },
  data() {
    return {
      spectrum: null,


      context:null,
      analyser:null,
      dataArray:null,

    };
  },
  computed: {
    points() {
      if (!this.spectrum) {
        return null;
      }

      const points = [];

      const dataLength = this.spectrum.length || Object.keys(this.spectrum).length;
      const sliceWidth = (this.width * 1.0) / dataLength;

      let x = 0;
      for (let i = 0; i < dataLength; i += 1) {
        const v = this.spectrum[i] / 255.0;
        const y = v * this.height;
        points.push([x, y]);
        x += sliceWidth;
      }

      return points;
    },
  },

  watch:{
    play(){
      this.updateData();
    }
  },
  directives: {
    render: {
      update(canvasElement, binding, vnode) {
        const context = canvasElement.getContext('2d');

        const width = canvasElement.width;
        const height = canvasElement.height;

        const points = binding.value;

        context.fillStyle = vnode.context.fillStyle;

        context.clearRect(0, 0, width, height);
        context.beginPath();

        context.moveTo(points[0][0], (height / 2) + (points[0][1] / 2));

        for (let i = 1; i < points.length; i += 1) {
          context.lineTo(points[i][0], (height / 2) + (points[i][1] / 2));
        }

        for (let i = points.length - 1; i >= 0; i -= 1) {
          context.lineTo(points[i][0], (height / 2) - (points[i][1] / 2));
        }

        context.fill();
      },
    },
  },
  // eslint-disable-next-line consistent-return
  async mounted() {
    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      this.$emit('error', '`navigator.mediaDevices.getUserMedia()` failed.');
      return Promise.resolve();
    }

    this. context = new AudioContext();

    this. analyser = this.context.createAnalyser();
    this. dataArray = new Uint8Array( this.analyser.frequencyBinCount);

    const source = this.context.createMediaStreamSource(stream);
    source.connect( this.analyser);



    this.updateData();
  },

  methods:{
    updateData(){

        this.analyser.getByteFrequencyData( this.dataArray);
        this.spectrum =  this.dataArray.slice();

        if(this.play)
          requestAnimationFrame(this.updateData);

    }
  },

  beforeDestroy() {
    if(this. context)
    this. context.close()
  }

};
</script>

