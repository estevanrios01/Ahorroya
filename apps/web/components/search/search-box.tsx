"use client";

import { useState } from "react";

export default function SearchBox() {
    const [value, setValue] = useState("");

    return (
        <input
            value={value}
            onChange={(e) =>
                setValue(e.target.value)
            }
            placeholder="Buscar productos..."
            className="w-full rounded-xl border p-4"
        />
    );
}
