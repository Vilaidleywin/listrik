<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        return Customer::latest()->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama'      => ['required','string','max:255'],
            'nomor_kwh' => ['required','string','max:50','unique:customers,nomor_kwh'],
            'alamat'    => ['required','string'],
            'voltase'   => ['required','string'],
            'no_hp'     => ['required','string','max:30'],
        ]);

        $customer = Customer::create($data);
        return response()->json($customer, 201);
    }

    public function update(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'nama'      => ['required','string','max:255'],
            'nomor_kwh' => ['required','string','max:50','unique:customers,nomor_kwh,' . $customer->id],
            'alamat'    => ['required','string'],
            'voltase'   => ['required','string'],
            'no_hp'     => ['required','string','max:30'],
        ]);

        $customer->update($data);
        return response()->json($customer);
    }

    public function destroy(Customer $customer)
    {
        $customer->delete();
        return response()->json(['message' => 'deleted']);
    }
}
