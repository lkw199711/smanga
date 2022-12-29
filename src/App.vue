<template>
  <div class="main">
    <div class="view">
      <router-view/>
    </div>
  </div>

</template>

<script lang="ts">
import {defineComponent, ref} from 'vue'
import {globalData} from "@/store";

export default defineComponent({
  watch: {
    // globalData:{
    //   handler(newVal: number, oldVal: number) {
    //     console.log(newVal)
    //   },
    //   deep: true,
    //   immediate: true,
    // },
    // 'globalData.chapterIndex': {
    //   handler(newVal: number, oldVal: number) {
    //     console.log(newVal)
    //   },
    //   deep: false,
    //   immediate: true,
    // },
  },
  methods: {
    check_login() {
      const id = this.$cookies.isKey('userId');
      const name = this.$cookies.isKey('userName');
      if (!name || !id) {
        this.$router.push('/login');
      }
    }
  },
  created() {
    this.check_login();
  },
  mounted() {
    this.check_login();
  }
})
</script>

<style lang="less">
.main {
  background-color: #d9d9d9;
  min-height: 100vh;
}

.view {
  /*padding: 100px;*/
}
</style>
