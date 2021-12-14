<?php

/*
php-mysql对js接口 by 太阳

传递post或get数据
ip 数据库的目标主机地址 ip或域名 默认为localhost
database 需要链接的数据库名称 默认为sunlight
username 数据库账号的用户名	默认root
password 数据库账号的密码 默认root
table 操作的表名	必填
type 需要执行的操作类型		默认select 		[insert,delete,select,update,search]

cond json类型 包含二级条件 根据操作类型不同而不同
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
	需要将其函数名或变量名加入到 keyword数组中(关键字数组) 使这个参数两侧不加单引号 让sql将其识别
	目前仅有 在sql中执行的 now()函数
 */

#输出所有错误信息
error_reporting(E_ALL);
ini_set('display_errors', '1');

#将出错信息输出到一个文本文件
ini_set('error_log', dirname(__FILE__) . '/mysql_error.txt');

#设置跨域
header('Access-Control-Allow-Origin:*');
header("content-type:text/html;charset=UTF-8");

#获取数据
if(!$_POST) $_POST=$_GET;

#设置默认值
$ip = @getValue($_POST['ip'],'localhost');
$username = @getValue($_POST['username'],'manga');
$password = @getValue($_POST['password'],'123qwe');
$database = @getValue($_POST['database'],'manga');
$type = @getValue($_POST['type'],'select');
$name = @getValue($_POST['name'],'*');
$cond = @getValue($_POST['cond'],array());

#声明关键字数组
$keyword = array('now()');

#链接mysql
$link = @mysql_connect($ip,$username,$password)or die("数据库链接错误");
#设置数据库
@mysql_select_db($database,$link);
#设置数据编码
mysql_query('set names utf8');

#获取数据表名。如获取失败，则返回错误
if(isset($_POST['table'])){
	$table = $_POST['table'];
}else{
	echo "表名(table)不能为空！";
	exit;
}


$cond = is_string($cond) ? json_decode($_POST['cond'],true) : $cond;

#参数格式化操作
format_parameter('field');
format_parameter('value');
format_parameter('like');

if(isset($cond['value'])&&is_string($cond['value'])) $cond['value'] = explode(',',$cond['value']);
if(isset($cond['like'])&&is_string($cond['like'])) $cond['like'] = explode(',',$cond['like']);

if(is_array($name)) $name = implode(',',$name);
if(is_array($table)) $name = implode(',',$table);

#判别操作类型
switch ($type) {
	case 'insert':
		$value = insert($table,$cond);
		break;

	case 'delete':
		$value = delete($table,$cond);
		break;

	case 'select':
		$value = select($name,$table,$cond);
		break;

	case 'update':
		$value = update($table,$cond);
		break;

	case 'search':
		$value = search($name,$table,$cond);
		break;

	case 'getnum':
		$value = getNum($name,$table,$cond);
		break;

	default:
		# code...
		break;
}

#返回数据
echo $value;

#关闭数据库连接
mysql_close($link);

#结束执行
exit;

#查表操作
function select($name,$table,$cond){
	#初始化所需变量
	$value = array();
	#附加条件
	$order = order($cond);
	$limit = limit($cond);
	$where = where($cond);	

	$sqlComm = "select $name from $table $where $order $limit;";
	$sql = mysql_query($sqlComm);
	$num = mysql_num_rows($sql);

	#如果找不到数据则返回错误信息
	if($num===0) return 0;
	#讲数据打包成数组
	while ($row = mysql_fetch_array($sql,MYSQL_ASSOC)){
		 array_push($value,$row);
	}
	#共有多少条记录
	// $value['num'] = $num;

	return json_encode($value);
}

#新增记录
function insert($table,$cond){
	#附加条件
	$field = field($cond);
	$value = implode(',',value($cond));

	$sqlComm = "insert into $table (".$field.") values (".$value.");";#调试语句错误

	return mysql_query($sqlComm);
}

#修改记录
function update($table,$cond){
	#附加条件
	$where = where($cond);
	$modify = modify($cond);

	$sqlComm = "update $table set $modify $where;";#调试语句错误

	mysql_query($sqlComm);

	return mysql_affected_rows();
}

#删除记录
function delete($table,$cond){
	#附加条件
	$where = where($cond);

	$sqlComm = "delete from $table $where;";

	mysql_query($sqlComm);

	return mysql_affected_rows();
}

#搜索
function search($name,$table,$cond){
	#初始化所需变量
	$value = array();
	#附加条件
	$order = order($cond);
	$limit = limit($cond);
	$where = where($cond);
	$content = @getValue($cond['content'],'content');
	if($where!=''){
		$where = str_replace('where','and',$where);
	}
	if (!isset($cond['keyword'])) {echo "关键字(keyword)不能为空！";exit;}

	$keyword = 	'%'.$cond['keyword'].'%';
	#参数化查询命令
	$sqlComm = sprintf("select $name from $table where $content like '%s' $where $order $limit;",mysql_real_escape_string('%'.$keyword.'%'));
	#执行
	$sql = mysql_query($sqlComm);
	#获取记录数量
	$num = mysql_num_rows($sql);
	#没有记录返回0
	if($num===0) return 0;
	#讲数据打包成数组
	while ($row = mysql_fetch_array($sql,MYSQL_ASSOC)){
		 array_push($value,$row);
	}
	#共有多少条记录
	// $value['num'] = $num;

	return json_encode($value);
}

#获取记录数量
function getNum($name,$table,$cond){
	#初始化所需变量
	$value = array();
	#附加条件
	$order = order($cond);
	$limit = limit($cond);
	$where = where($cond);

	$sqlComm = "select $name from $table $where $order;";
	$sql = mysql_query($sqlComm);
	$num = mysql_num_rows($sql);
	return $num;
}


#设置查询排序方式
function order($cond){
	$order = '';

	if(isset($cond['order'])){
		$order = "order by ".$cond['order'];	

		#排序正反顺序	
		if(isset($cond['desc'])) $order = $order." desc";
	}

	return $order;
}

#设置查询数量限制
function limit($cond){
	$limit = '';
	#设置开始值
	$start = isset($cond['start']) ? $cond['start'].', ' : '';

	if(isset($cond['limit']))
		$limit = 'limit '.$start.$cond['limit'];

	return $limit;
}

#设置查询条件
function where($cond){
	$where = '';

	if(isset($cond['like'])){
		#拼接条件
		$where = 'where '.implode(' and ',$cond['like']);
	}

	return $where;
}

#拼接所需查询的字段
function field($cond){
	if(isset($cond['field'])){

		return implode(',',$cond['field']);
	}
	else{
		echo "字段(field)不能为空！";
		exit;
	}
}

#拼接需要新增的值
function value($cond){
	if(isset($cond['value'])){

		foreach ($cond['value'] as $key => $value) {
			if (!is_keyword($value)) {
				$cond['value'][$key] = '\''.$value.'\'';
			}
		}
		return $cond['value'];
	}
	else{
		echo "值(value)不能为空！";
		exit;
	}
}

#判断是否为php sql关键字
function is_keyword($str){
	global $keyword;

	for ($i=0,$length=count($keyword); $i < $length; $i++) { 
		if($str===$keyword[$i]) return true;
	}

	return false;
}

#拼接需要写改的值
function modify($cond){
	$sentence = Array();
	$value = value($cond);

	#拼接set语句
	if(isset($cond['field']) && isset($cond['value'])){
		for($i=0,$length=count($cond['field']);$i<$length;$i++)
			array_push($sentence,$cond['field'][$i].' = '.$value[$i]);
	}else{
		echo "字段(field) 与 值(value)不能为空！";
		exit;
	}

	return implode(',',$sentence);
}
/*
* 获取可选数据
* a存在则返回a
* a不存在则返回
* 函数执行前需加@
 */
function getValue($a,$b){
	if(isset($a))
		return $a;
	else
		return $b;
}
/*
* 如数据为空值，不存在，false
* 则返回false
 */
function bool($a){
	return isset($a) && $a && $a!=='false';
}

function format_parameter($parameter){
	global $cond;
	if(isset($_POST[$parameter])) {
		$cond[$parameter] = $_POST[$parameter];
		#如果为字符串美型 则解码
		if(is_array(json_decode($cond[$parameter]))) {
			$cond[$parameter] = json_decode($_POST[$parameter]);
		}
	}

	#字符串转数组
	if(isset($cond[$parameter])&&!is_array($cond[$parameter])) $cond[$parameter] = explode(',',$cond[$parameter]);

}

?>