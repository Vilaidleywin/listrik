<?php

namespace App\Models;

class Bill extends \Illuminate\Database\Eloquent\Model
{
    protected $fillable = [
        'customer_id',
        'pemakaian',
        'tarif',
        'total',
        'paid',
        'paid_at'
    ];

    public function customer()
    {
        return $this->belongsTo(\App\Models\Customer::class);
    }
}
