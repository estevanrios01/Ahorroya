export class Statistics {
    found = 0;
    inserted = 0;
    updated = 0;
    errors = 0;
    started = Date.now();

    finish() {
        return {
            found: this.found,
            inserted: this.inserted,
            updated: this.updated,
            errors: this.errors,
            duration:
                Date.now() -
                this.started
        };
    }
}
