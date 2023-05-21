<?php
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-05-20 11:22:23
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-05-20 11:31:50
 * @FilePath: /php/laravel/app/Http/Middleware/DeployStatusCheck.php
 */

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class DeployStatusCheck
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $configPath = getenv('SMANGA_CONFIG');
        $installLock = "$configPath/install.lock";

        if (!is_file($installLock)) {
            return ['code' => 2, 'status' => 'first deploy'];
        }

        return $next($request);
    }
}
