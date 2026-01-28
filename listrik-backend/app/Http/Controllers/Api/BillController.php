<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use Illuminate\Http\Request;

class BillController extends Controller
{
    public function index()
    {
        return Bill::with('customer')->latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'customer_id' => ['required', 'exists:customers,id'],
            'pemakaian'   => ['required', 'integer', 'min:1'],
            'tarif'       => ['required', 'integer', 'min:0'],
            'total'       => ['required', 'integer', 'min:0'],
        ]);

        $bill = Bill::create([
            ...$data,
            'paid' => false,
            'paid_at' => null,
        ]);

        return response()->json($bill->load('customer'), 201);
    }

    public function update(Request $request, Bill $bill)
    {
        $data = $request->validate([
            'pemakaian' => ['sometimes', 'required', 'integer', 'min:1'],
            'tarif'     => ['sometimes', 'required', 'integer', 'min:0'],
            'total'     => ['sometimes', 'required', 'integer', 'min:0'],
            'paid'      => ['sometimes', 'required', 'boolean'],
            'paid_at'   => ['nullable', 'date'],
        ]);

        $bill->update($data);
        return response()->json($bill->load('customer'));
    }

    public function destroy(Bill $bill)
    {
        $bill->delete();
        return response()->json(['message' => 'deleted']);
    }
    public function show(\App\Models\Bill $bill)
    {
        return $bill->load('customer');
    }

    public function togglePaid(Bill $bill)
    {
        $next = !$bill->paid;
        $bill->update([
            'paid' => $next,
            'paid_at' => $next ? now() : null,
        ]);

        return response()->json($bill->load('customer'));
    }
}
