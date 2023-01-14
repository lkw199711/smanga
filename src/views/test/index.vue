<template>
  <div class="index">
    <h1>test</h1>
    <el-button @click="do_test">测试</el-button>
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'
import {testAxios} from "@/api/test";

export default defineComponent({
  name: 'index',
  // 数据
  data() {
    return {
      abc: 'php ./chapter/compress.php "/mnt/hhd-2t/00manga/00zip/[アズ][魔术学姐][Vol.01-Vol.08][完结][bili]/Vol.01.cbz" "/www/wwwroot/smanga.mn2.cc/php/public" "14" "109" "2655" "zip"',
      abc1: 'php ./chapter/compress.php "/mnt/hhd-2t/00manga/00zip/[アズ][魔术学姐][Vol.01-Vol.08][完结][bili]/Vol.04.cbz" "/www/wwwroot/smanga.mn2.cc/php/public" "14" "109" "2658" "zip" "" ""',
    }
  },

  // 传值
  props: [],

  // 引用
  computed: {},

  // 组件
  components: {},

  // 方法
  methods: {
    do_test(){
      testAxios.post('http://192.168.2.8:91/php/test/mkdir.php').then(res=>{
        console.log(res);
      })
    },
  },

  // 生命周期
  created() {

  },
})
</script>

<style scoped lang='less'>

</style>
