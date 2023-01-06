<template>
  <div class="main">
    <div class="view">
      <router-view/>
    </div>
  </div>

</template>

<script lang="ts">
import {defineComponent} from 'vue'
import {Cookies, global_set_json} from "@/utils";
import {get_bookmark} from "@/api/bookmark";

export default defineComponent({
  watch: {},
  methods: {
    check_login() {
      const id = Cookies.get('userId');
      const name = Cookies.get('userName');
      if (!name || !id) {
        this.$router.push('/login');
      }
    }
  },
  async created() {
    // 检查登录状态
    this.check_login();
    // 获取书签列表
    const res = await get_bookmark();
    global_set_json('bookmarkList',res.data.list);
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
