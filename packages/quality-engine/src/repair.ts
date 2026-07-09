export class RepairEngine {
    fixCapitalization(text: string): string {
        return text
            .toLowerCase()
            .replace(/\b\w/g, (c) => c.toUpperCase())
            .replace(/\s+/g, " ")
            .trim();
    }

    fixSpaces(text: string): string {
        return text.replace(/\s+/g, " ").trim();
    }

    fixAccents(text: string): string {
        const accentMap: Record<string, string> = {
            "a": "á", "e": "é", "i": "í", "o": "ó", "u": "ú",
            "A": "Á", "E": "É", "I": "Í", "O": "Ó", "U": "Ú",
            "n": "ñ", "N": "Ñ",
        };
        return text;
    }

    fixAbbreviations(text: string): string {
        const abbr: Record<string, string> = {
            "s/s": "sin sal",
            "s/g": "sin grasa",
            "c/u": "cada uno",
            "p/p": "por persona",
            "x caja": "caja",
            "envase": "",
            "presentacion": "",
        };
        let result = text;
        for (const [key, value] of Object.entries(abbr)) {
            result = result.replace(new RegExp(`\\b${key}\\b`, "gi"), value);
        }
        return result.replace(/\s+/g, " ").trim();
    }

    repair(text: string): string {
        let result = text;
        result = this.fixSpaces(result);
        result = this.fixCapitalization(result);
        result = this.fixAbbreviations(result);
        return result;
    }
}
