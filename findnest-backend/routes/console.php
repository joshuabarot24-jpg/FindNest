<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Schedule::command('items:check-unclaimed')->daily();
Schedule::command('claims:check-pickup-deadlines')->daily();
Schedule::command('trust:passive-recovery')->daily();

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
