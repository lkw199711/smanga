<?
require_once './public/common.php';

pdf2png('./01-10.PDF','./cache/');


 /**
 * 将pdf文件转化为多张png图片
 * @param string $pdf  pdf所在路径 （/www/pdf/abc.pdf pdf所在的绝对路径）
 * @param string $path 新生成图片所在路径 (/www/pngs/)
 *
 * @return array|bool
 */
function pdf2png($pdf, $path)
{
    if (!extension_loaded('imagick')) {
    	echo "no imagick";
        return false;
    }
    if (!file_exists($pdf)) {
    	echo "no file";
        return false;
    }
    if (!is_dir($path)) {
    	echo "no dir";
    	mkdir($path,0777);
    }
    $im = new Imagick();
    $im->setResolution(80, 80); //设置分辨率 值越大分辨率越高
    $im->setCompressionQuality(100);			// 新图
    //$im->setImageCompressionQuality(30);	// 旧图
    
    $im->readImage($pdf);
    foreach ($im as $k => $v) {
        $v->setImageFormat('png');
        $fileName = $path . $k . '.png';
        if ($v->writeImage($fileName) == true) {
            $return[] = $fileName;
        }
    }
    return $return;
}
 
/**
 * 将pdf转化为单一png图片
 * @param string $pdf  pdf所在路径 （/www/pdf/abc.pdf pdf所在的绝对路径）
 * @param string $path 新生成图片所在路径 (/www/pngs/)
 *
 * @throws Exception
 */
function pdf2png2($pdf, $path)
{
    try {
        $im = new Imagick();
        $im->setCompressionQuality(100);
        $im->setResolution(120, 120);//设置分辨率 值越大分辨率越高
        $im->readImage($pdf);
 
        $canvas = new Imagick();
        $imgNum = $im->getNumberImages();
        //$canvas->setResolution(120, 120);
        foreach ($im as $k => $sub) {
            $sub->setImageFormat('png');
            //$sub->setResolution(120, 120);
            $sub->stripImage();
            $sub->trimImage(0);
            $width  = $sub->getImageWidth() + 10;
            $height = $sub->getImageHeight() + 10;
            if ($k + 1 == $imgNum) {
                $height += 10;
            } //最后添加10的height
            $canvas->newImage($width, $height, new ImagickPixel('white'));
            $canvas->compositeImage($sub, Imagick::COMPOSITE_DEFAULT, 5, 5);
        }
 
        $canvas->resetIterator();
        $canvas->appendImages(true)->writeImage($path . microtime(true) . '.png');
    } catch (Exception $e) {
        throw $e;
    }
}
?>