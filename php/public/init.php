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
		
		$sqlRes = dosql(['table'=>'version']);

		$vers = [];

		for ($i=0; $i < count($sqlRes); $i++) { 
			array_push($vers, $sqlRes[$i]['version']);
		}

		// 314
		if (array_search('3.1.4', $vers)===false) {
			$link->query("ALTER TABLE compress MODIFY COLUMN compressType enum('zip','rar','pdf','image','7z')");
			dosql([
				'table'=>'version',
				'type'=>'insert',
				'field'=>['version','versionDescribe','createTime','updateTime'],
				'value'=>['3.1.4','添加7z,修复shell参数','2023-2-28 8:32:00','now()']
			]);
		}

		// 315
		if (array_search('3.1.5', $vers)===false) {
			dosql([
				'table'=>'version',
				'type'=>'insert',
				'field'=>['version','versionDescribe','createTime','updateTime'],
				'value'=>['3.1.5','条漫模式新增书签支持','2023-3-4 14:57:00','now()']
			]);
		}

		// 316
		if (array_search('3.1.6', $vers)===false) {
			$link->query("ALTER TABLE user ADD `mediaLimit` varchar(255)");
			$link->query("ALTER TABLE user ADD `editMedia` int(1) DEFAULT 1");
			$link->query("ALTER TABLE user ADD `editUser` int(1) DEFAULT 1");
			dosql([
				'table'=>'version',
				'type'=>'insert',
				'field'=>['version','versionDescribe','createTime','updateTime'],
				'value'=>['3.1.6','新增用户权限管理','2023-3-5 18:05:00','now()']
			]);
		}

		// 317
		if (array_search('3.1.7', $vers)===false) {
			dosql([
				'table'=>'version',
				'type'=>'insert',
				'field'=>['version','versionDescribe','createTime','updateTime'],
				'value'=>['3.1.7','外置sql设置错误问题','2023-3-18 00:27:31','now()']
			]);
		} 
		
		// 318
		if (array_search('3.1.8', $vers)===false) {
			dosql([
				'table'=>'version',
				'type'=>'insert',
				'field'=>['version','versionDescribe','createTime','updateTime'],
				'value'=>['3.1.8','新增视图切换功能, 解决文字展示不全的问题.','2023-4-1 13:23:08','now()']
			]);
		} 

		// 319
		if (array_search('3.1.9', $vers)===false) {
			dosql([
				'table'=>'version',
				'type'=>'insert',
				'field'=>['version','versionDescribe','createTime','updateTime'],
				'value'=>['3.1.9','新增排序方式切换功能.','2023-4-1 23:33:43','now()']
			]);
		} 

		// 320
		if (array_search('3.2.0', $vers)===false) {
			dosql([
				'table'=>'version',
				'type'=>'insert',
				'field'=>['version','versionDescribe','createTime','updateTime'],
				'value'=>['3.2.0','新增搜索功能;处理扫描错误.','2023-4-5 21:02:03','now()']
			]);
		} 

		// 321
		if (array_search('3.2.1', $vers)===false) {
			// 创建版本表
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
				'table'=>'version',
				'type'=>'insert',
				'field'=>['version','versionDescribe','createTime','updateTime'],
				'value'=>['3.2.1','新增用户设置模块','2023-3-18 00:27:31','now()']
			]);
		} 

		// 记录版本 代表初始化结束
		write_txt('./version','3.2.1');

		exit_request([
				'code'=>0,
				'vers'=>$vers,
				'message'=>'初始化成功!'
			]);
	}else{
		exit_request([
				'code'=>1,
				'vers'=>$vers
			]);
	}
?>