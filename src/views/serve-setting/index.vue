<template>
  <div class="serve-setting-container">
    <h1 class="page-title">服务器设置</h1>

    <!-- 扫描设置卡片 -->
    <el-card class="setting-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">扫描设置</span>
        </div>
      </template>

      <el-form :model="form" label-width="160px" size="default">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="扫描引擎">
              <el-select v-model="form.scan.engine" :style="{ width: '300px' }">
                <el-option label="模板扫描 v2（混合目录）" value="template-v2" />
                <el-option label="模板扫描 v1（单模板）" value="template-v1" />
                <el-option label="旧扫描器（紧急回退）" value="legacy" />
              </el-select>
              <el-button type="primary" @click="confirm_scan_engine" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="扫描周期">
              <el-input v-model="form.scan.interval" placeholder="输入cron表达式" :style="{ width: '300px' }"></el-input>
              <span class="suffix ml-2 text-gray-500">cron表达式</span>
              <el-button type="primary" @click="comfirm_interval" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="媒体库封面生成周期">
              <el-input v-model="form.scan.mediaPosterInterval" placeholder="输入cron表达式"
                :style="{ width: '300px' }"></el-input>
              <span class="suffix ml-2 text-gray-500">cron表达式</span>
              <el-button type="primary" @click="comfirm_poster_interval" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="同步周期">
              <el-input v-model="form.sync.interval" placeholder="输入cron表达式" :style="{ width: '300px' }"></el-input>
              <span class="suffix ml-2 text-gray-500">cron表达式</span>
              <el-button type="primary" @click="comfirm_sync_interval" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="更新漫画与章节封面">
              <el-switch v-model="form.scan.reloadCover" :active-value="1" :inactive-value="0" />
              <el-button type="primary" @click="comfirm_update_cover" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="忽略隐藏文件夹和文件">
              <el-switch v-model="form.scan.ignoreHiddenFiles" :active-value="1" :inactive-value="0" />
              <el-button type="primary" @click="comfirm_scan_ignore_hidden" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="生成媒体库封面">
              <el-switch v-model="form.scan.createMediaPoster" :active-value="1" :inactive-value="0" />
              <el-button type="primary" @click="comfirm_create_poster" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="form-note mt-4 text-gray-500 text-sm">
        <p>• 模板扫描 v2 支持混合目录；出现兼容问题时可立即切换到 v1 或旧扫描器，后续扫描任务即时生效。</p>
        <p>• 扫描周期为cron表达式,默认为一天两次</p>
        <p>• cron表达式格式:秒 分 时 日 月 周,为六位表达式,位数错误将不能启动定时任务.</p>
        <p>• 再次扫描媒体库时,是否对已有封面的漫画再次加载封面.开启会增加扫描时间.</p>
        <p>• 不建议纯压缩包库开启更新封面功能.</p>
        <p>• 忽略隐藏文件夹和文件,开启后扫描时会忽略以.开头的文件夹和文件.对于群辉,威联通成品nas机器有用,可规避其系统自动生成的隐藏目录.</p>
        <p>• 生成媒体库封面,开启后扫描时会生成媒体库的封面图片,用于在漫画列表中显示.如果您希望自定义封面,请关闭此选项.</p>
      </div>
    </el-card>

    <!-- SSL证书设置卡片 -->
    <el-card class="setting-card mt-6" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">SSL证书设置</span>
        </div>
      </template>

      <el-form :model="form" label-width="160px" size="default">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="PEM文件路径">
              <el-input v-model="form.ssl.pem" placeholder="输入PEM文件路径" :style="{ width: '500px' }"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="KEY文件路径">
              <el-input v-model="form.ssl.key" placeholder="输入KEY文件路径" :style="{ width: '500px' }"></el-input>
            </el-form-item>
          </el-col>

          <el-col :span="24" class="flex justify-start mt-4">
            <el-button type="primary" @click="comfirm_ssl" class="mr-3">保存证书设置</el-button>
            <el-button type="danger" @click="reset_ssl">重置证书设置</el-button>
          </el-col>
        </el-row>
      </el-form>

      <div class="form-note mt-4 text-gray-500 text-sm">
        <p>• SSL证书在默认模式下,以HTTP的方式监听443端口,使用http://smanga_domain:443可以访问.</p>
        <p>• 你可以使用宿主机的nginx配置反向代理进行设置.</p>
        <p>• 如果你在宿主机没有nginx或者不希望通过反代的方式进行配置,可以在此处填写证书使用的文件,smanga会将这些文件写入到nginx配置之中.</p>
      </div>
    </el-card>

    <!-- 压缩设置卡片 -->
    <el-card class="setting-card mt-6" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">压缩与存储设置</span>
        </div>
      </template>

      <el-form :model="form" label-width="160px" size="default">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="封面压缩大小">
              <el-input v-model="form.compress.poster" placeholder="输入压缩大小" type="number"
                :style="{ width: '150px' }"></el-input>
              <span class="suffix ml-2 text-gray-500">KB</span>
              <el-button type="primary" @click="confirm_poster_size" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="压缩文件保存时长">
              <el-input v-model="form.compress.saveDuration" placeholder="输入保存天数" type="number"
                :style="{ width: '150px' }"></el-input>
              <span class="suffix ml-2 text-gray-500">天</span>
              <el-button type="primary" @click="confirm_compress_duration" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="同步加载压缩包">
              <el-switch v-model="form.compress.sync" :active-value="1" :inactive-value="0" />
              <el-button type="primary" @click="comfirm_sync_compress" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="解压缓存自动清理">
              <el-radio-group v-model="form.compress.autoClear">
                <el-radio :label="0">不自动清理</el-radio>
                <el-radio :label="1">每次解压时执行清理</el-radio>
                <el-radio :label="2">通过cron定时清理</el-radio>
              </el-radio-group>
              <el-button type="primary" @click="comfirm_auto_clear" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24" v-if="form.compress.autoClear !== 0">
            <el-form-item label="解压缓存数量限制">
              <el-input v-model="form.compress.limit" placeholder="输入缓存数量限制" type="number" min="1"
                :style="{ width: '150px' }"></el-input>
              <span class="suffix ml-2 text-gray-500">个</span>
              <el-button type="primary" @click="confirm_cache_limit" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24" v-if="form.compress.autoClear === 2">
            <el-form-item label="cron定时表达式">
              <el-input v-model="form.compress.clearCron" placeholder="输入cron表达式"
                :style="{ width: '300px' }"></el-input>
              <span class="suffix ml-2 text-gray-500">cron表达式</span>
              <el-button type="primary" @click="confirm_clear_cron" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

        </el-row>
      </el-form>

      <div class="form-note mt-4 text-gray-500 text-sm">
        <p>• 封面压缩大小单位为KB,设置过小将影响封面质量.</p>
        <p>• 文件保存周期单位为天,填写0不删除文件.</p>
        <p>• 开启同步加载压缩包后,浏览章节时会在单词请求等待压缩包解压完成.适合比较小的章节</p>
        <p>• 解压缓存自动清理:设置解压缓存的自动清理策略.</p>
        <p>• 选择"每次解压时执行清理"会在每次解压漫画时清理之前的缓存.</p>
        <p>• 选择"通过cron定时清理"会按照设置的cron表达式定期执行清理.</p>
        <p>• 解压缓存数量限制:设置最大缓存数量,当超过限制时会清理最旧的缓存.</p>
      </div>
    </el-card>

    <!-- 队列设置卡片 -->
    <el-card class="setting-card mt-6" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">队列设置</span>
          <span class="text-sm text-gray-500 ml-2">(修改并发数需重启服务生效)</span>
        </div>
      </template>

      <el-form :model="form" label-width="200px" size="default">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="Worker 模式">
              <el-select v-model="form.queue.worker.mode" placeholder="选择模式" :style="{ width: '200px' }">
                <el-option label="Embedded (内嵌)" value="embedded" />
                <el-option label="External (独立进程)" value="external" />
                <el-option label="Disabled (禁用)" value="disabled" />
              </el-select>
              <el-button type="primary" @click="confirm_queue_mode" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="Background 并发数">
              <el-slider v-model="form.queue.workers.background.concurrency" :min="1" :max="10" show-input
                :style="{ width: '380px' }" />
              <span class="suffix ml-2 text-gray-500">扫描/同步/P2P 等</span>
              <el-button type="primary" @click="confirm_queue_bg_concurrency" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="Compress 并发数">
              <el-slider v-model="form.queue.workers.compress.concurrency" :min="1" :max="10" show-input
                :style="{ width: '380px' }" />
              <span class="suffix ml-2 text-gray-500">压缩与封面处理</span>
              <el-button type="primary" @click="confirm_queue_cp_concurrency" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="重试次数">
              <el-input v-model="form.queue.attempts" type="number" min="1" max="10"
                :style="{ width: '150px' }"></el-input>
              <span class="suffix ml-2 text-gray-500">次</span>
              <el-button type="primary" @click="confirm_queue_attempts" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="任务超时">
              <el-input v-model="form.queue.timeout" type="number" min="10000" step="10000"
                :style="{ width: '200px' }"></el-input>
              <span class="suffix ml-2 text-gray-500">毫秒 (ms)</span>
              <el-button type="primary" @click="confirm_queue_timeout" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="轮询间隔">
              <el-input v-model="form.queue.pollIntervalMs" type="number" min="100" step="100"
                :style="{ width: '200px' }"></el-input>
              <span class="suffix ml-2 text-gray-500">毫秒 (ms)</span>
              <el-button type="primary" @click="confirm_queue_poll" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div class="form-note mt-4 text-gray-500 text-sm">
        <p>• <b>Embedded</b>: 队列 Worker 内嵌在主进程中运行(默认)。</p>
        <p>• <b>External</b>: 队列 Worker 作为独立进程运行,主进程仅提供 HTTP 服务。</p>
        <p>• <b>Disabled</b>: 禁用队列 Worker,任务不会被执行。</p>
        <p>• 并发数与模式修改后<b>需要重启服务</b>才能生效。</p>
        <p>• 重试次数、超时、轮询间隔修改后实时生效,无需重启。</p>
      </div>
    </el-card>

    <!-- P2P 设置卡片 -->
    <el-card class="setting-card mt-6" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">P2P 设置</span>
          <span class="text-sm text-gray-500 ml-2">(分布式漫画同步与多源下载)</span>
        </div>
      </template>

      <el-form :model="form" label-width="180px" size="default">
        <el-row :gutter="20">
          <!-- 总开关 -->
          <el-col :span="24">
            <el-form-item label="启用 P2P">
              <el-switch v-model="form.p2p.enable" />
              <el-button type="primary" @click="comfirm_p2p_enable" class="ml-4">确定</el-button>
            </el-form-item>
          </el-col>

          <!-- ==================== Node 角色 ==================== -->
          <el-col :span="24">
            <el-form-item label="作为节点(Node)">
              <el-switch v-model="form.p2p.role.node" />
              <el-button type="primary" @click="comfirm_p2p_role_node" class="ml-4">确定</el-button>
              <span class="suffix ml-2 text-gray-500">作为下载节点向 Tracker 注册并参与拉取/做种</span>
            </el-form-item>
          </el-col>

          <!-- Node 配置项 -->
          <template v-if="form.p2p.role.node">
            <el-col :span="24">
              <el-form-item label="节点名称">
                <el-input v-model="form.p2p.node.nodeName" placeholder="自定义节点显示名" :style="{ width: '300px' }" />
                <el-button type="primary" @click="comfirm_p2p_node_name" class="ml-4">确定</el-button>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="本机公网地址">
                <el-input v-model="form.p2p.node.publicUrl"
                  placeholder="示例 smanga.com:9797/api"
                  :style="{ width: '500px' }" />
                <el-button type="primary" @click="comfirm_p2p_public_url" class="ml-4">确定</el-button>
                <span class="suffix ml-2 text-gray-500">smanga访问地址+/api</span>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="心跳间隔">
                <el-input v-model="form.p2p.node.heartbeatInterval" type="number" min="10"
                  :style="{ width: '180px' }" />
                <span class="suffix ml-2 text-gray-500">秒(最小 10)</span>
                <el-button type="primary" @click="comfirm_p2p_heartbeat" class="ml-4">确定</el-button>
              </el-form-item>
            </el-col>

            <!-- Tracker 列表 -->
            <el-col :span="24">
              <el-form-item label="Tracker 服务器">
                <div class="tracker-list">
                  <div v-for="(_, idx) in p2pTrackerInputs" :key="idx" class="tracker-row">
                    <el-input v-model="p2pTrackerInputs[idx]"
                      placeholder="http://tracker.example.com:9797/api"
                      :style="{ width: '500px' }" />
                    <el-button type="danger" link @click="remove_tracker_input(idx)" class="ml-2">移除</el-button>
                  </div>
                  <div class="tracker-actions mt-2">
                    <el-button @click="add_tracker_input">+ 添加 Tracker</el-button>
                    <el-button type="primary" @click="comfirm_p2p_trackers" class="ml-2">保存 Tracker 列表</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-col>

            <!-- 手动注册节点 -->
            <el-col :span="24">
              <el-form-item label="手动注册节点">
                <el-button type="primary" :loading="registerLoading" @click="click_register_node">
                  {{ registerLoading ? '注册中...' : '立即注册' }}
                </el-button>
                <span class="suffix ml-2 text-gray-500">向所有 Tracker 并行注册并触发反向可达性检测</span>
              </el-form-item>
            </el-col>

            <!-- 注册结果：每个 tracker 一行 -->
            <el-col :span="24" v-if="registerResult">
              <el-form-item label="注册结果">
                <div class="register-summary mb-3">
                  <el-tag :type="registerResult.anySuccess ? 'success' : 'danger'" size="default">
                    {{ registerResult.anySuccess ? '注册完成' : '全部失败' }}
                  </el-tag>
                  <span class="ml-2 text-sm text-gray-500" v-if="registerResult.reused">(复用已有身份，仅更新信息)</span>
                </div>
                <el-table :data="registerResult.results" size="small" border stripe style="width: 100%; max-width: 700px;">
                  <el-table-column prop="trackerUrl" label="Tracker 地址" min-width="200" />
                  <el-table-column label="状态" width="80" align="center">
                    <template #default="{ row }">
                      <el-tag :type="row.success ? 'success' : 'danger'" size="small">
                        {{ row.success ? '成功' : '失败' }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="详情" min-width="180">
                    <template #default="{ row }">
                      <span v-if="row.success" class="text-green-600">{{ row.publicUrl || '-' }}</span>
                      <span v-else class="text-red-500">{{ row.error }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </el-col>
          </template>
          <!-- /Node 配置项 -->

          <el-divider />

          <!-- ==================== Tracker 角色 ==================== -->
          <el-col :span="24">
            <el-form-item label="作为 Tracker">
              <el-switch v-model="form.p2p.role.tracker" />
              <el-button type="primary" @click="comfirm_p2p_role_tracker" class="ml-4">确定</el-button>
              <span class="suffix ml-2 text-gray-500">本机对外提供 Tracker 服务,供其它节点注册</span>
            </el-form-item>
          </el-col>

          <!-- Tracker 配置项 -->
          <template v-if="form.p2p.role.tracker">
            <el-col :span="24">
              <el-form-item label="Tracker 对外地址">
                <el-input v-model="form.p2p.tracker.publicUrl"
                  placeholder="例如 http://tracker.example.com:9797/api"
                  :style="{ width: '500px' }" />
                <el-button type="primary" @click="comfirm_p2p_tracker_public_url" class="ml-4">确定</el-button>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="允许公开注册">
                <el-switch v-model="form.p2p.tracker.allowPublicRegister" />
                <el-button type="primary" @click="comfirm_p2p_allow_public_register" class="ml-4">确定</el-button>
                <span class="suffix ml-2 text-gray-500">关闭后需要邀请码才能注册</span>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="强制邀请码">
                <el-switch v-model="form.p2p.tracker.requireInviteToRegister" />
                <el-button type="primary" @click="comfirm_p2p_require_invite" class="ml-4">确定</el-button>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="同步密钥">
                <el-input v-model="form.p2p.tracker.syncKey"
                  placeholder="设置密钥后自动启用 tracker 间数据同步"
                  :style="{ width: '500px' }"
                  />
                <el-button type="primary" @click="comfirm_p2p_sync_key" class="ml-4">确定</el-button>
                <div class="suffix ml-2 text-gray-500" style="margin-top: 4px;">
                  所有 tracker 配置相同密钥,留空则不启用同步
                </div>
              </el-form-item>
            </el-col>

            <el-col :span="24" v-if="form.p2p.tracker.syncKey">
              <el-form-item label="同步间隔">
                <el-input v-model="form.p2p.tracker.syncIntervalSec" type="number" min="30"
                  :style="{ width: '180px' }" />
                <span class="suffix ml-2 text-gray-500">秒(最小 30, 默认 300)</span>
                <el-button type="primary" @click="comfirm_p2p_sync_interval" class="ml-4">确定</el-button>
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="手动同步">
                <el-button type="primary" :loading="syncLoading" @click="click_trigger_sync">
                  {{ syncLoading ? '同步中...' : '立即同步' }}
                </el-button>
                <span class="suffix ml-2 text-gray-500">立即从所有 peer tracker 拉取最新数据</span>
              </el-form-item>
            </el-col>
          </template>
          <!-- /Tracker 配置项 -->
        </el-row>
      </el-form>

      <div class="form-note mt-4 text-gray-500 text-sm">
        <p>• <b>启用 P2P</b>:总开关,关闭后本机不参与任何 P2P 通信。</p>
        <p>• <b>作为节点</b>:开启后会向 Tracker 列表注册自身,参与多源下载。</p>
        <p>• <b>作为 Tracker</b>:本机对外提供索引服务,允许其它节点注册并相互发现。</p>
        <p>• <b>本机公网地址</b>:其它节点连过来时使用的完整访问地址。Tracker 会反向探测可达性,无法连通将拒绝注册。</p>
        <p>• 留空公网地址时,Tracker 会用请求来源 IP 自动识别;但若你处于内网,必须显式填写公网信息并做端口映射。</p>
        <p>• <b>Tracker 服务器</b>:本节点要注册到的 Tracker 地址列表,可填多个。修改后会自动用新配置重新注册。</p>
      </div>
    </el-card>

    <!-- 登录封面设置卡片 -->
    <el-card class="setting-card mt-6" shadow="hover">
      <template #header>
        <div class="card-header">
          <span class="card-title">登录封面设置</span>
          <span class="text-sm text-gray-500 ml-2">(每个客户端单独设置)</span>
        </div>
      </template>

      <el-form :model="form" label-width="160px" size="default">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="封面随机">
              <el-switch v-model="backRandom" @change="back_random" />
            </el-form-item>
          </el-col>

          <el-col :span="24" class="mt-4">
            <div class="cover-selection-title text-gray-600 mb-3">选择封面样式:</div>
            <div class="cover-grid">
              <div v-for="item in coverArr" :key="item"
                :class="['cover-item', 'back-item', 'bg' + item, { 'active': !backRandom && activeBack === item }]"
                @click="back_click(item)">
                <div v-if="!backRandom && activeBack === item" class="cover-select-indicator">
                  <el-icon size="20">
                    <Check />
                  </el-icon>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import serveSettingApi from '@/api/serve-setting';
import { Check } from '@element-plus/icons-vue';

const coverArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
let activeBack = ref(0);
let backRandom = ref(true);

const form = reactive({
  scan: {
    engine: 'template-v2' as 'legacy' | 'template-v1' | 'template-v2',
    autoCompress: 0,
    interval: 60,
    reloadCover: 0,
    ignoreHiddenFiles: 0,
    mediaPosterInterval: 0,
    createMediaPoster: 0,
  },
  sync: {
    interval: 60
  },
  ssl: {
    pem: '',
    key: ''
  },
  compress: {
    auto: 0,
    saveDuration: 30,
    poster: 300,
    bookmark: 300,
    sync: 1,
    autoClear: 0,
    clearCron: '',
    limit: 0,
  },
  p2p: {
    enable: false,
    role: {
      node: false,
      tracker: false,
    },
    node: {
      nodeId: '',
      nodeName: '',
      publicUrl: '',
      heartbeatInterval: 30,
      trackers: [] as string[],
    },
    tracker: {
      publicUrl: '',
      allowPublicRegister: true,
      requireInviteToRegister: false,
      syncKey: '',
      syncIntervalSec: 300,
    },
  },
  queue: {
    worker: {
      mode: 'embedded',
    },
    workers: {
      background: {
        concurrency: 1,
      },
      compress: {
        concurrency: 1,
      },
    },
    attempts: 3,
    timeout: 120000,
    pollIntervalMs: 1000,
  },
});

// P2P trackers 列表的临时编辑模型(以字符串数组形式绑定输入框)
const p2pTrackerInputs = ref<string[]>([]);
// 同步 form.p2p.node.trackers -> p2pTrackerInputs(在加载与每次提交后调用)
function syncTrackerInputs() {
  const list = (form.p2p.node.trackers || []).slice();
  p2pTrackerInputs.value = list.length ? list : [''];
}
function add_tracker_input() {
  p2pTrackerInputs.value.push('');
}
function remove_tracker_input(index: number) {
  p2pTrackerInputs.value.splice(index, 1);
  if (!p2pTrackerInputs.value.length) p2pTrackerInputs.value.push('');
}

// 计算封面图片URL
const getCoverUrl = (index: number) => {
  // 这里使用占位图URL，实际项目中应替换为真实图片路径
  return `https://picsum.photos/seed/cover${index}/300/200`;
};

function back_random(val: boolean) {
  activeBack.value = 0;
  localStorage.setItem('activeBack', String(0));
  ElMessage.success('已启用随机封面');
}

function back_click(item: number) {
  backRandom.value = false;
  activeBack.value = item;
  localStorage.setItem('activeBack', String(item));
  ElMessage.success(`已选择封面样式 ${item}`);
}

/**
 * @description: 设置扫描时间间隔
 * @return {*}
 */
async function comfirm_interval() {
  try {
    await serveSettingApi.set('scan', 'interval', form.scan.interval);
  } catch (error) {
    console.error('Failed to set scan interval:', error);
  }
}

async function confirm_scan_engine() {
  try {
    await serveSettingApi.set('scan', 'engine', form.scan.engine);
    ElMessage.success('扫描引擎已切换，后续扫描任务即时生效');
  } catch (error) {
    console.error('Failed to set scan engine:', error);
  }
}

async function comfirm_poster_interval() {
  try {
    await serveSettingApi.set('scan', 'mediaPosterInterval', form.scan.mediaPosterInterval);
  } catch (error) {
    console.error('Failed to set poster interval:', error);
  }
}

/**
 * @description: 设置更新封面开关
 * @return {*}
 */
async function comfirm_update_cover() {
  try {
    await serveSettingApi.set('scan', 'reloadCover', form.scan.reloadCover);
  } catch (error) {
    console.error('Failed to set reload cover:', error);
  }
}

async function comfirm_scan_ignore_hidden() {
  try {
    await serveSettingApi.set('scan', 'ignoreHiddenFiles', form.scan.ignoreHiddenFiles);
  } catch (error) {
    console.error('Failed to set ignore hidden files:', error);
  }
}

async function comfirm_create_poster() {
  try {
    await serveSettingApi.set('scan', 'createMediaPoster', form.scan.createMediaPoster);
  } catch (error) {
    console.error('Failed to set create media poster:', error);
  }
}

async function confirm_poster_size() {
  try {
    await serveSettingApi.set('compress', 'poster', form.compress.poster);
  } catch (error) {
    console.error('Failed to set poster size:', error);
  }
}

async function comfirm_sync_interval() {
  try {
    await serveSettingApi.set('sync', 'interval', form.sync.interval);
  } catch (error) {
    console.error('Failed to set sync interval:', error);
  }
}

async function confirm_compress_duration() {
  try {
    await serveSettingApi.set('compress', 'saveDuration', form.compress.saveDuration);
  } catch (error) {
    console.error('Failed to set compress duration:', error);
  }
}

async function comfirm_sync_compress() {
  try {
    await serveSettingApi.set('compress', 'sync', form.compress.sync);
  } catch (error) {
    console.error('Failed to set sync compress:', error);
  }
}

async function comfirm_auto_clear() {
  try {
    await serveSettingApi.set('compress', 'autoClear', form.compress.autoClear);
  } catch (error) {
    console.error('Failed to set auto clear:', error);
  }
}

async function confirm_clear_cron() {
  try {
    await serveSettingApi.set('compress', 'clearCron', form.compress.clearCron);
  } catch (error) {
    console.error('Failed to set clear cron:', error);
  }
}

async function confirm_cache_limit() {
  try {
    await serveSettingApi.set('compress', 'limit', form.compress.limit);
  } catch (error) {
    console.error('Failed to set cache limit:', error);
  }
}


// ===== 队列设置提交方法 =====
async function confirm_queue_mode() {
  try {
    await serveSettingApi.set('queue', 'worker.mode', form.queue.worker.mode);
    ElMessage.warning('Worker 模式已保存，需重启服务生效');
  } catch (error) {
    console.error('Failed to set queue.worker.mode:', error);
  }
}

async function confirm_queue_bg_concurrency() {
  try {
    await serveSettingApi.set('queue', 'workers.background.concurrency', form.queue.workers.background.concurrency);
    ElMessage.warning('Background 并发数已保存，需重启服务生效');
  } catch (error) {
    console.error('Failed to set background concurrency:', error);
  }
}

async function confirm_queue_cp_concurrency() {
  try {
    await serveSettingApi.set('queue', 'workers.compress.concurrency', form.queue.workers.compress.concurrency);
    ElMessage.warning('Compress 并发数已保存，需重启服务生效');
  } catch (error) {
    console.error('Failed to set compress concurrency:', error);
  }
}

async function confirm_queue_attempts() {
  try {
    await serveSettingApi.set('queue', 'attempts', form.queue.attempts);
    ElMessage.success('重试次数已保存');
  } catch (error) {
    console.error('Failed to set queue.attempts:', error);
  }
}

async function confirm_queue_timeout() {
  try {
    await serveSettingApi.set('queue', 'timeout', form.queue.timeout);
    ElMessage.success('任务超时已保存');
  } catch (error) {
    console.error('Failed to set queue.timeout:', error);
  }
}

async function confirm_queue_poll() {
  try {
    await serveSettingApi.set('queue', 'pollIntervalMs', form.queue.pollIntervalMs);
    ElMessage.success('轮询间隔已保存');
  } catch (error) {
    console.error('Failed to set queue.pollIntervalMs:', error);
  }
}


/**
 * @description: 设置ssl证书
 * @return {*}
 */
async function comfirm_ssl() {
  try {
    await serveSettingApi.set_ssl(form.ssl.pem, form.ssl.key);
  } catch (error) {
    console.error('Failed to set SSL:', error);
  }
}

/**
 * @description: 重置证书设置
 * @return {*}
 */
async function reset_ssl() {
  try {
    await serveSettingApi.reset_ssl();
    form.ssl.pem = '';
    form.ssl.key = '';
  } catch (error) {
    console.error('Failed to reset SSL:', error);
  }
}

// ===== P2P 设置提交方法 =====
async function comfirm_p2p_enable() {
  try {
    await serveSettingApi.set('p2p', 'enable', form.p2p.enable);
    ElMessage.success(form.p2p.enable ? 'P2P 已开启' : 'P2P 已关闭');
  } catch (error) {
    console.error('Failed to set p2p.enable:', error);
  }
}

async function comfirm_p2p_role_node() {
  try {
    await serveSettingApi.set('p2p', 'role.node', form.p2p.role.node);
    ElMessage.success('已保存,节点角色变更后会自动重新注册');
  } catch (error) {
    console.error('Failed to set p2p.role.node:', error);
  }
}

async function comfirm_p2p_role_tracker() {
  try {
    await serveSettingApi.set('p2p', 'role.tracker', form.p2p.role.tracker);
    ElMessage.success('已保存,Tracker 角色变更建议重启服务');
  } catch (error) {
    console.error('Failed to set p2p.role.tracker:', error);
  }
}

async function comfirm_p2p_node_name() {
  try {
    await serveSettingApi.set('p2p', 'node.nodeName', form.p2p.node.nodeName);
    ElMessage.success('节点名称已保存');
  } catch (error) {
    console.error('Failed to set p2p.node.nodeName:', error);
  }
}

async function comfirm_p2p_public_url() {
  try {
    await serveSettingApi.set('p2p', 'node.publicUrl', String(form.p2p.node.publicUrl || '').trim());
    ElMessage.success('公网地址已保存,节点将自动重新注册');
  } catch (error) {
    console.error('Failed to set p2p.node.publicUrl:', error);
  }
}

async function comfirm_p2p_heartbeat() {
  try {
    await serveSettingApi.set('p2p', 'node.heartbeatInterval', Number(form.p2p.node.heartbeatInterval) || 30);
    ElMessage.success('心跳间隔已保存');
  } catch (error) {
    console.error('Failed to set p2p.node.heartbeatInterval:', error);
  }
}

async function comfirm_p2p_trackers() {
  try {
    // 过滤空值并去重
    const list = Array.from(
      new Set(
        p2pTrackerInputs.value
          .map((u) => String(u || '').trim())
          .filter((u) => /^https?:\/\//i.test(u))
      )
    );
    if (list.length === 0) {
      ElMessage.warning('请至少填写一个有效的 tracker 地址(以 http:// 或 https:// 开头)');
      return;
    }
    await serveSettingApi.set('p2p', 'node.trackers', list);
    form.p2p.node.trackers = list;
    syncTrackerInputs();
    ElMessage.success('Tracker 列表已保存,节点将自动重新注册');
  } catch (error) {
    console.error('Failed to set p2p.node.trackers:', error);
  }
}

async function comfirm_p2p_tracker_public_url() {
  try {
    await serveSettingApi.set('p2p', 'tracker.publicUrl', form.p2p.tracker.publicUrl);
    ElMessage.success('Tracker 对外地址已保存');
  } catch (error) {
    console.error('Failed to set p2p.tracker.publicUrl:', error);
  }
}

async function comfirm_p2p_allow_public_register() {
  try {
    await serveSettingApi.set('p2p', 'tracker.allowPublicRegister', form.p2p.tracker.allowPublicRegister);
    ElMessage.success('已保存');
  } catch (error) {
    console.error('Failed to set p2p.tracker.allowPublicRegister:', error);
  }
}

async function comfirm_p2p_require_invite() {
  try {
    await serveSettingApi.set('p2p', 'tracker.requireInviteToRegister', form.p2p.tracker.requireInviteToRegister);
    ElMessage.success('已保存');
  } catch (error) {
    console.error('Failed to set p2p.tracker.requireInviteToRegister:', error);
  }
}

async function comfirm_p2p_sync_key() {
  try {
    await serveSettingApi.set('p2p', 'tracker.syncKey', String(form.p2p.tracker.syncKey || '').trim());
    if (form.p2p.tracker.syncKey) {
      ElMessage.success('同步密钥已保存,重启服务后 tracker 间数据同步将生效');
    } else {
      ElMessage.success('同步密钥已清空,数据同步已关闭');
    }
  } catch (error) {
    console.error('Failed to set p2p.tracker.syncKey:', error);
  }
}

async function comfirm_p2p_sync_interval() {
  try {
    const val = Number(form.p2p.tracker.syncIntervalSec);
    if (!Number.isFinite(val) || val < 30) {
      ElMessage.warning('同步间隔最小为 30 秒');
      form.p2p.tracker.syncIntervalSec = 300;
      return;
    }
    await serveSettingApi.set('p2p', 'tracker.syncIntervalSec', val);
    ElMessage.success('同步间隔已保存,重启服务后生效');
  } catch (error) {
    console.error('Failed to set p2p.tracker.syncIntervalSec:', error);
  }
}

// ===== 手动注册节点 =====
const registerLoading = ref(false);

interface TrackerResultItem {
  trackerUrl: string
  success: boolean
  publicUrl?: string
  error?: string
  reused?: boolean
}

const registerResult = ref<{
  anySuccess: boolean
  results: TrackerResultItem[]
  nodeName?: string
  reused?: boolean
} | null>(null);
// ===== 手动同步 Tracker =====
const syncLoading = ref(false);

async function click_register_node() {
  // 前置校验
  if (!form.p2p.enable) {
    registerResult.value = {
      anySuccess: false,
      results: [{ trackerUrl: '-', success: false, error: '请先开启"启用 P2P"开关' }],
    };
    return;
  }
  if (!form.p2p.role.node) {
    registerResult.value = {
      anySuccess: false,
      results: [{ trackerUrl: '-', success: false, error: '请先开启"作为节点(Node)"角色' }],
    };
    return;
  }

  registerLoading.value = true;
  registerResult.value = null;

  try {
    const res: any = await serveSettingApi.register_node_now();
    if (res?.code === 200) {
      registerResult.value = {
        anySuccess: res.data?.anySuccess ?? false,
        results: res.data?.results || [],
        nodeName: res.data?.nodeName,
        reused: res.data?.reused,
      };
      // 重新拉取配置以刷新显示
      try {
        const latest = await serveSettingApi.get();
        Object.assign(form, latest);
        syncTrackerInputs();
      } catch (e) {
        console.warn('刷新配置失败:', e);
      }
    } else {
      registerResult.value = {
        anySuccess: false,
        results: [{ trackerUrl: '-', success: false, error: res?.message || '未知错误' }],
      };
    }
  } catch (err: any) {
    const reason =
      err?.response?.data?.message ||
      err?.message ||
      '请求失败,请检查网络与服务状态';
    registerResult.value = {
      anySuccess: false,
      results: [{ trackerUrl: '-', success: false, error: reason }],
    };
    console.error('register_node_now failed:', err);
  } finally {
    registerLoading.value = false;
  }
}

async function click_trigger_sync() {
  syncLoading.value = true;
  try {
    const res: any = await serveSettingApi.trigger_tracker_sync();
    if (res?.code === 200) {
      ElMessage.success(res?.message || '同步完成');
    } else {
      ElMessage.warning(res?.message || '同步失败');
    }
  } catch (err: any) {
    const reason = err?.response?.data?.message || err?.message || '请求失败';
    ElMessage.error(reason);
  } finally {
    syncLoading.value = false;
  }
}

onMounted(async () => {
  try {
    const res = await serveSettingApi.get();
    Object.assign(form, res);
    syncTrackerInputs();

    const val = localStorage.getItem('activeBack');
    if (val && val !== '0') {
      activeBack.value = Number(val);
      backRandom.value = false;
    }
  } catch (error) {
    ElMessage.error('加载设置失败');
    console.error('Failed to load settings:', error);
  }
});
</script>

<style scoped lang="less" src="@/style/login-bg.less"></style>
<style lang="less" scoped>
.serve-setting-container {
  padding: 20px 30px;
  min-height: 100vh;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: @s-back-text;
  margin-bottom: 24px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.setting-card {
  border-radius: 8px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.form-note {
  padding: 10px 15px;
  background-color: #f4f4f5;
  border-radius: 4px;
  line-height: 1.6;
}

.suffix {
  font-size: 14px;
}

.cover-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.cover-item {
  height: 100px;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
}

.cover-item:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cover-item.active {
  border-color: #4096ff;
}

.cover-select-indicator {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  background-color: rgba(64, 150, 255, 0.9);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
}

.cover-selection-title {
  font-weight: 500;
}

.flex {
  display: flex;
}

.justify-start {
  justify-content: flex-start;
}

.mr-3 {
  margin-right: 12px;
}

.ml-2 {
  margin-left: 8px;
}

.ml-4 {
  margin-left: 16px;
}

.mt-4 {
  margin-top: 16px;
}

.mt-6 {
  margin-top: 24px;
}

.text-gray-500 {
  color: #909399;
}

.text-gray-600 {
  color: #606266;
}

.text-sm {
  font-size: 12px;
}

.tracker-list {
  width: 100%;
}

.tracker-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.tracker-actions {
  display: flex;
  align-items: center;
}

.register-result-item {
  :deep(.el-form-item__label) {
    visibility: hidden;
  }
}

.register-result-content {
  font-size: 13px;
  line-height: 1.6;

  .register-error-reason {
    pre {
      margin: 4px 0 0 0;
      padding: 8px 10px;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 4px;
      white-space: pre-wrap;
      word-break: break-all;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 12px;
      color: #c0392b;
    }
  }
}
</style>
