"use client";

import { useState } from "react";
import { BarcodeFormat } from "../types";

export function BarcodeScanner() {
    const [code, setCode] = useState("");
    const [result, setResult] = useState<string | null>(null);
    const [format] = useState<BarcodeFormat>("EAN-13");

    const handleScan = async () => {
        const res = await fetch("/api/barcode/scan", {
            method: "POST",
            body: JSON.stringify({ code, format })
        });
        const data = await res.json();
        setResult(JSON.stringify(data, null, 2));
    };

    return (
        <div className="space-y-4 p-4">
            <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ingresa código de barras"
                className="w-full rounded-xl border p-4"
            />
            <button onClick={handleScan} className="rounded-xl bg-cyan-500 px-6 py-3 text-white">
                Escanear
            </button>
            {result && (
                <pre className="rounded-lg bg-slate-900 p-4 text-sm text-white">
                    {result}
                </pre>
            )}
        </div>
    );
}

export function BarcodeResult({ code, productName, brand }: {
    code: string;
    productName?: string;
    brand?: string;
}) {
    return (
        <article className="rounded-xl border bg-white p-4">
            <h3 className="font-bold">{productName || "Producto desconocido"}</h3>
            <p className="text-sm text-slate-500">{brand}</p>
            <p className="text-xs text-slate-400">Código: {code}</p>
        </article>
    );
}

export function BarcodeHistory({ items }: {
    items: Array<{ code: string; scannedAt: string }>;
}) {
    return (
        <div className="space-y-2">
            {items.map((item, i) => (
                <div key={i} className="flex justify-between rounded-lg border p-3">
                    <span>{item.code}</span>
                    <span className="text-sm text-slate-400">{item.scannedAt}</span>
                </div>
            ))}
        </div>
    );
}
