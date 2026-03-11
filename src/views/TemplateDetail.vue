<template>
  <!-- eslint-disable vue/html-indent -->
  <div class="template-detail-page">
    <!-- 主要内容区域 -->
    <div class="main-content">
      <div ref="mediaContainerRef" class="media-container"
        :style="{ scrollBehavior: isInitialLoad ? 'auto' : 'smooth' }">
        <!--左侧返回按钮  -->
        <el-button size="large" class="back-button" @click="handleBack">
          <el-icon :size="20">
            <Back />
          </el-icon>
        </el-button>
        <!-- 左侧视频/图片展示区 - 可滚动显示多个模板 -->
        <div class="media-scroll-wrapper">
          <div v-for="(item, index) in relatedTemplates" :key="item.id" class="media-item"
            :class="{ active: selectedThumbnail === index }">
            <div class="media-player flex-col-center" @click="handleImagePreview(index, item)">
              <!-- 媒体播放器 - 自动判断显示视频或图片 -->
              <MediaPlayer :ref="(el) => setMediaPlayerRef(el, index)" :src="item.fileUrl"
                :poster="item.imageUrl || item.imgUrl" :autoplay="isVideoType(item) && selectedThumbnail === index"
                :loop="true" :controls="isVideoType(item)" :muted="true" :minimal-controls="true"
                :image-only="isImageType(item)" object-fit="contain" poster-fit="contain" class="video-player" />
            </div>
            <div class="content-notice">
              内容由AI生成，禁止利用功能从事违法活动，请合理规范地使用生成内容
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧信息面板 -->
      <div class="info-panel">
        <!-- 顶部操作图标 -->
        <div class="info-actions">
          <!-- 我的资产：显示多个操作图标 -->
          <template v-if="pageTypeRef === 'assets'">
            <el-dropdown trigger="click" placement="bottom-end" popper-class="template-detail-download-popper"
              :hide-on-click="false" @command="(cmd: string) => handleDownloadCommand(cmd)"
              @visible-change="handleDownloadMenuVisible">
              <div class="btn-icon-wrapper" @click.stop>
                <el-icon v-if="isDownloading" class="is-loading btn-icon-loading">
                  <Loading />
                </el-icon>
                <img v-else :src="images.downloadIcon" class="btn-icon" alt="下载" />
              </div>
              <template #dropdown>
                <el-dropdown-menu class="download-menu">
                  <el-dropdown-item command="download">
                    <div class="menu-item-content">
                      <img :src="images.download" alt="下载" class="menu-icon" />
                      <span>下载</span>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item command="toggle-watermark" class="watermark-toggle-item">
                    <div class="menu-item-content" @click.stop="handleWatermarkToggleChange(!removeWatermarkEnabled)">
                      <el-switch v-model="removeWatermarkEnabled" active-color="#8f50ea" inactive-color="#201B26"
                        @click.stop @change="handleWatermarkToggleChange" />
                      <span>去除水印</span>
                      <img :src="images.vip" alt="VIP" class="vip-icon" />
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <img :src="templateDetail?.isCollect === 1 ? images.collected : images.collect" class="btn-icon" alt=""
              @click="handleAssetsCollect" />
            <el-dropdown trigger="click" popper-class="template-detail-more-popper" @command="handleMoreCommand">
              <img :src="images.more" class="btn-icon" alt="" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="report">
                    <el-icon>
                      <Bell />
                    </el-icon>
                    <span>反馈</span>
                  </el-dropdown-item>
                  <el-dropdown-item command="delete">
                    <el-icon>
                      <Delete />
                    </el-icon>
                    <span>删除</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <!-- 其他模块：只显示喜欢按钮 -->
          <template v-else>
            <img :src="templateDetail?.isLike === 1 ? images.like : images.dislike" class="btn-icon" alt=""
              @click="handleLikeToggle" />
          </template>
        </div>

        <!-- 我的资产详情 -->
        <div v-if="pageTypeRef == 'assets'">
          <h5 class="section-title">{{ templateDetail?.typeName }}</h5>
          <div v-if="requestParams" class="video-thumb-row">
            <!-- AI视频-单图/模板动作 AI图片-指令改图/姿势裂变-->
            <img v-if="requestParams.imageUrl" :src="requestParams.imageUrl" />
            <!-- AI视频-尾帧 -->
            <img v-if="requestParams.lastFrameUrl" :src="requestParams.lastFrameUrl" />
            <!-- AI视频-多图成片 -->
            <img v-for="item in requestParams.imageUrls" :key="item" :src="item" />

            <!-- AI图片-商品展示 6 -->
            <img v-if="requestParams.productItemUrl" :src="requestParams.productItemUrl" />
            <!-- AI图片-穿搭调整-模特图 5 -->
            <img v-if="templateDetail?.type == 5 && requestParams.flatSceneImageUrl"
              :src="requestParams.flatSceneImageUrl" />

            <!-- 万物穿戴-单视角/多视角 -->
            <img v-if="requestParams.itemViewOneUrl" :src="requestParams.itemViewOneUrl" />
            <img v-if="requestParams.itemViewTwoUrl" :src="requestParams.itemViewTwoUrl" />

            <!-- 换模特换背景/只换模特/只换背景 -->
            <img v-if="requestParams.clothesSceneUrl" :src="requestParams.clothesSceneUrl" />
            <!-- 只换模特 -->
            <img v-if="requestParams.clothesSceneUrlModel" :src="requestParams.clothesSceneUrlModel" />
            <!-- 只换背景 -->
            <img v-if="requestParams.clothesSceneUrlBg" :src="requestParams.clothesSceneUrlBg" />

            <!-- AI试衣-自定义=>连体衣/上下装 -->
            <img v-if="requestParams.upperFrontUrl" :src="requestParams.upperFrontUrl" />
            <img v-if="requestParams.downFrontUrl" :src="requestParams.downFrontUrl" />
            <img v-if="requestParams.frontDressUrl" :src="requestParams.frontDressUrl" />

            <!-- AI试衣-平铺图=>连体衣/上下装正面背面 -->
            <!-- AI试衣-平铺图=>上下装/上装正面 -->
            <img v-if="requestParams.flatUpperFrontUrl" :src="requestParams.flatUpperFrontUrl" />
            <!-- AI试衣-平铺图=>上下装/上装背面 -->
            <img v-if="requestParams.flatUpperBackUrl" :src="requestParams.flatUpperBackUrl" />
            <!-- AI试衣-平铺图=>上下装/下装正面 -->
            <img v-if="requestParams.flatDownFrontUrl" :src="requestParams.flatDownFrontUrl" />
            <!-- AI试衣-平铺图=>上下装/下装背面 -->
            <img v-if="requestParams.flatDownBackUrl" :src="requestParams.flatDownBackUrl" />
            <!-- AI试衣-平铺图=>连体衣正面 -->
            <img v-if="requestParams.flatFrontDressUrl" :src="requestParams.flatFrontDressUrl" />
            <!-- AI试衣-平铺图=>连体衣背面 -->
            <img v-if="requestParams.flatBackDressUrl" :src="requestParams.flatBackDressUrl" />

            <!-- AI试衣-挂拍图 => 正面/背面 -->
            <img v-if="requestParams.hangingFrontUrl" :src="requestParams.hangingFrontUrl" />
            <img v-if="requestParams.hangingBackUrl" :src="requestParams.hangingBackUrl" />

            <!-- AI试衣-搭配图 => 一身搭-->
            <img v-if="requestParams.mixedItemsUrl" :src="requestParams.mixedItemsUrl" />

            <!-- AI试衣-人台图 => 正面/背面-->
            <!-- 人台图 正面-->
            <img v-if="requestParams.mannequinFrontUrl" :src="requestParams.mannequinFrontUrl" />
            <!-- 人台图 背面 -->
            <img v-if="requestParams.mannequinBackUrl" :src="requestParams.mannequinBackUrl" />
          </div>

          <!-- AI试衣-搭配图 => 鞋靴-->
          <template v-if="requestParams && templateDetail?.type == 24">
            <h5 class="section-title">鞋靴</h5>
            <div class="video-thumb-row">
              <img v-if="requestParams.shoesUrl" :src="requestParams.shoesUrl" />
            </div>
          </template>

          <!-- AI图片-穿搭调整 => 连体衣/上下装 创意模板库:热门穿搭-连体衣/上下装 -->
          <template v-if="
            requestParams &&
            (templateDetail?.type == 5 ||
              templateDetail?.type == 27 ||
              templateDetail?.type == 28)
          ">
            <h5 v-if="outfitAdjustmentTitle" class="section-title">
              {{ outfitAdjustmentTitle }}
            </h5>
            <div class="video-thumb-row">
              <img v-if="requestParams.flatFrontDressUrl" :src="requestParams.flatFrontDressUrl" />
              <img v-if="requestParams.flatUpperFrontUrl" :src="requestParams.flatUpperFrontUrl" />
              <img v-if="requestParams.flatDownFrontUrl" :src="requestParams.flatDownFrontUrl" />
            </div>
          </template>

          <!-- 万物穿戴-单视角/多视角 =>穿戴参考 -->
          <template v-if="requestParams && templateDetail?.type == 11">
            <h5 class="section-title">穿戴参考</h5>
            <div class="video-thumb-row">
              <img v-for="item in requestParams.wearSceneUrl" :key="item" :src="item" />
            </div>
          </template>

          <!-- 换模特换背景=>换模特换背景12/只换模特13/只换背景14 -->
          <!-- AI试衣-平铺图 => 连体衣17/上下装18 模特非必填 -->
          <!-- AI试衣-挂拍图19 模特非必填 -->

          <!-- 模特 -->
          <template v-if="
            requestParams &&
            (templateDetail?.type == 12 ||
              templateDetail?.type == 13 ||
              (templateDetail?.type == 17 && requestParams.modelImageUrl) ||
              (templateDetail?.type == 18 && requestParams.modelImageUrl) ||
              (templateDetail?.type == 19 && requestParams.modelImageUrl) ||
              (templateDetail?.type == 20 && requestParams.modelImageUrl))
          ">
            <h5 class="section-title">模特</h5>
            <div class="video-thumb-row">
              <img v-if="requestParams.modelImageUrl" :src="requestParams.modelImageUrl" />
              <img v-if="requestParams.modelImageUrlNew" :src="requestParams.modelImageUrlNew" />
              <img v-if="requestParams.modelImageUrlOnly" :src="requestParams.modelImageUrlOnly" />
            </div>
          </template>

          <!-- 姿势 -->
          <template v-if="requestParams && templateDetail?.type == 24">
            <h5 class="section-title">姿势</h5>
            <div class="video-thumb-row">
              <img v-for="item in requestParams.poseChooseImg" :key="item" :src="item" />
            </div>
          </template>

          <!-- 模特场景 -->
          <template v-if="
            requestParams &&
            (templateDetail?.type == 28 ||
              templateDetail?.type == 27 ||
              templateDetail?.type == 23 ||
              templateDetail?.type == 24 ||
              templateDetail?.type == 22 ||
              templateDetail?.type == 20 ||
              templateDetail?.type == 19 ||
              (templateDetail?.type == 18 && requestParams.sceneImageUrl) ||
              (templateDetail?.type == 17 && requestParams.sceneImageUrl) ||
              templateDetail?.type == 14 ||
              templateDetail?.type == 12)
          ">
            <h5 class="section-title">
              {{ templateDetail?.type == 28 || templateDetail?.type == 27 ? '模特场景' : '场景' }}
            </h5>
            <div class="video-thumb-row">
              <img v-for="item in requestParams.modelSceneUrl ||
                requestParams.modelSceneUrlBg ||
                requestParams.flatSceneImageUrl ||
                (templateDetail?.type == 24
                  ? requestParams?.sceneImageUrl.slice(0, 1)
                  : requestParams?.sceneImageUrl) ||
                requestParams?.multipleModels" :key="item" :src="item" />
            </div>
          </template>

          <!-- AI试衣-自定义标签参数 -->
          <template v-if="requestParams && (templateDetail?.type == 15 || templateDetail?.type == 16)">
            <div class="video-thumb-row">
              <el-button v-if="requestParams.gender" type="primary" class="btn" size="small">
                {{ requestParams.gender }}
              </el-button>
              <el-button v-if="requestParams.age" type="primary" class="btn" size="small">
                {{ requestParams.age }}
              </el-button>
              <el-button v-if="requestParams.skinToneCode" type="primary" class="btn" size="small">
                <text class="skin-tone-code" :style="{ backgroundColor: requestParams.skinToneCode }"></text>
              </el-button>
              <el-button v-if="requestParams.bodyType" type="primary" class="btn" size="small">
                {{ requestParams.bodyType }}
              </el-button>
              <el-button v-if="requestParams.composition" type="primary" class="btn" size="small">
                {{ requestParams.composition }}
              </el-button>
              <el-button v-if="requestParams.angleCode" type="primary" class="btn" size="small">
                {{ requestParams.angleCode }}
              </el-button>
            </div>
          </template>

          <!-- 创意描述 -->
          <div v-if="templateDetail?.type != 10 && templateDetail?.type != 2 && creativeDescription"
            class="creative-description">
            <div class="description-header">
              <h5 class="section-label">创意描述</h5>
              <el-icon v-if="creativeDescription" class="copy-icon" @click="copyDescription(creativeDescription)">
                <CopyDocument />
              </el-icon>
            </div>
            <!-- 单个描述 -->
            <p v-if="creativeDescription" class="description-text">
              {{ creativeDescription }}
            </p>
            <!-- 多图成片 -->
            <template v-if="requestParams?.prompts">
              <div v-for="(item, index) in requestParams?.prompts" :key="index">
                <div class="description-header">
                  <h5 class="section-label">
                    创意描述-片段{{ numberToChinese(Number(index) + 1) }}
                  </h5>
                  <el-icon class="copy-icon" @click="copyDescription(item.value)">
                    <CopyDocument />
                  </el-icon>
                </div>
                <p class="description-text">
                  {{ item.value }}
                </p>
              </div>
            </template>
          </div>

          <!-- AI视频-模板动作 -->
          <template v-if="requestParams?.promptsListTitles && templateDetail?.type == 10">
            <h5 class="section-title">参考动作</h5>
            <div class="video-thumb-row">
              <el-button v-for="item in requestParams.promptsListTitles" :key="item" type="primary" class="btn">
                {{ item }}
              </el-button>
            </div>
          </template>

          <!-- AI图片-视角选择/模特姿势库 -->
          <template v-if="
            (templateDetail?.type == 2 || templateDetail?.type == 3) &&
            requestParams?.poseChooseImg
          ">
            <h5 v-if="templateDetail?.type == 2" class="section-title">
              {{ requestParams?.poseChooseKey == 'view_angle' ? '视角选择' : '模特姿势库' }}
            </h5>
            <h5 v-if="templateDetail?.type == 3" class="section-title">模特表情库</h5>
            <div class="video-thumb-row">
              <img v-for="item in requestParams.poseChooseImg" :key="item" :src="item" />
            </div>
          </template>

          <!-- AI图片-商品场景 -->
          <template v-if="templateDetail?.type == 6 && requestParams?.productSceneUrl">
            <h5 class="section-title">商品场景</h5>
            <div class="video-thumb-row">
              <img v-for="item in requestParams.productSceneUrl" :key="item" :src="item" />
            </div>
          </template>

          <div v-if="
            requestParams &&
            (requestParams.algorithmName ||
              requestParams.duration ||
              requestParams.resolution ||
              requestParams.aspectRatio ||
              requestParams.quality)
          " class="tag-row">
            <span v-if="requestParams.algorithmName" class="tag">
              {{ requestParams.algorithmName }}
            </span>
            <span v-if="requestParams.duration" class="tag">{{ requestParams.duration }}秒</span>
            <span v-if="requestParams.resolution" class="tag">
              {{ requestParams.resolution }}
            </span>
            <span v-if="requestParams.aspectRatio" class="tag">
              {{ requestParams.aspectRatio }}
            </span>
            <span v-if="requestParams.quality" class="tag">
              {{ requestParams.quality }}
            </span>
            <span class="tag">{{ isVideoType(templateDetail) ? '视频' : '图片' }}</span>
          </div>
          <div v-if="templateDetail?.createTime" class="use-count">
            {{ formatDateToChinese(templateDetail.createTime) }}
          </div>
        </div>

        <!-- 创意模板详情模块 -->
        <div v-if="pageTypeRef == 'template' || pageTypeRef == 'like'">
          <!-- 穿戴饰物：上面展示穿戴饰物图，下面展示穿戴参考 -->
          <template v-if="isWearAccessories">
            <!-- 穿戴饰物图（单视角或多视角） -->
            <div v-if="wearAccessoriesImages.length > 0">
              <div class="section-title">穿戴饰物</div>
              <div class="video-thumb-row">
                <img v-for="(item, index) in wearAccessoriesImages" :key="item.id || index" :src="item.imgUrl"
                  :alt="getImageSetLabel(item.closeType)" />
              </div>
            </div>
            <!-- 穿戴参考（materialLibraryType: 1） -->
            <div v-if="wearReferenceImages.length > 0">
              <div class="section-title">穿戴参考</div>
              <div class="video-thumb-row">
                <img v-for="(item, index) in wearReferenceImages" :key="item.id || index"
                  :src="item.materialImgUrl || item.imgUrl" alt="穿戴参考" />
              </div>
            </div>
          </template>

          <!-- 热门穿搭：上面展示上下装/连体衣，下面展示穿搭参考 -->
          <template v-else-if="isPopularOutfit">
            <!-- 上下装或连体衣 -->
            <div v-if="outfitImages.length > 0">
              <div class="section-title">热门穿搭</div>
              <div class="video-thumb-row">
                <img v-for="(item, index) in outfitImages" :key="item.id || index" :src="item.imgUrl"
                  :alt="getImageSetLabel(item.closeType)" />
              </div>
            </div>
            <!-- 穿搭参考/模特场景（materialLibraryType: 0） -->
            <div v-if="sceneReferenceImages.length > 0">
              <div class="section-title">模特场景</div>
              <div class="video-thumb-row">
                <img v-for="(item, index) in sceneReferenceImages.slice(0, 1)" :key="item.id || index"
                  :src="item.materialImgUrl || item.imgUrl" alt="模特场景" />
              </div>
            </div>
          </template>

          <!-- 模特视频：分为单图和首尾帧两种展示方式 -->
          <template v-else-if="isModelVideo">
            <!-- 单图模式（closeType: 6） -->
            <div v-if="modelVideoMode === 'single' && modelVideoSingleImage">
              <div class="section-title">{{ templateDetail?.title }}</div>
              <div class="video-thumb-row">
                <img :src="modelVideoSingleImage.imgUrl" alt="单图" />
              </div>
            </div>
            <!-- 首尾帧模式（closeType: 4, 5） -->
            <div v-else-if="modelVideoMode === 'firstLastFrame'">
              <div class="section-title">{{ templateDetail?.title }}</div>
              <div class="video-thumb-row">
                <img v-if="modelVideoFirstFrame" :src="modelVideoFirstFrame.imgUrl" alt="首帧" />
                <img v-if="modelVideoLastFrame" :src="modelVideoLastFrame.imgUrl" alt="尾帧" />
              </div>
            </div>
          </template>

          <!-- 面料创拍：展示创意描述和复制功能 -->
          <template v-else-if="isFabricShoot">
            <div v-if="fabricShootDescription" class="creative-description">
              <div class="section-title">{{ templateDetail?.title }}</div>
              <div class="description-header">
                <h5 class="section-label">创意描述</h5>
                <el-icon class="copy-icon" @click="copyFabricShootDescription">
                  <CopyDocument />
                </el-icon>
              </div>
              <div class="description-bar">
                <p class="description-text">{{ fabricShootDescription }}</p>
              </div>
            </div>
          </template>
          <div v-if="templateDetail?.algorithmName || templateDetail?.titleName" class="tag-row">
            <span v-if="templateDetail?.algorithmName" class="tag">
              {{ templateDetail.algorithmName }}
            </span>
            <span v-if="templateDetail?.titleName" class="tag">
              {{ templateDetail.titleName }}
            </span>
          </div>
          <!-- <div class="use-count">已被使用{{ templateDetail?.useCount }}次</div> -->
        </div>

        <!-- 操作按钮区 -->
        <div class="action-section">
          <!-- 创意模板：一键同款 -->
          <template v-if="pageTypeRef === 'template' || pageTypeRef === 'like'">
            <el-button type="primary" size="large" @click="handleOneClick">一键同款</el-button>
          </template>

          <!-- 我的资产：操作按钮组 -->
          <template v-if="pageTypeRef === 'assets'">
            <div v-if="isImageType(templateDetail)" class="action-item">
              <div class="section-title">生成</div>
              <el-button size="large" type="primary" @click="handleGenerateVideo">
                <img :src="images.video1" alt="" class="action-icon" />
                生成视频
              </el-button>
            </div>
            <div v-if="isImageType(templateDetail)" class="action-item">
              <div class="section-title">编辑</div>
              <div class="flex action-item-content">
                <el-button size="large" type="primary" @click="handleEditImage">
                  <img :src="images.imgEdit" alt="" class="action-icon" />
                  编辑图片
                </el-button>
                <!-- 品牌水印对所有用户可见，但仅会员可用；按钮右上角显示会员标识 -->
                <div class="vip-feature-btn">
                  <el-button size="large" type="primary" @click="handleBrandWatermark">
                    <img :src="images.brandWatermark" alt="" class="action-icon brand-watermark-icon" />
                    品牌水印
                  </el-button>
                  <img :src="images.vip3" alt="VIP" class="vip-badge" />
                </div>
              </div>
            </div>
            <!-- 视频类型显示品牌水印：所有用户可见，仅会员可用 -->
            <div v-if="isVideoType(templateDetail)" class="action-item">
              <div class="section-title">编辑</div>
              <div class="vip-feature-btn">
                <el-button size="large" type="primary" @click="handleBrandWatermark">
                  <img :src="images.brandWatermark" alt="" class="action-icon brand-watermark-icon" />
                  品牌水印
                </el-button>
                <img :src="images.vip3" alt="VIP" class="vip-badge" />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 编辑图片弹窗 -->
    <EditImageModal v-model="showEditModal" :image-url="templateDetail?.imageUrl"
      :original-description="templateDetail?.description || templateDetail?.prompt" @confirm="handleEditConfirm" />

    <!-- 反馈弹窗 -->
    <FeedbackModal v-if="templateDetail" v-model="showFeedbackModal" :user-id="userStore.userInfo?.userId"
      :task-id="templateDetail?.taskId" :task-result-id="templateDetail?.id" @success="handleFeedbackSuccess" />

    <!-- 会员购买弹窗 -->
    <MembershipModal :show="showCoinInsufficient" :error-type="coinErrorType" :is-vip="isUserVip"
      @close="handleCoinInsufficientClose" @success="handleMembershipPurchaseSuccess" />

    <!-- 责任声明弹窗 -->
    <WatermarkDisclaimerModal v-model="showWatermarkDisclaimer" @confirm="handleWatermarkDisclaimerConfirm"
      @cancel="handleWatermarkDisclaimerCancel" @no-remind-change="handleWatermarkDisclaimerNoRemindChange" />

    <!-- 品牌水印弹窗 -->
    <BrandWatermarkModal v-model="showBrandWatermarkModal" :task-result-id="templateDetail?.id"
      :no-watermark-url="templateDetail?.noWatermarkUrl || ''"
      :image-url="templateDetail?.imageUrl || templateDetail?.imgUrl || ''" :file-url="templateDetail?.fileUrl || ''"
      :file-type="isVideoType(templateDetail) ? 2 : 1" @close="handleBrandWatermarkClose" />

    <!-- 图片预览 - 使用 Element Plus ImageViewer -->
    <el-image-viewer v-if="showImagePreview" :url-list="previewImageList" :initial-index="previewInitialIndex"
      :hide-on-click-modal="true" @close="handlePreviewClose" />
    <!-- 右侧缩略图列表 -->
    <div class="thumbnail-sidebar">
      <div ref="thumbnailList" class="thumbnail-list">
        <div v-for="(item, index) in relatedTemplates" :key="item.id" class="thumbnail-item"
          :class="{ active: selectedThumbnail === index }" @click="selectThumbnail(index, item)">
          <div class="thumbnail-image">
            <img :src="item.lessenImg || item.imgUrl || item.imageUrl" :alt="item.title" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Vue API 已自动导入
import { images } from '@/assets'
import { ElMessage, ElMessageBox, ElImageViewer } from 'element-plus'
import { CopyDocument, Bell, Delete, Loading } from '@element-plus/icons-vue'
import { creativeApi } from '@/api/creative'
import { assetApi } from '@/api/asset'
import { userApi } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { useTemplateStore } from '@/stores/template'
import { useWatermarkStore } from '@/stores/watermark'
import { watermarkDownloader } from '@/utils/WatermarkDownloader'
import type { CreativeTemplate } from '@/types'
import { copyToClipboard } from '@/utils/clipboard'

// Props 定义（支持弹窗模式）
interface Props {
  id?: string | number
  pageType?: string
  cateId?: string
  cateTitle?: string
  sourceTab?: string
  collectId?: string
  isCollect?: number
  // 是否是弹窗模式
  isModal?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  id: undefined,
  pageType: undefined,
  cateId: undefined,
  cateTitle: undefined,
  sourceTab: undefined,
  collectId: undefined,
  isCollect: undefined,
  isModal: false,
})

// Emits 定义
const emit = defineEmits<{
  close: []
  delete: [assetId: string | number]
  likeChanged: [detail: CreativeTemplate | null]
}>()

// 路由相关（仅在非弹窗模式使用）
const route = useRoute()
const router = useRouter()

// 用户store
const userStore = useUserStore()
const templateStore = useTemplateStore()
const watermarkStore = useWatermarkStore()

// 响应式数据
const templateDetail = ref<CreativeTemplate | null>(null)
const relatedTemplates = ref<CreativeTemplate[]>([])
const selectedThumbnail = ref(0)
const previousThumbnailIndex = ref(-1)
const thumbnailList = ref<HTMLElement>()
const mediaContainerRef = ref<HTMLElement>()
const mediaPlayerRefs = ref<any[]>([]) // MediaPlayer 组件引用数组
const cateTitleRef = ref('')
const showEditModal = ref(false) // 编辑图片弹窗显示状态
const showBrandWatermarkModal = ref(false) // 品牌水印弹窗显示状态
const showImagePreview = ref(false) // 图片预览显示状态
const previewImageList = ref<string[]>([]) // 预览图片列表
const previewInitialIndex = ref(0) // 预览初始索引
const showFeedbackModal = ref(false) // 反馈弹窗显示状态

// 去除水印相关状态
const removeWatermarkEnabled = computed(() => watermarkStore.removeWatermarkEnabled)
const showCoinInsufficient = ref(false) // 会员购买弹窗
const coinErrorType = ref('up_vip') // 错误类型
const showWatermarkDisclaimer = ref(false) // 责任声明弹窗
const isDownloading = ref(false) // 下载状态
const isUserVip = computed(() => userStore.userInfo?.isVip === 1)

// 购买会员成功后的待处理操作
type PendingAction = { type: 'download' } | { type: 'toggle' } | { type: 'brandWatermark' }
const pendingAfterVipAction = ref<PendingAction | null>(null)

// 页面类型：assets-我的资产详情 | template-创意模板详情 | like-我的喜欢详情
const pageTypeRef = ref<string>('template')
// 来源标签（用于 assets 页面，标识从哪个列表跳转过来）
const sourceTabRef = ref<string>('')
// 是否初始加载（用于控制滚动行为）
const isInitialLoad = ref(true)

const relatedPageParams = ref({
  current: 1,
  size: 20,
})

const hasMoreRelated = ref(true)
const loadingRelated = ref(false)
// 数据是否已初始化完成（用于避免初始渲染时的闪烁）
const isDataReady = ref(false)

// 解析 requestParam（资产详情返回的参数内容）
const requestParams = computed(() => {
  if (!templateDetail.value || !(templateDetail.value as any).requestParam) {
    return null
  }

  try {
    const requestParamStr = (templateDetail.value as any).requestParam
    if (typeof requestParamStr === 'string') {
      // 仅在需要时调试打印，避免频繁访问 computed 导致控制台刷屏
      // console.log('[TemplateDetail] requestParams:', JSON.parse(requestParamStr))
      return JSON.parse(requestParamStr)
    }
    return requestParamStr
  } catch (error) {
    console.warn('解析 requestParam 失败:', error)
    return null
  }
})

// 判断是否为穿戴饰物类型
const isWearAccessories = computed(() => {
  if (!templateDetail.value) return false
  const titleCode = (templateDetail.value as any).titleCode
  const titleName = (templateDetail.value as any).titleName
  return titleCode === 'wear_accessories' || titleName === '穿戴饰物'
})

// 判断是否为热门穿搭类型
const isPopularOutfit = computed(() => {
  if (!templateDetail.value) return false
  const titleCode = (templateDetail.value as any).titleCode
  const titleName = (templateDetail.value as any).titleName
  return titleCode === 'popular_outfits' || titleName === '热门穿搭'
})

// 判断是否为模特视频类型
const isModelVideo = computed(() => {
  if (!templateDetail.value) return false
  const titleCode = (templateDetail.value as any).titleCode
  const titleName = (templateDetail.value as any).titleName
  return titleCode === 'model_video' || titleName === '模特视频'
})

// 判断是否为面料创拍类型
const isFabricShoot = computed(() => {
  if (!templateDetail.value) return false
  const titleCode = (templateDetail.value as any).titleCode
  const titleName = (templateDetail.value as any).titleName
  return titleCode === 'fabric_create' || titleName === '面料创拍'
})

// 统一判断是否为视频类型（根据页面类型使用不同字段）
// 创意模板和做同款详情：使用 type 字段（type==0是视频，type==1是图片）
// 我的资产：使用 fileType 字段（fileType==1是图片，fileType==2是视频）
const isVideoType = (item: any): boolean => {
  if (!item) return false

  // 我的资产页面：使用 fileType 字段
  if (pageTypeRef.value === 'assets') {
    if (item.fileType !== undefined && item.fileType !== null) {
      return item.fileType === 2 // fileType === 2 表示视频
    }
    // 如果 fileType 不存在，根据是否有 fileUrl 判断（有 fileUrl 通常是视频）
    return !!item.fileUrl
  }

  // 创意模板和做同款详情：使用 type 字段
  // pageType 为 'template' 或 'like' 时使用 type
  if (item.type !== undefined && item.type !== null) {
    return item.type === 0 // type === 0 表示视频
  }

  // 兼容旧数据：如果没有 type，尝试使用 fileType
  if (item.fileType !== undefined && item.fileType !== null) {
    return item.fileType === 2
  }

  // 如果都没有，根据是否有 fileUrl 判断（有 fileUrl 通常是视频）
  return !!item.fileUrl
}

// 统一判断是否为图片类型
const isImageType = (item: any): boolean => {
  return !isVideoType(item)
}

// 模板的 imageSetList（用于显示具体内容）
const templateImageSetList = computed(() => {
  if (!templateDetail.value || !(templateDetail.value as any).imageSetList) {
    return []
  }
  const imageSetList = (templateDetail.value as any).imageSetList || []
  // 过滤出有 imgUrl 的项，并按 closeType 排序
  return imageSetList
    .filter((item: any) => item.imgUrl)
    .sort((a: any, b: any) => {
      // 按照 closeType 排序，确保显示顺序正确
      // 热门穿搭：上装(1) -> 下装(2) -> 连体衣(3)
      // 模特视频：单图(6) -> 首帧(4) -> 尾帧(5)
      // 穿戴饰物：单视角(7) -> 多视角一(8) -> 多视角二(9)
      return a.closeType - b.closeType
    })
})

// 穿戴饰物图（单视角或多视角，closeType: 7, 8, 9）
const wearAccessoriesImages = computed(() => {
  return templateImageSetList.value.filter(
    (item: any) => item.closeType === 7 || item.closeType === 8 || item.closeType === 9
  )
})

// 穿戴参考（materialLibraryType: 1）
const wearReferenceImages = computed(() => {
  if (!templateDetail.value || !(templateDetail.value as any).imageSetList) {
    return []
  }
  const imageSetList = (templateDetail.value as any).imageSetList || []
  return imageSetList.filter((item: any) => item.materialLibraryType === 1)
})

// 热门穿搭图（上装、下装、连体衣，closeType: 1, 2, 3）
const outfitImages = computed(() => {
  return templateImageSetList.value.filter(
    (item: any) => item.closeType === 1 || item.closeType === 2 || item.closeType === 3
  )
})

// 穿搭参考/模特场景（materialLibraryType: 0）
const sceneReferenceImages = computed(() => {
  if (!templateDetail.value || !(templateDetail.value as any).imageSetList) {
    return []
  }
  const imageSetList = (templateDetail.value as any).imageSetList || []
  return imageSetList.filter((item: any) => item.materialLibraryType === 0)
})

// 模特视频模式（单图或首尾帧）
const modelVideoMode = computed(() => {
  if (!isModelVideo.value || !templateDetail.value) return 'single'
  const imageSetList = (templateDetail.value as any).imageSetList || []
  const hasFirstFrame = imageSetList.some((item: any) => item.closeType === 4)
  const hasLastFrame = imageSetList.some((item: any) => item.closeType === 5)
  return hasFirstFrame || hasLastFrame ? 'firstLastFrame' : 'single'
})

// 模特视频单图（closeType: 6）
const modelVideoSingleImage = computed(() => {
  if (!isModelVideo.value || !templateDetail.value) return null
  const imageSetList = (templateDetail.value as any).imageSetList || []
  const found = imageSetList.find(
    (item: any) => item.closeType === 6 && (item.imgUrl || item.imageUrl)
  )
  if (!found) return null
  // 确保返回的对象有 imgUrl 字段
  return {
    ...found,
    imgUrl: found.lessenImg || found.imgUrl || found.imageUrl,
  }
})

// 模特视频首帧（closeType: 4）
const modelVideoFirstFrame = computed(() => {
  if (!isModelVideo.value || !templateDetail.value) return null
  const imageSetList = (templateDetail.value as any).imageSetList || []
  const found = imageSetList.find(
    (item: any) => item.closeType === 4 && (item.imgUrl || item.imageUrl)
  )
  if (!found) return null
  // 确保返回的对象有 imgUrl 字段
  return {
    ...found,
    imgUrl: found.lessenImg || found.imgUrl || found.imageUrl,
  }
})

// 模特视频尾帧（closeType: 5）
const modelVideoLastFrame = computed(() => {
  if (!isModelVideo.value || !templateDetail.value) return null
  const imageSetList = (templateDetail.value as any).imageSetList || []
  const found = imageSetList.find(
    (item: any) => item.closeType === 5 && (item.imgUrl || item.imageUrl)
  )
  if (!found) return null
  // 确保返回的对象有 imgUrl 字段
  return {
    ...found,
    imgUrl: found.lessenImg || found.imgUrl || found.imageUrl,
  }
})

// 穿搭调整标题（连体衣/上下装/上装图/下装图）
const outfitAdjustmentTitle = computed(() => {
  if (!requestParams.value) return ''
  const hasDress = !!requestParams.value.flatFrontDressUrl
  const hasUpper = !!requestParams.value.flatUpperFrontUrl
  const hasDown = !!requestParams.value.flatDownFrontUrl
  if (hasDress) return '连体衣'
  if (hasUpper && hasDown) return '上下装'
  if (hasUpper) return '上装图'
  if (hasDown) return '下装图'
  return ''
})

// 面料创拍创意描述（closeType: 0 的 imageSetDesc）
const fabricShootDescription = computed(() => {
  if (!isFabricShoot.value || !templateDetail.value) return ''
  const imageSetList = (templateDetail.value as any).imageSetList || []
  const fabricItem = imageSetList.find((item: any) => item.closeType === 0)
  return fabricItem?.imageSetDesc || ''
})

// 获取 imageSet 的标签文本
const getImageSetLabel = (closeType: number) => {
  const labelMap: Record<number, string> = {
    0: '面料创拍',
    1: '上装',
    2: '下装',
    3: '连体衣',
    4: '首帧',
    5: '尾帧',
    6: '图生视频',
    7: '单视角',
    8: '多视角一',
    9: '多视角二',
  }
  return labelMap[closeType] || '图片'
}

// 统一的创意描述文本（用于复制等功能）
const descriptionText = computed(() => {
  const params: any = requestParams.value
  if (!params) return ''

  // 优先使用 description / prompt / creativityDesc 字段
  if (params.description) return params.description
  if (params.prompt) return params.prompt
  if (params.creativityDesc) return params.creativityDesc

  // 其次尝试从 prompts 数组中拼接 value 字段
  if (Array.isArray(params.prompts)) {
    return params.prompts
      .map((item: any) => item?.value)
      .filter((v: any) => !!v)
      .join('\n')
  }

  return ''
})

// 获取创意描述文本（优先级：description > prompt > creativityDesc）
const creativeDescription = computed(() => {
  if (!requestParams.value) return ''
  return (
    requestParams.value.description ||
    requestParams.value.prompt ||
    requestParams.value.creativityDesc ||
    requestParams.value.productPrompt ||
    requestParams.value.creativeDescription ||
    ''
  )
})

// 将数字转换为中文大写数字
const numberToChinese = (num: number): string => {
  const chineseNumbers = ['', '一', '二', '三', '四']
  if (num >= 1 && num <= 4) {
    return chineseNumbers[num]
  }
  // 如果超过4，返回原数字（可以根据需要扩展）
  return String(num)
}

// 将日期格式转换为年月日格式（如：2025-12-05 -> 2025年12月05日）
const formatDateToChinese = (dateStr: string | null | undefined): string => {
  if (!dateStr) return ''
  // 处理 YYYY-MM-DD 格式
  const match = dateStr.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (match) {
    const [, year, month, day] = match
    return `${year}年${month.padStart(2, '0')}月${day.padStart(2, '0')}日`
  }
  // 如果格式不匹配，返回原字符串
  return dateStr
}

// 详情请求并发控制：
// - detailRequestToken: 每次发起详情请求递增，用于丢弃过期响应（用户快速切换缩略图时）
// - currentDetailTargetId: 当前“应该展示”的详情 id
const detailRequestToken = ref(0)
const currentDetailTargetId = ref<string | number | null>(null)

// 获取详情数据（根据 pageType 调用不同接口）
const loadTemplateDetail = async (
  templateId?: string | number,
  options?: { token?: number; expectedId?: string | number }
) => {
  const normalizeId = (v: any): string | number | null => {
    if (v == null) return null
    if (Array.isArray(v)) return v[0] ?? null
    return v
  }

  const id = normalizeId(templateId || props.id || route.params.id)
  if (!id) {
    // 弹窗模式下，如果没有ID，可能是组件刚创建时props还未传递，不立即关闭弹窗
    // 等待一个tick，如果还是没有ID，再关闭
    if (props.isModal) {
      await nextTick()
      const retryId = templateId || props.id || route.params.id
      if (!retryId) {
        ElMessage.error('ID不存在')
        emit('close')
      }
      return
    } else {
      ElMessage.error('ID不存在')
      router.back()
    }
    return
  }

  const expectedId = normalizeId(options?.expectedId ?? id) ?? id
  const token = options?.token

  try {
    const params: any = {
      id: String(id),
      userId: userStore.userInfo?.userId,
    }

    let response: any = { resp_code: -1 }

    switch (pageTypeRef.value) {
      case 'assets': // 我的资产详情
        console.log('[资产详情] 查询参数:', params)
        response = await assetApi.getTaskDetail(params)
        console.log('[资产详情] 查询结果:', response)
        if (response.resp_code === 0) {
          const assetData = response.datas || {}
          // 映射资产详情字段到页面使用的字段
          const updatedDetail = {
            ...assetData,
            imgUrl: assetData.imageUrl || assetData.imgUrl, // 映射 imageUrl 到 imgUrl
          }
          // 丢弃过期响应：token 不一致或当前目标 id 已变化
          if (
            (typeof token === 'number' && token !== detailRequestToken.value) ||
            (currentDetailTargetId.value != null &&
              String(currentDetailTargetId.value) !== String(expectedId))
          ) {
            return
          }

          templateDetail.value = updatedDetail

          // 同步更新 relatedTemplates 中对应项的数据（确保数据一致性）
          if (
            selectedThumbnail.value >= 0 &&
            selectedThumbnail.value < relatedTemplates.value.length &&
            String(relatedTemplates.value[selectedThumbnail.value]?.id) === String(id)
          ) {
            relatedTemplates.value[selectedThumbnail.value] = {
              ...relatedTemplates.value[selectedThumbnail.value],
              ...updatedDetail,
            }
          }

          // 只有成功回写到 UI 后，才认为该 id “已加载”
          lastLoadedDetailId.value = expectedId
        }
        break

      case 'template': // 创意模板详情
      case 'like': // 我的喜欢详情
        console.log('[模板详情] 查询参数:', params)
        response = await creativeApi.getCreativeTemplateDetail(params)
        console.log('[模板详情] 查询结果:', response)
        if (response.resp_code === 0) {
          const updatedDetail = response.datas || {}
          // 丢弃过期响应：token 不一致或当前目标 id 已变化
          if (
            (typeof token === 'number' && token !== detailRequestToken.value) ||
            (currentDetailTargetId.value != null &&
              String(currentDetailTargetId.value) !== String(expectedId))
          ) {
            return
          }

          templateDetail.value = updatedDetail

          // 同步更新 relatedTemplates 中对应项的数据（确保数据一致性）
          if (
            selectedThumbnail.value >= 0 &&
            selectedThumbnail.value < relatedTemplates.value.length &&
            String(relatedTemplates.value[selectedThumbnail.value]?.id) === String(id)
          ) {
            relatedTemplates.value[selectedThumbnail.value] = {
              ...relatedTemplates.value[selectedThumbnail.value],
              ...updatedDetail,
            }
          }

          // 只有成功回写到 UI 后，才认为该 id “已加载”
          lastLoadedDetailId.value = expectedId
        }
        break
    }

    if (response.resp_code !== 0) {
      ElMessage.error(response.resp_msg || '获取详情失败')
    }
  } catch (error) {
    console.error('获取详情失败:', error)
    ElMessage.error('获取详情失败')
  }
}

// 获取相关模板/资产（统一加载逻辑）
const loadRelatedTemplates = async (isRefresh = false) => {
  if (loadingRelated.value) return

  if (isRefresh) {
    relatedPageParams.value.current = 1
    relatedTemplates.value = []
    hasMoreRelated.value = true
  }

  try {
    loadingRelated.value = true

    if (pageTypeRef.value === 'assets') {
      // assets 页面：加载相关资产
      const userId = userStore.userInfo?.userId
      if (!userId) {
        return
      }

      // 根据来源标签决定加载什么数据
      const params: any = {
        userId: String(userId),
        size: relatedPageParams.value.size,
        current: relatedPageParams.value.current,
      }

      // 根据来源标签对照接口字段获取对应的接口参数
      // 来源标签：all, image, video, favorite（兼容：images, videos, favorites）
      const sourceTabMap: Record<string, { isCollect?: number; fileType?: number }> = {
        favorite: { isCollect: 1 },
        favorites: { isCollect: 1 },
        image: { fileType: 1 },
        images: { fileType: 1 },
        video: { fileType: 2 },
        videos: { fileType: 2 },
        all: { isCollect: 0 }, // 全部列表：isCollect = 0 显示全部
      }

      const tabConfig = sourceTabMap[sourceTabRef.value]
      if (tabConfig) {
        Object.assign(params, tabConfig)
        // 如果详情有类型且没有设置 fileType，可以根据详情类型设置
        if (!tabConfig.fileType && templateDetail.value?.fileType) {
          params.fileType = templateDetail.value.fileType
        }
      } else if (templateDetail.value?.fileType) {
        // 如果没有来源标签，默认显示全部（isCollect = 0）并使用当前资产类型
        params.isCollect = 0
        params.fileType = templateDetail.value.fileType
      } else {
        // 如果既没有来源标签也没有详情类型，默认显示全部
        params.isCollect = 0
      }

      const response = await assetApi.getMyAssetsPage(params)

      if (response.resp_code === 0 && response.datas) {
        const { records, total } = response.datas

        // 处理数据，确保有 imgUrl 字段
        const processedRecords = records.map((item: any) => ({
          ...item,
          imgUrl: item.imageUrl || item.imgUrl,
        }))

        if (isRefresh) {
          // 先设置列表数据
          relatedTemplates.value = processedRecords

          // 尝试从缓存获取索引
          const cachedListData = templateStore.getTemplateListData()
          let currentIndex = -1

          // 如果缓存数据中有索引且列表数据匹配，优先使用缓存索引
          if (
            cachedListData &&
            cachedListData.currentIndex !== undefined &&
            cachedListData.currentIndex >= 0 &&
            cachedListData.list &&
            cachedListData.list.length > 0 &&
            cachedListData.list.length === processedRecords.length
          ) {
            // 检查缓存列表的第一个和最后一个ID是否匹配，如果匹配则使用缓存索引
            const firstMatches = cachedListData.list[0]?.id === processedRecords[0]?.id
            const lastMatches =
              cachedListData.list[cachedListData.list.length - 1]?.id ===
              processedRecords[processedRecords.length - 1]?.id
            if (firstMatches && lastMatches) {
              currentIndex = cachedListData.currentIndex
            }
          }

          // 如果缓存索引无效，通过ID查找
          if (currentIndex < 0) {
            const currentAssetId = templateDetail.value?.id
            currentIndex = processedRecords.findIndex((item: any) => item.id === currentAssetId)
          }

          if (currentIndex >= 0 && currentIndex < processedRecords.length) {
            // 当前资产在列表中，设置为选中并更新详情
            selectedThumbnail.value = currentIndex
            templateDetail.value = {
              ...processedRecords[currentIndex],
              ...templateDetail.value, // 保留详情接口返回的额外字段
            }
          } else {
            // 如果当前资产不在当前页，将其插入到列表开头并选中
            if (templateDetail.value) {
              const currentAsset = {
                ...templateDetail.value,
                imgUrl: templateDetail.value.imageUrl || templateDetail.value.imgUrl,
              }
              relatedTemplates.value = [currentAsset, ...processedRecords]
              selectedThumbnail.value = 0
            } else {
              // 如果没有详情数据，默认选中第一项
              if (processedRecords.length > 0) {
                selectedThumbnail.value = 0
                templateDetail.value = processedRecords[0] as CreativeTemplate
              }
            }
          }
        } else {
          relatedTemplates.value.push(...processedRecords)
        }

        // 根据总数和当前页数据判断是否还有更多数据
        const currentTotal = relatedTemplates.value.length
        hasMoreRelated.value = currentTotal < total
      }
    } else if (pageTypeRef.value === 'like') {
      // 我的喜欢页面：加载用户点赞的模板
      const userId = userStore.userInfo?.userId
      if (!userId) {
        return
      }

      const response = await userApi.getUserLikesPage({
        userId: String(userId),
        size: relatedPageParams.value.size,
        current: relatedPageParams.value.current,
      })

      if (response.resp_code === 0 && response.datas) {
        let { records, total } = response.datas

        // 处理数据格式，确保有正确的字段
        const processedRecords = records.map((item: any) => {
          // 如果返回的是点赞记录，需要提取模板信息
          if (item.creativeTemplate) {
            return {
              ...item.creativeTemplate,
              likeId: item.id, // 保留点赞记录ID
            }
          }
          return item
        })

        if (isRefresh) {
          // 找到当前模板在列表中的位置
          const currentTemplateId = templateDetail.value?.id
          let foundIndex = -1

          if (currentTemplateId) {
            foundIndex = processedRecords.findIndex(
              (item: any) =>
                item.id === currentTemplateId || item.creativeTemplate?.id === currentTemplateId
            )
          }

          if (foundIndex >= 0) {
            // 当前模板在列表中，使用列表数据并设置正确的索引
            relatedTemplates.value = processedRecords
            selectedThumbnail.value = foundIndex
            // 使用列表中的数据更新详情（确保数据一致）
            templateDetail.value = {
              ...processedRecords[foundIndex],
              ...templateDetail.value, // 保留详情接口返回的额外字段
            }
          } else {
            // 如果当前模板不在列表中，将其插入到列表开头并选中
            if (templateDetail.value) {
              relatedTemplates.value = [templateDetail.value as any, ...processedRecords]
              selectedThumbnail.value = 0
            } else {
              // 如果没有详情数据，使用列表数据
              relatedTemplates.value = processedRecords
              if (processedRecords.length > 0) {
                selectedThumbnail.value = 0
                templateDetail.value = processedRecords[0] as CreativeTemplate
              }
            }
          }
        } else {
          relatedTemplates.value.push(...processedRecords)
        }

        // 根据总数和当前页数据判断是否还有更多数据
        const currentTotal = relatedTemplates.value.length
        hasMoreRelated.value = currentTotal < total
      }
    } else {
      // 其他页面（template）：加载相关模板
      const cateId = props.cateId || (route.query.cateId as string)
      const response = await creativeApi.getCreativeTemplateList({
        titleId: cateId,
        userId: userStore.userInfo?.userId,
        size: relatedPageParams.value.size,
        current: relatedPageParams.value.current,
      })

      if (response.resp_code === 0) {
        let { records, total } = response.datas

        if (isRefresh) {
          // 找到当前模板在列表中的位置
          const currentTemplateId = templateDetail.value?.id
          let foundIndex = -1

          if (currentTemplateId) {
            foundIndex = records.findIndex((item: any) => item.id === currentTemplateId)
          }

          if (foundIndex >= 0) {
            // 当前模板在列表中，使用列表数据并设置正确的索引
            relatedTemplates.value = records
            selectedThumbnail.value = foundIndex
            // 使用列表中的数据更新详情（确保数据一致）
            templateDetail.value = {
              ...records[foundIndex],
              ...templateDetail.value, // 保留详情接口返回的额外字段
            }
          } else {
            // 如果当前模板不在列表中，将其插入到列表开头并选中
            if (templateDetail.value) {
              relatedTemplates.value = [templateDetail.value as any, ...records]
              selectedThumbnail.value = 0
            } else {
              // 如果没有详情数据，使用列表数据
              relatedTemplates.value = records
              if (records.length > 0) {
                selectedThumbnail.value = 0
                templateDetail.value = records[0] as CreativeTemplate
              }
            }
          }
        } else {
          relatedTemplates.value.push(...records)
        }

        // 根据总数和当前页数据判断是否还有更多数据
        const currentTotal = relatedTemplates.value.length
        hasMoreRelated.value = currentTotal < total
      }
    }
  } catch (error) {
    console.error('获取相关数据失败:', error)
  } finally {
    loadingRelated.value = false
  }
}

// 加载更多相关模板
const loadMoreRelated = async () => {
  if (!hasMoreRelated.value || loadingRelated.value) return

  relatedPageParams.value.current++
  await loadRelatedTemplates(false)
}

// 设置 MediaPlayer ref
const setMediaPlayerRef = (el: any, index: number) => {
  if (el) {
    mediaPlayerRefs.value[index] = el
  }
}

// 选择缩略图
const selectThumbnail = async (index: number, template: CreativeTemplate) => {
  // 设置标志：表示是用户主动点击触发的（必须在最开始设置，防止滚动事件提前触发）
  isUserClickingThumbnail.value = true
  // 取消滚动停顿触发的详情请求，避免“刚滚动完 + 立刻点击”产生多次详情请求
  clearScrollDetailTimer()

  // 验证索引有效性
  if (index < 0 || index >= relatedTemplates.value.length) {
    console.warn('[selectThumbnail] 无效的索引:', index, '列表长度:', relatedTemplates.value.length)
    isUserClickingThumbnail.value = false
    return
  }

  // 如果上一个选中的是视频，先暂停视频播放
  if (
    previousThumbnailIndex.value >= 0 &&
    previousThumbnailIndex.value < relatedTemplates.value.length
  ) {
    const previousTemplate = relatedTemplates.value[previousThumbnailIndex.value]
    if (isVideoType(previousTemplate)) {
      // 如果是视频类型，暂停播放
      const previousPlayer = mediaPlayerRefs.value[previousThumbnailIndex.value]
      if (previousPlayer && typeof previousPlayer.pause === 'function') {
        previousPlayer.pause()
      }
    }
  }

  // 更新当前选中的缩略图
  selectedThumbnail.value = index

  // 使用 relatedTemplates 中的数据更新显示（确保数据一致性）
  const currentTemplate = relatedTemplates.value[index]
  if (currentTemplate) {
    // 立即使用列表数据更新显示，确保页面不会空白
    templateDetail.value = { ...currentTemplate }
    // 更新 previousThumbnailIndex，确保后续逻辑正确
    previousThumbnailIndex.value = index
  } else {
    // 如果列表中没有数据，使用传入的 template 作为兜底
    templateDetail.value = template
    previousThumbnailIndex.value = index
    console.warn('[selectThumbnail] 列表中没有找到对应索引的数据，使用传入的 template')
  }

  // 立即调用详情接口获取完整数据（不等待滚动完成）
  if (currentTemplate?.id) {
    // 异步加载详情，不阻塞滚动
    loadDetailOnce(currentTemplate.id).catch((err) => {
      console.error('[selectThumbnail] 加载详情失败:', err)
      // 即使加载失败，也要确保页面显示基本数据
      if (!templateDetail.value) {
        templateDetail.value = currentTemplate || template
      }
    })
  }

  // 使用 requestAnimationFrame 确保标志已经生效，然后再触发滚动
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 双重 requestAnimationFrame 确保在下一个渲染周期执行
      syncMediaContainerToSelected()

      // 滚动完成后，延迟重置标志（确保所有滚动事件处理完成）
      // 根据滚动距离计算延迟时间：每个项大约需要 100-200ms，从第1个到第5个需要更多时间
      const scrollDistance = Math.abs(index - (previousThumbnailIndex.value || 0))
      const delay = Math.max(500, scrollDistance * 150) // 每个项150ms，最少500ms

      setTimeout(() => {
        // 延迟重置标志，确保滚动事件处理完成
        isUserClickingThumbnail.value = false
        console.log('[缩略图点击] 标志已重置，允许滚动触发详情加载')
      }, delay)
    })
  })

  console.log('缩略图切换:', {
    from: previousThumbnailIndex.value,
    to: index,
    currentTemplate: currentTemplate || template,
    templateType: isVideoType(currentTemplate || template) ? '视频' : '图片',
  })
}

// 返回上一页
const handleBack = () => {
  if (props.isModal) {
    emit('close')
  } else {
    router.back()
  }
}

// 复制描述
const copyDescription = async (text?: string) => {
  const textToCopy = text || descriptionText.value
  if (!textToCopy) {
    ElMessage.warning('暂无可复制的描述')
    return
  }
  const success = await copyToClipboard(textToCopy)
  if (success) {
    ElMessage.success('复制成功')
  } else {
    ElMessage.error('复制失败，请重试')
  }
}

// 复制面料创拍描述
const copyFabricShootDescription = async () => {
  if (!fabricShootDescription.value) {
    ElMessage.warning('暂无可复制的描述')
    return
  }
  const success = await copyToClipboard(fabricShootDescription.value)
  if (success) {
    ElMessage.success('复制成功')
  } else {
    ElMessage.error('复制失败，请重试')
  }
}

// 一键同款 - 统一跳转到 same_style 页面,根据 taskType 显示不同内容
const handleOneClick = () => {
  // 检查登录状态
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    if (props.isModal) {
      emit('close')
    }
    router.push('/login')
    return
  }

  if (!templateDetail.value) return

  // 获取任务类型（从 titleCode 获取）
  const taskType = templateDetail.value.titleCode

  // 弹窗模式下，先关闭弹窗再跳转
  if (props.isModal) {
    emit('close')
  }

  // 通过 Generate 容器层路由跳转，确保资产状态正确传递
  // 直接传递 templateId 和 taskType，SameStyle 页面会调用详情接口获取最新数据
  router.push({
    name: 'Generate',
    params: {
      module: 'same-style',
    },
    query: {
      id: String(templateDetail.value.id),
      taskType: taskType || '',
    },
  })
}

// 编辑图片 - 显示编辑弹窗
const handleEditImage = () => {
  if (!templateDetail.value) return
  showEditModal.value = true
}

// 打开品牌水印弹窗（非会员弹出会员购买，与无水印下载流程一致）
const handleBrandWatermark = async () => {
  if (!templateDetail.value) return

  // 先刷新一次用户信息，防止会员已过期/刚开通状态不一致
  await refreshUserInfoIfPossible()

  // 非会员：拦截并弹出会员购买弹窗
  if (!isUserVip.value) {
    // 记录购买成功后的待处理动作：回到品牌水印弹窗
    pendingAfterVipAction.value = { type: 'brandWatermark' }
    coinErrorType.value = 'up_vip'
    showCoinInsufficient.value = true
    return
  }

  // 会员：正常打开品牌水印弹窗
  showBrandWatermarkModal.value = true
}

// 关闭品牌水印弹窗
const handleBrandWatermarkClose = () => {
  showBrandWatermarkModal.value = false
}

// 图片预览 - 点击图片放大预览
const handleImagePreview = (index: number, item: any) => {
  // 只有图片类型才支持预览
  if (isVideoType(item)) {
    return // 视频不预览
  }

  // 获取当前图片URL
  const imageUrl = item.imageUrl || item.imgUrl || item.fileUrl
  if (!imageUrl) {
    ElMessage.warning('图片地址不存在')
    return
  }

  // 收集所有图片类型的URL用于预览列表
  const imageUrls = relatedTemplates.value
    .filter((t) => isImageType(t)) // 只包含图片类型
    .map((t) => t.imageUrl || t.imgUrl || t.fileUrl)
    .filter((url) => url) // 过滤空值

  // 如果当前图片不在列表中，添加到列表开头
  const currentIndex = imageUrls.findIndex((url) => url === imageUrl)
  if (currentIndex === -1) {
    imageUrls.unshift(imageUrl)
    previewInitialIndex.value = 0
  } else {
    previewInitialIndex.value = currentIndex
  }

  previewImageList.value = imageUrls
  showImagePreview.value = true
}

// 关闭预览
const handlePreviewClose = () => {
  showImagePreview.value = false
  previewImageList.value = []
  previewInitialIndex.value = 0
}

// 编辑确认 - 直接调用指令改图接口并跳转到统一的立即生成页面
const handleEditConfirm = async (data: { description: string; imageUrl: string }) => {
  try {
    const editDescription = data.description?.trim()
    if (!editDescription) {
      ElMessage.warning('请输入编辑描述')
      return
    }

    // 解析后的原始请求参数（资产详情中的 requestParam）
    const params: any = requestParams.value
    if (!params) {
      ElMessage.warning('原始参数不存在，无法编辑')
      return
    }

    // 实际使用的图片地址：优先用高清图，其次回退到弹窗传入的 imageUrl
    const actualImageUrl =
      (templateDetail.value as any)?.imageUrl ||
      (templateDetail.value as any)?.imgUrl ||
      data.imageUrl ||
      ''

    if (!actualImageUrl) {
      ElMessage.warning('暂无可编辑的图片')
      return
    }

    // 构建与移动端 uniapp 一致的指令改图请求参数
    const requestData: any = {
      userId: userStore.userInfo?.userId || 0,
      algorithmId: params.algorithmId || 0,
      algorithmCode: params.algorithmCode || '',
      count: params.count || 1,
      quality: params.quality || '',
      aspectRatio: params.aspectRatio || '',
      paramIds: params.paramIds || [],
      imageUrl: actualImageUrl,
      creativityDesc: editDescription,
    }

    // 如果当前详情来源于“我的资产”，且编辑的是历史图片，则补充 historyParams
    if (pageTypeRef.value === 'assets' && templateDetail.value?.id && actualImageUrl) {
      requestData.historyParams = [
        {
          taskResultId: templateDetail.value.id,
          type: 'imageUrl',
          url: actualImageUrl,
        },
      ]
    }

    console.log('[编辑图片] 指令改图请求参数:', requestData)

    const res = await creativeApi.imageEdit(requestData)

    if (res.resp_code === 0) {
      // 关闭本地编辑弹窗
      showEditModal.value = false
      // 弹窗模式下同步关闭外层弹窗
      if (props.isModal) {
        emit('close')
      }

      // 跳转到统一的 Generate 容器层的 AI 图片模块，查看生成结果
      // 传递 taskId 和 imageUrl，用于回显图片并开始轮询任务结果
      router.push({
        name: 'Generate',
        params: {
          module: 'image',
        },
        query: {
          taskId: res.datas, // 任务ID，用于开始轮询
          imageUrl: actualImageUrl, // 图片URL，用于回显
          fromEdit: 'true', // 标记来源，用于区分是编辑跳转
        },
      })
    } else if (res.resp_code === 1) {
      // 处理潮币不足或需要升级VIP
      const errorType = res.resp_msg
      if (errorType === 'coin_deficiency' || errorType === 'up_vip') {
        // 显示潮币不足弹窗
        coinErrorType.value = errorType
        showCoinInsufficient.value = true
      } else {
        ElMessage.error(res.resp_msg || '提交失败，请重试')
      }
    } else {
      ElMessage.error(res.resp_msg || '提交失败，请重试')
    }
  } catch (error) {
    console.error('[编辑图片] 指令改图提交失败:', error)
    ElMessage.error('网络异常，请重试')
  }
}

// 生成视频
const handleGenerateVideo = () => {
  if (!templateDetail.value) return

  // 获取图片URL（优先使用高清图）
  const imageUrl = templateDetail.value.imageUrl || templateDetail.value.imgUrl

  console.log('[生成视频] 跳转到AI视频模块，图片URL:', imageUrl)

  // 弹窗模式下，先关闭弹窗再跳转
  if (props.isModal) {
    emit('close')
  }

  // 通过 Generate 容器层跳转到 AI 视频模块，
  // 确保左侧模块 + 右侧资产面板都在同一页面中
  router.push({
    name: 'Generate',
    params: {
      module: 'video',
    },
    query: {
      // 供 VideoGeneration 页面回显主图
      imageUrl,
      // 供 Generate 容器层在资产列表中高亮当前资产
      fromAssetId: templateDetail.value.id,
    },
  })
}

// 刷新用户信息（用于下载前检查会员状态）
const refreshUserInfoIfPossible = async () => {
  const phone = userStore.userInfo?.phone
  if (!phone) return
  try {
    await userStore.getUserInfo(phone)
  } catch (e) {
    console.warn('[TemplateDetail] 刷新用户信息失败（忽略，继续走本地状态）:', e)
  }
}

// 确保资产有 noWatermarkUrl（如果没有则调用接口获取）
const ensureNoWatermarkUrlForAsset = async (asset: any): Promise<string | null> => {
  if (asset?.noWatermarkUrl) {
    return asset.noWatermarkUrl
  }

  try {
    const userId = userStore.userInfo?.userId
    if (!userId) {
      console.warn('[TemplateDetail] 用户ID不存在，无法获取无水印URL')
      return null
    }

    const taskResultId = asset?.id || templateDetail.value?.id
    if (!taskResultId) {
      console.warn('[TemplateDetail] 资产ID不存在，无法获取无水印URL')
      return null
    }

    const res = await creativeApi.findAlgorithmResulList({
      taskResultIds: [String(taskResultId)],
      userId: String(userId),
    })

    if (res.resp_code === 0 && res.datas) {
      const list: any[] =
        (Array.isArray(res.datas) ? res.datas : null) ||
        (Array.isArray(res.datas?.records) ? res.datas.records : null) ||
        (Array.isArray(res.datas?.list) ? res.datas.list : null) ||
        (Array.isArray(res.datas?.datas) ? res.datas.datas : null) ||
        []
      const hit = list.find((it) => String(it?.id) === String(taskResultId)) || list[0]
      const fetchedNoWatermarkUrl = hit?.noWatermarkUrl

      if (fetchedNoWatermarkUrl) {
        // 更新内存中的数据
        if (templateDetail.value) {
          ; (templateDetail.value as any).noWatermarkUrl = fetchedNoWatermarkUrl
        }
        if (
          selectedThumbnail.value >= 0 &&
          selectedThumbnail.value < relatedTemplates.value.length
        ) {
          ; (relatedTemplates.value[selectedThumbnail.value] as any).noWatermarkUrl =
            fetchedNoWatermarkUrl
        }
        return fetchedNoWatermarkUrl
      }
    }
  } catch (e) {
    console.warn('[TemplateDetail] 获取 noWatermarkUrl 失败:', e)
  }
  return null
}

// 处理下载菜单命令
const handleDownloadCommand = (command: string) => {
  if (command === 'download') {
    handleDownload()
  } else if (command === 'toggle-watermark') {
    // 点击整个按钮区域时切换开关状态
    handleWatermarkToggleChange(!removeWatermarkEnabled.value)
  }
}

// 处理下载菜单显示/隐藏
const handleDownloadMenuVisible = (_visible: boolean) => {
  // 菜单显示时可以做一些处理
}

// 处理去除水印开关变化
const handleWatermarkToggleChange = (val: string | number | boolean) => {
  const enabled = val === true || val === 1 || val === '1' || val === 'true'
  // 如果不是会员，打开会员购买弹窗
  if (!isUserVip.value) {
    pendingAfterVipAction.value = { type: 'toggle' }
    showCoinInsufficient.value = true
    coinErrorType.value = 'up_vip'
    watermarkStore.setRemoveWatermarkEnabled(false)
    return
  }

  // 如果是会员，检查是否需要显示责任声明
  const noRemind = localStorage.getItem('watermark_disclaimer_no_remind') === 'true'
  if (!noRemind && enabled) {
    // 显示责任声明弹窗
    pendingAfterVipAction.value = { type: 'toggle' }
    showWatermarkDisclaimer.value = true
    watermarkStore.setRemoveWatermarkEnabled(false)
    return
  }

  // 更新状态
  watermarkStore.setRemoveWatermarkEnabled(enabled)
}

// 处理会员购买弹窗关闭
const handleCoinInsufficientClose = () => {
  showCoinInsufficient.value = false
  pendingAfterVipAction.value = null
}

// 处理会员购买成功
const handleMembershipPurchaseSuccess = async () => {
  showCoinInsufficient.value = false
  // 刷新用户信息
  await refreshUserInfoIfPossible()
  // 继续之前的操作
  if (pendingAfterVipAction.value) {
    if (pendingAfterVipAction.value.type === 'download') {
      pendingAfterVipAction.value = null
      handleDownload()
    } else if (pendingAfterVipAction.value.type === 'toggle') {
      pendingAfterVipAction.value = null
      // 检查是否需要显示责任声明
      const noRemind = localStorage.getItem('watermark_disclaimer_no_remind') === 'true'
      if (!noRemind) {
        showWatermarkDisclaimer.value = true
      } else {
        watermarkStore.setRemoveWatermarkEnabled(true)
      }
    } else if (pendingAfterVipAction.value.type === 'brandWatermark') {
      // 品牌水印入口购买成功后，自动打开品牌水印弹窗
      pendingAfterVipAction.value = null
      showBrandWatermarkModal.value = true
    }
  }
}

// 处理责任声明确认
const handleWatermarkDisclaimerConfirm = () => {
  showWatermarkDisclaimer.value = false
  watermarkStore.setRemoveWatermarkEnabled(true)
  // 如果之前有待处理的下载操作，继续执行
  if (pendingAfterVipAction.value?.type === 'download') {
    pendingAfterVipAction.value = null
    handleDownload()
  } else if (pendingAfterVipAction.value?.type === 'toggle') {
    pendingAfterVipAction.value = null
  }
}

// 处理责任声明取消
const handleWatermarkDisclaimerCancel = () => {
  showWatermarkDisclaimer.value = false
  watermarkStore.setRemoveWatermarkEnabled(false)
  pendingAfterVipAction.value = null
}

// 处理不再弹窗提醒变化
const handleWatermarkDisclaimerNoRemindChange = (noRemind: boolean) => {
  localStorage.setItem('watermark_disclaimer_no_remind', noRemind ? 'true' : 'false')
}

// 下载/保存资产（参考资产列表的下载逻辑）
const handleDownload = async () => {
  if (!templateDetail.value) return

  if (isDownloading.value) return // 防止重复点击

  try {
    isDownloading.value = true
    // 优先使用当前选中项的数据（因为 MediaPlayer 使用的是 relatedTemplates 中的数据）
    // 如果 relatedTemplates 中有数据，优先使用；否则使用 templateDetail
    const currentItem =
      selectedThumbnail.value >= 0 && selectedThumbnail.value < relatedTemplates.value.length
        ? relatedTemplates.value[selectedThumbnail.value]
        : templateDetail.value

    // 根据文件类型选择下载 URL（与资产列表逻辑一致）
    const isVideo = isVideoType(currentItem)

    // 详情页去除水印逻辑（仅资产详情生效）：
    const wantRemoveWatermark = removeWatermarkEnabled.value

    // 若用户尝试无水印下载：先刷新用户信息再判断是否会员/是否已过期
    if (wantRemoveWatermark) {
      await refreshUserInfoIfPossible()
      if (!isUserVip.value) {
        // 非会员/已过期：拦截无水印下载，提示开通会员
        pendingAfterVipAction.value = { type: 'download' }
        showCoinInsufficient.value = true
        coinErrorType.value = 'up_vip'
        ElMessage.warning('仅会员可去除水印，请开通会员')
        return
      }
    }

    let downloadUrl = isVideo ? currentItem.fileUrl : currentItem.imageUrl || currentItem.imgUrl

    // 如果需要去除水印，尝试获取 noWatermarkUrl
    if (pageTypeRef.value === 'assets' && wantRemoveWatermark && isUserVip.value) {
      const noWatermarkUrl = await ensureNoWatermarkUrlForAsset(currentItem)
      if (noWatermarkUrl) {
        downloadUrl = noWatermarkUrl
      }
    }

    console.log('[handleDownload] 下载信息:', {
      isVideo,
      selectedThumbnail: selectedThumbnail.value,
      currentItem,
      fileUrl: currentItem.fileUrl,
      imageUrl: currentItem.imageUrl,
      imgUrl: currentItem.imgUrl,
      downloadUrl,
      templateDetailFileUrl: templateDetail.value.fileUrl,
      relatedTemplatesLength: relatedTemplates.value.length,
    })

    if (!downloadUrl) {
      ElMessage.warning('文件地址无效')
      return
    }

    // 文件名生成（与资产列表逻辑一致）
    const filePrefix = 'chaotuishou'
    const namePart =
      currentItem?.prompt ||
      currentItem?.title ||
      currentItem?.name ||
      templateDetail.value?.prompt ||
      templateDetail.value?.title ||
      templateDetail.value?.name ||
      (isVideo ? 'video' : 'image')

    // 文件扩展名：视频 mp4，图片 png（与资产列表逻辑一致）
    const fileExtension = isVideo ? 'mp4' : 'png'

    try {
      await watermarkDownloader.download(downloadUrl, {
        filename: `${filePrefix}_${namePart}_${Date.now()}.${fileExtension}`,
        silent: false,
      })
    } catch (err) {
      console.warn('[下载] 跨域或网络限制，使用跳转方式下载', err)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.target = '_blank'
      link.rel = 'noopener'
      link.download = `${filePrefix}_${namePart}_${Date.now()}.${fileExtension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      ElMessage.info('已为你打开新标签页进行下载')
    }
  } catch (error) {
    console.error('[下载] 失败:', error)
    ElMessage.error('下载失败，请重试')
  } finally {
    isDownloading.value = false
  }
}

// 右侧滚动监听
const handleThumbnailScroll = (event: Event) => {
  const target = event.target as HTMLElement
  const { scrollTop, scrollHeight, clientHeight } = target

  // 当滚动到底部附近时加载更多
  if (scrollHeight - scrollTop - clientHeight < 100) {
    loadMoreRelated()
  }
}

// 标志：是否是用户主动点击缩略图触发的滚动（此时不应在滚动事件中加载详情）
const isUserClickingThumbnail = ref(false)

// 滚动触发的详情加载定时器（避免滚动过程频繁请求）
let scrollDetailTimer: number | undefined
const clearScrollDetailTimer = () => {
  if (scrollDetailTimer) {
    clearTimeout(scrollDetailTimer)
    scrollDetailTimer = undefined
  }
}

// 已加载的详情 ID，避免同一项重复请求
const lastLoadedDetailId = ref<string | number | null>(null)
// 当前正在请求中的详情 ID（同一 ID 的并发请求直接跳过）
const inFlightDetailId = ref<string | number | null>(null)

const loadDetailOnce = async (id?: string | number) => {
  if (!id) return
  // 只要 id 相同且已成功回写过，就不重复请求
  if (lastLoadedDetailId.value != null && String(lastLoadedDetailId.value) === String(id)) return
  // 同一 id 正在请求中，直接跳过（避免滚动 + 点击触发重复请求）
  if (inFlightDetailId.value != null && String(inFlightDetailId.value) === String(id)) return

  // 设置当前目标 id，用于丢弃过期响应
  currentDetailTargetId.value = id
  const token = ++detailRequestToken.value
  inFlightDetailId.value = id
  try {
    await loadTemplateDetail(id, { token, expectedId: id })
  } finally {
    // 只清理由本次请求设置的 inFlight（防止快速切换时误清空）
    if (inFlightDetailId.value != null && String(inFlightDetailId.value) === String(id)) {
      inFlightDetailId.value = null
    }
  }
}

// 左侧媒体容器滚动监听 - 同步选中项和右侧缩略图
const handleMediaContainerScroll = async (event: Event) => {
  // 每次滚动先清理待触发的详情请求
  clearScrollDetailTimer()

  // 如果是用户点击缩略图触发的滚动
  if (isUserClickingThumbnail.value) {
    const target = event.target as HTMLElement
    if (!target || relatedTemplates.value.length === 0) return

    const { scrollTop, clientHeight } = target
    const itemHeight = clientHeight
    const currentIndex = Math.floor(scrollTop / itemHeight)
    const validIndex = Math.max(0, Math.min(currentIndex, relatedTemplates.value.length - 1))
    // 关键：点击触发的平滑滚动过程中，不要用“滚动中的临时 index”覆盖详情展示
    // 否则会出现：缩略图已选中第2个，但滚动经过第1个时把详情刷回第1个（错位）

    // 只有当滚动到目标位置时，才调用详情接口
    if (validIndex === selectedThumbnail.value && validIndex < relatedTemplates.value.length) {
      const targetTemplate = relatedTemplates.value[validIndex]
      // 调用详情接口获取完整数据（如果还没有加载过）
      if (lastLoadedDetailId.value !== targetTemplate.id) {
        await loadDetailOnce(targetTemplate.id)
      }
    }

    // 同步右侧缩略图滚动
    const scrollPercentage =
      relatedTemplates.value.length > 1 ? validIndex / (relatedTemplates.value.length - 1) : 0
    syncRightThumbnailScroll(scrollPercentage)

    return // 直接返回，不执行后续的详情加载逻辑
  }

  const target = event.target as HTMLElement
  if (!target || relatedTemplates.value.length === 0) return

  const { scrollTop, clientHeight } = target

  // 每个媒体项占据完整的视口高度（100vh = clientHeight）
  const itemHeight = clientHeight

  // 根据滚动位置计算当前应该选中的项（向下取整，因为 scroll-snap 会对齐到开始位置）
  const currentIndex = Math.floor(scrollTop / itemHeight)

  // 确保索引在有效范围内
  const validIndex = Math.max(0, Math.min(currentIndex, relatedTemplates.value.length - 1))

  // 如果索引发生变化，更新选中项并处理视频播放
  if (validIndex !== selectedThumbnail.value && validIndex < relatedTemplates.value.length) {
    const previousIndex = selectedThumbnail.value
    const currentTemplate = relatedTemplates.value[validIndex]
    const previousTemplate =
      previousIndex >= 0 && previousIndex < relatedTemplates.value.length
        ? relatedTemplates.value[previousIndex]
        : null

    // 如果上一个选中的是视频，暂停播放
    if (previousTemplate && isVideoType(previousTemplate)) {
      const previousPlayer = mediaPlayerRefs.value[previousIndex]
      if (previousPlayer && typeof previousPlayer.pause === 'function') {
        previousPlayer.pause()
      }
    }

    // 更新选中项
    selectedThumbnail.value = validIndex
    previousThumbnailIndex.value = validIndex

    // 滚动过程中优先使用列表数据展示（确保数据一致性）
    templateDetail.value = { ...currentTemplate }

    // 滚动停顿后再加载选中项详情，避免滚动过程频繁请求
    if (currentTemplate.id) {
      scrollDetailTimer = window.setTimeout(async () => {
        await loadDetailOnce(currentTemplate.id)
      }, 200)
    }

    // 如果当前选中的是视频，自动播放
    if (isVideoType(currentTemplate)) {
      nextTick(() => {
        const currentPlayer = mediaPlayerRefs.value[validIndex]
        if (currentPlayer && typeof currentPlayer.play === 'function') {
          currentPlayer.play()
        }
      })
    }
  }

  // 计算滚动百分比用于同步右侧缩略图
  const scrollPercentage =
    relatedTemplates.value.length > 1 ? validIndex / (relatedTemplates.value.length - 1) : 0

  // 同步右侧缩略图滚动
  syncRightThumbnailScroll(scrollPercentage)
}

// 同步右侧缩略图滚动
const syncRightThumbnailScroll = (scrollPercentage: number) => {
  if (!thumbnailList.value) return

  const { scrollHeight, clientHeight } = thumbnailList.value
  const maxScroll = scrollHeight - clientHeight

  if (maxScroll > 0) {
    const targetScrollTop = maxScroll * scrollPercentage
    thumbnailList.value.scrollTop = targetScrollTop
  }
}

// 同步左侧滚动位置到选中项
const syncMediaContainerToSelected = (instant = false) => {
  if (!mediaContainerRef.value || relatedTemplates.value.length === 0) return

  const container = mediaContainerRef.value
  const { clientHeight } = container

  // 每个媒体项占据完整的视口高度（100vh = clientHeight）
  const itemHeight = clientHeight

  // 根据选中索引计算目标滚动位置（每个项的开始位置）
  const targetScrollTop = selectedThumbnail.value * itemHeight

  // 初始加载时使用立即滚动，避免看到滚动过程
  container.scrollTo({
    top: targetScrollTop,
    behavior: instant ? 'auto' : 'smooth',
  })

  console.log('滚动到选中项:', {
    index: selectedThumbnail.value,
    itemHeight,
    targetScrollTop,
    containerHeight: clientHeight,
    instant,
  })
}

// 切换喜欢状态（用于template和like页面）
const handleLikeToggle = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  if (!templateDetail.value) return

  try {
    const isLiking = !templateDetail.value.isLike
    const userId = userStore.userInfo?.userId
    if (!userId) {
      ElMessage.warning('请先登录')
      return
    }

    // 获取当前的点赞数和 likeId
    const currentUseLikes = templateDetail.value.useLikes || 0
    const currentLikeId = templateDetail.value.likeId

    const params: any = {
      userId,
      creativeTemplateId: templateDetail.value.id,
      useLikes: currentUseLikes, // 传递当前的点赞数
    }

    // 如果存在 likeId，总是传递（取消喜欢时需要）
    if (currentLikeId) {
      params.likeId = currentLikeId
    }

    const response = await userApi.userLikes(params)
    if (response.resp_code === 0) {
      // 更新点赞状态
      templateDetail.value.isLike = isLiking ? 1 : 0
      // 更新点赞数
      templateDetail.value.useLikes = currentUseLikes + (isLiking ? 1 : -1)

      // 更新 likeId
      if (isLiking && response.datas?.likeId) {
        templateDetail.value.likeId = response.datas.likeId
      } else if (!isLiking) {
        templateDetail.value.likeId = null
      }

      ElMessage.success(isLiking ? '喜欢成功' : '取消喜欢')

      // 如果是弹窗模式，通知父组件更新列表状态
      if (props.isModal) {
        emit('likeChanged', templateDetail.value)
      }
    } else {
      ElMessage.error(response.resp_msg || '网络开小差了~，请稍后再试')
    }
  } catch (error) {
    console.error('喜欢操作失败:', error)
    ElMessage.error('网络开小差了~，请稍后再试')
  }
}

// 资产收藏操作（用于assets页面）
const handleAssetsCollect = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }
  if (!templateDetail.value) return

  try {
    const isCollecting = !templateDetail.value.isCollect
    const userId = userStore.userInfo?.userId
    if (!userId) {
      ElMessage.warning('请先登录')
      return
    }
    const params: any = {
      userId,
    }

    if (isCollecting) {
      params.dataIds = [templateDetail.value.id]
    } else {
      if (templateDetail.value.collectId) {
        params.collectIds = [templateDetail.value.collectId]
      } else {
        ElMessage.error('收藏信息丢失')
        return
      }
    }

    const response = await assetApi.batchCollect(params)
    if (response.resp_code === 0) {
      templateDetail.value.isCollect = isCollecting ? 1 : 0
      templateDetail.value.collectId = response.datas?.collectIds?.[0] || null
      ElMessage.success(isCollecting ? '收藏成功' : '取消收藏')
    } else {
      ElMessage.error(response.resp_msg || '网络开小差了~，请稍后再试')
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    ElMessage.error('网络开小差了~，请稍后再试')
  }
}

// 更多菜单命令处理
const handleMoreCommand = (command: string) => {
  switch (command) {
    case 'report':
      handleReport()
      break
    case 'delete':
      handleDelete()
      break
  }
}

// 举报处理
const handleReport = () => {
  showFeedbackModal.value = true
}

// 反馈提交成功回调
const handleFeedbackSuccess = () => {
  // 反馈提交成功后的处理（如果需要刷新数据等）
  console.log('反馈提交成功')
}

// 删除处理（仅资产页面可用）
const handleDelete = async () => {
  if (pageTypeRef.value !== 'assets') {
    ElMessage.warning('只有我的资产页面可以删除')
    return
  }

  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  if (!templateDetail.value) {
    ElMessage.warning('数据不存在')
    return
  }

  try {
    const userId = userStore.userInfo?.userId
    if (!userId) {
      ElMessage.warning('请先登录')
      return
    }

    // 确认删除
    await ElMessageBox.confirm('确定要删除这个资产吗？删除后无法恢复。', '确认删除', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    const params = {
      taskResultIds: [templateDetail.value.id],
      userId,
    }

    const response = await assetApi.batchDelete(params)
    if (response.resp_code === 0) {
      ElMessage.success('删除成功')
      const deletedAssetId = templateDetail.value.id
      // 触发 delete 事件，通知父组件更新列表
      emit('delete', deletedAssetId)
      // 返回上一页
      if (props.isModal) {
        emit('close')
      } else {
        router.back()
      }
    } else {
      ElMessage.error(response.resp_msg || '删除失败')
    }
  } catch (error: any) {
    // 用户取消删除
    if (error === 'cancel') {
      return
    }
    console.error('删除操作失败:', error)
    ElMessage.error('网络开小差了~，请稍后再试')
  }
}

// 组件挂载
onMounted(async () => {
  // 获取页面类型参数（优先使用 props，否则使用路由参数）
  pageTypeRef.value = props.pageType || (route.query.pageType as string) || 'template'
  cateTitleRef.value = props.cateTitle || (route.query.cateTitle as string) || ''
  sourceTabRef.value = props.sourceTab || (route.query.sourceTab as string) || ''

  console.log(
    '[详情页] pageType:',
    pageTypeRef.value,
    'sourceTab:',
    sourceTabRef.value,
    'isModal:',
    props.isModal
  )

  // 对于我的资产页面，如果从列表传过来了收藏状态，先设置（接口返回后会覆盖）
  if (pageTypeRef.value === 'assets') {
    const collectId = props.collectId || (route.query.collectId as string)
    const isCollect =
      props.isCollect !== undefined
        ? props.isCollect
        : route.query.isCollect
          ? Number(route.query.isCollect)
          : undefined
    if (collectId || isCollect !== undefined) {
      // 先初始化一个临时对象，避免后续访问 undefined
      if (!templateDetail.value) {
        templateDetail.value = {} as CreativeTemplate
      }
      if (collectId && templateDetail.value) {
        ; (templateDetail.value as any).collectId = collectId
      }
      if (isCollect !== undefined && templateDetail.value) {
        ; (templateDetail.value as any).isCollect = Number(isCollect)
      }
    }
  }

  // 尝试从store获取列表数据（如果是从列表页跳转过来的）
  const cachedListData = templateStore.getTemplateListData()
  const cateIdFromRoute = props.cateId || (route.query.cateId as string)
  const shouldUseCachedData =
    cachedListData &&
    cachedListData.pageType === pageTypeRef.value &&
    (pageTypeRef.value !== 'template' || cachedListData.cateId === cateIdFromRoute) &&
    (pageTypeRef.value !== 'assets' || cachedListData.sourceTab === sourceTabRef.value)

  if (shouldUseCachedData && cachedListData.list && cachedListData.list.length > 0) {
    const templateId = props.id || route.params.id
    console.log('[详情页] 使用缓存数据:', {
      listLength: cachedListData.list.length,
      currentIndex: cachedListData.currentIndex,
      templateId: templateId,
    })

    // 先找到当前项目在列表中的位置（在设置列表之前）
    let foundIndex: number

    if (cachedListData.currentIndex !== undefined && cachedListData.currentIndex >= 0) {
      // 优先使用缓存的索引（最准确）
      foundIndex = cachedListData.currentIndex
      console.log('[详情页] 使用缓存索引:', foundIndex)
    } else {
      // 如果没有缓存索引，通过ID查找（支持多种ID格式）
      foundIndex = cachedListData.list.findIndex((item: any) => {
        const itemTemplateId = item.creativeTemplateId || item.creativeTemplate?.id || item.id
        return (
          String(item.id) === String(templateId) ||
          String(item.creativeTemplateId) === String(templateId) ||
          String(item.creativeTemplate?.id) === String(templateId) ||
          String(itemTemplateId) === String(templateId)
        )
      })
      console.log('[详情页] 通过ID查找索引:', foundIndex, 'templateId:', templateId)
    }

    // 验证索引是否在有效范围内
    if (foundIndex >= 0 && foundIndex < cachedListData.list.length) {
      // 直接使用缓存数据中对应索引的项作为详情数据
      const selectedItem = cachedListData.list[foundIndex]

      // 处理嵌套的 creativeTemplate 结构（做同款数据是嵌套的）
      const processedList = cachedListData.list.map((item: any) => {
        // 如果数据嵌套在 creativeTemplate 中，提取出来
        if (item.creativeTemplate) {
          return {
            ...item.creativeTemplate,
            // 保留一些外层字段（likeId 和 useLikes 可能在外层）
            taskId: item.taskId,
            taskUuid: item.taskUuid,
            // 如果外层的 likeId 或 useLikes 存在，优先使用外层值（覆盖内层值）
            likeId: item.likeId || item.creativeTemplate?.likeId,
            useLikes: item.useLikes !== undefined ? item.useLikes : item.creativeTemplate?.useLikes,
            // creativeTemplateId 也在外层
            creativeTemplateId: item.creativeTemplateId || item.creativeTemplate?.id,
          }
        }
        return item
      })

      // 先设置选中索引（必须在设置列表之前）
      selectedThumbnail.value = foundIndex
      // 使用处理后的列表数据初始化详情（列表数据已经包含足够的信息）
      templateDetail.value = processedList[foundIndex] as CreativeTemplate
      // 然后设置处理后的列表数据（此时 selectedThumbnail 已经是正确的值）
      relatedTemplates.value = processedList as any[]

      console.log('[详情页] 设置选中索引:', foundIndex, 'itemId:', selectedItem.id)

      // 等待 DOM 更新完成，并设置滚动位置
      await nextTick()

      // 设置滚动位置，确保显示正确的项目
      if (mediaContainerRef.value && relatedTemplates.value.length > 0) {
        await new Promise((resolve) => requestAnimationFrame(resolve))
        const container = mediaContainerRef.value
        // 可能在等待期间组件已卸载或弹窗已关闭，此时直接返回
        if (!container) return
        const itemHeight = container.clientHeight
        const targetScrollTop = selectedThumbnail.value * itemHeight
        container.scrollTop = targetScrollTop
      }

      // 标记数据已准备好，可以显示内容
      isDataReady.value = true

      // 最后调用详情接口获取完整数据（如果有模板ID的话）
      // 注意：这会覆盖 templateDetail.value，但由于用户已经看到正确的数据，不会感到闪烁
      // 对于"做同款"数据，需要使用 creativeTemplateId，而不是任务ID
      const templateId =
        selectedItem.creativeTemplateId || selectedItem.creativeTemplate?.id || selectedItem.id
      if (templateId) {
        await loadTemplateDetail(templateId)
      }
    } else {
      console.warn('[详情页] 索引无效，使用路由ID加载详情:', {
        foundIndex,
        listLength: cachedListData.list.length,
        routeId: route.params.id,
      })
      // 如果索引无效，使用路由参数ID加载详情
      await loadTemplateDetail()
      if (templateDetail.value) {
        relatedTemplates.value = [templateDetail.value as any]
        selectedThumbnail.value = 0
        isDataReady.value = true
      }
    }
  } else {
    // 没有缓存数据，先加载详情数据（优先显示详情内容）
    await loadTemplateDetail()
    // 没有缓存数据，先显示当前详情
    if (templateDetail.value) {
      relatedTemplates.value = [templateDetail.value as any]
      selectedThumbnail.value = 0
      isDataReady.value = true
    }

    // 延迟加载相关列表数据（不阻塞详情显示，使用 nextTick 确保详情先渲染）
    nextTick(() => {
      // 异步加载相关列表，不阻塞当前渲染
      loadRelatedTemplates(true).then(() => {
        // loadRelatedTemplates 内部已经处理了选中逻辑，这里只需要确保滚动位置正确
        // 不需要再次查找和设置，避免覆盖 loadRelatedTemplates 中的正确逻辑
      })
    })
  }

  // 初始进入详情页时，直接设置滚动位置（在渲染前设置，避免看到滚动过程）
  if (relatedTemplates.value.length > 0 && mediaContainerRef.value) {
    // 等待 DOM 渲染完成
    await nextTick()
    // 再等待一帧，确保容器高度已计算
    await new Promise((resolve) => requestAnimationFrame(resolve))

    // 直接设置 scrollTop，不使用 scrollTo（避免任何动画）
    const container = mediaContainerRef.value
    // 在等待期间，组件可能被销毁或弹窗关闭，此时不再操作 DOM
    if (!container) return
    const itemHeight = container.clientHeight
    const targetScrollTop = selectedThumbnail.value * itemHeight
    container.scrollTop = targetScrollTop

    // 同步右侧缩略图滚动位置
    const scrollPercentage =
      relatedTemplates.value.length > 1
        ? selectedThumbnail.value / (relatedTemplates.value.length - 1)
        : 0
    syncRightThumbnailScroll(scrollPercentage)

    // 初始加载完成后，恢复平滑滚动（用于后续用户操作）
    nextTick(() => {
      isInitialLoad.value = false
    })
  }

  // 如果第一个项是视频，自动播放
  nextTick(() => {
    if (relatedTemplates.value.length > 0) {
      const firstItem = relatedTemplates.value[selectedThumbnail.value]
      if (firstItem && isVideoType(firstItem)) {
        // 如果是视频类型，自动播放
        const currentPlayer = mediaPlayerRefs.value[selectedThumbnail.value]
        if (currentPlayer && typeof currentPlayer.play === 'function') {
          currentPlayer.play()
        }
      }
    }
  })

  // 初始化上一个缩略图索引
  previousThumbnailIndex.value = selectedThumbnail.value

  // 添加滚动监听
  nextTick(() => {
    const thumbnailListElement = thumbnailList.value
    if (thumbnailListElement) {
      thumbnailListElement.addEventListener('scroll', handleThumbnailScroll)
    }

    // 添加左侧媒体容器滚动监听
    const mediaContainerElement = mediaContainerRef.value
    if (mediaContainerElement) {
      mediaContainerElement.addEventListener('scroll', handleMediaContainerScroll)
    }
  })
})

// 组件卸载时移除监听
onUnmounted(() => {
  const thumbnailListElement = thumbnailList.value
  if (thumbnailListElement) {
    thumbnailListElement.removeEventListener('scroll', handleThumbnailScroll)
  }

  const mediaContainerElement = mediaContainerRef.value
  if (mediaContainerElement) {
    mediaContainerElement.removeEventListener('scroll', handleMediaContainerScroll)
  }

  // 清理滚动详情定时器
  clearScrollDetailTimer()
})
</script>

<style lang="scss" scoped>
.template-detail-page {
  display: flex;
  height: 100vh;
  background-color: var(--primary-dark);
  color: var(--text-primary);
  position: relative;

  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;

    .media-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 100%;
      gap: var(--spacing-md);
      background: var(--primary-dark);
      padding: 0;
      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
      scroll-snap-type: y mandatory;
      scroll-behavior: smooth;

      // assets 页面：不滚动
      .back-button {
        position: fixed;
        top: 43px;
        left: 21px;
        width: 36px;
        height: 36px;
        background: var(--primary-dark) !important;
        border: none;
        border-radius: var(--radius-md);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;
        pointer-events: auto;

        &:hover {
          background: var(--bg-secondary) !important;
          color: var(--primary-hover);
        }

        &:focus {
          color: var(--primary-hover);
        }

        &:active {
          color: var(--primary-hover);
        }
      }

      // 媒体滚动容器
      .media-scroll-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0;
        min-height: 100%;
      }

      // 可滚动，每个item占满一屏
      .media-item {
        width: 100%;
        height: 100vh;
        min-height: 100vh;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        scroll-snap-align: start;
        scroll-snap-stop: always;
        position: relative;
        padding-top: 60px;
        box-sizing: border-box;
      }

      .media-player {
        position: relative;
        width: 100%;
        flex: 1;
        min-height: 0; // 允许 flex 子元素缩小
        overflow: hidden;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;

        // 左侧媒体区域加载中背景改为纯黑
        :deep(.lazy-image-wrapper) {
          background-color: #000000;
        }

        // 懒加载 loading 蒙层改为纯黑，并去掉高亮闪动
        :deep(.lazy-image-loading) {
          background-color: #000000 !important;

          &::after {
            display: none;
          }
        }

        .video-player {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
        }
      }

      .image-display {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        .main-image {
          max-width: 100%;
          object-fit: contain;
          border-radius: var(--radius-lg);
        }
      }

      .content-notice {
        padding: 21px 0 25px;
        text-align: center;
        font-size: var(--font-sm);
        color: var(--text-six);
        flex-shrink: 0;
      }
    }

    // 中间板块
    .info-panel {
      width: 286px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      padding: 43px 20px 39px;
      position: relative;
      background: var(--bg-secondary);

      .detail-loading-overlay {
        position: absolute;
        left: 20px;
        right: 20px;
        top: 92px; // 约等于顶部 actions + margin
        z-index: 2;
        pointer-events: none;
      }

      .detail-loading {
        min-height: 240px;
        border-radius: var(--radius-md);
        background: rgba(63, 56, 71, 0.18);
        padding: 16px 12px;
        margin-bottom: 16px;
      }

      .detail-loading-icon {
        font-size: 18px;
        color: var(--text-six);
      }

      .detail-loading-text {
        margin-top: 8px;
        margin-bottom: 10px;
        font-size: var(--font-sm);
        color: var(--text-six);
      }

      .detail-loading-skeleton {
        --el-skeleton-color: rgba(255, 255, 255, 0.08);
        --el-skeleton-to-color: rgba(255, 255, 255, 0.14);
      }

      .info-actions {
        display: flex;
        align-items: start;
        justify-content: flex-end;
        gap: var(--spacing-sm);
        margin-bottom: 29px;

        .btn-icon {
          width: 24px;
          height: 24px;
          cursor: pointer;
        }

        .btn-icon-loading {
          width: 24px;
          height: 24px;
          font-size: 24px;
        }

        .btn-icon-wrapper {
          display: inline-block;
          cursor: pointer;
        }
      }

      // 标题
      .section-title,
      .section-label {
        font-size: var(--font-md);
        color: var(--text-third);
        font-weight: normal;
      }

      .section-title {
        margin-bottom: var(--spacing-s);
      }

      .copy-icon {
        cursor: pointer;
      }

      .video-thumb-row {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        flex-wrap: wrap;
        margin-bottom: var(--spacing-lg);

        img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: var(--radius-md);
        }

        .btn {
          margin: 0 5px 5px 0;
          background: linear-gradient(90deg,
              rgba(204, 166, 244, 1) 0%,
              rgba(192, 126, 255, 1) 53%,
              rgba(204, 166, 244, 1) 99%);

          .skin-tone-code {
            width: 34px;
            height: 14px;
            border-radius: 4px;
          }
        }
      }
    }

    .creative-description {
      margin-bottom: var(--spacing-lg);

      .description-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: var(--spacing-s) 0;

        .copy {
          width: 12px;
          height: 12px;
        }
      }

      .description-text {
        font-size: var(--font-md);
        line-height: 23px;
        color: var(--text-primary);
        word-break: break-word;
        white-space: pre-wrap;
        -webkit-user-select: text;
        user-select: text;
      }

      .description-bar {
        padding: 0 var(--spacing-md);
      }
    }

    .tag-row {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
      margin-top: var(--spacing-s);

      .tag {
        padding: 6px;
        line-height: 1;
        border-radius: 4px;
        background-color: rgba(63, 56, 71, 0.31);
        color: var(--text-tag);
        font-size: var(--font-md);
        border: 1px solid rgba(216, 180, 254, 0.3);
      }
    }

    .use-count {
      font-size: 8px;
      color: var(--text-tag);
      margin-top: 5px;
    }
  }

  .action-section {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
    margin-top: auto;

    .action-item {
      width: 100%;
      display: flex;
      flex-direction: column;

      .action-icon {
        height: 19px;
        width: auto;
        object-fit: contain;
        margin-right: var(--spacing-xs);
      }

      .brand-watermark-icon {
        width: 22px;
        height: 22px;
      }
    }
  }

  .action-item-content {
    display: flex;
    gap: var(--spacing-sm);
  }

  // 会员专属功能按钮（右上角显示会员标识）
  .vip-feature-btn {
    position: relative;

    .el-button.el-button--primary.el-button--large {
      width: 100%;
    }

    .vip-badge {
      position: absolute;
      top: -9px;
      right: -10px;
      width: 19px;
      height: 19px;
      object-fit: contain;
      pointer-events: none;
    }
  }

  .thumbnail-sidebar {
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .thumbnail-list {
    flex: 1;
    overflow-y: auto;
    padding: 43px 9px;
    background-color: var(--bg-card);
  }

  .thumbnail-item {
    display: flex;
    gap: var(--spacing-sm);
    border-radius: var(--radius-md);
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: var(--spacing-sm);

    &.active {
      border-color: var(--primary-color);
    }
  }

  .thumbnail-image {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}

// 提升详情页内下拉菜单在弹窗中的层级，避免被对话框遮挡
:deep(.template-detail-download-popper) {
  z-index: 11050 !important;
}

// “更多”菜单使用默认 popper class，这里统一提高层级（仅作用于详情页内）
:deep(.el-dropdown__popper) {
  &.template-detail-more-popper {
    z-index: 11050 !important;
  }
}
</style>
