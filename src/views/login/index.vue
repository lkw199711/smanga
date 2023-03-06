<template>
  <div class="login-index">
    <div class="seat"></div>
    <div class="login-box">
      <div class="logo">
        <img src="../../assets/smanga-logo.png" alt="logo">
      </div>
      <el-form class="login-form" ref="form" :model="form" label-width="80px">
        <el-form-item label="用户名:">
          <el-input v-model="form.userName" placeholder="请输入用户名"></el-input>
        </el-form-item>

        <el-form-item label="密码:">
          <el-input v-model="form.passWord" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>

      <p class="app-box">
        <a href="/file/smanga1.1.apk">下载Android应用</a>
      </p>


      <!--按钮盒子-->
      <div class="btn-box">
        <el-button class="login-btn" type="primary" @click="do_login">登录</el-button>
      </div>
    </div>
    <database class="database"/>
  </div>
</template>

<script lang='ts'>
import {defineComponent} from 'vue'
import {login} from "@/api/account";
import { Cookies } from "@/utils";
import database from './components/database.vue';
import {config} from "@/store";

export default defineComponent({
  name: 'index',
  // 数据
  data() {
    return {
      form: {
        userName: '',
        passWord: ''
      }
    }
  },

  // 传值
  props: [],

  // 计算
  computed: {},

  // 组件
  components: {database},

  // 方法
  methods: {
    async do_login() {
      const res = await login(this.form);
      if (res.data.code === 0) {
        // 缓存用户信息
        const userInfo = res.data.userInfo;
        Cookies.set('userName', userInfo.username);
        Cookies.set('userId', userInfo.userId);
        Cookies.set('editMedia', userInfo.editMedia);
        Cookies.set('editUser', userInfo.editUser);
        config.editMedia = userInfo.editMedia==='1';
        config.editUser = userInfo.editUser==='1';

        await this.$router.push('media-list');
      }
    }
  },

  // 生命周期
  created() {
    document.onkeypress = (e) => {
      const keycode = document.all ? e.keyCode : e.which;
      if (keycode === 13) {
        this.do_login();
        return false;
      }
    }
  },
})
</script>

<style scoped lang='less'>
.seat {
  height: 1px;
}

.login-box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #ffffff;
  box-shadow: #cccccc 2px 2px 8px;

  .logo {
    text-align: center;
  }

  .login-form {
    width: 80%;
    margin: 0 auto;
  }
}

.btn-box {
  display: flex;
  justify-content: flex-end;
  width: 80%;
  margin: 0 auto;

  .login-btn {
    width: 100%;
  }
}

.app-box{
  margin: 2rem 0 2rem 6rem;
}

@media only screen and (min-width: 1200px) {
  .login-box {
    margin: -20rem auto;
    width: 44rem;
    height: 32rem;

    .logo {
      margin: 1rem;
    }
  }
}

@media only screen and (max-width: 1199px) and (min-width: 768px) {
  .login-box {
    margin: -16rem auto;
    width: 40rem;
    height: 30rem;

    .logo {
      margin: 1rem;
    }
  }
}

@media only screen and (max-width: 767px) {
  .login-box {
    width: 34rem;
    height: 26rem;
    margin: -12rem auto;
  }
}
</style>
