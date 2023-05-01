<?
require_once 'connect.php';
require_once 'lkw.php';
require_once '../dosql/mysql-1.0.php';

if (!is_file('./version')) {
	// 创建版本表
	$sqlComm = "CREATE TABLE IF NOT EXISTS smanga.version (
				`versionId` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '版本记录',
				`versionDescribe` VARCHAR(255) NULL DEFAULT NULL COMMENT '版本描述',
				`version` varchar(255) NULL DEFAULT NULL COMMENT 'version number',
				`createTime` datetime(0) NULL DEFAULT NULL COMMENT 'createTime',
				`updateTime` datetime(0) NULL DEFAULT NULL COMMENT 'updateTime',
				PRIMARY KEY (`versionId`) USING BTREE,
				UNIQUE INDEX `version`(`version`) USING BTREE
			)";
	// echo $sqlComm;
	$link->query($sqlComm);

	$sqlRes = dosql(['table' => 'version']);

	$vers = [];

	for ($i = 0; $i < count($sqlRes); $i++) {
		array_push($vers, $sqlRes[$i]['version']);
	}

	// 314
	if (array_search('3.1.4', $vers) === false) {
		$link->query("ALTER TABLE compress MODIFY COLUMN compressType enum('zip','rar','pdf','image','7z')");
		dosql([
			'table' => 'version',
			'type' => 'insert',
			'field' => ['version', 'versionDescribe', 'createTime', 'updateTime'],
			'value' => ['3.1.4', '添加7z,修复shell参数', '2023-2-28 8:32:00', 'now()']
		]);
	}

	// 315
	if (array_search('3.1.5', $vers) === false) {
		dosql([
			'table' => 'version',
			'type' => 'insert',
			'field' => ['version', 'versionDescribe', 'createTime', 'updateTime'],
			'value' => ['3.1.5', '条漫模式新增书签支持', '2023-3-4 14:57:00', 'now()']
		]);
	}

	// 316
	if (array_search('3.1.6', $vers) === false) {
		$link->query("ALTER TABLE user ADD `mediaLimit` varchar(255)");
		$link->query("ALTER TABLE user ADD `editMedia` int(1) DEFAULT 1");
		$link->query("ALTER TABLE user ADD `editUser` int(1) DEFAULT 1");
		dosql([
			'table' => 'version',
			'type' => 'insert',
			'field' => ['version', 'versionDescribe', 'createTime', 'updateTime'],
			'value' => ['3.1.6', '新增用户权限管理', '2023-3-5 18:05:00', 'now()']
		]);
	}

	// 317
	if (array_search('3.1.7', $vers) === false) {
		dosql([
			'table' => 'version',
			'type' => 'insert',
			'field' => ['version', 'versionDescribe', 'createTime', 'updateTime'],
			'value' => ['3.1.7', '外置sql设置错误问题', '2023-3-18 00:27:31', 'now()']
		]);
	}

	// 318
	if (array_search('3.1.8', $vers) === false) {
		dosql([
			'table' => 'version',
			'type' => 'insert',
			'field' => ['version', 'versionDescribe', 'createTime', 'updateTime'],
			'value' => ['3.1.8', '新增视图切换功能, 解决文字展示不全的问题.', '2023-4-1 13:23:08', 'now()']
		]);
	}

	// 319
	if (array_search('3.1.9', $vers) === false) {
		dosql([
			'table' => 'version',
			'type' => 'insert',
			'field' => ['version', 'versionDescribe', 'createTime', 'updateTime'],
			'value' => ['3.1.9', '新增排序方式切换功能.', '2023-4-1 23:33:43', 'now()']
		]);
	}

	// 320
	if (array_search('3.2.0', $vers) === false) {
		dosql([
			'table' => 'version',
			'type' => 'insert',
			'field' => ['version', 'versionDescribe', 'createTime', 'updateTime'],
			'value' => ['3.2.0', '新增搜索功能;处理扫描错误.', '2023-4-5 21:02:03', 'now()']
		]);
	}

	// 321
	if (array_search('3.2.1', $vers) === false) {
		// 创建个人设置表
		$sqlComm = "CREATE TABLE IF NOT EXISTS smanga.config (
				`configId` int(0) NOT NULL AUTO_INCREMENT COMMENT '设置项主键',
				`userId` int(0) NULL COMMENT '关联的用户id',
				`userName` varchar(255) NULL COMMENT '关联的用户名',
				`configValue` text NULL COMMENT '设置的详细内容 json打包',
				`createTime` datetime(0) NULL COMMENT '设置的创建时间',
				`updateTime` datetime(0) NULL COMMENT '设置的最近升级时间',
				PRIMARY KEY (`configId`),
				UNIQUE INDEX `id`(`userId`) USING BTREE COMMENT '用户id唯一'
			)";

		$link->query($sqlComm);

		dosql([
			'table' => 'version',
			'type' => 'insert',
			'field' => ['version', 'versionDescribe', 'createTime', 'updateTime'],
			'value' => ['3.2.1', '新增用户设置模块', '2023-4-22 18:12:57', 'now()']
		]);
	}

	// 322
	if (array_search('3.2.2', $vers) === false) {
		dosql([
			'table' => 'version',
			'type' => 'insert',
			'field' => ['version', 'versionDescribe', 'createTime', 'updateTime'],
			'value' => ['3.2.2', '修复缓存与排序的bug.', '2023-4-22 23:49:03', 'now()']
		]);
	}

	// 323
	if (array_search('3.2.3', $vers) === false) {
		// 创建个人设置表
		$sqlComm = "CREATE TABLE IF NOT EXISTS smanga.collect (
				`collectId` int(0) NOT NULL AUTO_INCREMENT COMMENT '收藏id',
				`collectType` varchar(255) NULL COMMENT '收藏类型',
				`userId` int(0) NOT NULL COMMENT '用户id',
				`mediaId` int(0) NULL COMMENT '媒体库id',
				`mangaId` int(0) NULL COMMENT '漫画id',
				`mangaName` varchar(255) NULL COMMENT '漫画名称',
				`chapterId` int(0) NULL COMMENT '章节id',
				`chapterName` varchar(255) NULL COMMENT '章节名称',
				`createTime` datetime(0) NULL COMMENT '收藏日期',
				PRIMARY KEY (`collectId`),
				UNIQUE INDEX `uManga`(`collectType`, `mangaId`) USING BTREE COMMENT '漫画id不允许重复',
				UNIQUE INDEX `uChapter`(`collectType`, `chapterId`) USING BTREE COMMENT '章节id不允许重复'
			)";

		$link->query($sqlComm);

		dosql([
			'table' => 'version',
			'type' => 'insert',
			'field' => ['version', 'versionDescribe', 'createTime', 'updateTime'],
			'value' => ['3.2.3', '新增收藏模块', '2023-4-24 23:36:57', 'now()']
		]);
	}


	// 324
	if (array_search('3.2.4', $vers) === false) {
		// 修改搜索表varchar字段 字符集为utf8mb4
		$link->query("
			ALTER TABLE `smanga`.`manga` 
			MODIFY COLUMN `mangaName` varchar(191) CHARACTER SET utf8mb4 NOT NULL COMMENT '漫画名称' AFTER `pathId`,
			MODIFY COLUMN `mangaPath` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '漫画路径' AFTER `mangaName`,
			MODIFY COLUMN `mangaCover` varchar(191) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '漫画封面' AFTER `mangaPath`;
		");

		$link->query("
			ALTER TABLE `smanga`.`chapter` 
			MODIFY COLUMN `chapterName` varchar(191) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '章节名称' AFTER `pathId`,
			MODIFY COLUMN `chapterPath` varchar(191) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '章节路径' AFTER `chapterName`,
			MODIFY COLUMN `chapterType` varchar(191) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '文件类型' AFTER `chapterPath`,
			MODIFY COLUMN `chapterCover` varchar(191) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '章节封面' AFTER `browseType`;
		");

		$link->query("
			ALTER TABLE `smanga`.`media` 
			MODIFY COLUMN `mediaName` varchar(191) CHARACTER SET utf8mb4 NOT NULL COMMENT '媒体库名称' AFTER `mediaId`,
			MODIFY COLUMN `mediaCover` varchar(191) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '媒体库封面' AFTER `mediaType`;
		");

		$link->query("
			ALTER TABLE `smanga`.`path` 
			MODIFY COLUMN `path` varchar(191) CHARACTER SET utf8mb4 NOT NULL COMMENT '路径' AFTER `mediaId`;
		");

		$link->query("
			ALTER TABLE `smanga`.`user` 
			MODIFY COLUMN `userName` varchar(191) CHARACTER SET utf8mb4 NOT NULL COMMENT '用户名' AFTER `userId`,
			MODIFY COLUMN `nickName` varchar(191) CHARACTER SET utf8mb4 NULL DEFAULT NULL COMMENT '昵称' AFTER `passWord`,
			MODIFY COLUMN `mediaLimit` varchar(191) CHARACTER SET utf8mb4 NULL DEFAULT NULL AFTER `updateTime`;
		");

		dosql([
			'table' => 'version',
			'type' => 'insert',
			'field' => ['version', 'versionDescribe', 'createTime', 'updateTime'],
			'value' => ['3.2.4', '适配表情文字', '2023-5-1 02:13:55', 'now()']
		]);
	}

	// 记录版本 代表初始化结束
	write_txt('./version', '3.2.4');

	exit_request([
		'code' => 0,
		'vers' => $vers,
		'message' => '初始化成功!'
	]);
} else {
	exit_request([
		'code' => 1,
		'vers' => $vers
	]);
}
