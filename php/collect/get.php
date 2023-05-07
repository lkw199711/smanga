<?
require_once '../public/common.php';
require_once '../public/lkw.php';
require_once '../dosql/mysql-1.0.php';

$userId = $_POST['userId'];
$collectType = $_POST['collectType'];
$pageSize = $_POST['pageSize'];
$recordStart = $_POST['recordStart'];

# 执行查询
if ($collectType === 'manga') {
    $sqlRes = dosql(array(
        'table' => 'collect,manga',
        'name' => ['manga.*', 'collect.createTime'],
        'where' => array("userId=$userId", "collectType='manga'", 'collect.mangaId=manga.mangaId'),
        'limit' => $pageSize,
        'start' => $recordStart,
    ));

    $count = dosql(array(
        'table' => 'collect',
        'type' => 'getcount',
        'where' => array("userId=$userId","collectType='manga'")
    ));
} elseif ($collectType === 'chapter') {
    $sqlRes = dosql(array(
        'table' => 'collect,chapter,manga',
        'name' => ['collect.createTime', 'chapter.*','manga.browseType'],
        'where' => array("userId=$userId", "collectType='chapter'", 'collect.chapterId=chapter.chapterId', 'collect.mangaId=manga.mangaId'),
        'limit' => $pageSize,
        'start' => $recordStart,
    ));

    $count = dosql(array(
        'table' => 'collect',
        'type' => 'getcount',
        'where' => array("userId=$userId", "collectType='chapter'")
    ));
}



$request = array(
    'code' => 0,
    'list' => $sqlRes,
    'count' => $count
);

echo json_encode($request);
