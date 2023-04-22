<?php

/*

1.1 使用ini外置读取参数 支持外置数据库

php-mysql对js接口 by 太阳

传递post或get数据
ip 数据库的目标主机地址 ip或域名 默认为localhost
database 需要链接的数据库名称 默认为sunlight
username 数据库账号的用户名	默认root
password 数据库账号的密码 默认root
table 操作的表名	必填
type 需要执行的操作类型		默认select 		[insert,delete,select,update,search]
name 数组 需要查询的字段名	默认*	
field 数组 需新增或修改时的字段名 若type为insert,update,search 此参数为必填
value 数组 需新增或修改时的值 若type为insert,update,search 此参数为必填 大小与field对应
like 数组 where的条件 数组每一项为单独的条件 如'id=1'
limit int 查询限制 限制返回的记录条数
*start int 查询限制开始序号 设置limit从何处开始限制返回 不填为0
order 排序需求 设置排序的字段 如为true则排序
*desc bool 排序顺序 如为true则倒序 默认为false
keyword 搜索关键字 当type为search时 此参数必填



注释:
	:当参数名前带有缩进格式 说明此参数为二级或者更低级参数 需要做为上级参数的属性传递
*	:当参数名前带有*时 表示此参数作为前参数的附属 为加强或宽展前一参数的功能

注意:
1.当type为insert或update时
	需注意vlaue属性 如果想要传递需要php或者sql执行的函数 亦或是常量变量等参数
	需要将其函数名或变量名加入到 sqlKeyword(关键字数组) 使这个参数两侧不加单引号 让sql将其识别
	目前仅有 在sql中执行的 now()函数
 */
#声明关键字数组
$sqlKeyword = array('/now\(\)/i','/max\(.*\) as nearTime/i');

$configFile = "/config/config.ini";
if (!is_dir('/app/php')){
	$configFile = '/mnt/hhd-2t/04config/config.ini';
}

#初始化变量
$gIp = read_ini_copy('sql','ip',$configFile);
$gUserName = read_ini_copy('sql','userName',$configFile);
$gPassWord = read_ini_copy('sql','passWord',$configFile);
$gPort = read_ini_copy('sql','port',$configFile);

/***
 * 读取ini文件的数值
 * */
function read_ini_copy($title,$key,$file){
	$data = filesize($file)==0 ? [] : parse_ini_file($file,true);

	if (!$data[$title]) return false;
	if (!$data[$title][$key]) return false;

	return $data[$title][$key];
}

function dosql($params){
	global $gIp;
	global $gUserName;
	global $gPassWord;
	global $gDatabase;
	
	#输出所有错误信息
	error_reporting(E_ALL);
	ini_set('display_errors', '1');

	#将出错信息输出到一个文本文件
	ini_set('error_log', dirname(__FILE__) . '/mysql_error.txt');

	#设置默认值
	$ip = @getValue($params['ip'],$gIp);
	$username = @getValue($params['username'],$gUserName);
	$password = @getValue($params['password'],$gPassWord);
	$database = @getValue($params['database'],'smanga');
	$port = @getValue($params['port'],$gPort);
	$type = @getValue($params['type'],'select');
	$name = @getValue($params['name'],'*');
	$where = @getValue($params['where'],array());
	$group = @getValue($params['group'],'');
	$field = @getValue($params['field'],array());
	$value = @getValue($params['value'],array());
	$limit = @getValue($params['limit'],'');
	$start = @getValue($params['start'],'');
	$order = @getValue($params['order'],'');
	$desc = @getValue($params['desc'],'');
	$keyword = @getValue($params['keyword'],'');

	#链接mysql
	if (isset($params['link'])) {
		$link = $params['link'];
	}else{
		$link = @mysqli_connect($ip,$username,$password,$database,$port)
	or die("数据库连接失败！失败信息：".mysqli_connect_error($link));
	}
	

	#设置数据库
	// @mysqli_select_db($link,$database,);
	
	#设置数据编码
	mysqli_set_charset($link,'utf8') or die ("数据库编码集设置失败！");

	#获取数据表名。如获取失败，则返回错误
	if(isset($params['table'])){
		$table = $params['table'];
	}else{
		echo "表名(table)不能为空！";
		exit;
	}

	$where = to_array($where);
	$field = to_array($field);
	$value = to_array($value);
	$name = to_string($name);
	$table = to_string($table);

	#判别操作类型
	switch ($type) {
		case 'insert':
			$request = insert($link,$table,$field,$value);
			break;

		case 'delete':
			$request = delete($link,$table,$where);
			break;

		case 'select':
			$request = select($link,$name,$table,$where,$group,$order,$desc,$limit,$start);
			break;

		case 'update':
			$request = update($link,$table,$where,$field,$value);
			break;

		case 'search':
			$request = search($link,$name,$table,$where,$field,$keyword,$group,$order,$desc,$limit,$start);
			break;

		case 'getcount':
			$request = getcount($link,$table,$where,$group);
			break;

		case 'getnum':
			$request = getnum($link,$name,$table,$where,$group);
			break;
		
		case 'searchcount':
			$request = search_count($link,$name,$table,$where,$field,$keyword,$group,$order,$desc,$limit,$start);
			break;

		default:
			# code...
			break;
	}

	#返回数据
	return $request;

	#关闭数据库连接
	mysqli_close($link);

	#结束执行
	exit;
}



#查表操作
function select($link,$name,$table,$where,$group,$order,$desc,$limit,$start){
	#初始化所需变量
	$value = array();
	#附加条件
	$group = group($group);
	$order = order($order,$desc);
	$limit = limit($limit,$start);
	$where = where($where);	

	$sqlComm = "select $name from $table $where $group $order $limit;";
// echo $sqlComm;exit();
	$sql = mysqli_query($link,$sqlComm);

	if (!$sql) {
		return array();
	}

	$num = mysqli_num_rows($sql);

	#如果找不到数据则返回错误信息
	if($num===0) return array();

	#讲数据打包成数组
	while ($row = mysqli_fetch_array($sql,MYSQLI_ASSOC)){
		 array_push($value,$row);
	}

	return $value;
}

#新增记录
function insert($link,$table,$field,$value){
	#附加条件
	$field = field($field);
	$value = value($value);

	$sqlComm = "insert into $table (".$field.") values (".$value.");";#调试语句错误
// echo $sqlComm;
	return mysqli_query($link,$sqlComm);
}

#修改记录
function update($link,$table,$where,$field,$value){
	#附加条件
	$where = where($where);
	$modify = modify($field,$value);

	$sqlComm = "update $table set $modify $where;";#调试语句错误
// echo $sqlComm;
	return mysqli_query($link,$sqlComm);
}

#删除记录
function delete($link,$table,$where){
	#附加条件
	$where = where($where);

	$sqlComm = "delete from $table $where;";

	return mysqli_query($link,$sqlComm);
}

#搜索
function search($link,$name,$table,$where,$field,$keyword,$group,$order,$desc,$limit,$start){
	#初始化所需变量
	$value = array();
	#附加条件
	$order = order($order,$desc);
	$limit = limit($limit,$start);
	$where = where($where);
	$field = implode(',',$field);

	if($where!=''){
		$where = str_replace('where','and',$where);
	}
	if (!$keyword) {echo "关键字(keyword)不能为空！";exit;}

	// $keyword = mysqli_real_escape_string($link,$keyword);
	// $sqlComm = "select $name from $table where $field like '%$keyword%' $where $order $limit;";

	// #参数化查询命令
	$sqlComm = sprintf("select $name from $table where $field like '%s' $where $order $limit;",mysqli_real_escape_string($link,'%'.$keyword.'%'));
	// echo "$sqlComm";exit;
	#执行
	$sql = mysqli_query($link,$sqlComm);
	if (!$sql) {
		return array();
	}
	#获取记录数量
	$num = mysqli_num_rows($sql);
	#没有记录返回0
	if($num===0) return array();
	#讲数据打包成数组
	while ($row = mysqli_fetch_array($sql,MYSQLI_ASSOC)){
		 array_push($value,$row);
	}
	#共有多少条记录
	// $value['num'] = $num;

	return $value;
}

function search_count($link,$name,$table,$where,$field,$keyword,$group,$order,$desc,$limit,$start){
	#初始化所需变量
	$value = array();
	#附加条件
	$order = order($order,$desc);
	$limit = limit($limit,$start);
	$where = where($where);
	$field = implode(',',$field);

	if($where!=''){
		$where = str_replace('where','and',$where);
	}
	if (!$keyword) {echo "关键字(keyword)不能为空！";exit;}

	// #参数化查询命令
	$sqlComm = sprintf("select $name from $table where $field like '%s' $where;",mysqli_real_escape_string($link,'%'.$keyword.'%'));
	
	#执行
	$sql = mysqli_query($link,$sqlComm);
	if (!$sql) {
		return 0;
	}

	#获取记录数量
	$num = mysqli_num_rows($sql);
	
	#共有多少条记录
	return $num;
	#讲数据打包成数组
	while ($row = mysqli_fetch_array($sql,MYSQLI_ASSOC)){
		 array_push($value,$row);
	}

	return $value;
}

#获取记录数量
function getcount($link,$table,$where,$group){
	#附加条件
	$where = where($where);
	$group = group($group);

	$sqlComm = "select count(*) as count from $table $where $group;";
	$sql = mysqli_query($link,$sqlComm);

	while ($row = mysqli_fetch_array($sql,MYSQLI_ASSOC)){
		 return $row['count'];
	}
}

#获取记录数量
function getnum($link,$name,$table,$where,$group){
	#附加条件
	$where = where($where);
	$group = group($group);

	$sqlComm = "select $name from $table $where $group;";
	$sql = mysqli_query($link,$sqlComm);
	$num = mysqli_num_rows($sql);
	return $num;
}

// 分组
function group($group){
	return $group ? 'group by '.$group : '';
}


#设置查询排序方式
function order($order,$desc){
	$request = '';

	if($order){
		$request = "order by ".$order;	

		#排序正反顺序	
		if($desc) $request = $request." desc";
	}

	return $request;
}

#设置查询数量限制
function limit($limit,$start){
	$request = '';

	if($limit){
		// 加一个逗号
		if ($start || $start==0) $start = $start.',';
		
		$request = "limit $start $limit";
	}

	return $request;
}

#设置查询条件
function where($where){
	$request = '';

	if(count($where)){
		#拼接条件
		$request = 'where '.implode(' and ',$where);
	}

	return $request;
}

#拼接所需查询的字段
function field($field){
	$request = '';

	// 目标字段拼接
	if(count($field)){
		return implode(',',$field);
	}

	return $request;
}

#拼接需要新增的值
function value($value){
	$request = '';

	if (count($value)) {
		foreach ($value as $key => $val) {
			if (!is_keyword($val)) {
				$value[$key] = '\''.$val.'\'';
			}
		}

		$request = implode(',',$value);
	}

	return $request;
	
}

#判断是否为php sql关键字
function is_keyword($str){
	global $sqlKeyword;

	for ($i=0,$length=count($sqlKeyword); $i < $length; $i++) { 
		if(preg_match($sqlKeyword[$i],$str)) return true;
	}

	return false;
}

#拼接需要写改的值
function modify($field,$value){
	$sentence = Array();

	if (count($value)) {
		foreach ($value as $key => $val) {
			if (!is_keyword($val)) {
				$value[$key] = '\''.$val.'\'';
			}
		}
	}

	#拼接set语句
	if($field && $value){
		for($i=0,$length=count($field);$i<$length;$i++)
			array_push($sentence,$field[$i].' = '.$value[$i]);
	}else{
		echo "字段(field) 与 值(value)不能为空！";
		exit;
	}

	return implode(',',$sentence);
}

/**
 * 取默认值
 * @param  [type] $a [description]
 * @param  [type] $b [description]
 * @return [type]    [description]
 */
function getValue($a,$b){
	if(isset($a))
		return $a;
	else
		return $b;
}

function to_array($val){
	return is_string($val) ? explode(',',$val) : $val;
}

function to_string($val){
	return is_array($val) ? implode(',',$val) : $val;
}

?>