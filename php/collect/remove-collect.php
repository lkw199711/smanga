<?
require_once '../public/common.php';
require_once '../public/lkw.php';
require_once '../dosql/mysql-1.0.php';

$userId = $_POST['userId'];
$targetId = $_POST['targetId'];
$collectType = $_POST['collectType'];
$targetName = $collectType . 'Id';

# 执行查询
$sqlRes = dosql(array(
    'type'=>'delete',
    'table' => 'collect',
    'name' => ['collectId'],
    'where' => array("userId=$userId", "collectType='$collectType'", "$targetName=$targetId"),
    'test'=>false
));

$request = array(
    'code' => 0,
    'sqlRes' => !!$sqlRes,
    'message'=> '移除成功'
);

echo json_encode($request);
