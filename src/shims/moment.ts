class MomentLike {
  private date: Date;

  constructor(value?: any) {
    this.date =
      value instanceof Date ? new Date(value) : value ? new Date(value) : new Date();
  }

  subtract(amount: number, unit: string) {
    if (unit.startsWith("month")) {
      this.date.setMonth(this.date.getMonth() - amount);
    } else if (unit.startsWith("year")) {
      this.date.setFullYear(this.date.getFullYear() - amount);
    }
    return this;
  }

  endOf(unit: string) {
    if (unit === "month") {
      this.date = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0);
    }
    return this;
  }

  format(_mask?: string) {
    const dd = `${this.date.getDate()}`.padStart(2, "0");
    const mm = `${this.date.getMonth() + 1}`.padStart(2, "0");
    const yyyy = this.date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
}

export default function moment(value?: any) {
  return new MomentLike(value);
}
