<?php

namespace App\Http\Controllers;

use App\Models\VersionSql;

class Version extends Controller
{
    /**
     * @description: 获取版本列表
     * @return {*}
     */
    public function get()
    {
        return VersionSql::list();
    }
}
