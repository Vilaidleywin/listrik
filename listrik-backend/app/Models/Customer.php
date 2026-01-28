<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'nomor_kwh',
        'alamat',
        'voltase',
        'no_hp',
    ];

    // 🔗 RELASI KE TAGIHAN
    public function bills()
    {
        return $this->hasMany(\App\Models\Bill::class);
    }
}
