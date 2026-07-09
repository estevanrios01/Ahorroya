export interface ValidationRule {
    name: string;
    validate: (value: unknown) => boolean;
    message: string;
}

export const commonRules: ValidationRule[] = [
    {
        name: "required",
        validate: (v) => v !== null && v !== undefined && v !== "",
        message: "Campo requerido"
    },
    {
        name: "minLength",
        validate: (v) => typeof v === "string" && v.length >= 2,
        message: "Debe tener al menos 2 caracteres"
    },
    {
        name: "positivePrice",
        validate: (v) => typeof v === "number" && v > 0,
        message: "El precio debe ser un número positivo"
    }
];

export function validateField(value: unknown, rules: ValidationRule[]): string[] {
    const errors: string[] = [];
    for (const rule of rules) {
        if (!rule.validate(value)) {
            errors.push(rule.message);
        }
    }
    return errors;
}
